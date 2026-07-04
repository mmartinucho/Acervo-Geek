-- ============================================================================
-- Acervo Geek — Seed inicial: universos geek + catálogos
-- Aplicado após as migrations:  supabase db reset   (ou psql -f)
-- Idempotente: limpa e repovoa.
--
-- Universos semeados: Copa do Mundo (figurinhas), Pokémon TCG e Yu-Gi-Oh (cards).
-- Catálogos são amostras representativas; o completo entra via import depois.
-- ============================================================================

begin;

-- IDs fixos (determinístico / re-executável)
-- temas
--   copa    0b000000-0000-4000-8000-000000000001
--   pokemon 0b000000-0000-4000-8000-000000000002
--   yugioh  0b000000-0000-4000-8000-000000000003
-- coleção Copa  0a1b2c3d-0000-4000-8000-000000000001

-- Limpeza (respeitando FKs: items → collections/themes)
delete from public.items where theme_id in (
  '0b000000-0000-4000-8000-000000000001',
  '0b000000-0000-4000-8000-000000000002',
  '0b000000-0000-4000-8000-000000000003'
);
delete from public.collections where id = '0a1b2c3d-0000-4000-8000-000000000001';
delete from public.themes where slug in ('copa', 'pokemon', 'yugioh');

-- Universos ---------------------------------------------------------------
insert into public.themes (id, slug, name, kind, accent, emoji, sort_order) values
  ('0b000000-0000-4000-8000-000000000001', 'copa',    'Copa do Mundo', 'stickers', '#12813F', '⚽', 10),
  ('0b000000-0000-4000-8000-000000000002', 'pokemon', 'Pokémon TCG',   'tcg',      '#F5C542', '⚡', 20),
  ('0b000000-0000-4000-8000-000000000003', 'yugioh',  'Yu-Gi-Oh!',     'tcg',      '#7C3AED', '🃏', 30);

-- Universo Copa: álbum + figurinhas --------------------------------------
insert into public.collections (id, name, publisher, year, total_slots, is_active, theme_id)
values ('0a1b2c3d-0000-4000-8000-000000000001', 'Copa 2026', 'Panini', 2026, 1, true,
        '0b000000-0000-4000-8000-000000000001');

insert into public.items
  (category, franchise, name, collection_id, sticker_number, is_special, attributes)
values
  ('sticker','Copa 2026','Escudo — Brasil',    '0a1b2c3d-0000-4000-8000-000000000001','BRA', true,  '{"country":"Brasil"}'),
  ('sticker','Copa 2026','Escudo — Argentina', '0a1b2c3d-0000-4000-8000-000000000001','ARG', true,  '{"country":"Argentina"}'),
  ('sticker','Copa 2026','Escudo — França',    '0a1b2c3d-0000-4000-8000-000000000001','FRA', true,  '{"country":"França"}'),
  ('sticker','Copa 2026','Escudo — Inglaterra','0a1b2c3d-0000-4000-8000-000000000001','ENG', true,  '{"country":"Inglaterra"}'),
  ('sticker','Copa 2026','Escudo — Portugal',  '0a1b2c3d-0000-4000-8000-000000000001','POR', true,  '{"country":"Portugal"}'),
  ('sticker','Copa 2026','Escudo — Espanha',   '0a1b2c3d-0000-4000-8000-000000000001','ESP', true,  '{"country":"Espanha"}'),
  ('sticker','Copa 2026','Vini Jr.',    '0a1b2c3d-0000-4000-8000-000000000001','7',  false, '{"country":"Brasil"}'),
  ('sticker','Copa 2026','Rodrygo',     '0a1b2c3d-0000-4000-8000-000000000001','21', false, '{"country":"Brasil"}'),
  ('sticker','Copa 2026','Neymar Jr.',  '0a1b2c3d-0000-4000-8000-000000000001','10', false, '{"country":"Brasil"}'),
  ('sticker','Copa 2026','Lionel Messi','0a1b2c3d-0000-4000-8000-000000000001','30', false, '{"country":"Argentina"}'),
  ('sticker','Copa 2026','Julián Álvarez','0a1b2c3d-0000-4000-8000-000000000001','31', false, '{"country":"Argentina"}'),
  ('sticker','Copa 2026','Enzo Fernández','0a1b2c3d-0000-4000-8000-000000000001','32', false, '{"country":"Argentina"}'),
  ('sticker','Copa 2026','Kylian Mbappé','0a1b2c3d-0000-4000-8000-000000000001','40', false, '{"country":"França"}'),
  ('sticker','Copa 2026','Aurélien Tchouaméni','0a1b2c3d-0000-4000-8000-000000000001','41', false, '{"country":"França"}'),
  ('sticker','Copa 2026','Ousmane Dembélé','0a1b2c3d-0000-4000-8000-000000000001','42', false, '{"country":"França"}'),
  ('sticker','Copa 2026','Jude Bellingham','0a1b2c3d-0000-4000-8000-000000000001','50', false, '{"country":"Inglaterra"}'),
  ('sticker','Copa 2026','Harry Kane','0a1b2c3d-0000-4000-8000-000000000001','51', false, '{"country":"Inglaterra"}'),
  ('sticker','Copa 2026','Bukayo Saka','0a1b2c3d-0000-4000-8000-000000000001','52', false, '{"country":"Inglaterra"}'),
  ('sticker','Copa 2026','Cristiano Ronaldo','0a1b2c3d-0000-4000-8000-000000000001','60', false, '{"country":"Portugal"}'),
  ('sticker','Copa 2026','Bruno Fernandes','0a1b2c3d-0000-4000-8000-000000000001','61', false, '{"country":"Portugal"}'),
  ('sticker','Copa 2026','Rafael Leão','0a1b2c3d-0000-4000-8000-000000000001','62', false, '{"country":"Portugal"}'),
  ('sticker','Copa 2026','Lamine Yamal','0a1b2c3d-0000-4000-8000-000000000001','70', false, '{"country":"Espanha"}'),
  ('sticker','Copa 2026','Pedri','0a1b2c3d-0000-4000-8000-000000000001','71', false, '{"country":"Espanha"}'),
  ('sticker','Copa 2026','Rodri','0a1b2c3d-0000-4000-8000-000000000001','72', false, '{"country":"Espanha"}');

