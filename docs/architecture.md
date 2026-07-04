# GeekMatch — Arquitetura do MVP

## Princípios

1. **O app só conversa com o Supabase.** Databricks e S3 ficam atrás dele (via tabelas de insight e URLs pré-assinadas). Isso mantém um único ponto de auth/autorização (RLS) e simplifica o cliente.
2. **Insights são dados, não chamadas.** Em vez de o app chamar um endpoint de ML em tempo real, o Databricks materializa resultados em tabelas Postgres (`match_suggestions`, `item_price_estimates`). O app lê como qualquer outro dado — com Realtime de graça. Exceção: o reconhecimento por câmera, que é síncrono por natureza (ver abaixo).
3. **Denormalizar com dono claro.** `profiles.reputation_score` é denormalizado, mas tem uma única fonte de escrita (trigger sobre `trade_reviews`). `match_suggestions.payload` carrega thumbnails/nomes prontos para evitar N+1 no feed.
4. **JSONB para atributos de cauda longa.** `items.attributes` absorve a variação entre categorias (cards vs. figuras). Um atributo é promovido a coluna quando vira filtro quente — não antes.

## Camadas (Clean Architecture no app)

```
app/src/
  domain/          # Entidades e regras puras (Item, Trade, MatchSuggestion)
  application/     # Casos de uso (ProposeTrade, ScanItem, DismissSuggestion)
  infrastructure/  # Gateways: SupabaseClient, S3Uploader, ScanApiClient
  presentation/    # Telas, componentes, hooks (React Native + Expo Router)
```

* **domain** não importa nada de fora (nem Supabase, nem React).
* **application** define interfaces de repositório (`TradeRepository`) implementadas em **infrastructure** — trocar Supabase por outra coisa não toca em regra de negócio.
* **presentation** consome casos de uso via hooks (`useMatchFeed`, `useScanItem`) usando TanStack Query para cache/estado de servidor.

## Fluxos principais

### 1. Cadastro de item via câmera (síncrono)

```
Câmera ─▶ Edge Function get-upload-url ─▶ upload direto ao S3 (URL pré-assinada)
       ─▶ Edge Function scan-item ─▶ Databricks Model Serving (endpoint REST)
       ◀─ top-N candidatos do catálogo (item_id + confiança)
Usuário confirma ─▶ INSERT em user_inventory (com ai_scan_meta para auditoria)
```

A Edge Function é o intermediário: guarda o token do Model Serving, aplica rate limit e loga a predição. O app nunca tem credencial do Databricks.

### 2. Matchmaking (assíncrono, batch → near-realtime depois)

Job diário/horário no Databricks cruza `user_inventory (for_trade)` × `wishlists`, pontua com o modelo de recomendação e faz upsert em `match_suggestions`. O app assina a tabela via Supabase Realtime — sugestões novas aparecem sem polling. Detalhes em [`databricks-integration.md`](./databricks-integration.md).

### 3. Ciclo de vida da troca

```
proposed → accepted → shipping → completed → (trade_reviews → reputation)
        ↘ cancelled            ↘ disputed
```

Transições validadas no caso de uso `UpdateTradeStatus` (e reforçadas por RLS: só as partes alteram). Reviews só destravam com `status = completed` — regra imposta na policy do banco, não só no app.

## Decisões e trade-offs registrados

| Decisão | Alternativa rejeitada | Motivo |
|---|---|---|
| Insights via tabelas Postgres | App chamando API do Databricks | Um só canal de dados, RLS unificada, Realtime grátis, app offline-tolerante |
| Reconhecimento via Edge Function → Model Serving | Modelo on-device | MVP mais rápido; on-device é otimização futura (custo/latência) |
| Embeddings fora do Postgres (`embedding_ref`) | pgvector no Supabase | Busca visual roda no Databricks onde o modelo vive; pgvector entra se precisarmos de busca vetorial no request path |
| Score de reputação denormalizado por trigger | Agregação na leitura | Feed lê score em toda listagem; escrita de review é rara |

## O que fica explicitamente FORA do MVP

* Pagamentos/escrow (trocas são combinadas entre as partes; disputa é manual).
* Chat próprio (a troca aceita expõe contato; chat in-app é fase 2).
* Precificação em tempo real (batch diário é suficiente para referência de valor).
