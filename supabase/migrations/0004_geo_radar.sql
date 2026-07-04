-- ============================================================================
-- Acervo Geek — Radar de proximidade
--
-- Troca de figurinha/card costuma ser presencial ou com frete curto: casar com
-- alguém a 1500 km é ruído. Aqui adicionamos localização ao perfil, um raio de
-- busca ajustável (o "radar") e distância no match.
--
-- MVP: distância por haversine em SQL puro (sem extensão) — portátil e testável.
-- Escala: migrar para PostGIS geography(Point) + índice GiST e ST_DWithin quando
-- o volume pedir filtro espacial indexado. A assinatura das funções não muda.
-- ============================================================================

alter table public.profiles
  add column latitude       double precision check (latitude between -90 and 90),
  add column longitude      double precision check (longitude between -180 and 180),
  -- Raio do radar em km; até onde o usuário topa encontrar trocas.
  add column search_radius_km integer not null default 50
    check (search_radius_km between 1 and 3000);

-- Distância em km entre dois pontos (Terra como esfera de raio 6371 km).
create or replace function public.distance_km(
  lat1 double precision, lon1 double precision,
  lat2 double precision, lon2 double precision
) returns double precision
language sql immutable parallel safe
as $$
  select 2 * 6371 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) *
    power(sin(radians(lon2 - lon1) / 2), 2)
  ));
$$;

-- Match de repetidas, agora ciente do radar. Devolve também a distância.
-- p_radius_km sobrepõe o raio do perfil (o app manda o valor do controle);
-- se qualquer lado não tem coordenada, não filtra por distância (mostra mesmo).
drop function if exists public.find_sticker_matches(uuid);

create function public.find_sticker_matches(p_user uuid, p_radius_km integer default null)
returns table (
  other_user  uuid,
  i_give_item uuid,   -- minha repetida que ele quer
  i_get_item  uuid,   -- a repetida dele que eu quero
  distance_km double precision
)
language sql
stable
security definer set search_path = public
as $$
  with me as (
    select latitude, longitude, search_radius_km from public.profiles where id = p_user
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
  -- alguém quer a figurinha que me sobra
  join public.wishlists want_mine
    on want_mine.item_id = mine.item_id
   and want_mine.user_id <> p_user
  join public.profiles op
    on op.id = want_mine.user_id
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
    and mine.for_trade
    and (
      me.latitude is null or op.latitude is null
      or public.distance_km(me.latitude, me.longitude, op.latitude, op.longitude)
         <= coalesce(p_radius_km, me.search_radius_km)
    );
$$;
