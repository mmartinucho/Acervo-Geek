import { AuthUser } from '@/domain/entities/auth-user';

export interface AuthRepository {
  // false no mock: o app não exige login (roda com usuário demo).
  readonly requiresAuth: boolean;
  getCurrentUser(): Promise<AuthUser | null>;
  // Notifica login/logout; devolve função de cancelamento.
  onAuthChange(callback: (user: AuthUser | null) => void): () => void;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string, username: string): Promise<void>;
  signOut(): Promise<void>;
}
