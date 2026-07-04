-- ============================================================================
-- Acervo Geek — Venda além de troca + sinal de swipe do deck de descoberta
-- ============================================================================

-- Um exemplar do inventário pode estar à venda (com preço), para troca, ou ambos.
alter table public.user_inventory
  add column for_sale boolean not null default false,
  add column asking_price numeric(12, 2) check (asking_price > 0),
  add constraint sale_needs_price check (not for_sale or asking_price is not null);

create index user_inventory_forsale_idx
  on public.user_inventory (item_id) where for_sale;

-- Swipes do deck (quero/passo). Além de alimentar a fila do usuário, é o
-- sinal de treino mais valioso do matchmaking no Databricks: preferência
-- revelada item a item.
create table public.swipes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  inventory_id uuid not null references public.user_inventory (id) on delete cascade,
  direction    text not null check (direction in ('want', 'pass')),
  created_at   timestamptz not null default now(),
  -- Re-swipe substitui o anterior (upsert no cliente).
  unique (user_id, inventory_id)
);

create index swipes_user_idx on public.swipes (user_id, created_at desc);
create index swipes_inventory_idx on public.swipes (inventory_id) where direction = 'want';

alter table public.swipes enable row level security;

create policy "dono gerencia os próprios swipes" on public.swipes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Dois "quero" cruzados sobre inventários um do outro = match imediato,
-- detectável por trigger/job sem esperar o batch do Databricks.
