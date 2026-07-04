import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Credenciais vêm de variáveis EXPO_PUBLIC_* (inlined pelo Expo no bundle).
// Sem elas, o app roda com os repositórios mock — a UI não muda.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// Sessão persiste em AsyncStorage (localStorage no web); autoRefresh mantém o
// token válido. detectSessionInUrl off — não usamos OAuth redirect por enquanto.
// storage só em ambiente com window (browser/nativo); no SSR do export estático
// (Node) fica undefined para não quebrar o prerender.
const hasWindow = typeof window !== 'undefined';

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        storage: hasWindow ? AsyncStorage : undefined,
        persistSession: hasWindow,
        autoRefreshToken: hasWindow,
        detectSessionInUrl: false,
      },
    })
  : null;
