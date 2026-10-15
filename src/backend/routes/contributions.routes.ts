import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../supabase-admin';
import { requireAuth } from '../middleware/require-auth';
import { respondNotConfigured, respondPaymentsNotConfigured } from '../not-configured';
import { buildPix } from '../pix';
import { Contribution } from '../../app/core/models/contribution.model';

export const publicContributionsRouter = Router();
export const ownerContributionsRouter = Router();
ownerContributionsRouter.use(requireAuth);

interface ContributionRow {
  id: string;
  event_id: string;
  gift_id: string | null;
  guest_name: string | null;
  guest_message: string | null;
  amount: number;
  created_at: string;
  gifts?: { name: string } | { name: string }[] | null;
}

function toContribution(row: ContributionRow): Contribution {
  const gift = Array.isArray(row.gifts) ? row.gifts[0] : row.gifts;
  return {
    id: row.id,
    eventId: row.event_id,
    giftId: row.gift_id,
    giftName: gift?.name ?? null,
    guestName: row.guest_name,
    guestMessage: row.guest_message,
    amount: row.amount,
    createdAt: row.created_at,
  };
}

const createContributionSchema = z.object({
  eventId: z.string().uuid(),
  giftId: z.string().uuid().nullable(),
  amount: z.number().positive().max(1_000_000),
  guestName: z.string().max(120).nullable(),
  guestMessage: z.string().max(500).nullable(),
});

publicContributionsRouter.post('/', async (req, res) => {
  if (!supabaseAdmin) {
    respondNotConfigured(res);
    return;
  }

  const parsed = createContributionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Preencha um valor válido para contribuir.' });
    return;
  }

  const { eventId, giftId, amount, guestName, guestMessage } = parsed.data;

  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id, name, is_published, owner_id')
    .eq('id', eventId)
    .maybeSingle();

  if (!event || !event.is_published) {
    res.status(404).json({ error: 'Evento não encontrado.' });
    return;
  }

  const { data: owner } = await supabaseAdmin
    .from('profiles')
    .select('display_name, pix_key, pix_city')
    .eq('id', event.owner_id)
    .maybeSingle();

  if (!owner?.pix_key || !owner?.pix_city) {
    respondPaymentsNotConfigured(res);
    return;
  }

  if (giftId) {
    const { data: gift } = await supabaseAdmin
      .from('gifts')
      .select('id, is_published')
      .eq('id', giftId)
      .eq('event_id', eventId)
      .maybeSingle();

    if (!gift || !gift.is_published) {
      res.status(404).json({ error: 'Presente não encontrado.' });
      return;
    }
  }

  const built = await buildPix({
    pixKey: owner.pix_key,
    merchantName: owner.display_name,
    merchantCity: owner.pix_city,
    amount,
    infoAdicional: event.name,
  });

  if (!built) {
    res.status(502).json({ error: 'Não foi possível gerar o Pix agora. Tente novamente em instantes.' });
    return;
  }

  const { data: contribution, error: insertError } = await supabaseAdmin
    .from('contributions')
    .insert({
      event_id: eventId,
      gift_id: giftId,
      guest_name: guestName,
      guest_message: guestMessage,
      amount,
      pix_code: built.brCode,
    })
    .select('id')
    .single();

  if (insertError || !contribution) {
    res.status(500).json({ error: 'Não foi possível registrar a contribuição. Tente novamente.' });
    return;
  }

  res.status(201).json({ contributionId: contribution.id, qrCodeBase64: built.qrCodeBase64, qrCodeText: built.brCode });
});

ownerContributionsRouter.get('/events/:eventId/contributions', async (req, res) => {
  if (!supabaseAdmin) {
    respondNotConfigured(res);
    return;
  }

  const { data: event } = await supabaseAdmin
    .from('events')
    .select('id, owner_id')
    .eq('id', req.params['eventId'])
    .maybeSingle();

  if (!event || event.owner_id !== req.session.userId) {
    res.status(404).json({ error: 'Evento não encontrado.' });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('contributions')
    .select('*, gifts(name)')
    .eq('event_id', req.params['eventId'])
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ error: 'Não foi possível carregar as contribuições.' });
    return;
  }

  res.json((data as ContributionRow[]).map(toContribution));
});
