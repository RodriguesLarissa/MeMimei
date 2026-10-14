import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { EventRepositoryService } from '../../../core/services/event-repository.service';
import { GiftEvent } from '../../../core/models/event.model';
import { Gift } from '../../../core/models/gift.model';
import { GiftCategory } from '../../../core/models/gift-category';
import { UiLoadingSpinner } from '../../../shared/ui/loading-spinner/loading-spinner';
import { UiEmptyState } from '../../../shared/ui/empty-state/empty-state';
import { UiButton } from '../../../shared/ui/button/button';
import { EventCoverHero } from '../event-cover-hero/event-cover-hero';
import { EventPhotoGallery } from '../event-photo-gallery/event-photo-gallery';
import { GiftCategoryFilter } from '../gift-category-filter/gift-category-filter';
import { GiftGrid } from '../gift-grid/gift-grid';
import { FreeContributionCard } from '../free-contribution-card/free-contribution-card';
import { ShareWhatsappButton } from '../share-whatsapp-button/share-whatsapp-button';
import { GiftDetailDialog } from '../gift-detail-dialog/gift-detail-dialog';

interface EventPageData {
  event: GiftEvent | undefined;
  gifts: Gift[];
}

@Component({
  selector: 'app-event-public-page',
  imports: [
    RouterLink,
    UiLoadingSpinner,
    UiEmptyState,
    UiButton,
    EventCoverHero,
    EventPhotoGallery,
    GiftCategoryFilter,
    GiftGrid,
    FreeContributionCard,
    ShareWhatsappButton,
    GiftDetailDialog,
  ],
  templateUrl: './event-public-page.html',
  styleUrl: './event-public-page.scss',
})
export class EventPublicPage {
  private readonly route = inject(ActivatedRoute);
  private readonly eventRepository = inject(EventRepositoryService);

  readonly loading = signal(true);
  readonly selectedCategory = signal<GiftCategory | 'todos'>('todos');
  readonly selectedGift = signal<Gift | null>(null);

  private readonly data$ = this.route.paramMap.pipe(
    tap(() => this.loading.set(true)),
    switchMap((params) => this.eventRepository.getEventBySlug(params.get('slug') ?? '')),
    tap(() => this.loading.set(false)),
  );

  private readonly data = toSignal(this.data$, { initialValue: { event: undefined, gifts: [] } as EventPageData });

  readonly event = computed(() => this.data().event);
  readonly gifts = computed(() => this.data().gifts);

  readonly filteredGifts = computed(() => {
    const category = this.selectedCategory();
    const allGifts = this.gifts();
    return category === 'todos' ? allGifts : allGifts.filter((gift) => gift.category === category);
  });

  onCategoryChange(category: GiftCategory | 'todos'): void {
    this.selectedCategory.set(category);
  }

  onGiftSelected(gift: Gift): void {
    this.selectedGift.set(gift);
  }

  closeDialog(): void {
    this.selectedGift.set(null);
  }
}
