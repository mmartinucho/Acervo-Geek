# Acervo Geek — Guia para o Claude Code

Leia este arquivo ao iniciar. Ele explica o que é o projeto, como rodar, as
convenções e o que fazer/evitar. Comentários, docs e textos de UI são em
**português (pt-BR)**.

---

## 1. O que é

**Acervo Geek** é um marketplace mobile inteligente para colecionadores do
**universo geek** (cards de TCG, figurinhas de álbum, action figures, Funko,
HQs, games). O usuário escolhe um ou mais **universos** que coleciona (Copa do
Mundo, Pokémon, Yu-Gi-Oh, One Piece, Funko, Magic…) e o app se adapta ao
**universo ativo**. Três pilares:

1. **Reconhecimento por câmera com IA** — fotografa o item e identifica no catálogo.
2. **Matchmaking** — deck de swipe estilo Tinder que cruza *minhas repetidas* ×
   *lista de desejos do outro*, escopado pelo universo ativo.
3. **Reputação** — confiança via avaliações pós-troca.

Modelo mental do usuário por item: **Preciso** (wishlist) · **Tenho** ·
**Repetida** (excedente entra no match). Universo de lançamento: **Copa do Mundo**.

Docs de produto/arquitetura: `docs/architecture.md`,
`docs/databricks-integration.md`, `docs/collectible-themes.md`,
`docs/home-screen.md`.

---

## 2. Estrutura do repositório

```
mobile/                  App React Native + Expo (TypeScript, Expo Router)
  src/
    app/                 Rotas: (auth), (tabs), onboarding, scan
    domain/              Entidades e regras puras (sem React/Supabase)
    application/ports/   Interfaces de repositório (contratos)
    infrastructure/      Implementações: mock-* e supabase-*, + container.ts
    presentation/        Componentes, hooks, auth-context
    constants/theme.ts   Design system (cores, fontes, spacing)
    components/themed-text.tsx  Escala tipográfica
supabase/
  migrations/            0001..0007 (schema, RLS, RPCs) — versionadas, em ordem
  seed.sql               Universos + catálogos (Copa/Pokémon/Yu-Gi-Oh)
design/figma-make/       Referência visual (export do Figma Make) — NÃO é o app
docs/                    Arquitetura, integração Databricks, temas, home
```

---

## 3. Stack

- **Frontend:** React Native + Expo SDK 57 (TypeScript), Expo Router, Reanimated
  + Gesture Handler (swipe), expo-linear-gradient, @expo/vector-icons.
- **Fontes:** Space Grotesk (títulos) + Inter (texto) via `@expo-google-fonts`.
- **Backend:** Supabase (PostgreSQL + Auth + Realtime), RLS em tudo.
- **Mídia:** AWS S3 (upload por URL pré-assinada via Edge Function).
- **Data/IA:** Databricks (ETL, matchmaking, precificação) — escreve de volta em
  tabelas de insight no Postgres; o app nunca fala direto com o Databricks.

---

## 4. Como rodar (local)

### App

```bash
cd mobile
npm install
npm start            # Expo: 'w' web, 'i' iOS, 'a' Android, ou Expo Go no celular
```

Verificações rápidas (rode antes de commitar mudança não-trivial):

```bash
npx tsc --noEmit                 # typecheck (deve passar limpo)
npx expo export --platform web   # garante que o bundle compila (todas as rotas)
```

**Sem configuração, o app roda com dados MOCK** — a UI é idêntica à versão
conectada. Para ligar ao Supabase real, copie `mobile/.env.example` para
`mobile/.env` e preencha `EXPO_PUBLIC_SUPABASE_URL` e
`EXPO_PUBLIC_SUPABASE_ANON_KEY`. O `src/infrastructure/container.ts` troca os
mocks pelas implementações Supabase automaticamente quando as env vars existem.

### Banco (Supabase)

```bash
supabase db reset    # aplica migrations 0001..0007 + seed.sql
```

Migrations são **imutáveis e ordenadas**: para mudar o schema, crie um novo
arquivo `000N_descricao.sql` — nunca edite um já aplicado. Todas as tabelas têm
RLS; escrita sempre restrita ao dono (`auth.uid()`), exceto tabelas de insight
(escritas pelo Databricks via service_role).

RPCs principais (escopadas pelo universo ativo via `resolve_theme`):
`list_themes`, `set_active_theme`, `album_sheet`, `set_slot_state`,
`find_sticker_matches`, `deck_for_user`, `has_collection_data`.

---

## 5. Arquitetura (Clean Architecture)

