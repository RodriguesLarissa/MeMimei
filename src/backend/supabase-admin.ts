import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { backendEnv, isBackendConfigured } from './env';

/**
 * Cliente com a service role key — ignora RLS por definição do Supabase.
 * Só deve ser usado no backend, nunca exposto ao navegador. Toda checagem de
 * dono/publicado que a RLS fazia precisa ser refeita em código nas rotas.
 */
export const supabaseAdmin: SupabaseClient | null = isBackendConfigured
  ? createClient(backendEnv.supabaseUrl, backendEnv.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })
  : null;
