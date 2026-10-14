import { Injectable, inject } from '@angular/core';
import { Observable, catchError, from, map, of, switchMap } from 'rxjs';
import { SupabaseClientService } from '../supabase/supabase-client.service';
import { MockEventService } from './mock-event.service';
import { GiftEvent } from '../models/event.model';
import { Gift } from '../models/gift.model';

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

/** Busca eventos publicados no Supabase pelo slug; se não configurado ou não encontrado, usa os dados fictícios de demonstração. */
@Injectable({ providedIn: 'root' })
export class EventRepositoryService {
  private readonly supabase = inject(SupabaseClientService);
  private readonly mockEventService = inject(MockEventService);

  getEventBySlug(slug: string): Observable<{ event: GiftEvent | undefined; gifts: Gift[] }> {
    if (!this.supabase.isConfigured()) {
      return this.getFromMock(slug);
    }

    const query = this.supabase.client
      .from('events')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    return from(query).pipe(
      switchMap(({ data, error }) => {
        if (error || !data) {
          return this.getFromMock(slug);
        }

        const event = toGiftEvent(data as EventRow);
        const giftsQuery = this.supabase.client
          .from('gifts')
          .select('*')
          .eq('event_id', event.id)
          .eq('is_published', true)
          .order('sort_order', { ascending: true });

        return from(giftsQuery).pipe(
          map(({ data: giftRows, error: giftError }) => {
            if (giftError) throw giftError;
            return { event, gifts: (giftRows as GiftRow[]).map(toGift) };
          }),
        );
      }),
      catchError(() => this.getFromMock(slug)),
    );
  }

  private getFromMock(slug: string): Observable<{ event: GiftEvent | undefined; gifts: Gift[] }> {
    return this.mockEventService.getEventBySlug(slug).pipe(
      switchMap((event) => {
        if (!event) {
          return of({ event: undefined, gifts: [] });
        }
        return this.mockEventService.getGiftsByEventId(event.id).pipe(map((gifts) => ({ event, gifts })));
      }),
    );
  }
}
