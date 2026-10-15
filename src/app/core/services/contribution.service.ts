import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contribution, CreateContributionInput, CreateContributionResult } from '../models/contribution.model';

@Injectable({ providedIn: 'root' })
export class ContributionService {
  private readonly http = inject(HttpClient);

  create(input: CreateContributionInput): Observable<CreateContributionResult> {
    return this.http.post<CreateContributionResult>('/api/public/contributions', input);
  }

  listByEvent(eventId: string): Observable<Contribution[]> {
    return this.http.get<Contribution[]>(`/api/events/${eventId}/contributions`);
  }
}
