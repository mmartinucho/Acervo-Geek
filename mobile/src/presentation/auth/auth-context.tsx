import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { AuthUser } from '@/domain/entities/auth-user';
import { repositories } from '@/infrastructure/container';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  requiresAuth: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = repositories.auth;
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    auth.getCurrentUser().then((u) => {
      if (active) {
        setUser(u);
        setIsLoading(false);
      }
    });
    const unsubscribe = auth.onAuthChange((u) => {
      if (active) setUser(u);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [auth]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isLoading,
      requiresAuth: auth.requiresAuth,
      signIn: auth.signIn.bind(auth),
      signUp: auth.signUp.bind(auth),
      signOut: auth.signOut.bind(auth),
    }),
    [user, isLoading, auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
