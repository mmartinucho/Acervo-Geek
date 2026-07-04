# Integração Databricks ↔ Supabase

## Visão geral

```
                    (1) Ingestão                        (2) Processamento
Supabase Postgres ────────────────▶ Databricks Lakehouse ─────────────────┐
  profiles, items,   CDC (logical     bronze → silver → gold             │
  user_inventory,    replication)     Feature Store                      │
  wishlists, trades                   Jobs: matchmaking, pricing         │
        ▲                                                                │
        │           (3) Write-back (JDBC, service_role)                  │
        └────────── match_suggestions, item_price_estimates ◀────────────┘

App ◀── PostgREST / Realtime ── Supabase (RLS aplicada normalmente)
```

## 1. Ingestão (Supabase → Databricks)

**MVP: Lakeflow Connect / ingestão federada via JDBC** lendo réplicas das tabelas transacionais em janelas horárias (incremental por `updated_at`/`created_at`). É suficiente porque o matchmaking do MVP roda em batch.

**Evolução: CDC via logical replication.** O Supabase expõe replicação lógica do Postgres (`wal2json`); um conector (Debezium/Kafka ou Lakeflow CDC) alimenta as tabelas bronze com latência de segundos quando o matchmaking migrar para near-realtime.

Camadas no lakehouse (medallion):

| Camada | Conteúdo |
|---|---|
| **bronze** | Cópia crua das tabelas do Supabase + eventos de scan (logs das Edge Functions) |
| **silver** | Dados limpos e conformados: inventário "tradeable" resolvido contra o catálogo, wishlists deduplicadas, histórico de trocas com desfecho |
| **gold** | Agregados prontos para features: matriz usuário×item, taxas de conversão de sugestão→troca, sinais de preço por item/condição |

## 2. Feature Store e modelos

* **Feature Store (Unity Catalog):** features por usuário (colecionabilidade, atividade, reputação), por item (raridade, demanda = wishlists ativas / ofertas) e por par usuário-usuário (sobreposição inventário×wishlist, distância geográfica).
* **Modelo de matchmaking (MVP):** heurística pontuada — interseção bidirecional `inventory(A) ∩ wishlist(B)` e vice-versa, ponderada por prioridade da wishlist, condição mínima, reputação e localidade. Vira ranking learning-to-rank quando houver histórico de conversão (`trades.suggestion_id` existe exatamente para esse feedback loop).
* **Modelo de precificação:** regressão por item/condição sobre trocas concluídas + sinais externos; publica em `item_price_estimates`.
* **Reconhecimento de imagem:** embedding visual (CLIP-like) servido via **Databricks Model Serving**; busca por similaridade contra os embeddings do catálogo (referenciados por `items.embedding_ref`). Chamado sincronamente pela Edge Function `scan-item`.

## 3. Write-back (Databricks → Supabase)

O job de matchmaking termina com um **upsert via JDBC** direto no Postgres do Supabase, usando uma role dedicada (`databricks_writer`) com permissão **apenas** nas tabelas de insight:

```sql
grant insert, update, delete on public.match_suggestions    to databricks_writer;
grant insert, update        on public.item_price_estimates to databricks_writer;
```

Regras do write-back:

1. **Upsert idempotente** com `model_version` e `generated_at` — reprocessar um job não duplica sugestões.
2. **`expires_at` obrigatório** — sugestões velhas somem do feed sem depender de limpeza do app (o índice parcial já filtra `dismissed_at is null`; um job de retenção apaga expiradas semanalmente).
3. **Payload completo** (`payload` JSONB com ids, nomes e thumbnails dos itens dos dois lados) para o feed renderizar com uma única query.
4. **Nunca escrever nas tabelas transacionais.** Se um modelo precisar enriquecer `items` (ex.: novo item detectado pelos scans), isso passa por um pipeline de curadoria separado, não pelo write-back de sugestões.

## 4. Consumo no app

* Feed de matches: `select * from match_suggestions where dismissed_at is null and expires_at > now() order by score desc` — RLS garante que cada usuário só vê as suas.
* **Supabase Realtime** na tabela `match_suggestions` notifica o app quando o job publica sugestões novas ("Você tem 3 novos matches!").
* Preço de referência: join de `item_price_estimates` na tela de detalhe do item.

## Métricas do loop de IA

`trades.suggestion_id` liga cada troca à sugestão que a originou. No gold layer isso vira a métrica norte do matchmaking: **taxa de conversão sugestão → troca proposta → troca concluída**, segmentada por `model_version` — base para A/B de modelos sem tocar no app.
