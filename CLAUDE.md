# Acervo Geek — Guia para o Claude Code

Leia este arquivo ao iniciar a sessão. Ele explica o produto, como rodar, as
convenções, o estado atual e — no fim — um **passo a passo para aplicar o design
do Figma** ao app. Comentários, docs e textos de UI são em **português (pt-BR)**.

---

## 1. O que é

**Acervo Geek** é um marketplace mobile inteligente para colecionadores do
**universo geek** (cards de TCG, figurinhas de álbum, action figures, Funko,
HQs, games). O usuário escolhe um ou mais **universos** que coleciona e o app se
adapta ao **universo ativo** (inclusive a cor de acento muda por universo).

Pilares:
1. **Reconhecimento por câmera com IA** — fotografa o item e identifica no catálogo.
2. **Matchmaking** — deck de swipe estilo Tinder que cruza *minhas repetidas* ×
   *lista de desejos do outro*, sempre dentro do universo ativo.
3. **Reputação** — confiança via avaliações pós-troca.

Modelo mental por item: **Preciso** (wishlist) · **Tenho** · **Repetida**
(o excedente entra no match). Universo de **lançamento**: Copa do Mundo.

Docs: `docs/architecture.md`, `docs/databricks-integration.md`,
`docs/collectible-themes.md`, `docs/home-screen.md`.

---

## 2. Estrutura do repositório

```
mobile/                          App React Native + Expo (TypeScript, Expo Router)
  src/
    app/
      _layout.tsx                Layout raiz: fontes, tema, AuthProvider, guard de rota
      (auth)/sign-in.tsx         Login/cadastro
      (tabs)/_layout.tsx         Barra de abas
      (tabs)/index.tsx           Descobrir (deck de swipe)  ← tela principal
      (tabs)/search.tsx          Buscar
      (tabs)/trades.tsx          Negócios (troca/compra/venda)
      (tabs)/profile.tsx         Perfil
      onboarding.tsx             Montar álbum (grade de figurinhas/cards)
      scan.tsx                   Modal de câmera (placeholder)
    domain/entities/             Entidades puras (item, listing, trade, theme, …)
    application/ports/           Interfaces de repositório (contratos)
    infrastructure/
      container.ts               Amarração das portas (mock ↔ Supabase por env)
      supabase/client.ts         Cliente Supabase (só se houver env)
      repositories/              mock-*.ts e supabase-*.ts (um par por porta)
    presentation/
      auth/auth-context.tsx      useAuth + guard de onboarding
      components/                UI (deck/, avatar, chips, …)
      hooks/                     useDeck, useAlbumSheet, useDeals, …
    constants/theme.ts           Design system (cores, fontes, spacing, gradientes)
    components/themed-text.tsx   Escala tipográfica (variantes)
    components/themed-view.tsx   View com cor de fundo do tema
    hooks/use-theme.ts           useTheme() → paleta do modo atual
supabase/
  migrations/0001..0007          Schema, RLS, RPCs — versionadas e IMUTÁVEIS
  seed.sql                       Universos + catálogos (Copa/Pokémon/Yu-Gi-Oh)
design/figma-make/               Referência visual (export do Figma Make) — NÃO é o app
  src/app/App.tsx                Protótipo com TODAS as telas (fonte da verdade visual)
  src/styles/theme.css           Tokens (base shadcn; acento é dinâmico no App.tsx)
docs/                            Arquitetura, Databricks, temas, home
```

---

## 3. Stack

- **Frontend:** React Native + Expo SDK 57 (TS), Expo Router, Reanimated +
  Gesture Handler (swipe), expo-linear-gradient, @expo/vector-icons (Ionicons).
- **Fontes:** Space Grotesk (display) + Inter (texto), via `@expo-google-fonts`,
  carregadas em `_layout.tsx`.
- **Backend:** Supabase (PostgreSQL + Auth + Realtime), RLS em tudo.
- **Mídia:** AWS S3 (upload por URL pré-assinada via Edge Function).
- **Data/IA:** Databricks (ETL, matchmaking, precificação) — materializa insights
  em tabelas Postgres; o app nunca fala direto com o Databricks.

---

## 4. Como rodar (local)

### App
```bash
cd mobile
npm install
npm start            # Expo: 'w' web, 'i' iOS, 'a' Android, ou Expo Go no celular
```

