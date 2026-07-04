-- ============================================================================
-- Acervo Geek — Onboarding: montagem do álbum
--
-- A tela de onboarding mostra a lista de figurinhas do álbum ativo e o usuário
-- marca cada uma: preciso / tenho / repetida. Isso popula wishlists e
-- user_inventory — os dois inputs do matchmaking.
--
-- Estados:
--   'missing'   → preciso (entra em wishlists)
--   'have'      → tenho 1 (user_inventory quantity 1)
--   'duplicate' → repetida (user_inventory quantity 2, for_trade)
-- ============================================================================

-- Folha do álbum ativo com o estado de cada slot para o usuário.
create or replace function public.album_sheet(p_user uuid)
returns table (
  item_id        uuid,
  sticker_number text,
  name           text,
  country        text,
  is_special     boolean,
  state          text
)
language sql
stable
security definer set search_path = public
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
  from public.collections c
  join public.items i on i.collection_id = c.id
  left join public.user_inventory ui
    on ui.item_id = i.id and ui.user_id = p_user
  where c.is_active
  order by i.is_special desc, length(i.sticker_number), i.sticker_number;
$$;

-- Define o estado de um slot (idempotente: limpa e reescreve).
create or replace function public.set_slot_state(
  p_user  uuid,
  p_item  uuid,
  p_state text
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if p_state not in ('missing', 'have', 'duplicate') then
    raise exception 'estado inválido: %', p_state;
  end if;

  delete from public.user_inventory where user_id = p_user and item_id = p_item;
  delete from public.wishlists      where user_id = p_user and item_id = p_item;

  if p_state = 'have' then
    insert into public.user_inventory (user_id, item_id, quantity, for_trade)
    values (p_user, p_item, 1, false);
  elsif p_state = 'duplicate' then
    insert into public.user_inventory (user_id, item_id, quantity, for_trade)
    values (p_user, p_item, 2, true);
  else -- 'missing' → preciso
    insert into public.wishlists (user_id, item_id)
    values (p_user, p_item);
  end if;
end;
$$;

-- Onboarding pendente? (nenhum dado de coleção ainda)
create or replace function public.has_collection_data(p_user uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select
    exists (select 1 from public.user_inventory where user_id = p_user)
    or exists (select 1 from public.wishlists where user_id = p_user);
$$;
