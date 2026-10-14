import { Component, input, output } from '@angular/core';
import { Gift } from '../../../../core/models/gift.model';
import { GIFT_CATEGORIES } from '../../../../core/models/gift-category';
import { UiBadge } from '../../../../shared/ui/badge/badge';
import { UiButton } from '../../../../shared/ui/button/button';

@Component({
  selector: 'app-gift-row',
  imports: [UiBadge, UiButton],
  templateUrl: './gift-row.html',
  styleUrl: './gift-row.scss',
})
export class GiftRow {
  gift = input.required<Gift>();
  isFirst = input(false);
  isLast = input(false);

  edit = output<void>();
  delete = output<void>();
  moveUp = output<void>();
  moveDown = output<void>();

  readonly categoryLabel = (categoryId: Gift['category']) =>
    GIFT_CATEGORIES.find((category) => category.id === categoryId)?.label ?? '';
}
