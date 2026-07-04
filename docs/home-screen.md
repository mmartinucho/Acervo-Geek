# Tela Home — Esboço de componentes

A Home é o **feed de matches**: o valor central do produto (matchmaking) precisa estar na primeira dobra, com o scan por câmera a um toque de distância.

## Wireframe

```
┌──────────────────────────────────────┐
│ HomeHeader                           │  avatar + saudação + sino (Realtime)
├──────────────────────────────────────┤
│ MatchSuggestionCarousel              │  ★ hero da tela
│  ┌─────────┐ ┌─────────┐ ┌────────┐  │
│  │MatchCard│ │MatchCard│ │Match...│  │  score, usuário, itens dos 2 lados
│  └─────────┘ └─────────┘ └────────┘  │  ações: Propor troca / Dispensar
├──────────────────────────────────────┤
│ WishlistPulse                        │  "3 itens da sua wishlist entraram
│                                      │   em inventários esta semana"
├──────────────────────────────────────┤
│ RecentActivityFeed                   │  trocas em andamento, reviews novas
│  · TradeStatusRow (shipping…)        │
│  · ReviewReceivedRow (★★★★★)         │
├──────────────────────────────────────┤
│                        (ScanFAB) 📷  │  botão flutuante → fluxo de scan
└──────────────────────────────────────┘
```

## Árvore de componentes

```
presentation/screens/HomeScreen.tsx
├── HomeHeader
│   └── NotificationBell          # badge via Realtime (match_suggestions INSERT)
├── MatchSuggestionCarousel       # FlatList horizontal, paginação por score
│   └── MatchCard
│       ├── UserBadge             # avatar + username + ReputationStars
│       ├── TradePreview          # "você dá" ⇄ "você recebe" (thumbs do payload)
│       └── MatchActions          # Propor troca | Dispensar (update dismissed_at)
├── WishlistPulse                 # CTA leve para revisar a wishlist
├── RecentActivityFeed            # SectionList
│   ├── TradeStatusRow            # status chip + contraparte
│   └── ReviewReceivedRow
└── ScanFAB                       # navega para /scan (fluxo câmera → IA)
```

## Contrato de dados (hooks)

```ts
// presentation/hooks/useMatchFeed.ts
// TanStack Query + assinatura Realtime; o caso de uso vive em application/.
function useMatchFeed(): {
  suggestions: MatchSuggestion[];   // ordenadas por score desc
  dismiss: (id: string) => void;    // otimista: some da UI, update no banco
  proposeTrade: (id: string) => void; // cria trade com suggestion_id preenchido
  isLoading: boolean;
}

// domain/entities/MatchSuggestion.ts
interface MatchSuggestion {
  id: string;
  matchedUser: { id: string; username: string; avatarUrl?: string; reputation: number };
  score: number;
  youGive: TradePreviewItem[];      // vem pronto do payload JSONB — zero N+1
  youGet: TradePreviewItem[];
  expiresAt: Date;
}
```

## Regras de UX que viram requisito técnico

1. **Feed nunca vazio:** sem sugestões → `EmptyMatchState` com CTA duplo ("Escaneie sua coleção" / "Monte sua wishlist") — são os dois inputs do matchmaking.
2. **Dispensar é otimista e reversível** (snackbar "Desfazer" por 5s antes do update).
3. **Propor troca pré-preenche** a tela de proposta com os itens do payload da sugestão e carrega `suggestion_id` — é o que fecha o loop de métricas do modelo.
4. **Badge Realtime, feed pull-to-refresh:** o sino atualiza sozinho; o carrossel só reordena quando o usuário puxa, para não trocar cards sob o dedo.

## Fora da Home (navegação por tabs — Expo Router)

```
(tabs)/index      → Home (este documento)
(tabs)/search     → Busca no catálogo/inventários
(tabs)/scan       → modal full-screen da câmera
(tabs)/trades     → Minhas trocas (kanban por status)
(tabs)/profile    → Perfil, inventário, wishlist, reputação
```