Verificações (rode antes de commitar mudança não-trivial):
```bash
npx tsc --noEmit                 # typecheck — deve passar limpo
npx expo export --platform web   # garante que o bundle compila (todas as rotas)
```

> **Truque de verificação visual sem simulador:** `npx expo export --platform web`
> gera um site estático em `dist/`. Sirva com `npx serve dist` e abra no navegador
> (ou tire screenshots) para conferir o layout de cada tela rapidamente.

**Sem `.env`, o app roda com dados MOCK** (UI idêntica à conectada). Para ligar
ao Supabase: copie `mobile/.env.example` → `mobile/.env` e preencha
`EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`. O
`src/infrastructure/container.ts` troca mocks por Supabase automaticamente.

### Banco (Supabase)
```bash
supabase db reset    # aplica migrations 0001..0007 + seed.sql
```

Migrations são **imutáveis e ordenadas**: para mudar schema, crie um novo
`000N_descricao.sql` — nunca edite um já aplicado. RLS em tudo; escrita restrita
ao dono (`auth.uid()`), exceto tabelas de insight (Databricks via service_role).

RPCs (escopadas pelo universo ativo via `resolve_theme`): `list_themes`,
`set_active_theme`, `album_sheet`, `set_slot_state`, `find_sticker_matches`,
`deck_for_user`, `has_collection_data`.

---

## 5. Arquitetura (Clean Architecture)

Dependência: `presentation → application → domain`; `infrastructure` implementa
as portas de `application`. Regras:

- **domain** não importa nada de fora (nem React, nem Supabase).
- **application/ports** define interfaces: `DeckRepository`, `AuthRepository`,
  `CollectionRepository`, `ThemeRepository`, `DealRepository`.
- **infrastructure** tem DUAS implementações por porta: `mock-*` e `supabase-*`.
  O **`container.ts`** escolhe conforme `EXPO_PUBLIC_*` — único ponto que muda ao
  ligar o backend. **Mantenha os dois lados funcionando.**
- **presentation** consome via hooks.

**Receita para nova feature de dados:** entidade em `domain/` → porta em
`application/ports/` → `mock-*` e `supabase-*` em `infrastructure/repositories/`
→ ligar no `container.ts` → hook em `presentation/hooks/`.

---

## 6. Design system e tipografia (estado atual)

Cor/fonte/spacing vêm de `mobile/src/constants/theme.ts`. Texto passa por
`ThemedText` (variantes: `display`, `title`, `subtitle`, `body`, `bodyMedium`,
`label`, `small`, `smallBold`, `caption`). Fundo por `ThemedView`/`useTheme()`.
Suporte a claro/escuro via `useColorScheme`.

⚠️ **Fonte nomeada ignora `fontWeight` no RN.** Cada peso é uma família
(`Inter_600SemiBold`, `SpaceGrotesk_700Bold`). Nunca use `fontWeight` inline
esperando negrito — use a **variante** do `ThemedText` ou `fontFamily: Fonts.<peso>`.

---

## 7. Convenções

- **Idioma:** pt-BR em UI, comentários e docs.
- **TypeScript strict**, sem `any` desnecessário; `tsc --noEmit` limpo.
- **Verifique de verdade:** UI → gere o web export e olhe; banco → rode as
  migrations (`supabase db reset`) antes de commitar. Não confie só no typecheck.
- **Commits** claros e em escopo; a mensagem explica o "porquê".

---

## 8. Estado atual e próximos passos

**Pronto e validado:** schema + RLS; venda/swipes; figurinhas da Copa; radar de
proximidade; RPCs do deck; wiring do Supabase; autenticação (login/cadastro +
guard); onboarding (montar álbum); tipografia; modelo multi-universo (temas com
`ThemeRepository` mock+Supabase). App roda em mock; camada Supabase pronta.

**Pendente (prioridade):**
1. **Aplicar o design do Figma** ao app — ver Seção 10.
2. **Tela de seleção de universo** (onboarding) ligada ao `ThemeRepository`.
3. **Scan real:** `expo-camera` → Edge Function → IA Vision.
4. **`SupabaseDealRepository`** (aba Negócios ainda em mock).

---

## 9. Regras importantes / cuidados

