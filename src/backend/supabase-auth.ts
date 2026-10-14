import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { backendEnv, isBackendConfigured } from './env';

/** Cliente com a chave anônima — só para os fluxos de autenticação (signUp, signIn, signOut, reset de senha). */
export const supabaseAuth: SupabaseClient | null = isBackendConfigured
  ? createClient(backendEnv.supabaseUrl, backendEnv.supabaseAnonKey, {
      auth: { persistSession: false },
    })
  : null;
