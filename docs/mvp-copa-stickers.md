# MVP vertical — Figurinhas da Copa

Decisão de arranque: em vez de abraçar todos os colecionáveis no dia 1, o MVP
foca **um álbum de figurinhas da Copa**. Público massivo, dor cristalina
(repetida ↔ faltante) e ciclo curto (3–6 meses) que valida rápido a mecânica de
swipe/match e a IA de precificação. A base de usuários conquistada migra depois
para cards, figures e Funkos — o modelo de dados é o mesmo.

## 1. Modelo "tenho / preciso / repetida" (reaproveita o schema)

Não é preciso um modelo novo — mapeia direto no que já existe:

| Conceito do usuário | Tabela | Regra |
|---|---|---|
| **Tenho** | `user_inventory` | `quantity >= 1` |
| **Repetida** | `user_inventory` | `quantity > 1` → o excedente (`quantity - 1`) entra no match |
| **Preciso** | `wishlists` | slot que falta no álbum |
| **Álbum / progresso** | `collections` + view `user_collection_progress` | "faltam X para completar" |

A migration `0003_copa_stickers.sql` adiciona só o específico de álbum:
categoria `sticker`, tabela `collections`, `items.collection_id/sticker_number/
is_special`, a view de progresso e a calculadora de troca justa.

## 2. Fluxo do usuário (e onde já está no app)

1. **Onboarding** — escolhe o álbum que coleciona (`collections.is_active`).
2. **Catalogação rápida** — câmera + IA Vision reconhece a figurinha (nº + se é
   especial) e faz `INSERT`/incrementa `quantity` em `user_inventory`. Tela
   `scan` (hoje placeholder; ver §4 de fontes de dados).
3. **Lista de desejos** — marca os faltantes → `wishlists`.
4. **Swipe** — a tela **Descobrir** já mostra um card por vez; para figurinhas
   ele prioriza os seus faltantes que outros têm repetido. Direita = "quero"
   (grava em `swipes`), esquerda = passo. Um **radar de proximidade** (raio
   ajustável 25/100/500 km/Brasil) filtra quem está longe demais — troca de
   figurinha é presencial ou frete curto. Distância vem de `distance_km()` e o
   raio padrão de `profiles.search_radius_km` (migration 0004).
5. **Match inteligente** — quando há dupla ponta (minha repetida que ele quer +
   repetida dele que eu quero), dispara o overlay "Deu match!". Sem esperar o
   batch do Databricks, a função `find_sticker_matches(user)` já resolve o par;
   o ranking/torna refinado vem do job.

## 3. Calculadora de troca justa (o "torna")

O que tira a briga do "quanto vale" das mãos dos usuários:

- Valor de cada exemplar vem de `item_price_estimates` (modelo de pricing do
  Databricks, por item/condição).
- A tela de negociação soma os dois lados (via `trade_items`) e mostra:
  "Item A vale R$100, Item B vale R$80 → para ficar justo, adicione R$20."
- Ao aceitar, persiste em `trades.suggested_cash_brl` + `trades.cash_from`
  (quem paga) + `pricing_model_version` — auditoria e métrica de conversão.

## 4. Fontes de dados (o "coração técnico")

- **Cards (fase 2):** APIs públicas entregam foto, nome e preço — Pokémon TCG
  API, Scryfall (Magic). A IA só cruza o inventário com esses dados.
- **Figurinhas da Copa (MVP):** não há API rica; monta-se um **seed** (JSON) do
  álbum — `numero`, `nome`, `raridade/especial` — que popula `collections` +
  `items`. Preço médio vem de poucas fontes de mercado + o próprio histórico de
  trocas concluídas alimentando o pricing.
- **Reconhecimento visual:** Google Vision / AWS Rekognition ou um modelo
  próprio (embedding do catálogo via `items.embedding_ref`) servido pelo
  Databricks Model Serving, chamado pela Edge Function `scan-item`.

## 5. Monetização

- **Taxa de intermediação:** quando a transação envolve dinheiro (venda ou torna
  do match), uma pequena taxa de serviço pela intermediação e garantia.
- **Premium:** usuário comum tem limite de swipes/itens; o Premium desbloqueia
  gráficos de valorização do item no tempo, alertas de preço e prioridade no
  swipe dos outros. (Limites e gráficos são leitura sobre dados que o Databricks
  já produz — sem nova infra.)

## 6. Próximo passo concreto

1. Aplicar `0003_copa_stickers.sql`.
2. Criar o seed do primeiro álbum (JSON → `collections` + `items`).
3. Ligar a tela Descobrir ao Supabase (trocar o mock por `swipes` +
   `find_sticker_matches`) e o Scan à IA Vision.
