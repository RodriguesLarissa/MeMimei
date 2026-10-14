import { Router } from 'express';
import { supabaseAdmin } from '../supabase-admin';
import { DEMO_EVENT_SLUG, getMockEventBySlug } from '../mock-event';
import { GiftEvent } from '../../app/core/models/event.model';
import { Gift } from '../../app/core/models/gift.model';

export const publicEventsRouter = Router();

interface EventRow {
  id: string;
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

interface GiftRow {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  suggested_amount: number | null;
  category: string;
  is_published: boolean;
  allows_free_contribution: boolean;
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

// O exemplo da tela inicial é sempre fictício — nunca busca no Supabase,
// mesmo que alguém publique um evento real com o mesmo slug.
publicEventsRouter.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  if (slug === DEMO_EVENT_SLUG || !supabaseAdmin) {
    const mock = getMockEventBySlug(slug);
    res.json({ event: mock?.event, gifts: mock?.gifts ?? [] });
    return;
  }

  const { data: eventRow, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (error || !eventRow) {
    res.json({ event: undefined, gifts: [] });
    return;
  }

  const event = toGiftEvent(eventRow as EventRow);

  const { data: giftRows, error: giftError } = await supabaseAdmin
    .from('gifts')
    .select('*')
    .eq('event_id', event.id)
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (giftError) {
    res.status(500).json({ error: 'Não foi possível carregar os presentes.' });
    return;
  }

  res.json({ event, gifts: (giftRows as GiftRow[]).map(toGift) });
});
