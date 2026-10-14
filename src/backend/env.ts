try {
  process.loadEnvFile();
} catch {
  // Sem .env local (ex: produção, onde as variáveis já vêm do ambiente de hospedagem).
}

export const backendEnv = {
  supabaseUrl: process.env['SUPABASE_URL'] ?? '',
  supabaseAnonKey: process.env['SUPABASE_ANON_KEY'] ?? '',
  supabaseServiceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '',
  sessionSecret: process.env['SESSION_SECRET'] ?? 'memimei-dev-secret-troque-em-producao',
};

/** Só fica `true` quando todas as credenciais do Supabase necessárias para o backend existem. */
export const isBackendConfigured = Boolean(
  backendEnv.supabaseUrl && backendEnv.supabaseAnonKey && backendEnv.supabaseServiceRoleKey,
);
