import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../supabase-admin';
import { requireAuth } from '../middleware/require-auth';
import { respondNotConfigured } from '../not-configured';
import { Gift } from '../../app/core/models/gift.model';

export const giftsRouter = Router();
giftsRouter.use(requireAuth);

interface GiftRow {
  id: string;
  event_id: string;
  name: string;
  description: string;
  image_url: string | null;
  suggested_amount: number | null;
  category: string;
  is_published: boolean;
  allows_free_contribution: boolean;
  sort_order: number;
}

function toGift(row: GiftRow): Gift {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url ?? '',
    suggestedAmount: row.suggested_amount,
    category: row.category as Gift['category'],
    isPublished: row.is_published,
    allowsFreeContribution: row.allows_free_contribution,
  };
}

const giftInputSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  imageUrl: z.string(),
  suggestedAmount: z.number().nullable(),
  category: z.enum(['cozinha', 'moveis', 'decoracao', 'eletrodomesticos', 'livre']),
  isPublished: z.boolean(),
  allowsFreeContribution: z.boolean(),
});

function toRow(input: z.infer<typeof giftInputSchema>) {
  return {
    name: input.name,
    description: input.description,
    image_url: input.imageUrl || null,
    suggested_amount: input.suggestedAmount,
    category: input.category,
    is_published: input.isPublished,
    allows_free_contribution: input.allowsFreeContribution,
  };
}

/** Confere se o evento pertence ao usuário logado. Devolve o evento ou null. */
async function getOwnedEvent(eventId: string, userId: string) {
  const { data } = await supabaseAdmin!.from('events').select('id, owner_id').eq('id', eventId).maybeSingle();
  return data && data.owner_id === userId ? data : null;
}

/** Confere se o presente pertence a um evento do usuário logado. Devolve o presente ou null. */
async function getOwnedGift(giftId: string, userId: string): Promise<GiftRow | null> {
  const { data: gift } = await supabaseAdmin!.from('gifts').select('*').eq('id', giftId).maybeSingle();
  if (!gift) return null;

  const event = await getOwnedEvent((gift as GiftRow).event_id, userId);
  return event ? (gift as GiftRow) : null;
}

giftsRouter.get('/events/:eventId/gifts', async (req, res) => {
  if (!supabaseAdmin) {
    respondNotConfigured(res);
    return;
  }

  const event = await getOwnedEvent(req.params['eventId'], req.session.userId!);
  if (!event) {
    res.status(404).json({ error: 'Evento não encontrado.' });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('gifts')
    .select('*')
    .eq('event_id', req.params['eventId'])
    .order('sort_order', { ascending: true });

  if (error) {
    res.status(500).json({ error: 'Não foi possível carregar os presentes.' });
    return;
  }

  res.json((data as GiftRow[]).map(toGift));
});

giftsRouter.post('/events/:eventId/gifts', async (req, res) => {
  if (!supabaseAdmin) {
    respondNotConfigured(res);
    return;
  }

  const event = await getOwnedEvent(req.params['eventId'], req.session.userId!);
  if (!event) {
    res.status(404).json({ error: 'Evento não encontrado.' });
    return;
  }

  const parsed = giftInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Preencha os campos obrigatórios corretamente.' });
    return;
  }

  const { count } = await supabaseAdmin
    .from('gifts')
    .select('id', { count: 'exact', head: true })
    .eq('event_id', req.params['eventId']);

  const { data, error } = await supabaseAdmin
    .from('gifts')
    .insert({ ...toRow(parsed.data), event_id: req.params['eventId'], sort_order: count ?? 0 })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: 'Não foi possível adicionar o presente.' });
    return;
  }

  res.status(201).json(toGift(data as GiftRow));
});

giftsRouter.put('/gifts/:id', async (req, res) => {
  if (!supabaseAdmin) {
    respondNotConfigured(res);
    return;
  }

  const gift = await getOwnedGift(req.params['id'], req.session.userId!);
  if (!gift) {
    res.status(404).json({ error: 'Presente não encontrado.' });
    return;
  }

  const parsed = giftInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Preencha os campos obrigatórios corretamente.' });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('gifts')
    .update(toRow(parsed.data))
    .eq('id', req.params['id'])
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: 'Não foi possível salvar o presente.' });
    return;
  }

  res.json(toGift(data as GiftRow));
});

giftsRouter.delete('/gifts/:id', async (req, res) => {
  if (!supabaseAdmin) {
    respondNotConfigured(res);
    return;
  }

  const gift = await getOwnedGift(req.params['id'], req.session.userId!);
  if (!gift) {
    res.status(404).json({ error: 'Presente não encontrado.' });
    return;
  }

  const { error } = await supabaseAdmin.from('gifts').delete().eq('id', req.params['id']);
  if (error) {
    res.status(500).json({ error: 'Não foi possível excluir o presente.' });
    return;
  }

  res.json({ success: true });
});

const moveSchema = z.object({ direction: z.enum(['up', 'down']) });

giftsRouter.post('/gifts/:id/move', async (req, res) => {
  if (!supabaseAdmin) {
    respondNotConfigured(res);
    return;
  }

  const gift = await getOwnedGift(req.params['id'], req.session.userId!);
  if (!gift) {
    res.status(404).json({ error: 'Presente não encontrado.' });
    return;
  }

  const parsed = moveSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Direção inválida.' });
    return;
  }

  const { data: siblings, error } = await supabaseAdmin
    .from('gifts')
    .select('*')
    .eq('event_id', gift.event_id)
    .order('sort_order', { ascending: true });

  if (error || !siblings) {
    res.status(500).json({ error: 'Não foi possível reordenar os presentes.' });
    return;
  }

  const list = siblings as GiftRow[];
  const index = list.findIndex((g) => g.id === gift.id);
  const targetIndex = parsed.data.direction === 'up' ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= list.length) {
    res.json(list.map(toGift));
    return;
  }

  const current = list[index];
  const target = list[targetIndex];

  const [updateA, updateB] = await Promise.all([
    supabaseAdmin.from('gifts').update({ sort_order: target.sort_order }).eq('id', current.id),
    supabaseAdmin.from('gifts').update({ sort_order: current.sort_order }).eq('id', target.id),
  ]);

  if (updateA.error || updateB.error) {
    res.status(500).json({ error: 'Não foi possível reordenar os presentes.' });
    return;
  }

  [list[index], list[targetIndex]] = [list[targetIndex], list[index]];
  res.json(list.map(toGift));
});
