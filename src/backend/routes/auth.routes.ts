import { Router } from 'express';
import { z } from 'zod';
import { supabaseAuth } from '../supabase-auth';
import { isBackendConfigured } from '../env';
import { respondNotConfigured } from '../not-configured';

export const authRouter = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
});

function translateAuthError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (normalized.includes('already registered') || normalized.includes('already been registered')) {
    return 'Este e-mail já está cadastrado.';
  }
  if (normalized.includes('password should be at least')) {
    return 'A senha precisa ter pelo menos 6 caracteres.';
  }
  return 'Não foi possível concluir a ação. Tente novamente em instantes.';
}

authRouter.get('/me', (req, res) => {
  if (!isBackendConfigured) {
    res.json({ configured: false, user: null });
    return;
  }

  if (!req.session.userId) {
    res.json({ configured: true, user: null });
    return;
  }

  res.json({
    configured: true,
    user: {
      id: req.session.userId,
      email: req.session.email ?? '',
      displayName: req.session.displayName ?? null,
    },
  });
});

authRouter.post('/signup', async (req, res) => {
  if (!supabaseAuth) {
    respondNotConfigured(res);
    return;
  }

  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Preencha nome, e-mail e uma senha com pelo menos 6 caracteres.' });
    return;
  }

  const { email, password, displayName } = parsed.data;
  const { error } = await supabaseAuth.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });

  if (error) {
    res.status(400).json({ error: translateAuthError(error.message) });
    return;
  }

  res.json({ success: true });
});

authRouter.post('/login', async (req, res) => {
  if (!supabaseAuth) {
    respondNotConfigured(res);
    return;
  }

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Informe e-mail e senha.' });
    return;
  }

  const { email, password } = parsed.data;
  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    res.status(401).json({ error: translateAuthError(error?.message ?? 'Invalid login credentials') });
    return;
  }

  req.session.userId = data.user.id;
  req.session.email = data.user.email ?? '';
  req.session.displayName = data.user.user_metadata?.['display_name'] as string | undefined;

  res.json({
    success: true,
    user: {
      id: data.user.id,
      email: data.user.email ?? '',
      displayName: req.session.displayName ?? null,
    },
  });
});

authRouter.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

authRouter.post('/reset-password', async (req, res) => {
  if (!supabaseAuth) {
    respondNotConfigured(res);
    return;
  }

  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Informe um e-mail válido.' });
    return;
  }

  const { error } = await supabaseAuth.auth.resetPasswordForEmail(parsed.data.email);

  if (error) {
    res.status(400).json({ error: translateAuthError(error.message) });
    return;
  }

  res.json({ success: true });
});
