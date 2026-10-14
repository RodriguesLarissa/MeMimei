import { Injectable, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { SupabaseClientService } from '../supabase/supabase-client.service';
import { Gift } from '../models/gift.model';

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

export type GiftInput = Omit<Gift, 'id'>;

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

function toRow(eventId: string, input: GiftInput, sortOrder: number) {
  return {
    event_id: eventId,
    name: input.name,
    description: input.description,
    image_url: input.imageUrl || null,
    suggested_amount: input.suggestedAmount,
    category: input.category,
    is_published: input.isPublished,
    allows_free_contribution: input.allowsFreeContribution,
    sort_order: sortOrder,
  };
}

@Injectable({ providedIn: 'root' })
export class GiftService {
  private readonly supabase = inject(SupabaseClientService);

  listByEvent(eventId: string): Observable<Gift[]> {
    const query = this.supabase.client
      .from('gifts')
      .select('*')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true });

    return from(query).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data as GiftRow[]).map(toGift);
      }),
    );
  }

  create(eventId: string, input: GiftInput, sortOrder: number): Observable<Gift> {
    const query = this.supabase.client.from('gifts').insert(toRow(eventId, input, sortOrder)).select().single();

    return from(query).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return toGift(data as GiftRow);
      }),
    );
  }

  update(id: string, eventId: string, input: GiftInput, sortOrder: number): Observable<Gift> {
    const query = this.supabase.client
      .from('gifts')
      .update(toRow(eventId, input, sortOrder))
      .eq('id', id)
      .select()
      .single();

    return from(query).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return toGift(data as GiftRow);
      }),
    );
  }

  delete(id: string): Observable<void> {
    const query = this.supabase.client.from('gifts').delete().eq('id', id);
    return from(query).pipe(
      map(({ error }) => {
        if (error) throw error;
      }),
    );
  }

  updateSortOrder(id: string, sortOrder: number): Observable<void> {
    const query = this.supabase.client.from('gifts').update({ sort_order: sortOrder }).eq('id', id);
    return from(query).pipe(
      map(({ error }) => {
        if (error) throw error;
      }),
    );
  }
}
