import React, { useState } from "react";
import { 
  Heart, X, Search, User, Briefcase, ChevronDown, 
  Settings, MapPin, Zap, Star, Shield, 
  ArrowRight, Plus, Scan, CheckCircle2, Circle, 
  MessageCircle, Repeat, Filter, Sparkles, ChevronLeft,
  Aperture, Eye, Trophy, Anchor, Package, Hexagon,
  Moon, Sun, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- MOCK DATA ---
const UNIVERSES = [
  { id: "pokemon", name: "Pokémon TCG", color: "#EF4444", icon: Aperture, desc: "Cartas, Boosters, Elite Trainer Boxes" },
  { id: "yugioh", name: "Yu-Gi-Oh!", color: "#D97706", icon: Eye, desc: "TCG, Speed Duel, Rush Duel" },
  { id: "worldcup", name: "Copa do Mundo", color: "#10B981", icon: Trophy, desc: "Figurinhas, Álbuns, Cromos Extras" },
  { id: "onepiece", name: "One Piece", color: "#3B82F6", icon: Anchor, desc: "Card Game, Action Figures" },
  { id: "funko", name: "Funko Pop", color: "#8B5CF6", icon: Package, desc: "Exclusivos, Chases, Vaulted" },
  { id: "magic", name: "Magic: The Gathering", color: "#14B8A6", icon: Hexagon, desc: "Commander, Standard, Modern" },
];

const MOCK_DISCOVER_CARDS = [
  {
    id: 1,
    title: "Charizard Base Set",
    subtitle: "Holo Rare • Inglês • NM",
    image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?q=80&w=800&auto=format&fit=crop",
    owner: { name: "Alex Costa", avatar: "https://i.pravatar.cc/150?u=alex", rep: 4.8, distance: "2km" },
    type: "Troca",
    matchHint: "Alex procura seu Pikachu VMAX",
    universe: "pokemon"
  },
  {
    id: 2,
    title: "Neymar Jr. Ouro",
    subtitle: "Legend • Qatar 2022",
    image: "https://images.unsplash.com/photo-1518091043644-c1d44570a2c9?q=80&w=800&auto=format&fit=crop",
    owner: { name: "Bruno", avatar: "https://i.pravatar.cc/150?u=bruno", rep: 5.0, distance: "5km" },
    type: "Venda",
    price: "R$ 150",
    matchHint: "Alta procura na sua região",
    universe: "worldcup"
  },
  {
    id: 3,
    title: "Blue-Eyes White Dragon",
    subtitle: "LOB-001 • 1st Edition",
    image: "https://images.unsplash.com/photo-1620336655052-a5198e3b0b53?q=80&w=800&auto=format&fit=crop",
    owner: { name: "Seto Kaiba", avatar: "https://i.pravatar.cc/150?u=seto", rep: 4.9, distance: "1km" },
    type: "Troca",
    matchHint: "Procura cartas do tipo Dragão",
    universe: "yugioh"
  }
];

// --- CONTEXT FOR THEME ---
const ThemeContext = React.createContext({ isDark: true, toggleTheme: () => {} });

// --- BRAND LOGO COMPONENT ---
function BrandLogo({ size = 48, className }: { size?: number, className?: string }) {
  return (
    <motion.div 
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
        {/* Outer Sci-Fi Hexagon */}
        <motion.path 
          d="M50 6L88 28V72L50 94L12 72V28L50 6Z" 
          stroke="currentColor" 
          strokeWidth="4" 
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Inner Isometric Lines */}
        <motion.path 
          d="M50 6V50M88 28L50 50M12 28L50 50M50 50V94" 
          stroke="currentColor" 
          strokeWidth="4" 
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
        />
        
        {/* Inner Glowing Core Gem (Card/Loot Reference) */}
        <motion.polygon 
          points="50,30 66,39 66,61 50,70 34,61 34,39" 
          fill="currentColor" 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.25, scale: 1 }}
          transition={{ duration: 1, delay: 1, ease: "easeOut" }}
          style={{ transformOrigin: "50px 50px" }}
        />
        
        {/* Pulsing Center Sparkle */}
        <motion.circle 
          cx="50" cy="50" r="6" 
          fill="currentColor" 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: [1, 1.4, 1] }}
          transition={{ 
            opacity: { duration: 0.5, delay: 1.5 }, 
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 } 
          }}
        />

        {/* Orbiting Tech Ring */}
        <motion.circle 
          cx="50" cy="50" r="45" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeDasharray="4 12" 
          fill="none" 
          opacity="0.5"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "50px 50px" }}
        />
      </svg>
    </motion.div>
  );
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<"login" | "onboarding-universe" | "onboarding-collection" | "main">("login");
  const [activeUniverses, setActiveUniverses] = useState<string[]>([]);
  const [currentUniverseId, setCurrentUniverseId] = useState<string>("pokemon");
  const [isDark, setIsDark] = useState(true);

  const currentUniverse = UNIVERSES.find(u => u.id === currentUniverseId) || UNIVERSES[0];

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div 
        className={cn("flex justify-center w-full min-h-screen transition-colors duration-700", isDark ? "bg-[#050505] dark" : "bg-neutral-100")}
        style={{ 
          '--accent': currentUniverse.color,
          '--accent-hover': currentUniverse.color + 'CC',
          '--accent-transparent': isDark ? currentUniverse.color + '15' : currentUniverse.color + '10',
        } as React.CSSProperties}
      >
        <div className={cn(
          "w-full max-w-[400px] h-[100dvh] sm:h-[850px] overflow-hidden relative flex flex-col font-sans transition-colors duration-700 sm:my-8 sm:rounded-[56px] shadow-2xl",
          isDark 
            ? "bg-[#0a0a0a] text-white sm:shadow-[0_0_0_12px_rgba(20,20,20,1)]" 
            : "bg-[#FAFAFA] text-neutral-900 sm:shadow-[0_0_0_12px_rgba(220,220,220,1)]"
        )}>
          
          <AnimatePresence mode="wait">
            {currentScreen === "login" && (
              <LoginScreen key="login" onNext={() => setCurrentScreen("onboarding-universe")} />
            )}
            {currentScreen === "onboarding-universe" && (
              <UniverseSelectionScreen 
                key="univ" 
                activeUniverses={activeUniverses}
                setActiveUniverses={setActiveUniverses}
                setCurrentUniverseId={setCurrentUniverseId}
                onNext={() => setCurrentScreen("onboarding-collection")} 
              />
            )}
            {currentScreen === "onboarding-collection" && (
              <CollectionSetupScreen key="coll" onNext={() => setCurrentScreen("main")} />
            )}
            {currentScreen === "main" && (
              <MainAppScreen 
                key="main" 
                universes={UNIVERSES.filter(u => activeUniverses.includes(u.id))}
                currentUniverse={currentUniverse}
                setCurrentUniverseId={setCurrentUniverseId}
              />
            )}
          </AnimatePresence>

        </div>
      </div>
    </ThemeContext.Provider>
  );
}

