import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../supabase-admin';
import { requireAuth } from '../middleware/require-auth';
import { respondNotConfigured } from '../not-configured';
import { buildPix, normalizePixKey, PixKeyType } from '../pix';

export const profileRouter = Router();
profileRouter.use(requireAuth);

const PIX_KEY_TYPES = ['cpf', 'cnpj', 'telefone', 'email', 'aleatoria'] as const;

interface ProfileRow {
  display_name: string;
  pix_key: string | null;
  pix_key_type: PixKeyType | null;
  pix_city: string | null;
}

profileRouter.get('/', async (req, res) => {
  if (!supabaseAdmin) {
    respondNotConfigured(res);
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('display_name, pix_key, pix_key_type, pix_city')
    .eq('id', req.session.userId!)
    .maybeSingle();

  if (error || !data) {
    res.status(404).json({ error: 'Perfil não encontrado.' });
    return;
  }

  const row = data as ProfileRow;
  res.json({
    displayName: row.display_name,
    pixKey: row.pix_key ?? '',
    pixKeyType: row.pix_key_type ?? '',
    pixCity: row.pix_city ?? '',
  });
});

const updateProfileSchema = z.object({
  displayName: z.string().min(1),
  pixKey: z.string().min(1),
  pixKeyType: z.enum(PIX_KEY_TYPES),
  pixCity: z.string().min(1).max(15),
});

profileRouter.put('/', async (req, res) => {
  if (!supabaseAdmin) {
    respondNotConfigured(res);
    return;
  }

  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Preencha nome, tipo e chave Pix e cidade.' });
    return;
  }

  const { displayName, pixKey, pixKeyType, pixCity } = parsed.data;

  const normalizedKey = normalizePixKey(pixKey, pixKeyType);
  if (!normalizedKey) {
    res.status(400).json({ error: 'Essa chave não bate com o tipo selecionado. Confira e tente novamente.' });
    return;
  }

  const built = await buildPix({ pixKey: normalizedKey, merchantName: displayName, merchantCity: pixCity, amount: 1 });
  if (!built) {
    res.status(400).json({ error: 'Essa chave Pix não parece válida. Confira e tente novamente.' });
    return;
  }

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ display_name: displayName, pix_key: normalizedKey, pix_key_type: pixKeyType, pix_city: pixCity })
    .eq('id', req.session.userId!);

  if (error) {
    res.status(500).json({ error: 'Não foi possível salvar o perfil.' });
    return;
  }

  res.json({ displayName, pixKey: normalizedKey, pixKeyType, pixCity });
});
