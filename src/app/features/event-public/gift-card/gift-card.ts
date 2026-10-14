import { Component, input, output } from '@angular/core';
import { Gift } from '../../../core/models/gift.model';
import { GIFT_CATEGORIES } from '../../../core/models/gift-category';
import { UiCard } from '../../../shared/ui/card/card';
import { UiBadge } from '../../../shared/ui/badge/badge';
import { UiButton } from '../../../shared/ui/button/button';

@Component({
  selector: 'app-gift-card',
  imports: [UiCard, UiBadge, UiButton],
  templateUrl: './gift-card.html',
  styleUrl: './gift-card.scss',
})
export class GiftCard {
  gift = input.required<Gift>();
  selected = output<Gift>();

  readonly categoryLabel = (categoryId: Gift['category']) =>
    GIFT_CATEGORIES.find((category) => category.id === categoryId)?.label ?? '';

  choose(): void {
    this.selected.emit(this.gift());
  }
}
