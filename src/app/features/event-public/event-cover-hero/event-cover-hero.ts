import { Component, computed, input } from '@angular/core';
import { GiftEvent } from '../../../core/models/event.model';

@Component({
  selector: 'app-event-cover-hero',
  templateUrl: './event-cover-hero.html',
  styleUrl: './event-cover-hero.scss',
})
export class EventCoverHero {
  event = input.required<GiftEvent>();

  readonly formattedDate = computed(() => {
    const date = this.event().eventDate;
    if (!date) {
      return null;
    }
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  });
}
