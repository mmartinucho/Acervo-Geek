-- ============================================================================
-- Acervo Geek — Universos/temas do mundo geek
--
-- O app deixa de ser "figurinhas da Copa" e passa a cobrir vários universos:
-- Copa do Mundo (figurinhas), Pokémon TCG, Yu-Gi-Oh, One Piece, Funko, Magic...
-- O usuário escolhe seu(s) universo(s) e o app (deck, coleção, match) é
-- escopado pelo universo ATIVO.
--
-- Compatibilidade: se o usuário ainda não escolheu um tema ativo, as funções
-- caem no primeiro tema disponível — o comportamento atual não quebra.
-- ============================================================================

create table public.themes (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,          -- 'copa', 'pokemon', 'yugioh'
  name        text not null,                 -- 'Copa do Mundo'
  kind        text not null,                 -- 'stickers' | 'tcg' | 'figures'
  accent      text,                          -- cor de acento do universo (hex)
  emoji       text,                          -- ícone provisório até a arte final
  sort_order  smallint not null default 100,
  is_available boolean not null default true,
  created_at  timestamptz not null default now()
);

create index themes_available_idx on public.themes (sort_order) where is_available;

-- Todo item pertence a um universo; álbuns/sets também.
alter table public.items       add column theme_id uuid references public.themes (id);
alter table public.collections add column theme_id uuid references public.themes (id);
create index items_theme_idx on public.items (theme_id);

-- Universos que o usuário coleciona + qual está ativo agora.
alter table public.profiles add column active_theme_id uuid references public.themes (id);

create table public.user_themes (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  theme_id   uuid not null references public.themes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, theme_id)
);

alter table public.themes      enable row level security;
alter table public.user_themes enable row level security;

create policy "temas são públicos" on public.themes for select using (true);
create policy "usuário gerencia os próprios universos" on public.user_themes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Lista de universos disponíveis (para a tela de seleção).
create or replace function public.list_themes()
returns setof public.themes
language sql stable
as $$
  select * from public.themes where is_available order by sort_order, name;
$$;

-- Define o universo ativo e garante a associação em user_themes.
create or replace function public.set_active_theme(p_user uuid, p_theme uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_themes (user_id, theme_id)
  values (p_user, p_theme)
  on conflict do nothing;
  update public.profiles set active_theme_id = p_theme, updated_at = now()
   where id = p_user;
end;
$$;

-- Resolve o tema do usuário: ativo, ou o primeiro disponível (fallback).
create or replace function public.resolve_theme(p_user uuid)
returns uuid
language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select active_theme_id from public.profiles where id = p_user),
    (select id from public.themes where is_available order by sort_order, name limit 1)
  );
$$;

-- ---------------------------------------------------------------------------
-- RPCs existentes agora escopadas pelo universo ativo do usuário
-- ---------------------------------------------------------------------------

-- Folha da coleção do universo ativo (funciona para figurinhas E cards).
create or replace function public.album_sheet(p_user uuid)
returns table (
  item_id        uuid,
  sticker_number text,
  name           text,
  country        text,
  is_special     boolean,
  state          text
)
language sql stable security definer set search_path = public
as $$
  select
    i.id,
    i.sticker_number,
    i.name,
    i.attributes ->> 'country',
    i.is_special,
    case
      when ui.quantity > 1 then 'duplicate'
      when ui.quantity = 1 then 'have'
      else 'missing'
    end as state
  from public.items i
  left join public.user_inventory ui
    on ui.item_id = i.id and ui.user_id = p_user
  where i.theme_id = public.resolve_theme(p_user)
  order by i.is_special desc, length(coalesce(i.sticker_number, i.name)), i.sticker_number, i.name;
$$;

-- Match de repetidas escopado ao universo ativo (não cruza Pokémon com Copa).
drop function if exists public.find_sticker_matches(uuid, integer);

create function public.find_sticker_matches(p_user uuid, p_radius_km integer default null)
returns table (
  other_user  uuid,
  i_give_item uuid,
  i_get_item  uuid,
  distance_km double precision
)
language sql stable security definer set search_path = public
as $$
  with me as (
    select latitude, longitude, search_radius_km, public.resolve_theme(p_user) as theme_id
    from public.profiles where id = p_user
  )
  select
    want_mine.user_id as other_user,
    mine.item_id      as i_give_item,
    theirs.item_id    as i_get_item,
    case
      when me.latitude is not null and op.latitude is not null
      then public.distance_km(me.latitude, me.longitude, op.latitude, op.longitude)
    end               as distance_km
  from public.user_inventory mine
  cross join me
  join public.items gi on gi.id = mine.item_id and gi.theme_id = me.theme_id
  join public.wishlists want_mine
    on want_mine.item_id = mine.item_id and want_mine.user_id <> p_user
  join public.profiles op on op.id = want_mine.user_id
  join public.user_inventory theirs
    on theirs.user_id = want_mine.user_id and theirs.quantity > 1 and theirs.for_trade
  join public.items ti on ti.id = theirs.item_id and ti.theme_id = me.theme_id
  join public.wishlists want_theirs
    on want_theirs.user_id = p_user and want_theirs.item_id = theirs.item_id
  where mine.user_id = p_user
    and mine.quantity > 1
    and mine.for_trade
    and (
      me.latitude is null or op.latitude is null
      or public.distance_km(me.latitude, me.longitude, op.latitude, op.longitude)
         <= coalesce(p_radius_km, me.search_radius_km)
    );
$$;
