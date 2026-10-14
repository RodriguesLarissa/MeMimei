import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../supabase-admin';
import { mercadoPagoPayment } from '../mercadopago';
import { requireAuth } from '../middleware/require-auth';
import { respondNotConfigured, respondPaymentsNotConfigured } from '../not-configured';
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
  status: Contribution['status'];
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
    status: row.status,
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
  if (!mercadoPagoPayment) {
    respondPaymentsNotConfigured(res);
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
    .select('id, name, is_published')
    .eq('id', eventId)
    .maybeSingle();

  if (!event || !event.is_published) {
    res.status(404).json({ error: 'Evento não encontrado.' });
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

  const { data: contribution, error: insertError } = await supabaseAdmin
    .from('contributions')
    .insert({
      event_id: eventId,
      gift_id: giftId,
      guest_name: guestName,
      guest_message: guestMessage,
      amount,
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertError || !contribution) {
    res.status(500).json({ error: 'Não foi possível registrar a contribuição. Tente novamente.' });
    return;
  }

  try {
    const payment = await mercadoPagoPayment.create({
      body: {
        transaction_amount: amount,
        description: `Contribuição para ${event.name} — MeMimei`,
        payment_method_id: 'pix',
        external_reference: contribution.id,
        payer: { email: `convidado+${contribution.id}@memimei.app` },
      },
    });

    const qrCode = payment.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 = payment.point_of_interaction?.transaction_data?.qr_code_base64;

    if (!payment.id || !qrCode || !qrCodeBase64) {
      throw new Error('Resposta do Mercado Pago sem os dados do Pix.');
    }

    await supabaseAdmin.from('payment_transactions').insert({
      contribution_id: contribution.id,
      provider: 'mercadopago',
      provider_payment_id: String(payment.id),
      status: payment.status ?? 'pending',
      amount,
      fee: payment.fee_details?.[0]?.amount ?? null,
      raw_payload: payment,
    });

    res.status(201).json({ contributionId: contribution.id, qrCodeBase64, qrCodeText: qrCode });
  } catch {
    await supabaseAdmin.from('contributions').update({ status: 'cancelled' }).eq('id', contribution.id);
    res.status(502).json({ error: 'Não foi possível gerar o Pix agora. Tente novamente em instantes.' });
  }
});

publicContributionsRouter.get('/:id/status', async (req, res) => {
  if (!supabaseAdmin) {
    respondNotConfigured(res);
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('contributions')
    .select('status')
    .eq('id', req.params['id'])
    .maybeSingle();

  if (error || !data) {
    res.status(404).json({ error: 'Contribuição não encontrada.' });
    return;
  }

  res.json({ status: data.status });
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
