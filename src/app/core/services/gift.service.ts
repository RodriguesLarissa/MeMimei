import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Gift } from '../models/gift.model';

export type GiftInput = Omit<Gift, 'id'>;

@Injectable({ providedIn: 'root' })
export class GiftService {
  private readonly http = inject(HttpClient);

  listByEvent(eventId: string): Observable<Gift[]> {
    return this.http.get<Gift[]>(`/api/events/${eventId}/gifts`);
  }

  create(eventId: string, input: GiftInput): Observable<Gift> {
    return this.http.post<Gift>(`/api/events/${eventId}/gifts`, input);
  }

  update(id: string, input: GiftInput): Observable<Gift> {
    return this.http.put<Gift>(`/api/gifts/${id}`, input);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/gifts/${id}`);
  }

  move(id: string, direction: 'up' | 'down'): Observable<Gift[]> {
    return this.http.post<Gift[]>(`/api/gifts/${id}/move`, { direction });
  }
}
