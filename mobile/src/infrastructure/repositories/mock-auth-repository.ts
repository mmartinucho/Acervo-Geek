import { AuthRepository } from '@/application/ports/auth-repository';
import { AuthUser } from '@/domain/entities/auth-user';

const DEMO_USER: AuthUser = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'demo@acervogeek.app',
  username: 'michael.m',
};

// Sem backend, o app roda "logado" como usuário demo — nenhuma tela de login.
export class MockAuthRepository implements AuthRepository {
  readonly requiresAuth = false;

  async getCurrentUser(): Promise<AuthUser | null> {
    return DEMO_USER;
  }

  onAuthChange(callback: (user: AuthUser | null) => void): () => void {
    callback(DEMO_USER);
    return () => {};
  }

  async signIn(): Promise<void> {}
  async signUp(): Promise<void> {}
  async signOut(): Promise<void> {}
}
