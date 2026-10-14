import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';
import { ContributionService } from '../../../core/services/contribution.service';
import { Contribution } from '../../../core/models/contribution.model';
import { UiCard } from '../../../shared/ui/card/card';
import { UiBadge } from '../../../shared/ui/badge/badge';
import { UiEmptyState } from '../../../shared/ui/empty-state/empty-state';
import { UiLoadingSpinner } from '../../../shared/ui/loading-spinner/loading-spinner';

@Component({
  selector: 'app-contributions-page',
  imports: [RouterLink, UiCard, UiBadge, UiEmptyState, UiLoadingSpinner],
  templateUrl: './contributions-page.html',
  styleUrl: './contributions-page.scss',
})
export class ContributionsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly contributionService = inject(ContributionService);

  readonly eventId = this.route.snapshot.paramMap.get('id')!;
  readonly loading = signal(true);

  readonly contributions = toSignal(
    this.contributionService.listByEvent(this.eventId).pipe(
      tap(() => this.loading.set(false)),
      catchError(() => {
        this.loading.set(false);
        return of<Contribution[]>([]);
      }),
    ),
    { initialValue: [] as Contribution[] },
  );

  readonly confirmed = computed(() => this.contributions().filter((c) => c.status === 'confirmed'));
  readonly pending = computed(() => this.contributions().filter((c) => c.status === 'pending'));
  readonly others = computed(() =>
    this.contributions().filter((c) => c.status === 'cancelled' || c.status === 'expired'),
  );

  readonly totalConfirmed = computed(() => this.confirmed().reduce((sum, c) => sum + c.amount, 0));
}
