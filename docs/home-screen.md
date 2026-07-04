# Tela Descobrir (Home) — Deck de swipe

A Home é um **deck estilo Tinder**: um anúncio por vez, em tela cheia.
Deslizar para a **direita = quero** (interesse em trocar ou comprar), para a
**esquerda = passo**. Cada swipe é preferência revelada — o sinal de treino
mais valioso do matchmaking (tabela `swipes`, migration 0002).

## Tema do MVP — figurinhas da Copa

No vertical de arranque (ver `mvp-copa-stickers.md`), a Home vem tematizada:

- **Deck edge-to-edge**: o card ocupa a tela; header e botões flutuam sobre ele.
  A barra de progresso do álbum vive na aba **Coleção** ("Acervo."), não na Home.
- **Cards de figurinha**: foto full-bleed (fallback: base escura com brilho da
  cor da categoria + monograma), scrim preto na base e um **único badge** de modo
  no topo (Troca ou preço) — como no protótipo.
- **Gancho do match recíproco** (`matchReason`): pílula na **cor de acento do
  universo** ("Quer sua repetida do Neymar") — resultado de `find_sticker_matches`.
  Ao deslizar para a direita num match recíproco, o overlay **"Sinergia."** fecha
  o loop (dois avatares + Repeat + "Iniciar Contato").

O card é agnóstico de categoria: sem foto, cai no visual escuro + brilho da
franquia (cards/figures). Só a camada de dados muda por vertical.

## Wireframe

```
┌──────────────────────────────────────┐
│ (🏆 Copa do Mundo ▾)      (📍 100 km) │  pílulas de vidro flutuantes
│ ┌──────────────────────────────────┐ │  (universo abre dropdown)
│ │  [Troca]                         │ │  único badge de modo no topo
│ │                                  │ │
│ │        [foto do item]            │ │  full-bleed (fallback: brilho+monograma)
│ │                                  │ │
│ │  ✨ Quer sua repetida do Neymar   │ │  match hint na COR DE ACENTO
│ │  Lionel Messi                    │ │
│ │  Argentina · Impecável           │ │
│ │  ┌ vidro: @bruno · ★4.9 · 4 km ┐ │ │  card de vidro do dono
│ └──────────────────────────────────┘ │
│           (✕)        (♥ acento)       │  X vidro / ♥ acento com glow
│        ( ✨ ▨ 🔍  [◈]  💼 👤 )        │  nav flutuante + FAB de scan (acento)
└──────────────────────────────────────┘
```

## Regras de produto

1. **Anúncio ≥ item**: um card do deck é um exemplar de `user_inventory` com
   `for_trade` e/ou `for_sale + asking_price`. Badges "Troca" e preço
   convivem no mesmo card.
2. **Swipe direito em anúncio de troca** com score alto → overlay **"Sinergia."**
   com CTA "Iniciar Contato". Em anúncio de venda, o "quero" entra na lista de
   interesses/negociação de compra.
3. **Deck ordenado pelo matchmaking**: `match_suggestions`/score do Databricks
   define a ordem.
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
Coleção    → "Acervo.": fichário do universo ativo (progresso + grid de cartas)
Buscar     → "Explorar.": catálogo/inventários por texto e categoria
Negócios   → "Negociações.": abas Ativos/Histórico com status
Perfil     → nome, stats, "Universos Ativos", toggle de tema
Scan       → modal (câmera + IA) no FAB central da nav flutuante
```

## Design aplicado (Figma)

O design do protótipo (`design/figma-make/src/app/App.tsx`) foi aplicado a todas
as telas. Decisões que ficaram (fonte da verdade para futuras telas):

- **Tema dark-first**: fundos `#0a0a0a`/`#050505`, superfície `#111`, "vidro"
  (`white/5` + borda `white/10`) via `expo-blur`. Modo claro `#FAFAFA`. Tokens em
  `mobile/src/constants/theme.ts`. Toggle Sol/Lua no Perfil sobrescreve o tema do
  sistema (`presentation/theme/theme-mode-context.tsx`); todo o app lê de
  `hooks/use-color-scheme`, então o toggle re-pinta tudo.
- **Tipografia**: uma sans neutra única — **Inter**. Títulos usam
  `Inter_500Medium` com tracking negativo forte (não Space Grotesk, que foi
  removida). Peso **sempre** vem da família (`Fonts.*`), nunca de `fontWeight`
  (RN não sintetiza). Escala em `components/themed-text.tsx`.
- **Ícones**: `lucide-react-native` (+ `react-native-svg`), fiéis ao protótipo
  (traço fino, `strokeWidth` ajustável). Ionicons saiu das telas migradas.
- **Acento por universo**: a cor viva vem do universo ativo, não de um tint fixo.
  `useAccent()` (`presentation/theme/accent-context.tsx`) expõe `accent` a partir
  do `ThemeRepository`; ação primária, barra de progresso, match hint e o FAB de
  scan consomem dele. Trocar de universo (header do Descobrir, aba Coleção ou
  Perfil) re-pinta o acento em todo o app. Tabela canônica em
  `UniverseAccents` (Copa `#10B981`, Pokémon `#EF4444`, Yu-Gi-Oh `#D97706`,
  One Piece `#3B82F6`, Funko `#8B5CF6`, Magic `#14B8A6`), espelhada em
  `supabase/seed.sql` e nos mocks.
- **Onboarding**: login (landing social + form de e-mail) → "Seus mundos."
  (seleção de universo, grava o ativo) → "Fichário." (monta o álbum) → app.

> Nota: o repositório não tem um `CLAUDE.md` com seções numeradas (o
> `mobile/CLAUDE.md` apenas importa o `AGENTS.md` do Expo), então o registro do
> "design aplicado" ficou aqui em vez de numa "Seção 8".
