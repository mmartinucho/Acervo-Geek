import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { AuthUser } from '@/domain/entities/auth-user';
import { repositories } from '@/infrastructure/container';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  requiresAuth: boolean;
  // Usuário logado ainda sem inventário/wishlist → deve montar o álbum.
  needsOnboarding: boolean;
  refreshOnboarding: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = repositories.auth;
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const refreshOnboarding = useCallback(async () => {
    if (!auth.requiresAuth) {
      setNeedsOnboarding(false);
      return;
    }
    const hasData = await repositories.collection.hasCollectionData();
    setNeedsOnboarding(!hasData);
  }, [auth.requiresAuth]);

  useEffect(() => {
    let active = true;
    const sync = async (u: AuthUser | null) => {
      if (!active) return;
      setUser(u);
      if (u) await refreshOnboarding();
      else setNeedsOnboarding(false);
      if (active) setIsLoading(false);
    };
    auth.getCurrentUser().then(sync);
    const unsubscribe = auth.onAuthChange(sync);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [auth, refreshOnboarding]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isLoading,
      requiresAuth: auth.requiresAuth,
      needsOnboarding,
      refreshOnboarding,
      signIn: auth.signIn.bind(auth),
      signUp: auth.signUp.bind(auth),
      signOut: auth.signOut.bind(auth),
    }),
    [user, isLoading, auth, needsOnboarding, refreshOnboarding],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
