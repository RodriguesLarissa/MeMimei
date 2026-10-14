import { Component, computed, inject, input, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GiftEvent } from '../../../core/models/event.model';

@Component({
  selector: 'app-share-whatsapp-button',
  templateUrl: './share-whatsapp-button.html',
  styleUrl: './share-whatsapp-button.scss',
})
export class ShareWhatsappButton {
  event = input.required<GiftEvent>();

  private readonly platformId = inject(PLATFORM_ID);

  readonly shareUrl = computed(() => {
    const path = `/e/${this.event().slug}`;
    if (isPlatformBrowser(this.platformId)) {
      return `${window.location.origin}${path}`;
    }
    return path;
  });

  readonly whatsappHref = computed(() => {
    const message = `Oi! Dá uma olhada na lista de presentes do ${this.event().name}: ${this.shareUrl()}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  });
}
