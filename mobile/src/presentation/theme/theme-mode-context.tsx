import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

// Modo de cor efetivo do app. Segue o sistema por padrão, mas o toggle Sol/Lua
// do Perfil pode sobrescrever em runtime. Todo o app lê daqui (via
// hooks/use-color-scheme), então o toggle re-pinta tudo de uma vez.
type Scheme = 'light' | 'dark';

interface ThemeModeValue {
  scheme: Scheme;
  toggle: () => void;
}

const ThemeModeContext = createContext<ThemeModeValue>({
  scheme: 'dark',
  toggle: () => {},
});

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const system = useRNColorScheme();
  const [hydrated, setHydrated] = useState(false);
  const [override, setOverride] = useState<Scheme | null>(null);

  // Web: antes de hidratar, assume 'light' (evita mismatch do render estático).
  useEffect(() => setHydrated(true), []);

  const base: Scheme = hydrated ? (system === 'dark' ? 'dark' : 'light') : 'light';
  const scheme: Scheme = override ?? base;

  const value = useMemo<ThemeModeValue>(
    () => ({
      scheme,
      toggle: () => setOverride(scheme === 'dark' ? 'light' : 'dark'),
    }),
    [scheme],
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode(): ThemeModeValue {
  return useContext(ThemeModeContext);
}
