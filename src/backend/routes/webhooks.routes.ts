import { Router } from 'express';
import { InvalidWebhookSignatureError, WebhookSignatureValidator } from 'mercadopago';
import { supabaseAdmin } from '../supabase-admin';
import { mercadoPagoPayment } from '../mercadopago';
import { backendEnv, isMercadoPagoConfigured } from '../env';

export const webhooksRouter = Router();

webhooksRouter.post('/mercadopago', async (req, res) => {
  if (!isMercadoPagoConfigured || !mercadoPagoPayment || !supabaseAdmin) {
    // Responde 200 pra não deixar o Mercado Pago tentando de novo um ambiente
    // que simplesmente ainda não está configurado.
    res.sendStatus(200);
    return;
  }

  const dataId = req.query['data.id'] ?? (req.body as { data?: { id?: string } })?.data?.id;

  try {
    WebhookSignatureValidator.validate({
      xSignature: req.headers['x-signature'],
      xRequestId: req.headers['x-request-id'],
      dataId: dataId as string | undefined,
      secret: backendEnv.mercadoPagoWebhookSecret,
      toleranceSeconds: 300,
    });
  } catch (error) {
    if (error instanceof InvalidWebhookSignatureError) {
      res.status(401).json({ error: 'Assinatura inválida.' });
      return;
    }
    throw error;
  }

  if (!dataId) {
    res.sendStatus(200);
    return;
  }

  try {
    // Nunca confiamos no corpo da notificação sozinho — buscamos o pagamento
    // de novo na API do Mercado Pago pra ter o status oficial.
    const payment = await mercadoPagoPayment.get({ id: String(dataId) });

    const { data: transaction } = await supabaseAdmin
      .from('payment_transactions')
      .select('id, contribution_id, status')
      .eq('provider_payment_id', String(dataId))
      .maybeSingle();

    if (!transaction) {
      res.sendStatus(200);
      return;
    }

    await supabaseAdmin
      .from('payment_transactions')
      .update({ status: payment.status ?? 'pending', raw_payload: payment })
      .eq('id', transaction.id);

    if (payment.status === 'approved' && transaction.status !== 'approved') {
      await supabaseAdmin
        .from('contributions')
        .update({ status: 'confirmed' })
        .eq('id', transaction.contribution_id);
    } else if (payment.status === 'cancelled' || payment.status === 'rejected') {
      await supabaseAdmin.from('contributions').update({ status: 'cancelled' }).eq('id', transaction.contribution_id);
    }

    res.sendStatus(200);
  } catch {
    // Erro nosso/transitório (não de assinatura) — devolve 500 pro Mercado Pago tentar de novo depois.
    res.sendStatus(500);
  }
});
