-- ============================================================================
-- Acervo Geek — MVP vertical: figurinhas de álbum (Copa do Mundo)
--
-- Por que este nicho primeiro: público massivo e sazonal, dor cristalina
-- (repetida ↔ faltante) e ciclo curto — ideal para validar o swipe/match e a
-- precificação. A base de usuários migra para cards/figures depois.
--
-- O modelo reaproveita as tabelas existentes:
--   "tenho"    = user_inventory (quantity >= 1)
--   "repetida" = user_inventory (quantity > 1  →  excedente entra no match)
--   "preciso"  = wishlists
--   swipe/match = swipes + match_suggestions (migrations 0001/0002)
-- Esta migration adiciona só o que é específico de álbum + a troca justa.
-- ============================================================================

-- 1. Nova categoria ------------------------------------------------------------
-- (alter type ... add value roda fora de transação; o Supabase aplica ok)
alter type item_category add value if not exists 'sticker';

-- 2. Coleções / álbuns ---------------------------------------------------------
-- Um álbum é o "set" das figurinhas: define o universo de slots numerados,
-- o que permite calcular progresso de conclusão por usuário.
create table public.collections (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,                 -- 'Copa 2026 — Panini'
  publisher    text,                          -- 'Panini'
  year         smallint,
  total_slots  integer not null check (total_slots > 0),
  cover_url    text,                          -- chave S3
  is_active    boolean not null default true, -- coleção em campanha
  created_at   timestamptz not null default now()
);

create index collections_active_idx on public.collections (is_active) where is_active;

-- 3. Vínculo do item ao álbum --------------------------------------------------
-- items continua sendo o catálogo canônico; para figurinhas ganha o número
-- do slot e o flag de especial (legend/holográfica/escudo).
alter table public.items
  add column collection_id  uuid references public.collections (id) on delete set null,
  add column sticker_number text,             -- '123', 'MES01' (texto: há prefixos)
  add column is_special     boolean not null default false;

-- Cada número aparece uma vez por álbum no catálogo.
create unique index items_collection_slot_idx
  on public.items (collection_id, sticker_number)
  where collection_id is not null;

-- 4. Calculadora de troca justa (o "torna") -----------------------------------
-- A valoração de cada exemplar vem de item_price_estimates (modelo de pricing
-- do Databricks). A troca soma os dois lados via trade_items; a diferença é o
-- ajuste em dinheiro sugerido. Persistimos a sugestão aceita para auditoria e
-- para o loop de métricas do modelo.
alter table public.trades
  add column suggested_cash_brl numeric(12, 2)
    check (suggested_cash_brl is null or suggested_cash_brl >= 0),
  add column cash_from uuid references public.profiles (id),  -- quem paga o torna
  add column pricing_model_version text,                       -- versão que gerou
  add constraint cash_from_is_party
    check (cash_from is null or cash_from in (proposer_id, receiver_id));

-- 5. Progresso do álbum por usuário -------------------------------------------
-- View pronta para a tela "faltam X para completar" e para alimentar o swipe
-- com prioridade nos faltantes. security_invoker mantém a RLS do inventário.
create view public.user_collection_progress
  with (security_invoker = true) as
select
  ui.user_id,
  c.id                          as collection_id,
  c.name,
  c.total_slots,
  count(distinct ui.item_id)                              as owned_slots,
  count(*) filter (where ui.quantity > 1)                 as duplicate_slots,
  coalesce(sum(ui.quantity - 1), 0)                       as spare_stickers,
  round(
    100.0 * count(distinct ui.item_id) / nullif(c.total_slots, 0), 1
  )                                                        as completion_pct
from public.collections c
join public.items i          on i.collection_id = c.id
join public.user_inventory ui on ui.item_id = i.id
group by ui.user_id, c.id, c.name, c.total_slots;

-- 6. Match de repetidas (auto-match do MVP) -----------------------------------
-- Duas pontas complementares: minha repetida que o outro precisa, e a repetida
-- dele que eu preciso. Esta função devolve os pares candidatos para um usuário;
-- o ranking/torna fica com o job do Databricks, mas isto já destrava o MVP sem
-- esperar o batch.
create or replace function public.find_sticker_matches(p_user uuid)
returns table (
  other_user   uuid,
  i_give_item  uuid,   -- minha repetida que ele quer
  i_get_item   uuid    -- a repetida dele que eu quero
)
language sql
stable
security definer set search_path = public
as $$
  select
    want_mine.user_id   as other_user,
    mine.item_id        as i_give_item,   -- minha repetida que ele quer
    theirs.item_id      as i_get_item     -- a repetida dele que eu quero
  from public.user_inventory mine
  -- alguém quer a figurinha que me sobra
  join public.wishlists want_mine
    on want_mine.item_id = mine.item_id
   and want_mine.user_id <> p_user
  -- esse alguém tem uma repetida disponível...
  join public.user_inventory theirs
    on theirs.user_id = want_mine.user_id
   and theirs.quantity > 1
   and theirs.for_trade
  -- ...e essa repetida está na MINHA lista de desejos
  join public.wishlists want_theirs
    on want_theirs.user_id = p_user
   and want_theirs.item_id = theirs.item_id
  where mine.user_id = p_user
    and mine.quantity > 1
    and mine.for_trade;
$$;

-- 7. RLS das novas tabelas -----------------------------------------------------
alter table public.collections enable row level security;

create policy "coleções são públicas" on public.collections
  for select using (true);
-- INSERT/UPDATE de coleção só via service_role (curadoria/seed).
