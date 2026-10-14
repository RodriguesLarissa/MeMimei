import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EventService } from '../../../core/services/event.service';
import { GiftService } from '../../../core/services/gift.service';
import { OCCASION_TYPES, OccasionType } from '../../../core/models/event.model';
import { GIFT_CATEGORIES } from '../../../core/models/gift-category';
import { DEMO_EVENT_SLUG } from '../../../core/services/mock-event.service';
import { Gift } from '../../../core/models/gift.model';
import { slugify } from '../../../core/utils/slugify';
import { UiButton } from '../../../shared/ui/button/button';
import { UiCard } from '../../../shared/ui/card/card';
import { UiAlert } from '../../../shared/ui/alert/alert';
import { UiLoadingSpinner } from '../../../shared/ui/loading-spinner/loading-spinner';
import { UiEmptyState } from '../../../shared/ui/empty-state/empty-state';
import { GiftRow } from '../components/gift-row/gift-row';
import { ImageUpload } from '../../../shared/ui/image-upload/image-upload';
import { GalleryUpload } from '../../../shared/ui/gallery-upload/gallery-upload';

@Component({
  selector: 'app-event-form-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    UiButton,
    UiCard,
    UiAlert,
    UiLoadingSpinner,
    UiEmptyState,
    GiftRow,
    ImageUpload,
    GalleryUpload,
  ],
  templateUrl: './event-form-page.html',
  styleUrl: './event-form-page.scss',
})
export class EventFormPage {
  private readonly fb = inject(FormBuilder);
  private readonly eventService = inject(EventService);
  private readonly giftService = inject(GiftService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly occasionTypes = OCCASION_TYPES;
  readonly giftCategories = GIFT_CATEGORIES;

  readonly eventId = signal<string | null>(this.route.snapshot.paramMap.get('id'));
  readonly isEditMode = () => this.eventId() !== null;

  readonly loading = signal(this.isEditMode());
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly coverImageUrl = signal('');
  readonly galleryImageUrls = signal<string[]>([]);

  readonly gifts = signal<Gift[]>([]);
  readonly loadingGifts = signal(false);
  readonly editingGift = signal<Gift | null>(null);
  readonly showGiftForm = signal(false);
  readonly giftImageUrl = signal('');

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    occasionType: ['cha-de-casa-nova', Validators.required],
    hostNames: ['', Validators.required],
    eventDate: [''],
    welcomeMessage: ['', Validators.required],
    themeColor: ['#C96A4B'],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
    isPublished: [false],
  });

  readonly giftForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    suggestedAmount: [''],
    category: ['livre' as Gift['category'], Validators.required],
    allowsFreeContribution: [true],
    isPublished: [true],
  });

  constructor() {
    this.form.controls.name.valueChanges.subscribe((name) => {
      if (!this.isEditMode() && !this.form.controls.slug.dirty) {
        this.form.controls.slug.setValue(slugify(name), { emitEvent: false });
      }
    });

    const id = this.eventId();
    if (id) {
      this.loadEvent(id);
      this.loadGifts(id);
    }
  }

  private async loadEvent(id: string): Promise<void> {
    const event = await firstValueFrom(this.eventService.getById(id));
    this.loading.set(false);

    if (!event) {
      this.errorMessage.set('Evento não encontrado.');
      return;
    }

    this.coverImageUrl.set(event.coverImageUrl);
    this.galleryImageUrls.set(event.galleryImageUrls);

    this.form.setValue({
      name: event.name,
      occasionType: event.occasionType,
      hostNames: event.hostNames,
      eventDate: event.eventDate ?? '',
      welcomeMessage: event.welcomeMessage,
      themeColor: event.themeColor || '#C96A4B',
      slug: event.slug,
      isPublished: event.isPublished,
    });
  }

  private async loadGifts(eventId: string): Promise<void> {
    this.loadingGifts.set(true);
    try {
      const gifts = await firstValueFrom(this.giftService.listByEvent(eventId));
      this.gifts.set(gifts);
    } finally {
      this.loadingGifts.set(false);
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const raw = this.form.getRawValue();
    const input = {
      name: raw.name,
      occasionType: raw.occasionType as OccasionType,
      hostNames: raw.hostNames,
      eventDate: raw.eventDate || null,
      welcomeMessage: raw.welcomeMessage,
      coverImageUrl: this.coverImageUrl(),
      galleryImageUrls: this.galleryImageUrls(),
      themeColor: raw.themeColor,
      slug: raw.slug,
      isPublished: raw.isPublished,
    };

    try {
      if (raw.slug === DEMO_EVENT_SLUG) {
        this.errorMessage.set('Esse link é reservado para o exemplo do MeMimei. Escolha outro.');
        this.isSubmitting.set(false);
        return;
      }

      const available = await firstValueFrom(this.eventService.isSlugAvailable(raw.slug, this.eventId() ?? undefined));
      if (!available) {
        this.errorMessage.set('Esse link já está em uso. Escolha outro.');
        this.isSubmitting.set(false);
        return;
      }

      if (this.isEditMode()) {
        await firstValueFrom(this.eventService.update(this.eventId()!, input));
        this.successMessage.set('Evento atualizado com sucesso!');
      } else {
        const created = await firstValueFrom(this.eventService.create(input));
        this.router.navigate(['/e', created.slug]);
        return;
      }
    } catch {
      this.errorMessage.set('Não foi possível salvar o evento. Tente novamente.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  openNewGiftForm(): void {
    this.editingGift.set(null);
    this.giftImageUrl.set('');
    this.giftForm.reset({
      name: '',
      description: '',
      suggestedAmount: '',
      category: 'livre',
      allowsFreeContribution: true,
      isPublished: true,
    });
    this.showGiftForm.set(true);
  }

  openEditGiftForm(gift: Gift): void {
    this.editingGift.set(gift);
    this.giftImageUrl.set(gift.imageUrl);
    this.giftForm.setValue({
      name: gift.name,
      description: gift.description,
      suggestedAmount: gift.suggestedAmount === null ? '' : String(gift.suggestedAmount),
      category: gift.category,
      allowsFreeContribution: gift.allowsFreeContribution,
      isPublished: gift.isPublished,
    });
    this.showGiftForm.set(true);
  }

  cancelGiftForm(): void {
    this.showGiftForm.set(false);
    this.editingGift.set(null);
  }

  async submitGift(): Promise<void> {
    if (this.giftForm.invalid) {
      this.giftForm.markAllAsTouched();
      return;
    }

    const eventId = this.eventId();
    if (!eventId) return;

    const raw = this.giftForm.getRawValue();
    const input = {
      name: raw.name,
      description: raw.description,
      imageUrl: this.giftImageUrl(),
      suggestedAmount: raw.suggestedAmount.trim() === '' ? null : Number(raw.suggestedAmount),
      category: raw.category,
      isPublished: raw.isPublished,
      allowsFreeContribution: raw.allowsFreeContribution,
    };

    const editing = this.editingGift();
    if (editing) {
      const sortOrder = this.gifts().findIndex((g) => g.id === editing.id);
      await firstValueFrom(this.giftService.update(editing.id, eventId, input, sortOrder));
    } else {
      await firstValueFrom(this.giftService.create(eventId, input, this.gifts().length));
    }

    this.showGiftForm.set(false);
    this.editingGift.set(null);
    await this.loadGifts(eventId);
  }

  async deleteGift(gift: Gift): Promise<void> {
    await firstValueFrom(this.giftService.delete(gift.id));
    this.gifts.set(this.gifts().filter((g) => g.id !== gift.id));
  }

  async moveGift(gift: Gift, direction: -1 | 1): Promise<void> {
    const eventId = this.eventId();
    if (!eventId) return;

    const list = [...this.gifts()];
    const index = list.findIndex((g) => g.id === gift.id);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    [list[index], list[targetIndex]] = [list[targetIndex], list[index]];
    this.gifts.set(list);

    await Promise.all([
      firstValueFrom(this.giftService.updateSortOrder(list[index].id, index)),
      firstValueFrom(this.giftService.updateSortOrder(list[targetIndex].id, targetIndex)),
    ]);
  }
}
