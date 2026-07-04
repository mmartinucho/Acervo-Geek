# Tela Descobrir (Home) — Deck de swipe

A Home é um **deck estilo Tinder**: um anúncio por vez, em tela cheia.
Deslizar para a **direita = quero** (interesse em trocar ou comprar), para a
**esquerda = passo**. Cada swipe é preferência revelada — o sinal de treino
mais valioso do matchmaking (tabela `swipes`, migration 0002).

## Wireframe

```
┌──────────────────────────────────────┐
│ Descobrir                       (📷) │  título + atalho para o scan
│ [Tudo] [Troca] [Venda]               │  filtro por modo de anúncio
│ ┌──────────────────────────────────┐ │
│ │  QUERO↗            badges: Troca │ │  carimbos aparecem ao arrastar
│ │                       R$ 1.250   │ │
│ │         [arte do item]           │ │  monograma sobre cor da categoria
│ │                                  │ │  (foto real na fase Supabase/S3)
│ │  Umbreon VMAX Alt Art            │ │
│ │  Pokémon TCG · Quase novo        │ │
│ │  @cardshark_rj · ★4.9 · Rio      │ │
│ └──────────────────────────────────┘ │
│           (✕)        (♥)             │  botões espelham os gestos
├──────────────────────────────────────┤
│ Descobrir | Buscar | Negócios | Perfil│
└──────────────────────────────────────┘
```

## Regras de produto

1. **Anúncio ≥ item**: um card do deck é um exemplar de `user_inventory` com
   `for_trade` e/ou `for_sale + asking_price`. Badges "Troca" e preço
   convivem no mesmo card.
2. **Swipe direito em anúncio de troca** com score alto → overlay **"Deu
   match!"** com CTA "Propor troca". Em anúncio de venda, o "quero" entra na
   lista de interesses/negociação de compra.
3. **Deck ordenado pelo matchmaking**: `match_suggestions`/score do Databricks
   define a ordem; filtros Tudo/Troca/Venda são locais.
4. **Deck nunca trava**: vazio → CTA "Recomeçar" (e, na fase Supabase, o
   Realtime repõe cards novos).

## Implementação

```
src/presentation/components/deck/
  swipe-deck.tsx   # gesto Pan (gesture-handler) + física (reanimated),
                   # carimbos QUERO/PASSO, pilha com 3 cards visíveis
  deck-card.tsx    # arte por categoria, badges de modo/preço, dono+reputação
src/presentation/hooks/use-deck.ts  # fila, filtro, swipe, celebração de match
```

Contratos: `DeckListing` (domain) ⇄ `DeckRepository` (port) ⇄
`MockDeckRepository` (infra, trocado por Supabase depois).

## Demais tabs

```
Descobrir  → este deck
Buscar     → catálogo/inventários por texto e categoria
Negócios   → trocas, compras e vendas com status (antiga "Trocas")
Perfil     → acervo, wishlist, reputação
Scan       → modal (câmera + IA) acessível pelo ícone no topo do deck
```
