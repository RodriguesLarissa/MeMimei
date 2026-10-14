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
  mercadoPagoAccessToken: process.env['MERCADOPAGO_ACCESS_TOKEN'] ?? '',
  mercadoPagoWebhookSecret: process.env['MERCADOPAGO_WEBHOOK_SECRET'] ?? '',
};

/** Só fica `true` quando todas as credenciais do Supabase necessárias para o backend existem. */
export const isBackendConfigured = Boolean(
  backendEnv.supabaseUrl && backendEnv.supabaseAnonKey && backendEnv.supabaseServiceRoleKey,
);

/** Só fica `true` quando as credenciais do Mercado Pago existem — o resto do app funciona sem isso. */
export const isMercadoPagoConfigured = Boolean(
  backendEnv.mercadoPagoAccessToken && backendEnv.mercadoPagoWebhookSecret,
);
