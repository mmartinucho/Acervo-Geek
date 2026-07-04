# GeekMatch

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
  home-screen.md             # Esboço de componentes da tela Home
supabase/
  migrations/
    0001_initial_schema.sql  # Esquema completo do MVP com RLS e índices
```

## Próximos passos

1. Criar o projeto Supabase e aplicar `supabase/migrations/0001_initial_schema.sql` (`supabase db push`).
2. Bootstrap do app: `npx create-expo-app@latest app --template tabs` seguindo a estrutura de `docs/home-screen.md`.
3. Configurar bucket S3 + upload via URL pré-assinada (Edge Function `get-upload-url`).
4. Configurar ingestão CDC no Databricks conforme `docs/databricks-integration.md`.