- **NUNCA commitar segredos** (`.env`, chaves de acesso, tokens). Já apareceu um
  arquivo "Chave de acesso" solto — se ver algo assim, avise e gitignore/remova.
- **Não edite migrations aplicadas** — crie a próxima `000N_*.sql`.
- **Não quebre o caminho mock:** o app roda sem `EXPO_PUBLIC_*`.
- **`design/figma-make/` é REFERÊNCIA**, não código do app — não misture no
  bundle mobile e não instale as libs dele (Tailwind, framer-motion) no `mobile/`.
- Antes de subir: cheque `git status` e adicione só o que faz parte da mudança
  (evite `git add .` cego).
- Notas de Expo em `mobile/AGENTS.md`.

---

## 10. PASSO A PASSO — Aplicar o design do Figma

Objetivo: traduzir o protótipo `design/figma-make/src/app/App.tsx` (React web +
Tailwind + framer-motion) para o app React Native, **sem** copiar código — o RN
usa `StyleSheet` (não Tailwind) e Reanimated (não framer-motion). O `App.tsx` é a
**fonte da verdade visual**; leia-o inteiro antes de começar.

### Direção visual do protótipo (resumo do que observar)
- **Dark-first** (fundo `#050505`/`#0a0a0a`; superfícies `#111`; vidro
  `white/5` + `backdrop-blur` + borda `white/10`). Modo claro existe (toggle
  Sol/Lua no Perfil) — fundo `#FAFAFA`.
- **Acento dinâmico por universo** (CSS var `--accent`): usado em ação primária,
  barra de progresso, "match hint", FAB de scan, seleção. Cores por universo:
  | universo | cor | ícone (lucide) |
  |---|---|---|
  | Pokémon TCG | `#EF4444` | Aperture |
  | Yu-Gi-Oh! | `#D97706` | Eye |
  | Copa do Mundo | `#10B981` | Trophy |
  | One Piece | `#3B82F6` | Anchor |
  | Funko Pop | `#8B5CF6` | Package |
  | Magic | `#14B8A6` | Hexagon |
- **Botão primário:** pílula, **invertido** (dark: fundo branco + texto preto;
  claro: fundo preto + texto branco), `active:scale`.
- **Tipografia:** títulos **grandes** (`text-4xl`/`text-6xl`), `font-medium`
  (500, NÃO 800), `tracking-tighter`, e muitos terminam com **ponto final**
  ("Acervo.", "Seus mundos.", "Fichário.", "Negociações.", "Sinergia."). Labels
  minúsculos `uppercase tracking-widest` (`text-[9px]`/`[10px]`). Números em mono.
- **Cantos:** cards `rounded-[28px]`..`[40px]`; pílulas `rounded-full`; chips de
  card na coleção com **aspect ratio 63/88** (proporção de carta TCG).
- **Nav flutuante:** pílula com blur na base, 5 ícones (Sparkles=Descobrir,
  Layers=Coleção, Search=Buscar, Briefcase=Negócios, User=Perfil) + **FAB central
  de Scan** na cor de acento.
- **Motion:** entradas com fade/scale, scanline no scan, deck arrastável.

### Mapa tela do Figma → arquivo do app
| Figma (componente em App.tsx) | Arquivo alvo no app |
|---|---|
| `LoginScreen` | `app/(auth)/sign-in.tsx` |
| `UniverseSelectionScreen` ("Seus mundos") | **nova rota** onboarding de universo (ligar ao `ThemeRepository`) |
| `CollectionSetupScreen` / `TabCollection` ("Fichário"/"Acervo") | `app/onboarding.tsx` e uma **aba Coleção** |
| `TabDiscover` (deck) | `app/(tabs)/index.tsx` + `presentation/components/deck/*` |
| `MatchOverlay` ("Sinergia") | overlay em `app/(tabs)/index.tsx` |
| `ScanModal` | `app/scan.tsx` |
| `TabSearch` ("Explorar") | `app/(tabs)/search.tsx` |
| `TabDeals` ("Negociações") | `app/(tabs)/trades.tsx` |
| `TabProfile` | `app/(tabs)/profile.tsx` |
| `NavItem` + nav flutuante | `app/(tabs)/_layout.tsx` (tabBar custom) |
| `BrandLogo` (SVG hexágono) | novo `presentation/components/brand-logo.tsx` (react-native-svg) |

