-- ============================================================================
-- Acervo Geek — RPC do deck enriquecido
--
-- O app chama UMA função e recebe o card pronto (sem N+1 no cliente):
-- item + dono + distância + modos/preço + o gancho do match recíproco.
-- Reaproveita find_sticker_matches (radar embutido) e junta os detalhes.
-- ============================================================================

create or replace function public.deck_for_user(
  p_user uuid,
  p_radius_km integer default null
)
returns table (
  listing_id       uuid,
  item_name        text,
  franchise        text,
  sticker_number   text,
  country          text,
  is_special       boolean,
  condition        item_condition,
  owner_username   text,
  owner_reputation numeric,
  owner_reviews    integer,
  owner_city       text,
  distance_km      double precision,
  for_trade        boolean,
  for_sale         boolean,
  price            numeric,
  match_reason     text
)
language sql
stable
security definer set search_path = public
as $$
  select
    theirs.id                                     as listing_id,
    got.name                                      as item_name,
    got.franchise                                 as franchise,
    got.sticker_number                            as sticker_number,
    got.attributes ->> 'country'                  as country,
    got.is_special                                as is_special,
    theirs.condition                              as condition,
    op.username                                   as owner_username,
    op.reputation_score                           as owner_reputation,
    op.reviews_count                              as owner_reviews,
    op.city                                       as owner_city,
    m.distance_km                                 as distance_km,
    theirs.for_trade                              as for_trade,
    theirs.for_sale                               as for_sale,
    theirs.asking_price                           as price,
    '@' || op.username || ' quer a sua repetida de ' || gave.name as match_reason
  from public.find_sticker_matches(p_user, p_radius_km) m
  -- o exemplar dele que EU recebo (a repetida que me falta)
  join public.user_inventory theirs
    on theirs.user_id = m.other_user and theirs.item_id = m.i_get_item
  join public.items got  on got.id  = m.i_get_item
  join public.items gave on gave.id = m.i_give_item   -- a minha repetida que ele quer
  join public.profiles op on op.id = m.other_user
  order by m.distance_km asc nulls last;
$$;
