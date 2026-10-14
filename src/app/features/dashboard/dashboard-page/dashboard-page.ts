import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/auth/auth.service';
import { GiftEvent } from '../../../core/models/event.model';
import { UiButton } from '../../../shared/ui/button/button';
import { UiCard } from '../../../shared/ui/card/card';
import { UiBadge } from '../../../shared/ui/badge/badge';
import { UiEmptyState } from '../../../shared/ui/empty-state/empty-state';
import { UiLoadingSpinner } from '../../../shared/ui/loading-spinner/loading-spinner';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink, UiButton, UiCard, UiBadge, UiEmptyState, UiLoadingSpinner],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  private readonly eventService = inject(EventService);
  readonly authService = inject(AuthService);

  readonly loading = signal(true);
  readonly copiedEventId = signal<string | null>(null);

  readonly events = toSignal(
    this.eventService.listMyEvents().pipe(
      tap(() => this.loading.set(false)),
      catchError(() => {
        this.loading.set(false);
        return of<GiftEvent[]>([]);
      }),
    ),
    { initialValue: [] as GiftEvent[] },
  );

  copyPublicLink(event: GiftEvent): void {
    const url = `${window.location.origin}/e/${event.slug}`;
    navigator.clipboard.writeText(url);
    this.copiedEventId.set(event.id);
    setTimeout(() => this.copiedEventId.set(null), 2000);
  }
}
