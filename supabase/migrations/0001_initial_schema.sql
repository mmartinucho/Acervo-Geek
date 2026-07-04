-- ============================================================================
-- Acervo Geek — Esquema inicial (MVP)
-- Aplicar via: supabase db push  (ou psql -f)
--
-- Convenções:
--  * Todas as tabelas usam UUID como PK (compatível com auth.users do Supabase).
--  * RLS habilitada em tudo; escrita sempre restrita ao dono do registro.
--  * Tabelas de insight (match_suggestions, item_price_estimates) são
--    escritas APENAS pelo Databricks via service_role — o app só lê.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tipos enumerados
-- ---------------------------------------------------------------------------
create type item_category as enum ('card', 'figure', 'comic', 'game', 'other');

create type item_condition as enum ('mint', 'near_mint', 'good', 'played', 'damaged');

create type trade_status as enum (
  'proposed',    -- proposta criada (pelo matchmaking ou manualmente)
  'accepted',    -- ambos concordaram com os itens
  'shipping',    -- em trânsito
  'completed',   -- ambos confirmaram recebimento
  'cancelled',   -- cancelada por uma das partes
  'disputed'     -- em disputa (mediação)
);

-- ---------------------------------------------------------------------------
-- profiles — extensão pública de auth.users
-- ---------------------------------------------------------------------------
create table public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  username         text not null unique check (char_length(username) between 3 and 30),
  display_name     text,
  avatar_url       text,                       -- chave do objeto no S3
  bio              text,
  city             text,
  country          text default 'BR',
  -- Score denormalizado (0–5), recalculado por trigger a partir de trade_reviews.
  reputation_score numeric(3, 2) not null default 0 check (reputation_score between 0 and 5),
  reviews_count    integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Cria o profile automaticamente no signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'username', 'user_' || left(new.id::text, 8)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- items — catálogo canônico (populado por seed + pipeline de IA no Databricks)
-- ---------------------------------------------------------------------------
create table public.items (
  id            uuid primary key default gen_random_uuid(),
  category      item_category not null,
  franchise     text not null,                 -- ex: 'Pokémon TCG', 'One Piece'
  name          text not null,
  set_code      text,                          -- ex: 'SV4-025'
  rarity        text,
  -- Atributos flexíveis por categoria (idioma, edição, escala da figura...).
  -- JSONB evita uma tabela por categoria no MVP; promover a coluna quando
  -- um atributo virar filtro quente.
  attributes    jsonb not null default '{}'::jsonb,
  image_url     text,                          -- imagem canônica do catálogo
  -- Identificador do embedding no Feature Store do Databricks (para busca
  -- visual). O vetor em si NÃO fica no Postgres no MVP.
  embedding_ref text,
  created_at    timestamptz not null default now()
);

create index items_franchise_idx on public.items (franchise);
create index items_category_idx  on public.items (category);
create index items_set_code_idx  on public.items (set_code);
create index items_name_trgm_idx on public.items using gin (to_tsvector('simple', name));

-- ---------------------------------------------------------------------------
-- user_inventory — o que cada usuário possui
-- ---------------------------------------------------------------------------
create table public.user_inventory (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  item_id      uuid not null references public.items (id),
  condition    item_condition not null default 'good',
  quantity     integer not null default 1 check (quantity > 0),
  for_trade    boolean not null default false, -- entra no matchmaking?
  -- Fotos reais do exemplar (chaves S3). A 1ª foto é a usada pela IA de
  -- reconhecimento no momento do cadastro.
  photo_keys   text[] not null default '{}',
  -- Resultado bruto do reconhecimento (candidatos, confiança) para auditoria.
  ai_scan_meta jsonb,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index user_inventory_user_idx on public.user_inventory (user_id);
create index user_inventory_item_idx on public.user_inventory (item_id);
create index user_inventory_tradeable_idx
  on public.user_inventory (item_id) where for_trade;

-- ---------------------------------------------------------------------------
-- wishlists — o que cada usuário procura
-- ---------------------------------------------------------------------------
create table public.wishlists (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  item_id       uuid not null references public.items (id),
  -- Condição mínima aceitável para o match.
  min_condition item_condition not null default 'played',
  priority      smallint not null default 3 check (priority between 1 and 5),
  created_at    timestamptz not null default now(),
  unique (user_id, item_id)
);

create index wishlists_item_idx on public.wishlists (item_id);

-- ---------------------------------------------------------------------------
-- trades — negociação entre dois usuários
-- ---------------------------------------------------------------------------
create table public.trades (
  id          uuid primary key default gen_random_uuid(),
  proposer_id uuid not null references public.profiles (id),
  receiver_id uuid not null references public.profiles (id),
  status      trade_status not null default 'proposed',
  -- Se a troca nasceu de uma sugestão do matchmaking, referência para métricas
  -- de conversão do modelo.
  suggestion_id uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (proposer_id <> receiver_id)
);

create index trades_proposer_idx on public.trades (proposer_id, status);
create index trades_receiver_idx on public.trades (receiver_id, status);

-- Itens envolvidos em cada troca (lado de quem oferece cada exemplar).
create table public.trade_items (
  id           uuid primary key default gen_random_uuid(),
  trade_id     uuid not null references public.trades (id) on delete cascade,
  inventory_id uuid not null references public.user_inventory (id),
  offered_by   uuid not null references public.profiles (id),
  unique (trade_id, inventory_id)
);

create index trade_items_trade_idx on public.trade_items (trade_id);

-- ---------------------------------------------------------------------------
-- trade_reviews — reputação pós-troca
-- ---------------------------------------------------------------------------
create table public.trade_reviews (
  id          uuid primary key default gen_random_uuid(),
  trade_id    uuid not null references public.trades (id),
  reviewer_id uuid not null references public.profiles (id),
  reviewed_id uuid not null references public.profiles (id),
  rating      smallint not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  -- Cada parte avalia a outra uma única vez por troca.
  unique (trade_id, reviewer_id),
  check (reviewer_id <> reviewed_id)
);

create index trade_reviews_reviewed_idx on public.trade_reviews (reviewed_id);

-- Mantém o score denormalizado do profile em sincronia.
create or replace function public.refresh_reputation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles p
     set reputation_score = sub.avg_rating,
         reviews_count    = sub.cnt,
         updated_at       = now()
    from (
      select reviewed_id, round(avg(rating)::numeric, 2) as avg_rating, count(*) as cnt
        from public.trade_reviews
       where reviewed_id = new.reviewed_id
       group by reviewed_id
    ) sub
   where p.id = sub.reviewed_id;
  return new;
end;
$$;

create trigger on_trade_review_created
  after insert on public.trade_reviews
  for each row execute function public.refresh_reputation();

-- ---------------------------------------------------------------------------
-- Tabelas de INSIGHT — escritas pelo Databricks (service_role), lidas pelo app
-- ---------------------------------------------------------------------------

-- Sugestões de troca geradas pelo job de matchmaking.
create table public.match_suggestions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  matched_user uuid not null references public.profiles (id) on delete cascade,
  score        numeric(5, 4) not null,          -- 0–1, ordena o feed
  -- Payload pronto para renderização: itens que "eu quero dele" e que
  -- "ele quer de mim" (ids + thumbnails), evitando N+1 no app.
  payload      jsonb not null,
  model_version text not null,
  generated_at timestamptz not null default now(),
  expires_at   timestamptz not null,            -- sugestões são perecíveis
  dismissed_at timestamptz
);