Fluxo de dependência: `presentation → application → domain`, com
`infrastructure` implementando as portas de `application`. Regra de ouro:

- **domain** não importa nada de fora (nem React, nem Supabase).
- **application/ports** define interfaces (`DeckRepository`, `AuthRepository`,
  `CollectionRepository`, `ThemeRepository`, `DealRepository`).
- **infrastructure** tem duas implementações de cada porta: `mock-*` (dados
  locais) e `supabase-*` (backend real). O **`container.ts`** escolhe qual usar
  conforme `EXPO_PUBLIC_*` — este é o único ponto que muda ao ligar o backend.
- **presentation** consome via hooks (`useDeck`, `useAlbumSheet`, `useAuth`…).

Ao adicionar uma feature de dados: crie a entidade em `domain/`, a porta em
`application/ports/`, as duas implementações em `infrastructure/repositories/`,
ligue no `container.ts`, e exponha via um hook em `presentation/hooks/`.

---

## 6. Design system e tipografia

Toda cor, fonte e espaçamento vem de `mobile/src/constants/theme.ts`. Texto
passa por `mobile/src/components/themed-text.tsx` (variantes: `display`,
`title`, `subtitle`, `body`, `small`, `smallBold`, `label`, `caption`…).

⚠️ **Fonte nomeada ignora `fontWeight`** no React Native. Cada peso é uma
família própria (`Inter_600SemiBold`, `SpaceGrotesk_700Bold`). Nunca use
`fontWeight` inline esperando negrito — use a **variante** do `ThemedText`, ou
defina `fontFamily: Fonts.<peso>` no estilo.

As fontes são carregadas no `mobile/src/app/_layout.tsx` com `useFonts`; o render
espera as fontes prontas. Suporte a tema claro/escuro via `useTheme()`.

### Referência visual: `design/figma-make/`

É o **export do Figma Make** (protótipo web React) que define o norte visual —
**não é o app**, é referência. Direção do design: **dark-first**, minimalista,
tipografia grande com `tracking` apertado, **cor de acento que muda conforme o
universo ativo** (`--accent`), glassmorphism (blur + bordas translúcidas),
cantos bem arredondados, nav flutuante, e microanimações (motion). As telas do
protótipo: Login, Seleção de universo ("Seus mundos"), Fichário/Coleção,
Descobrir (deck), Match ("Sinergia"), Scan, Explorar, Negociações, Perfil.
Ao aplicar o design no app, traduza os tokens/telas do `App.tsx` do protótipo
para o `theme.ts` + componentes React Native (Tailwind → StyleSheet).

---

## 7. Convenções

- **Idioma:** pt-BR em UI, comentários e docs.
- **TypeScript strict**; sem `any` desnecessário. `npx tsc --noEmit` limpo.
- **Verificar de verdade:** para mudança de UI, gere o web export e confira; não
  confie só no typecheck. Para mudança de banco, valide o SQL rodando as
  migrations (`supabase db reset` local) antes de commitar.
- **Commits** claros e em escopo; mensagem descreve o "porquê".

---

## 8. Estado atual e próximos passos

**Pronto e validado:** schema + RLS, venda/swipes, figurinhas da Copa, radar de
proximidade, RPCs do deck, wiring do Supabase, autenticação (login/cadastro +
guard de rota), onboarding (montar álbum), sistema de tipografia, modelo
multi-universo (temas). App roda em mock; camada Supabase pronta atrás de env.

**Pendente:**
1. **Aplicar o design do Figma** (`design/figma-make/`) ao app — retematizar
   `theme.ts` + componentes conforme o protótipo.
2. **Scan real:** `expo-camera` → Edge Function → IA Vision.
3. **Tela de seleção de universo** ligada ao `ThemeRepository` (dados prontos).
4. **`SupabaseDealRepository`** (aba Negócios ainda em mock).

---

## 9. Regras importantes / cuidados

- **NUNCA commitar segredos** (chaves de acesso, `.env`, tokens). Já houve um
  arquivo "Chave de acesso" solto na pasta — se aparecer algo assim, avise e
  gitignore/remova, não comite.
- **Não edite migrations já aplicadas** — crie a próxima `000N_*.sql`.
- **Não quebre o caminho mock:** o app precisa continuar rodando sem
  `EXPO_PUBLIC_*` (usa mocks). Ao mexer no `container.ts`, mantenha os dois lados.
- **`design/figma-make/` é referência**, não código do app — não misture no
  bundle mobile.
- Antes de subir, confira o `git status` e adicione só o que faz parte da
  mudança (evite `git add .` cego).

Notas específicas de Expo em `mobile/AGENTS.md` (versionamento do SDK).
