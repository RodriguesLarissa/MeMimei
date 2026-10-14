import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { GiftEvent } from '../models/event.model';

export type EventInput = Omit<GiftEvent, 'id'>;

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);

  listMyEvents(): Observable<GiftEvent[]> {
    return this.http.get<GiftEvent[]>('/api/events');
  }

  getById(id: string): Observable<GiftEvent | undefined> {
    return this.http.get<GiftEvent>(`/api/events/${id}`).pipe(
      catchError((error: HttpErrorResponse) => (error.status === 404 ? of(undefined) : throwError(() => error))),
    );
  }

  create(input: EventInput): Observable<GiftEvent> {
    return this.http.post<GiftEvent>('/api/events', input);
  }

  update(id: string, input: EventInput): Observable<GiftEvent> {
    return this.http.put<GiftEvent>(`/api/events/${id}`, input);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/events/${id}`);
  }

  isSlugAvailable(slug: string, excludeId?: string): Observable<boolean> {
    let params = new HttpParams().set('slug', slug);
    if (excludeId) {
      params = params.set('excludeId', excludeId);
    }
    return this.http
      .get<{ available: boolean }>('/api/events/slug-available', { params })
      .pipe(map((response) => response.available));
  }
}