create index match_suggestions_feed_idx
  on public.match_suggestions (user_id, score desc)
  where dismissed_at is null;

-- Precificação estimada por item/condição (modelo de pricing do Databricks).
create table public.item_price_estimates (
  item_id       uuid not null references public.items (id) on delete cascade,
  condition     item_condition not null,
  estimated_price numeric(12, 2) not null,
  currency      text not null default 'BRL',
  model_version text not null,
  computed_at   timestamptz not null default now(),
  primary key (item_id, condition)
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles             enable row level security;
alter table public.items                enable row level security;
alter table public.user_inventory       enable row level security;
alter table public.wishlists            enable row level security;
alter table public.trades               enable row level security;
alter table public.trade_items          enable row level security;
alter table public.trade_reviews        enable row level security;
alter table public.match_suggestions    enable row level security;
alter table public.item_price_estimates enable row level security;

-- Perfis e catálogo são públicos para leitura (marketplace).
create policy "profiles são públicos"       on public.profiles for select using (true);
create policy "usuário edita o próprio perfil" on public.profiles
  for update using (auth.uid() = id);

create policy "catálogo é público" on public.items for select using (true);
-- INSERT/UPDATE em items só via service_role (pipeline) — sem policy = negado.

-- Inventário: itens for_trade são visíveis a todos; o resto só ao dono.
create policy "inventário visível se for_trade ou dono" on public.user_inventory
  for select using (for_trade or auth.uid() = user_id);
create policy "dono gerencia o próprio inventário" on public.user_inventory
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "wishlist é pública" on public.wishlists for select using (true);
create policy "dono gerencia a própria wishlist" on public.wishlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Trocas: visíveis apenas às duas partes.
create policy "partes veem a troca" on public.trades
  for select using (auth.uid() in (proposer_id, receiver_id));
create policy "proposer cria a troca" on public.trades
  for insert with check (auth.uid() = proposer_id);
create policy "partes atualizam a troca" on public.trades
  for update using (auth.uid() in (proposer_id, receiver_id));

create policy "partes veem os itens da troca" on public.trade_items
  for select using (
    exists (
      select 1 from public.trades t
       where t.id = trade_id and auth.uid() in (t.proposer_id, t.receiver_id)
    )
  );
create policy "cada parte adiciona os próprios itens" on public.trade_items
  for insert with check (auth.uid() = offered_by);

-- Reviews: públicas (base da reputação), criadas apenas por participantes
-- de trocas concluídas.
create policy "reviews são públicas" on public.trade_reviews for select using (true);
create policy "participante avalia troca concluída" on public.trade_reviews
  for insert with check (
    auth.uid() = reviewer_id
    and exists (
      select 1 from public.trades t
       where t.id = trade_id
         and t.status = 'completed'
         and auth.uid() in (t.proposer_id, t.receiver_id)
         and reviewed_id in (t.proposer_id, t.receiver_id)
    )
  );

-- Insights: cada usuário lê apenas as próprias sugestões; preços são públicos.
-- Escrita fica sem policy (somente service_role do Databricks bypassa RLS).
create policy "usuário lê as próprias sugestões" on public.match_suggestions
  for select using (auth.uid() = user_id);
create policy "usuário descarta a própria sugestão" on public.match_suggestions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "preços são públicos" on public.item_price_estimates
  for select using (true);
