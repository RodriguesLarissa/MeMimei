import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../supabase-admin';
import { requireAuth } from '../middleware/require-auth';
import { respondNotConfigured } from '../not-configured';
import { DEMO_EVENT_SLUG } from '../mock-event';
import { GiftEvent } from '../../app/core/models/event.model';

export const eventsRouter = Router();
eventsRouter.use(requireAuth);

interface EventRow {
  id: string;
  owner_id: string;
  name: string;
  occasion_type: string;
  host_names: string;
  event_date: string | null;
  welcome_message: string;
  cover_image_url: string | null;
  gallery_image_urls: string[];
  theme_color: string | null;
  slug: string;
  is_published: boolean;
}

function toGiftEvent(row: EventRow): GiftEvent {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    occasionType: row.occasion_type as GiftEvent['occasionType'],
    hostNames: row.host_names,
    eventDate: row.event_date,
    welcomeMessage: row.welcome_message,
    coverImageUrl: row.cover_image_url ?? '',
    galleryImageUrls: row.gallery_image_urls ?? [],
    themeColor: row.theme_color ?? '',
    isPublished: row.is_published,
  };
}

const eventInputSchema = z.object({
  name: z.string().min(1),
  occasionType: z.enum(['cha-de-casa-nova', 'casamento', 'aniversario', 'cha-de-bebe', 'formatura']),
  hostNames: z.string().min(1),
  eventDate: z.string().nullable(),
  welcomeMessage: z.string(),
  coverImageUrl: z.string(),
  galleryImageUrls: z.array(z.string()),
  themeColor: z.string(),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug inválido'),
  isPublished: z.boolean(),
});

function toRow(input: z.infer<typeof eventInputSchema>, ownerId: string) {
  return {
    owner_id: ownerId,
    name: input.name,
    occasion_type: input.occasionType,
    host_names: input.hostNames,
    event_date: input.eventDate,
    welcome_message: input.welcomeMessage,
    cover_image_url: input.coverImageUrl || null,
    gallery_image_urls: input.galleryImageUrls,
    theme_color: input.themeColor || null,
    slug: input.slug,
    is_published: input.isPublished,
  };
}

async function isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  let query = supabaseAdmin!.from('events').select('id', { count: 'exact', head: true }).eq('slug', slug);
  if (excludeId) {
    query = query.neq('id', excludeId);
  }
  const { count, error } = await query;
  if (error) throw error;
  return (count ?? 0) === 0;
}

eventsRouter.get('/', async (req, res) => {
  if (!supabaseAdmin) {
    respondNotConfigured(res);
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('owner_id', req.session.userId)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ error: 'Não foi possível carregar seus eventos.' });
    return;
  }

  res.json((data as EventRow[]).map(toGiftEvent));
});

eventsRouter.get('/slug-available', async (req, res) => {
  if (!supabaseAdmin) {
    respondNotConfigured(res);
    return;
  }

  const slug = String(req.query['slug'] ?? '');
  const excludeId = req.query['excludeId'] ? String(req.query['excludeId']) : undefined;

  if (slug === DEMO_EVENT_SLUG) {
    res.json({ available: false });
    return;
  }

  try {
    res.json({ available: await isSlugAvailable(slug, excludeId) });
  } catch {
    res.status(500).json({ error: 'Não foi possível checar o link.' });
  }
});

eventsRouter.get('/:id', async (req, res) => {
  if (!supabaseAdmin) {
    respondNotConfigured(res);
    return;
  }

  const { data, error } = await supabaseAdmin.from('events').select('*').eq('id', req.params['id']).maybeSingle();

  if (error) {
    res.status(500).json({ error: 'Não foi possível carregar o evento.' });
    return;
  }
  if (!data || (data as EventRow).owner_id !== req.session.userId) {
    res.status(404).json({ error: 'Evento não encontrado.' });
    return;
  }

  res.json(toGiftEvent(data as EventRow));
});

eventsRouter.post('/', async (req, res) => {
  if (!supabaseAdmin) {
    respondNotConfigured(res);
    return;
  }

  const parsed = eventInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Preencha os campos obrigatórios corretamente.' });
    return;
  }

  if (parsed.data.slug === DEMO_EVENT_SLUG) {
    res.status(400).json({ error: 'Esse link é reservado para o exemplo do MeMimei. Escolha outro.' });
    return;
  }

  try {
    if (!(await isSlugAvailable(parsed.data.slug))) {
      res.status(409).json({ error: 'Esse link já está em uso. Escolha outro.' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('events')
      .insert(toRow(parsed.data, req.session.userId!))
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(toGiftEvent(data as EventRow));
  } catch {
    res.status(500).json({ error: 'Não foi possível criar o evento.' });
  }
});

eventsRouter.put('/:id', async (req, res) => {
  if (!supabaseAdmin) {
    respondNotConfigured(res);
    return;
  }

  const existing = await supabaseAdmin.from('events').select('owner_id').eq('id', req.params['id']).maybeSingle();
  if (existing.error || !existing.data || existing.data.owner_id !== req.session.userId) {
    res.status(404).json({ error: 'Evento não encontrado.' });
    return;
  }

  const parsed = eventInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Preencha os campos obrigatórios corretamente.' });
    return;
  }

  if (parsed.data.slug === DEMO_EVENT_SLUG) {
    res.status(400).json({ error: 'Esse link é reservado para o exemplo do MeMimei. Escolha outro.' });
    return;
  }

  try {
    if (!(await isSlugAvailable(parsed.data.slug, req.params['id']))) {
      res.status(409).json({ error: 'Esse link já está em uso. Escolha outro.' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('events')
      .update(toRow(parsed.data, req.session.userId!))
      .eq('id', req.params['id'])
      .select()
      .single();

    if (error) throw error;
    res.json(toGiftEvent(data as EventRow));
  } catch {
    res.status(500).json({ error: 'Não foi possível salvar o evento.' });
  }
});

eventsRouter.delete('/:id', async (req, res) => {
  if (!supabaseAdmin) {
    respondNotConfigured(res);
    return;
  }

  const existing = await supabaseAdmin.from('events').select('owner_id').eq('id', req.params['id']).maybeSingle();
  if (existing.error || !existing.data || existing.data.owner_id !== req.session.userId) {
    res.status(404).json({ error: 'Evento não encontrado.' });
    return;
  }

  const { error } = await supabaseAdmin.from('events').delete().eq('id', req.params['id']);
  if (error) {
    res.status(500).json({ error: 'Não foi possível excluir o evento.' });
    return;
  }

  res.json({ success: true });
});
