import { Injectable, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { SupabaseClientService } from '../supabase/supabase-client.service';
import { AuthService } from '../auth/auth.service';
import { GiftEvent } from '../models/event.model';

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

export type EventInput = Omit<GiftEvent, 'id'>;

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

function toRow(input: EventInput, ownerId: string) {
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

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly supabase = inject(SupabaseClientService);
  private readonly authService = inject(AuthService);

  listMyEvents(): Observable<GiftEvent[]> {
    const ownerId = this.authService.currentUser()?.id;
    const query = this.supabase.client
      .from('events')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    return from(query).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data as EventRow[]).map(toGiftEvent);
      }),
    );
  }

  getById(id: string): Observable<GiftEvent | undefined> {
    const query = this.supabase.client.from('events').select('*').eq('id', id).maybeSingle();

    return from(query).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data ? toGiftEvent(data as EventRow) : undefined;
      }),
    );
  }

  create(input: EventInput): Observable<GiftEvent> {
    const ownerId = this.authService.currentUser()?.id;
    if (!ownerId) {
      throw new Error('É preciso estar autenticado para criar um evento.');
    }

    const query = this.supabase.client.from('events').insert(toRow(input, ownerId)).select().single();

    return from(query).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return toGiftEvent(data as EventRow);
      }),
    );
  }

  update(id: string, input: EventInput): Observable<GiftEvent> {
    const ownerId = this.authService.currentUser()?.id;
    if (!ownerId) {
      throw new Error('É preciso estar autenticado para editar um evento.');
    }

    const query = this.supabase.client
      .from('events')
      .update(toRow(input, ownerId))
      .eq('id', id)
      .select()
      .single();

    return from(query).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return toGiftEvent(data as EventRow);
      }),
    );
  }

  delete(id: string): Observable<void> {
    const query = this.supabase.client.from('events').delete().eq('id', id);
    return from(query).pipe(
      map(({ error }) => {
        if (error) throw error;
      }),
    );
  }

  isSlugAvailable(slug: string, excludeId?: string): Observable<boolean> {
    let query = this.supabase.client.from('events').select('id', { count: 'exact', head: true }).eq('slug', slug);
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    return from(query).pipe(
      map(({ count, error }) => {
        if (error) throw error;
        return (count ?? 0) === 0;
      }),
    );
  }
}
