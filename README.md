# Acervo Geek

> Codinome anterior do projeto: **GeekMatch**.

Marketplace inteligente para colecionadores (cards, action figures, etc.) que elimina a desorganização de grupos de chat e fóruns através de três pilares:

1. **Reconhecimento de itens via câmera com IA** — o usuário fotografa o item e o sistema identifica automaticamente o card/figura no catálogo.
2. **Matchmaking inteligente** — sugestões de troca baseadas no cruzamento de inventário × lista de desejos entre usuários.
3. **Sistema de reputação** — confiança nas transações via avaliações pós-troca.

## Stack Técnica

| Camada | Tecnologia | Papel |
|---|---|---|
| Frontend | React Native + Expo (TypeScript) | App iOS/Android |
| Backend | Supabase (PostgreSQL) | Auth, banco transacional, Realtime |
| Mídia | AWS S3 | Fotos de itens e inventário |
| Data & IA | Databricks | ETL, Feature Store, modelos de match e precificação |

## Fluxo de dados (visão macro)

```
App (Expo) ──grava──▶ Supabase (Postgres) ──CDC/batch──▶ Databricks (bronze→silver→gold)
   ▲                                                          │
   └──lê (PostgREST/Realtime)── tabelas de insight ◀──escreve─┘
                       (match_suggestions, item_price_estimates)
```

O app **nunca fala diretamente com o Databricks**: o Databricks materializa os insights de volta em tabelas do Postgres/Supabase, e o app consome tudo pela mesma API (com RLS aplicada).

## Estrutura do repositório

```
docs/
  architecture.md            # Arquitetura, camadas Clean Architecture, decisões
  databricks-integration.md  # Fluxo Supabase ↔ Databricks (ingestão, IA, write-back)
  home-screen.md             # Deck de swipe (tela Descobrir)
  mvp-copa-stickers.md       # Vertical de arranque: figurinhas da Copa
supabase/
  migrations/
    0001_initial_schema.sql  # Esquema base do MVP com RLS e índices
    0002_marketplace.sql     # Venda (for_sale/preço) + swipes
    0003_copa_stickers.sql   # Álbuns, progresso, match de repetidas, troca justa
    0004_geo_radar.sql       # Localização + raio de busca + distância no match
mobile/                      # App React Native + Expo (TypeScript)
  src/
    app/                     # Rotas (Expo Router): tabs + modal de scan
    domain/                  # Entidades puras (MatchSuggestion, Trade)
    application/             # Portas (interfaces de repositório)
    infrastructure/          # Implementações (mocks hoje, Supabase depois)
    presentation/            # Componentes e hooks das telas
```

## Rodando o app

```bash
cd mobile
npm install
npm start        # Expo Go no celular, ou 'npm run web' no navegador
```

As telas atuais usam repositórios mock (`src/infrastructure/repositories/`) —
a UI já segue o contrato das tabelas do Supabase.

## Próximos passos

1. Criar o projeto Supabase e aplicar `supabase/migrations/0001_initial_schema.sql` (`supabase db push`).
2. Trocar os mocks por implementações Supabase em `mobile/src/infrastructure/` (auth + PostgREST + Realtime).
3. Fluxo de scan real: `expo-camera` + bucket S3 com URL pré-assinada (Edge Function `get-upload-url`).
4. Configurar ingestão CDC no Databricks conforme `docs/databricks-integration.md`.
