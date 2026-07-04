import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Credenciais vêm de variáveis EXPO_PUBLIC_* (inlined pelo Expo no bundle).
// Sem elas, o app roda com os repositórios mock — a UI não muda.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// persistSession fica desligado até a tela de auth existir (fase seguinte);
// evita depender de AsyncStorage e mantém o build web limpo.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;