-- vincula as figurinhas ao universo Copa e ajusta total_slots
update public.items
   set theme_id = '0b000000-0000-4000-8000-000000000001'
 where collection_id = '0a1b2c3d-0000-4000-8000-000000000001';

update public.collections
   set total_slots = (select count(*) from public.items
                       where collection_id = '0a1b2c3d-0000-4000-8000-000000000001')
 where id = '0a1b2c3d-0000-4000-8000-000000000001';

-- Universo Pokémon TCG: cards -------------------------------------------
insert into public.items (category, franchise, name, theme_id, sticker_number, rarity, is_special, attributes) values
  ('card','Pokémon TCG','Charizard ex',   '0b000000-0000-4000-8000-000000000002','SV3-125','Double Rare', true,  '{}'),
  ('card','Pokémon TCG','Pikachu VMAX',   '0b000000-0000-4000-8000-000000000002','SWSH-044','Rare',        true,  '{}'),
  ('card','Pokémon TCG','Umbreon VMAX',   '0b000000-0000-4000-8000-000000000002','EVS-215','Alt Art',      true,  '{}'),
  ('card','Pokémon TCG','Mewtwo GX',      '0b000000-0000-4000-8000-000000000002','SM-196', 'Rare',         false, '{}'),
  ('card','Pokémon TCG','Gengar',         '0b000000-0000-4000-8000-000000000002','FST-057','Uncommon',     false, '{}'),
  ('card','Pokémon TCG','Snorlax',        '0b000000-0000-4000-8000-000000000002','CRZ-143','Common',       false, '{}');

-- Universo Yu-Gi-Oh: cards ----------------------------------------------
insert into public.items (category, franchise, name, theme_id, sticker_number, rarity, is_special, attributes) values
  ('card','Yu-Gi-Oh!','Dark Magician',        '0b000000-0000-4000-8000-000000000003','LOB-005','Ultra Rare',  true,  '{}'),
  ('card','Yu-Gi-Oh!','Blue-Eyes White Dragon','0b000000-0000-4000-8000-000000000003','LOB-001','Ultra Rare', true,  '{}'),
  ('card','Yu-Gi-Oh!','Exodia the Forbidden One','0b000000-0000-4000-8000-000000000003','LOB-124','Ultra Rare', true, '{}'),
  ('card','Yu-Gi-Oh!','Summoned Skull',       '0b000000-0000-4000-8000-000000000003','MRD-003','Super Rare',  false, '{}'),
  ('card','Yu-Gi-Oh!','Celtic Guardian',      '0b000000-0000-4000-8000-000000000003','LOB-016','Rare',        false, '{}'),
  ('card','Yu-Gi-Oh!','Kuriboh',              '0b000000-0000-4000-8000-000000000003','MRD-071','Rare',        false, '{}');

commit;