// --- SCREENS ---

function LoginScreen({ onNext }: { onNext: () => void }) {
  const { isDark } = React.useContext(ThemeContext);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="flex flex-col h-full relative"
    >
      {/* Animated Abstract Background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#050505]">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[20%] w-[140%] h-[60%] bg-purple-600/30 blur-[120px] rounded-full mix-blend-screen"
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] -right-[30%] w-[120%] h-[70%] bg-emerald-600/20 blur-[120px] rounded-full mix-blend-screen"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-8 justify-end pb-16">
        <div className="mb-14 flex flex-col">
          <BrandLogo size={64} className="mb-8 text-white drop-shadow-2xl" />
          <h1 className="text-6xl font-medium tracking-tighter text-white leading-[0.9] mb-4">
            Acervo<span className="opacity-50 text-indigo-400">.</span>
          </h1>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Collect • Trade • Discover
          </p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={onNext}
            className="w-full font-medium py-4 rounded-full transition-transform active:scale-[0.98] flex items-center justify-center gap-2 bg-white/10 backdrop-blur-2xl border border-white/20 text-white hover:bg-white/20"
          >
            Continuar com Apple
          </button>
          <button 
            onClick={onNext}
            className="w-full font-medium py-4 rounded-full transition-transform active:scale-[0.98] flex items-center justify-center gap-2 bg-white/5 backdrop-blur-2xl border border-white/10 text-white hover:bg-white/10"
          >
            Continuar com Google
          </button>
        </div>

        <div className="mt-10 text-center">
          <button onClick={onNext} className="text-xs font-semibold tracking-wide text-white/40 hover:text-white/80 transition-colors uppercase">
            Acessar com E-mail
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function UniverseSelectionScreen({ activeUniverses, setActiveUniverses, setCurrentUniverseId, onNext }: any) {
  const { isDark } = React.useContext(ThemeContext);

  const toggleUniverse = (id: string) => {
    setActiveUniverses((prev: string[]) => 
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (activeUniverses.length > 0) {
      setCurrentUniverseId(activeUniverses[0]);
      onNext();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
      <div className="pt-20 px-8 pb-8">
        <h2 className="text-4xl font-medium tracking-tighter mb-3">Seus mundos.</h2>
        <p className={cn("text-sm", isDark ? "text-neutral-500" : "text-neutral-500")}>Selecione as franquias que você acompanha. Você pode personalizar isso depois.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 hide-scrollbar">
        <div className="flex flex-col gap-3">
          {UNIVERSES.map(univ => {
            const isSelected = activeUniverses.includes(univ.id);
            const Icon = univ.icon;
            return (
              <button
                key={univ.id}
                onClick={() => toggleUniverse(univ.id)}
                className={cn(
                  "relative flex items-center p-5 rounded-[28px] transition-all overflow-hidden w-full group",
                  isSelected 
                    ? (isDark ? "bg-white/5 border border-white/10" : "bg-black/5 border border-black/10") 
                    : (isDark ? "bg-transparent hover:bg-white/5" : "bg-transparent hover:bg-black/5")
                )}
                style={{ '--univ-color': univ.color } as React.CSSProperties}
              >
                {/* Subtle colored glow when selected */}
                {isSelected && (
                  <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at left, ${univ.color}, transparent 60%)` }} />
                )}

                <div className={cn("w-14 h-14 rounded-full flex items-center justify-center mr-5 relative z-10", isDark ? "bg-[#111]" : "bg-white shadow-sm")}>
                  <Icon size={24} strokeWidth={1.5} className={isSelected ? "text-[var(--univ-color)]" : (isDark ? "text-neutral-500" : "text-neutral-400")} />
                </div>
                
                <div className="flex-1 text-left relative z-10">
                  <h3 className={cn("font-medium text-lg tracking-tight mb-0.5", isSelected ? "" : (isDark ? "text-neutral-400" : "text-neutral-500"))}>{univ.name}</h3>
                  <p className={cn("text-[11px] font-medium tracking-wide uppercase", isDark ? "text-neutral-600" : "text-neutral-400")}>{univ.desc}</p>
                </div>
                
                {isSelected && (
                  <div className="relative z-10 text-[var(--univ-color)] ml-2">
                    <CheckCircle2 size={24} className={cn("fill-current", isDark ? "text-black" : "text-white")} />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className={cn("absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t pointer-events-none", isDark ? "from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" : "from-[#FAFAFA] via-[#FAFAFA]/80 to-transparent")}>
        <div className="pointer-events-auto">
          <button 
            onClick={handleNext}
            disabled={activeUniverses.length === 0}
            className={cn(
              "w-full font-medium py-4.5 rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
              activeUniverses.length === 0 
                ? (isDark ? "bg-neutral-900 text-neutral-600" : "bg-neutral-200 text-neutral-400") 
                : (isDark ? "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]" : "bg-black text-white shadow-[0_0_30px_rgba(0,0,0,0.2)]")
            )}
          >
            Continuar
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CollectionSetupScreen({ onNext }: { onNext: () => void }) {
  const { isDark } = React.useContext(ThemeContext);
  
  // Create 15 items to look like a full binder page
  const items = Array.from({ length: 15 }).map((_, i) => ({
    id: i + 1,
    num: String(i + 1).padStart(3, '0'),
    name: ["Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard", "Squirtle", "Wartortle", "Blastoise", "Caterpie", "Metapod", "Butterfree", "Weedle", "Kakuna", "Beedrill"][i],
    rare: [3, 6, 9].includes(i + 1)
  }));

  const [states, setStates] = useState<Record<number, "NONE" | "NEED" | "HAVE" | "REPEAT">>({
    1: "HAVE", 2: "HAVE", 3: "NEED", 4: "HAVE", 5: "REPEAT", 6: "NONE"
  });

  const cycleState = (id: number) => {
    setStates(prev => {
      const current = prev[id] || "NONE";
      const nextMap: Record<string, any> = { "NONE": "NEED", "NEED": "HAVE", "HAVE": "REPEAT", "REPEAT": "NONE" };
      return { ...prev, [id]: nextMap[current] };
    });
  };

  const total = items.length;
  const haveCount = Object.values(states).filter(s => s === "HAVE" || s === "REPEAT").length;
  const progress = (haveCount / total) * 100;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
      <div className={cn("pt-20 px-8 pb-6")}>
        <h2 className="text-4xl font-medium tracking-tighter mb-3">Fichário.</h2>
        
        {/* Modern Progress Bar */}
        <div className="mt-8">
          <div className="flex justify-between items-end mb-3">
            <div className={cn("text-[11px] font-semibold uppercase tracking-widest", isDark ? "text-neutral-500" : "text-neutral-400")}>
              Base Set
            </div>
            <div className="text-xs font-bold font-mono">
              <span className="text-[var(--accent)]">{haveCount}</span><span className={isDark ? "text-neutral-700" : "text-neutral-300"}>/{total}</span>
            </div>
          </div>
          <div className={cn("h-1 w-full rounded-full overflow-hidden", isDark ? "bg-white/10" : "bg-black/10")}>
            <motion.div 
              className="h-full bg-[var(--accent)]" 
              initial={{ width: 0 }} 
              animate={{ width: `${progress}%` }} 
              transition={{ duration: 0.5, ease: "easeOut" }} 
            />
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-3 mt-6">
          <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-widest text-neutral-500">
            <div className={cn("w-2 h-2 rounded-full border", isDark ? "border-neutral-700" : "border-neutral-300")} /> Vazio
          </div>
          <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-widest text-rose-500">
            <div className="w-2 h-2 rounded-full bg-rose-500/20 border border-rose-500" /> Preciso
          </div>
          <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-widest text-[var(--accent)]">
            <div className="w-2 h-2 rounded-full bg-[var(--accent)]" /> Tenho
          </div>
          <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-widest text-amber-500">
            <div className="w-2 h-2 rounded-full bg-amber-500" /> Duplicada
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-2 hide-scrollbar">
        {/* Binder Grid Aspect Ratio (2.5 : 3.5 TCG standard) */}
        <div className="grid grid-cols-3 gap-2 px-2 pb-32">
          {items.map(item => {
            const s = states[item.id] || "NONE";
            return (
              <button 
                key={item.id} onClick={() => cycleState(item.id)}
                className={cn(
                  "relative w-full aspect-[63/88] rounded-xl flex flex-col justify-between p-2.5 transition-all overflow-hidden text-left",
                  s === "NONE" && (isDark ? "bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]" : "bg-black/[0.02] border border-black/5 hover:bg-black/[0.04]"),
                  s === "NEED" && (isDark ? "bg-rose-500/10 border border-rose-500/30 shadow-[inset_0_0_15px_rgba(244,63,94,0.1)]" : "bg-rose-50 border border-rose-200 shadow-[inset_0_0_15px_rgba(244,63,94,0.05)]"),
                  s === "HAVE" && "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] shadow-lg border border-white/20",
                  s === "REPEAT" && "bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20 border border-white/30",
                )}
              >
                {/* Glow for HAVE/REPEAT */}
                {(s === "HAVE" || s === "REPEAT") && (
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                )}

                <div className={cn(
                  "font-mono text-[8px] font-semibold",
                  s === "NONE" ? "opacity-30" : (s === "NEED" ? "text-rose-400" : "text-white/80")
                )}>
                  #{item.num}
                </div>
                
                <div className={cn(
                  "font-medium text-[10px] tracking-tight truncate w-full",
                  s === "NONE" ? (isDark ? "text-neutral-500" : "text-neutral-400") : (s === "NEED" ? "text-rose-500" : "text-white font-bold")
                )}>
                  {item.name}
                </div>
                
                {item.rare && s === "NONE" && <Sparkles size={8} className="text-amber-500/50 absolute top-2.5 right-2.5" />}
                {s === "REPEAT" && (
                  <div className="absolute -top-1 -right-1 bg-white text-amber-600 font-black text-[9px] w-5 h-5 rounded-bl-lg rounded-tr-lg flex items-center justify-center shadow-sm">
                    2
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className={cn("absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t pointer-events-none", isDark ? "from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent" : "from-[#FAFAFA] via-[#FAFAFA]/90 to-transparent")}>
        <div className="pointer-events-auto">
          <button onClick={onNext} className={cn("w-full font-medium py-4.5 rounded-full active:scale-[0.98] transition-transform shadow-[0_0_30px_var(--accent-transparent)] flex justify-center items-center gap-2",
            isDark ? "bg-white text-black" : "bg-black text-white"
          )}>
            Ir para o Radar <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// --- MAIN APP (TABS & NAV) ---
function MainAppScreen({ universes, currentUniverse, setCurrentUniverseId }: any) {
  const [activeTab, setActiveTab] = useState("discover");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { isDark } = React.useContext(ThemeContext);

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === "discover" && <TabDiscover key="discover" currentUniverse={currentUniverse} universes={universes} setCurrentUniverseId={setCurrentUniverseId} onMatch={() => setActiveModal("match")} />}
          {activeTab === "collection" && <TabCollection key="collection" currentUniverse={currentUniverse} universes={universes} setCurrentUniverseId={setCurrentUniverseId} />}
          {activeTab === "search" && <TabSearch key="search" currentUniverse={currentUniverse} />}
          {activeTab === "deals" && <TabDeals key="deals" />}
          {activeTab === "profile" && <TabProfile key="profile" currentUniverse={currentUniverse} universes={universes} onScan={() => setActiveModal("scan")} />}
        </AnimatePresence>
      </div>

      {/* Floating Dynamic Bottom Nav */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none z-40">
        <div className={cn("pointer-events-auto flex items-center px-3 py-2.5 rounded-full backdrop-blur-2xl border shadow-2xl gap-1", 
          isDark ? "bg-white/5 border-white/10 shadow-black/50" : "bg-black/5 border-black/10 shadow-black/10"
        )}>
          <NavItem icon={<Sparkles size={18} strokeWidth={2} />} active={activeTab === "discover"} onClick={() => setActiveTab("discover")} />
          <NavItem icon={<Layers size={18} strokeWidth={2} />} active={activeTab === "collection"} onClick={() => setActiveTab("collection")} />
          <NavItem icon={<Search size={18} strokeWidth={2} />} active={activeTab === "search"} onClick={() => setActiveTab("search")} />
          
          <div className="mx-1">
            <button onClick={() => setActiveModal("scan")} className={cn("w-12 h-12 bg-[var(--accent)] rounded-full flex items-center justify-center text-white transition-transform active:scale-[0.95] shadow-[0_0_20px_var(--accent-transparent)]")}>
              <Scan size={20} strokeWidth={2.5} />
            </button>
          </div>
          
          <NavItem icon={<Briefcase size={18} strokeWidth={2} />} active={activeTab === "deals"} onClick={() => setActiveTab("deals")} />
          <NavItem icon={<User size={18} strokeWidth={2} />} active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === "match" && <MatchOverlay key="match" onClose={() => setActiveModal(null)} />}
        {activeModal === "scan" && <ScanModal key="scan" onClose={() => setActiveModal(null)} />}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, active, onClick }: any) {
  const { isDark } = React.useContext(ThemeContext);
  return (
    <button onClick={onClick} className={cn("w-10 h-10 flex items-center justify-center rounded-full transition-all", 
      active ? (isDark ? "bg-white/10 text-white" : "bg-black/10 text-black") : (isDark ? "text-neutral-500 hover:text-white" : "text-neutral-400 hover:text-black")
    )}>
      <div className={cn("transition-transform", active ? "scale-105" : "scale-100")}>{icon}</div>
    </button>
  );
}

// --- TAB: COLLECTION (BINDER) ---
function TabCollection({ currentUniverse, universes, setCurrentUniverseId }: any) {
  const { isDark } = React.useContext(ThemeContext);
  const [showSelector, setShowSelector] = useState(false);
  
  // Create 15 items to look like a full binder page
  const items = Array.from({ length: 15 }).map((_, i) => ({
    id: i + 1,
    num: String(i + 1).padStart(3, '0'),
    name: ["Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard", "Squirtle", "Wartortle", "Blastoise", "Caterpie", "Metapod", "Butterfree", "Weedle", "Kakuna", "Beedrill"][i],
    rare: [3, 6, 9].includes(i + 1)
  }));

  const [states, setStates] = useState<Record<number, "NONE" | "NEED" | "HAVE" | "REPEAT">>({
    1: "HAVE", 2: "HAVE", 3: "NEED", 4: "HAVE", 5: "REPEAT", 6: "NONE"
  });

  const cycleState = (id: number) => {
    setStates(prev => {
      const current = prev[id] || "NONE";
      const nextMap: Record<string, any> = { "NONE": "NEED", "NEED": "HAVE", "HAVE": "REPEAT", "REPEAT": "NONE" };
      return { ...prev, [id]: nextMap[current] };
    });
  };

  const total = items.length;
  const haveCount = Object.values(states).filter(s => s === "HAVE" || s === "REPEAT").length;
  const progress = (haveCount / total) * 100;
  
  const CurrentIcon = currentUniverse.icon;

  return (
    <div className="h-full flex flex-col px-8 pt-20 pb-32 overflow-y-auto hide-scrollbar relative">
      <div className="flex items-center justify-between mb-8 z-20">
        <h2 className="text-4xl font-medium tracking-tighter">Acervo.</h2>
        <div className={cn("flex gap-2")}>
          <button className={cn("p-3 rounded-full transition-colors", isDark ? "bg-white/5 text-neutral-400 hover:text-white" : "bg-black/5 text-neutral-600 hover:text-black")}>
             <Search size={18} />
          </button>
          <button className={cn("p-3 rounded-full transition-colors", isDark ? "bg-white/5 text-neutral-400 hover:text-white" : "bg-black/5 text-neutral-600 hover:text-black")}>
             <Filter size={18} />
          </button>
        </div>
      </div>
      
      {/* Universe Selector embedded in page */}
      <div className="relative z-30 mb-8">
        <button 
          onClick={() => setShowSelector(!showSelector)}
          className={cn("w-full flex items-center justify-between p-4 rounded-3xl border transition-colors", 
            isDark ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]" : "bg-black/[0.02] border-black/5 hover:bg-black/[0.05]"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", isDark ? "bg-[#111]" : "bg-white shadow-sm")} style={{ color: currentUniverse.color }}>
              <CurrentIcon size={18} strokeWidth={2} />
            </div>
            <div className="text-left">
              <div className={cn("text-[9px] font-semibold uppercase tracking-widest mb-0.5", isDark ? "text-neutral-500" : "text-neutral-500")}>Universo Ativo</div>
              <div className="font-medium tracking-tight text-sm">{currentUniverse.name}</div>
            </div>
          </div>
          <ChevronDown size={18} className={cn("transition-transform opacity-50", showSelector && "rotate-180")} />
        </button>

        <AnimatePresence>
          {showSelector && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className={cn("absolute top-[80px] left-0 right-0 border rounded-3xl p-3 z-40 shadow-2xl backdrop-blur-3xl", 
                isDark ? "bg-[#111]/90 border-white/10" : "bg-white/90 border-black/10"
              )}
            >
              {universes.map((u: any) => {
                const UnivIcon = u.icon;
                return (
                  <button 
                    key={u.id}
                    onClick={() => { setCurrentUniverseId(u.id); setShowSelector(false); }}
                    className={cn("flex items-center gap-4 w-full p-4 rounded-2xl transition-colors", 
                      currentUniverse.id === u.id 
                        ? (isDark ? "bg-white/5" : "bg-black/5") 
                        : (isDark ? "hover:bg-white/5" : "hover:bg-black/5")
                    )}
                  >
                    <span style={{ color: u.color }}><UnivIcon size={20} strokeWidth={1.5} /></span>
                    <span className="font-medium flex-1 text-left tracking-tight">{u.name}</span>
                    {currentUniverse.id === u.id && <CheckCircle2 size={18} className="text-[var(--accent)]" />}
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 z-10">
        <div className="flex justify-between items-end mb-3 px-1">
          <div className={cn("text-[10px] font-semibold uppercase tracking-widest", isDark ? "text-neutral-500" : "text-neutral-400")}>
            Progresso • Base Set
          </div>
          <div className="text-xs font-bold font-mono">
            <span className="text-[var(--accent)]">{haveCount}</span><span className={isDark ? "text-neutral-700" : "text-neutral-300"}>/{total}</span>
          </div>
        </div>
        <div className={cn("h-1.5 w-full rounded-full overflow-hidden", isDark ? "bg-white/10" : "bg-black/10")}>
          <motion.div 
            className="h-full bg-[var(--accent)]" 
            initial={{ width: 0 }} 
            animate={{ width: `${progress}%` }} 
            transition={{ duration: 0.5, ease: "easeOut" }} 
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-3 mb-8 px-1 z-10">
        <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-widest text-neutral-500">
          <div className={cn("w-2.5 h-2.5 rounded-full border", isDark ? "border-neutral-700" : "border-neutral-300")} /> Faltante
        </div>
        <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-widest text-rose-500">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500" /> Wishlist
        </div>
        <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-widest text-[var(--accent)]">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" /> Adquirida
        </div>
        <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-widest text-amber-500">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Duplicada
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2 px-1 z-10">
        {items.map(item => {
          const s = states[item.id] || "NONE";
          return (
            <button 
              key={item.id} onClick={() => cycleState(item.id)}
              className={cn(
                "relative w-full aspect-[63/88] rounded-2xl flex flex-col justify-between p-2.5 transition-all overflow-hidden text-left",
                s === "NONE" && (isDark ? "bg-white/[0.02] border border-white/5 hover:bg-white/[0.04]" : "bg-black/[0.02] border border-black/5 hover:bg-black/[0.04]"),
                s === "NEED" && (isDark ? "bg-rose-500/10 border border-rose-500/30 shadow-[inset_0_0_15px_rgba(244,63,94,0.1)]" : "bg-rose-50 border border-rose-200 shadow-[inset_0_0_15px_rgba(244,63,94,0.05)]"),
                s === "HAVE" && "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] shadow-lg border border-white/20",
                s === "REPEAT" && "bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20 border border-white/30",
              )}
            >
              {(s === "HAVE" || s === "REPEAT") && (
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              )}
              <div className={cn(
                "font-mono text-[8px] font-semibold",
                s === "NONE" ? "opacity-30" : (s === "NEED" ? "text-rose-400" : "text-white/80")
              )}>
                #{item.num}
              </div>
              <div className={cn(
                "font-medium text-[10px] tracking-tight truncate w-full",
                s === "NONE" ? (isDark ? "text-neutral-500" : "text-neutral-400") : (s === "NEED" ? "text-rose-500" : "text-white font-bold")
              )}>
                {item.name}
              </div>
              {item.rare && s === "NONE" && <Sparkles size={8} className="text-amber-500/50 absolute top-2.5 right-2.5" />}
              {s === "REPEAT" && (
                <div className="absolute -top-1 -right-1 bg-white text-amber-600 font-black text-[9px] w-5 h-5 rounded-bl-lg rounded-tr-lg flex items-center justify-center shadow-sm">
                  2
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- TAB: DISCOVER (SWIPE) ---
function TabDiscover({ currentUniverse, universes, setCurrentUniverseId, onMatch }: any) {
  const [cards, setCards] = useState(MOCK_DISCOVER_CARDS);
  const [filter, setFilter] = useState("Tudo");
  const [showSelector, setShowSelector] = useState(false);
  const { isDark } = React.useContext(ThemeContext);

  const handleSwipe = (dir: 'left' | 'right') => {
    if (cards.length === 0) return;
    if (dir === 'right') {
      if (Math.random() > 0.5) onMatch();
    }
    setCards(prev => prev.slice(1));
  };
  
  const CurrentIcon = currentUniverse.icon;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
      
      {/* Floating Header */}
      <div className="absolute top-10 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
        <button 
          onClick={() => setShowSelector(!showSelector)}
          className={cn("pointer-events-auto flex items-center gap-2 px-5 py-3 rounded-full backdrop-blur-xl border transition-colors", 
            isDark ? "bg-black/40 border-white/10" : "bg-white/60 border-black/5 shadow-sm"
          )}
        >
          <span className="text-[var(--accent)]"><CurrentIcon size={16} strokeWidth={2.5} /></span>
          <span className="font-medium text-sm tracking-tight">{currentUniverse.name}</span>
          <ChevronDown size={14} className={cn("transition-transform opacity-50", showSelector && "rotate-180")} />
        </button>

        <div className={cn("pointer-events-auto flex items-center gap-1.5 px-4 py-3 rounded-full backdrop-blur-xl border", 
          isDark ? "bg-black/40 border-white/10" : "bg-white/60 border-black/5 shadow-sm"
        )}>
          <MapPin size={12} className="text-[var(--accent)]" />
          <span className="text-[11px] font-bold">10km</span>
        </div>
      </div>

      {/* Universe Selector Dropdown */}
      <AnimatePresence>
        {showSelector && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={cn("absolute top-28 left-6 right-6 border rounded-3xl p-3 z-30 shadow-2xl backdrop-blur-3xl", 
              isDark ? "bg-[#111]/90 border-white/10" : "bg-white/90 border-black/10"
            )}
          >
            {universes.map((u: any) => {
              const UnivIcon = u.icon;
              return (
                <button 
                  key={u.id}
                  onClick={() => { setCurrentUniverseId(u.id); setShowSelector(false); }}
                  className={cn("flex items-center gap-4 w-full p-4 rounded-2xl transition-colors", 
                    currentUniverse.id === u.id 
                      ? (isDark ? "bg-white/5" : "bg-black/5") 
                      : (isDark ? "hover:bg-white/5" : "hover:bg-black/5")
                  )}
                >
                  <span style={{ color: u.color }}><UnivIcon size={20} strokeWidth={1.5} /></span>
                  <span className="font-medium flex-1 text-left tracking-tight">{u.name}</span>
                  {currentUniverse.id === u.id && <CheckCircle2 size={18} className="text-[var(--accent)]" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe Deck Container (Edge to Edge) */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pt-16">
        {cards.length > 0 ? (
          <div className="relative w-full h-[95%]">
            {cards.slice(0, 2).reverse().map((card, idx) => {
              const isTop = idx === cards.slice(0, 2).length - 1;
              return (
                <motion.div
                  key={card.id}
                  className="absolute inset-0 rounded-[40px] overflow-hidden shadow-2xl origin-bottom bg-[#111]"
                  style={{ zIndex: isTop ? 10 : 0 }}
                  initial={!isTop ? { scale: 0.95, y: 20 } : false}
                  animate={!isTop ? { scale: 0.95, y: 20 } : { scale: 1, y: 0 }}
                  drag={isTop ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(e, info) => {
                    if (info.offset.x > 100) handleSwipe('right');
                    else if (info.offset.x < -100) handleSwipe('left');
                  }}
                >
                  <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                  
                  {/* Subtle Grain Overlay & Gradient */}
                  <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                  {/* Badges Top */}
                  <div className="absolute top-24 left-6 flex gap-2">
                    <div className={cn("px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-2xl", 
                      "bg-white/10 text-white border border-white/20"
                    )}>
                      {card.type === "Troca" ? <Repeat size={12} /> : "R$"} {card.type === "Venda" ? card.price : card.type}
                    </div>
                  </div>

                  {/* Card Content Bottom */}
                  <div className="absolute bottom-0 w-full p-8 pb-32 text-left pointer-events-none">
                    <div className="inline-flex items-center gap-2 bg-[var(--accent)] text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 shadow-lg shadow-[var(--accent-transparent)]">
                      <Sparkles size={12} /> {card.matchHint}
                    </div>
                    <h2 className="text-4xl font-medium tracking-tighter text-white mb-2 leading-none drop-shadow-md">{card.title}</h2>
                    <p className="text-white/70 font-medium tracking-tight mb-8 text-sm">{card.subtitle}</p>

                    {/* Owner Info Glass */}
                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-2xl p-4 rounded-[28px] border border-white/20">
                      <img src={card.owner.avatar} alt={card.owner.name} className="w-12 h-12 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="font-medium text-white text-base tracking-tight">{card.owner.name}</div>
                        <div className="flex items-center gap-2 text-[10px] text-white/60 uppercase tracking-widest font-semibold mt-1">
                          <span className="flex items-center gap-1"><Star size={10} className="fill-white/60" /> {card.owner.rep}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><MapPin size={10} /> {card.owner.distance}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center px-8">
            <BrandLogo size={80} className={cn("mb-8 opacity-40", isDark ? "text-white" : "text-black")} />
            <h3 className="text-3xl font-medium tracking-tighter mb-4">Radar Limpo.</h3>
            <p className={cn("text-sm mb-12 font-medium", isDark ? "text-neutral-500" : "text-neutral-500")}>Não há mais itens na sua região atual para este universo.</p>
            <button onClick={() => setCards(MOCK_DISCOVER_CARDS)} className={cn("px-8 py-4 font-medium rounded-full transition-transform active:scale-[0.98]", isDark ? "bg-white text-black" : "bg-black text-white")}>
              Expandir Busca
            </button>
          </div>
        )}

        {/* Floating Action Buttons */}
        {cards.length > 0 && (
          <div className="absolute bottom-[110px] left-0 right-0 flex justify-center items-center gap-6 z-20 pointer-events-none">
            <button onClick={() => handleSwipe('left')} className={cn("pointer-events-auto w-16 h-16 rounded-full flex items-center justify-center transition-transform active:scale-[0.9] backdrop-blur-2xl border", isDark ? "bg-black/50 text-neutral-400 border-white/10 hover:text-white" : "bg-white/50 text-neutral-500 border-black/5 shadow-lg hover:text-black")}>
              <X size={24} strokeWidth={2} />
            </button>
            <button onClick={() => handleSwipe('right')} className="pointer-events-auto w-20 h-20 bg-[var(--accent)] text-white rounded-full flex items-center justify-center shadow-[0_0_40px_var(--accent-transparent)] transition-transform active:scale-[0.9]">
              <Heart size={32} className="fill-current" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// --- OVERLAY: MATCH ---
function MatchOverlay({ onClose }: any) {
  const { isDark } = React.useContext(ThemeContext);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center px-6">
      <div className={cn("absolute inset-0 backdrop-blur-3xl", isDark ? "bg-black/60" : "bg-white/60")} onClick={onClose} />
      
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-sm flex flex-col items-center text-center z-10">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-[0_0_60px_rgba(16,185,129,0.4)] mb-8">
          <Heart size={32} className="fill-current" />
        </div>
        
        <h2 className="text-5xl font-medium tracking-tighter mb-4">Sinergia.</h2>
        <p className={cn("mb-12 font-medium", isDark ? "text-neutral-400" : "text-neutral-600")}>Você e Alex possuem itens de interesse mútuo no radar.</p>

        <div className="flex items-center justify-center gap-6 mb-16 w-full">
          <img src="https://i.pravatar.cc/150?u=me" className={cn("w-24 h-24 rounded-full object-cover shadow-2xl")} alt="You" />
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", isDark ? "bg-white/10 text-white" : "bg-black/5 text-black")}>
            <Repeat size={20} />
          </div>
          <img src="https://i.pravatar.cc/150?u=alex" className={cn("w-24 h-24 rounded-full object-cover shadow-2xl")} alt="Them" />
        </div>

        <button className={cn("w-full font-medium py-4.5 rounded-full mb-4 transition-transform active:scale-[0.98] flex items-center justify-center gap-2", isDark ? "bg-white text-black" : "bg-black text-white")}>
          Iniciar Contato
        </button>
        <button onClick={onClose} className={cn("w-full font-medium py-4.5 rounded-full transition-colors", isDark ? "text-neutral-500 hover:text-neutral-300" : "text-neutral-500 hover:text-neutral-800")}>
          Voltar pro Radar
        </button>
      </motion.div>
    </motion.div>
  );
}

// --- MODAL: SCAN ---
function ScanModal({ onClose }: any) {
  return (
    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="absolute inset-0 z-50 bg-[#050505] flex flex-col">
      <div className="relative flex-1">
        <img src="https://images.unsplash.com/photo-1620336655052-a5198e3b0b53?q=80&w=800&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-80" alt="camera" />
        
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        
        {/* Scanner UI Focus Area */}
        <div className="absolute inset-0 m-10 border border-white/20 rounded-[40px] relative overflow-hidden">
          <motion.div 
            animate={{ top: ["0%", "100%", "0%"] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[1px] bg-white shadow-[0_0_20px_white]" 
          />
          {/* Subtle grid to look technical */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-50 mix-blend-overlay" />
        </div>

        {/* Header */}
        <div className="absolute top-12 left-8 right-8 flex items-center justify-between">
          <button onClick={onClose} className="w-12 h-12 bg-black/40 backdrop-blur-2xl rounded-full flex items-center justify-center text-white border border-white/10">
            <X size={20} strokeWidth={2} />
          </button>
          <div className="bg-black/40 backdrop-blur-2xl px-5 py-3 rounded-full text-white font-semibold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 border border-white/10">
            <Sparkles size={14} /> Scanner IA
          </div>
        </div>

        {/* Footer info */}
        <div className="absolute bottom-12 left-8 right-8 text-center">
          <div className="bg-black/60 backdrop-blur-3xl p-8 rounded-[32px] border border-white/10">
            <h3 className="text-white text-2xl font-medium tracking-tight mb-2">Blue-Eyes White Dragon</h3>
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-[0.2em] mb-8">LOB-001 • Rare</p>
            <button className="w-full bg-white text-black font-medium py-4.5 rounded-full active:scale-[0.98] transition-transform">
              Registrar Item
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- TAB: SEARCH ---
function TabSearch({ currentUniverse }: any) {
  const { isDark } = React.useContext(ThemeContext);
  const categories = ["Cards", "Figurinhas", "Action Figures", "Funko", "HQs", "Games"];
  
  return (
    <div className="h-full flex flex-col px-8 pt-20 pb-32 overflow-y-auto hide-scrollbar">
      <h2 className="text-4xl font-medium tracking-tighter mb-8">Explorar.</h2>
      
      <div className="relative mb-8">
        <Search className={cn("absolute left-5 top-1/2 -translate-y-1/2", isDark ? "text-neutral-500" : "text-neutral-400")} size={20} strokeWidth={2} />
        <input 
          type="text" 
          placeholder="Busque itens, usuários..." 
          className={cn("w-full rounded-full py-4.5 pl-14 pr-4 font-medium focus:outline-none transition-colors", 
            isDark ? "bg-white/5 text-white placeholder:text-neutral-600 focus:bg-white/10" : "bg-black/5 text-neutral-900 placeholder:text-neutral-400 focus:bg-black/10"
          )}
        />
        <button className={cn("absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full", isDark ? "text-neutral-400 bg-white/5" : "text-neutral-600 bg-black/5")}>
          <Filter size={16} strokeWidth={2} />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-12">
        {categories.map((cat, i) => (
          <button key={i} className={cn("px-5 py-2.5 rounded-full text-[11px] font-semibold transition-colors tracking-widest uppercase", 
            i === 0 
              ? (isDark ? "bg-white text-black" : "bg-black text-white") 
              : (isDark ? "bg-white/5 text-neutral-400 hover:text-white" : "bg-black/5 text-neutral-600 hover:text-black")
          )}>
            {cat}
          </button>
        ))}
      </div>

      <h3 className={cn("text-[10px] font-semibold uppercase tracking-[0.2em] mb-6", isDark ? "text-neutral-600" : "text-neutral-400")}>Destaques ({currentUniverse.name})</h3>
      <div className="grid grid-cols-2 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="group cursor-pointer">
            <div className={cn("h-48 relative rounded-[24px] overflow-hidden mb-3", isDark ? "bg-white/5" : "bg-black/5")}>
               <img src={`https://images.unsplash.com/photo-1613771404721-1f92d799e49f?auto=format&fit=crop&w=300&q=80&sig=${i}`} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" alt="card" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
               <div className="absolute bottom-3 left-3 text-white">
                 <div className="font-bold text-sm tracking-tight mb-0.5 shadow-sm">Booster Raro</div>
                 <div className="text-[10px] font-bold uppercase tracking-wider text-white/80">R$ 45,00</div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- TAB: DEALS ---
function TabDeals() {
  const { isDark } = React.useContext(ThemeContext);
  const deals = [
    { id: 1, type: "Troca", status: "Proposta", with: "Alex Costa", item: "Pikachu VMAX", date: "Hoje" },
    { id: 2, type: "Venda", status: "Trânsito", with: "Bruno", item: "Neymar Jr. Ouro", date: "Ontem", price: "R$ 150" },
    { id: 3, type: "Compra", status: "Concluída", with: "Seto Kaiba", item: "Dark Magician", date: "12 Mar", price: "R$ 80" },
  ];

  return (
    <div className="h-full flex flex-col px-8 pt-20 pb-32 overflow-y-auto hide-scrollbar">
      <h2 className="text-4xl font-medium tracking-tighter mb-8">Negociações.</h2>
      
      <div className={cn("flex gap-8 mb-8")}>
        <button className={cn("pb-2 text-sm font-medium", isDark ? "text-white border-b border-white" : "text-black border-b border-black")}>Ativos</button>
        <button className={cn("pb-2 text-sm font-medium", isDark ? "text-neutral-600 hover:text-neutral-400" : "text-neutral-400 hover:text-neutral-600")}>Histórico</button>
      </div>

      <div className="space-y-4">
        {deals.map(deal => (
          <div key={deal.id} className={cn("rounded-[32px] p-5 flex flex-col gap-5 border", isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-black/5 shadow-sm")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em]", 
                  isDark ? "bg-white/10 text-white" : "bg-black/5 text-black"
                )}>
                  {deal.type}
                </div>
                <span className={cn("text-[9px] uppercase font-semibold tracking-widest", isDark ? "text-neutral-600" : "text-neutral-400")}>{deal.date}</span>
              </div>
              <div className={cn("flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em]",
                deal.status === "Proposta" ? "text-amber-500" :
                deal.status === "Trânsito" ? "text-blue-500" :
                "text-emerald-500"
              )}>
                <Circle size={6} className="fill-current" /> {deal.status}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <img src={`https://i.pravatar.cc/150?u=${deal.with}`} className="w-12 h-12 rounded-full object-cover" alt={deal.with} />
              <div className="flex-1">
                <div className="font-medium text-base tracking-tight">{deal.item}</div>
                <div className={cn("text-[11px] font-medium tracking-wide mt-0.5", isDark ? "text-neutral-500" : "text-neutral-500")}>com {deal.with}</div>
              </div>
              {deal.price && <div className="font-medium text-lg">{deal.price}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- TAB: PROFILE ---
function TabProfile({ currentUniverse, universes, onScan }: any) {
  const { isDark, toggleTheme } = React.useContext(ThemeContext);

  return (
    <div className="h-full flex flex-col overflow-y-auto hide-scrollbar pb-32">
      
      {/* Header/Banner */}
      <div className={cn("relative pt-20 px-8 pb-10 overflow-hidden")}>
        {/* Profile Abstract BG */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[var(--accent)] blur-[100px] rounded-full mix-blend-screen" />
        </div>

        <div className="absolute top-8 right-8 flex items-center gap-3 relative z-10">
          <button onClick={toggleTheme} className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-black/5 text-black hover:bg-black/10")}>
            {isDark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
          </button>
          <button className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", isDark ? "bg-white/5 text-neutral-400 hover:text-white" : "bg-black/5 text-neutral-600 hover:text-black")}>
            <Settings size={20} strokeWidth={2} />
          </button>
        </div>
        
        <div className="flex flex-col mt-4 relative z-10">
          <div className="relative mb-6">
            <img src="https://i.pravatar.cc/150?u=me" className={cn("w-28 h-28 rounded-full object-cover")} alt="Avatar" />
          </div>
          <h2 className="text-4xl font-medium tracking-tighter mb-1">Lucas.</h2>
          <p className={cn("text-[11px] font-semibold uppercase tracking-[0.2em] mb-6", isDark ? "text-neutral-500" : "text-neutral-500")}>@lucasgeek</p>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-2xl font-medium tracking-tight">4.9</span>
              <span className={cn("text-[9px] font-semibold uppercase tracking-widest", isDark ? "text-neutral-600" : "text-neutral-400")}>Rating</span>
            </div>
            <div className={cn("w-[1px] h-8", isDark ? "bg-white/10" : "bg-black/10")} />
            <div className="flex flex-col">
              <span className="text-2xl font-medium tracking-tight">142</span>
              <span className={cn("text-[9px] font-semibold uppercase tracking-widest", isDark ? "text-neutral-600" : "text-neutral-400")}>Trades</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="px-8 relative z-10">
        <button onClick={onScan} className={cn("w-full font-medium py-4.5 rounded-full flex items-center justify-center gap-2 mb-12 active:scale-[0.98] transition-transform", isDark ? "bg-white text-black" : "bg-black text-white")}>
          <Plus size={18} strokeWidth={2.5} /> Adicionar ao Acervo
        </button>

        <h3 className={cn("text-[10px] font-semibold uppercase tracking-[0.2em] mb-6", isDark ? "text-neutral-600" : "text-neutral-400")}>Universos Ativos</h3>
        <div className="space-y-3">
          {universes.map((u: any) => {
            const UnivIcon = u.icon;
            return (
              <div key={u.id} className={cn("flex items-center gap-5 p-5 rounded-[28px] cursor-pointer transition-colors border", isDark ? "bg-white/[0.03] hover:bg-white/[0.05] border-white/5" : "bg-white hover:bg-neutral-50 border-black/5 shadow-sm")}>
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", isDark ? "bg-[#111]" : "bg-neutral-100")} style={{ color: u.color }}><UnivIcon size={20} strokeWidth={1.5} /></div>
                <div className="flex-1">
                  <div className="font-medium text-lg tracking-tight mb-0.5">{u.name}</div>
                  <div className={cn("text-[10px] font-semibold uppercase tracking-[0.2em]", isDark ? "text-neutral-600" : "text-neutral-400")}>128 itens</div>
                </div>
                <ChevronRight size={18} className={isDark ? "text-neutral-700" : "text-neutral-300"} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ size, className }: any) {
  return <ChevronLeft size={size} className={cn("rotate-180", className)} />;
}
