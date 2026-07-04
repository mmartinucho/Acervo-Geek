import { SupabaseClient, User } from '@supabase/supabase-js';

import { AuthRepository } from '@/application/ports/auth-repository';
import { AuthUser } from '@/domain/entities/auth-user';

function toAuthUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? undefined,
    username: (user.user_metadata?.username as string | undefined) ?? undefined,
  };
}

export class SupabaseAuthRepository implements AuthRepository {
  readonly requiresAuth = true;

  constructor(private readonly client: SupabaseClient) {}

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data } = await this.client.auth.getSession();
    return toAuthUser(data.session?.user ?? null);
  }

  onAuthChange(callback: (user: AuthUser | null) => void): () => void {
    const { data } = this.client.auth.onAuthStateChange((_event, session) => {
      callback(toAuthUser(session?.user ?? null));
    });
    return () => data.subscription.unsubscribe();
  }

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }

  async signUp(email: string, password: string, username: string): Promise<void> {
    // username vai em metadata → o trigger handle_new_user usa no profile.
    const { error } = await this.client.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) throw new Error(error.message);
  }

  async signOut(): Promise<void> {
    await this.client.auth.signOut();
  }
}
