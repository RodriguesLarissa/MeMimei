import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GiftEvent } from '../models/event.model';
import { Gift } from '../models/gift.model';

/** Busca o evento publicado pelo slug (demo fictícia ou evento real) via o backend. */
@Injectable({ providedIn: 'root' })
export class EventRepositoryService {
  private readonly http = inject(HttpClient);

  getEventBySlug(slug: string): Observable<{ event: GiftEvent | undefined; gifts: Gift[] }> {
    return this.http.get<{ event: GiftEvent | undefined; gifts: Gift[] }>(`/api/public/events/${slug}`);
  }
}
