-- ============================================================================
-- Acervo Geek — Seed do primeiro álbum (Copa 2026)
-- Catálogo inicial de figurinhas. Aplicado após as migrations:
--   supabase db reset   (roda migrations + seed)
--   ou: psql -f supabase/seed.sql
--
-- Idempotente: limpa o álbum antes de repovoar.
-- Amostra representativa (escudos especiais + craques por seleção); o catálogo
-- completo (670 slots) entra depois via import do JSON oficial.
-- ============================================================================

begin;

-- Limpa o álbum anterior (items -> collection, respeitando FK).
delete from public.items where collection_id = '0a1b2c3d-0000-4000-8000-000000000001';
delete from public.collections where id = '0a1b2c3d-0000-4000-8000-000000000001';

-- total_slots recebe um provisório (>0, exigido pelo check) e é recalculado
-- ao fim, refletindo o catálogo realmente semeado.
insert into public.collections (id, name, publisher, year, total_slots, is_active)
values ('0a1b2c3d-0000-4000-8000-000000000001', 'Copa 2026', 'Panini', 2026, 1, true);

-- Helper local: insere uma figurinha no álbum.
-- (country vai em attributes — atributo de cauda longa, vira coluna se virar
--  filtro quente.)
insert into public.items
  (category, franchise, name, collection_id, sticker_number, is_special, attributes)
values
  -- Escudos (especiais / holográficos)
  ('sticker','Copa 2026','Escudo — Brasil',    '0a1b2c3d-0000-4000-8000-000000000001','BRA', true,  '{"country":"Brasil"}'),
  ('sticker','Copa 2026','Escudo — Argentina', '0a1b2c3d-0000-4000-8000-000000000001','ARG', true,  '{"country":"Argentina"}'),
  ('sticker','Copa 2026','Escudo — França',    '0a1b2c3d-0000-4000-8000-000000000001','FRA', true,  '{"country":"França"}'),
  ('sticker','Copa 2026','Escudo — Inglaterra','0a1b2c3d-0000-4000-8000-000000000001','ENG', true,  '{"country":"Inglaterra"}'),
  ('sticker','Copa 2026','Escudo — Portugal',  '0a1b2c3d-0000-4000-8000-000000000001','POR', true,  '{"country":"Portugal"}'),
  ('sticker','Copa 2026','Escudo — Espanha',   '0a1b2c3d-0000-4000-8000-000000000001','ESP', true,  '{"country":"Espanha"}'),
  -- Brasil
  ('sticker','Copa 2026','Vini Jr.',    '0a1b2c3d-0000-4000-8000-000000000001','7',  false, '{"country":"Brasil"}'),
  ('sticker','Copa 2026','Rodrygo',     '0a1b2c3d-0000-4000-8000-000000000001','21', false, '{"country":"Brasil"}'),
  ('sticker','Copa 2026','Neymar Jr.',  '0a1b2c3d-0000-4000-8000-000000000001','10', false, '{"country":"Brasil"}'),
  -- Argentina
  ('sticker','Copa 2026','Lionel Messi','0a1b2c3d-0000-4000-8000-000000000001','30', false, '{"country":"Argentina"}'),
  ('sticker','Copa 2026','Julián Álvarez','0a1b2c3d-0000-4000-8000-000000000001','31', false, '{"country":"Argentina"}'),
  ('sticker','Copa 2026','Enzo Fernández','0a1b2c3d-0000-4000-8000-000000000001','32', false, '{"country":"Argentina"}'),
  -- França
  ('sticker','Copa 2026','Kylian Mbappé','0a1b2c3d-0000-4000-8000-000000000001','40', false, '{"country":"França"}'),
  ('sticker','Copa 2026','Aurélien Tchouaméni','0a1b2c3d-0000-4000-8000-000000000001','41', false, '{"country":"França"}'),
  ('sticker','Copa 2026','Ousmane Dembélé','0a1b2c3d-0000-4000-8000-000000000001','42', false, '{"country":"França"}'),
  -- Inglaterra
  ('sticker','Copa 2026','Jude Bellingham','0a1b2c3d-0000-4000-8000-000000000001','50', false, '{"country":"Inglaterra"}'),
  ('sticker','Copa 2026','Harry Kane','0a1b2c3d-0000-4000-8000-000000000001','51', false, '{"country":"Inglaterra"}'),
  ('sticker','Copa 2026','Bukayo Saka','0a1b2c3d-0000-4000-8000-000000000001','52', false, '{"country":"Inglaterra"}'),
  -- Portugal
  ('sticker','Copa 2026','Cristiano Ronaldo','0a1b2c3d-0000-4000-8000-000000000001','60', false, '{"country":"Portugal"}'),
  ('sticker','Copa 2026','Bruno Fernandes','0a1b2c3d-0000-4000-8000-000000000001','61', false, '{"country":"Portugal"}'),
  ('sticker','Copa 2026','Rafael Leão','0a1b2c3d-0000-4000-8000-000000000001','62', false, '{"country":"Portugal"}'),
  -- Espanha
  ('sticker','Copa 2026','Lamine Yamal','0a1b2c3d-0000-4000-8000-000000000001','70', false, '{"country":"Espanha"}'),
  ('sticker','Copa 2026','Pedri','0a1b2c3d-0000-4000-8000-000000000001','71', false, '{"country":"Espanha"}'),
  ('sticker','Copa 2026','Rodri','0a1b2c3d-0000-4000-8000-000000000001','72', false, '{"country":"Espanha"}');

-- total_slots reflete o catálogo realmente semeado (progresso coerente).
update public.collections
   set total_slots = (select count(*) from public.items
                       where collection_id = '0a1b2c3d-0000-4000-8000-000000000001')
 where id = '0a1b2c3d-0000-4000-8000-000000000001';

commit;