### Fases (faça em ordem, verificando a cada uma)

**Fase 0 — Preparar**
1. Leia `design/figma-make/src/app/App.tsx` por inteiro e liste as telas/estados.
2. Decida ícones: para fidelidade ao lucide, instale **`lucide-react-native`** no
   `mobile/` (+ `react-native-svg`); ou mapeie para Ionicons já usados. Registre a
   decisão aqui.
3. Se for usar o logo SVG animado, instale `react-native-svg`.

**Fase 1 — Tokens + acento dinâmico (base de tudo)**
1. Reescreva `constants/theme.ts` com a paleta dark-first do protótipo
   (backgrounds, superfícies, vidro, bordas, texto) e o modo claro.
2. Adicione o mapa de universos (cor + ícone) — pode reusar/alinhar com
   `ThemeRepository`/`seed.sql`. ⚠️ **Reconcilie os acentos:** hoje o `seed.sql`
   usa outras cores (`themes.accent`); alinhe com a tabela acima (ex.: Copa
   `#10B981`), ou escolha a fonte de verdade e ajuste o outro lado.
3. Crie um **`AccentProvider` + `useAccent()`** (`presentation/`) que expõe a cor
   do **universo ativo** (do `ThemeRepository`/estado). Componentes de ação
   primária, progresso, match e scan leem `useAccent()` em vez de `theme.tint`.
4. Ajuste `ThemedText` à hierarquia do Figma (tamanhos/tracking; pesos via
   `Fonts.*`). Decida a fonte: manter Space Grotesk/Inter ou trocar para uma sans
   `font-medium` mais neutra como no protótipo — registre a decisão.
5. Verifique: `tsc --noEmit` + export web.

**Fase 2 — Componentes base (reutilizáveis)**
Crie/atualize em `presentation/components/`:
1. `PrimaryButton` (pílula invertida), `GlassButton`, `Chip`, `GlassCard`.
2. `StatusPill` (Proposta/Trânsito/Concluída — âmbar/azul/esmeralda).
3. **Bottom nav flutuante** (pílula blur + FAB de scan com acento) no
   `(tabs)/_layout.tsx` (`tabBar` custom).
4. `DeckCard` (imagem full-bleed + scrim + "match hint" na cor de acento + card
   de vidro do dono) e `SwipeDeck` (arraste + botões X/♥).
5. Grid da coleção: chip com **aspect 63/88** e 4 estados
   (NONE/NEED=rose/HAVE=acento/REPEAT=âmbar+badge "2").

**Fase 3 — Telas (uma por vez, comparando com o protótipo)**
Siga o mapa acima. Para cada tela: implemente → export web → screenshot → compare
com a tela correspondente do `App.tsx` → ajuste. Sugestão de ordem por impacto:
`(tabs)/index.tsx` (Descobrir) → seleção de universo → onboarding/coleção →
match overlay → perfil → negócios → buscar → scan → login.

**Fase 4 — Integração e verificação final**
1. Ligue a seleção de universo ao `ThemeRepository` (`list_themes` /
   `set_active_theme`) e o `useAccent()` ao universo ativo — trocar de universo
   deve trocar o acento em todo o app.
2. `tsc --noEmit` limpo + `expo export --platform web` sem erros.
3. Screenshot de cada tela (claro e escuro) e revisão lado a lado com o Figma.
4. Confirme que o **caminho mock ainda funciona** (app sobe sem `.env`).

### Cuidados específicos desta migração
- **Não** instale Tailwind/framer-motion no `mobile/`; traduza para `StyleSheet`
  + Reanimated. O `design/figma-make/` continua sendo só referência.
- Classes Tailwind → estilos: `rounded-full`→`borderRadius: 999`; `bg-white/5`→
  `rgba(255,255,255,0.05)`; `backdrop-blur`→`expo-blur` (`BlurView`); gradientes→
  `expo-linear-gradient`.
- Mantenha o **alerta de `fontWeight`** (Seção 6): pesos via família de fonte.
- O protótipo usa imagens do Unsplash e avatares fake — no app real vêm do S3/
  catálogo; use placeholders coerentes enquanto não houver mídia real.
