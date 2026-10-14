import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Contribution,
  ContributionStatus,
  CreateContributionInput,
  CreateContributionResult,
} from '../models/contribution.model';

@Injectable({ providedIn: 'root' })
export class ContributionService {
  private readonly http = inject(HttpClient);

  create(input: CreateContributionInput): Observable<CreateContributionResult> {
    return this.http.post<CreateContributionResult>('/api/public/contributions', input);
  }

  getStatus(contributionId: string): Observable<{ status: ContributionStatus }> {
    return this.http.get<{ status: ContributionStatus }>(`/api/public/contributions/${contributionId}/status`);
  }

  listByEvent(eventId: string): Observable<Contribution[]> {
    return this.http.get<Contribution[]>(`/api/events/${eventId}/contributions`);
  }
}
