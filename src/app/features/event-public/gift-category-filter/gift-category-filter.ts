import { Component, input, output } from '@angular/core';
import { GIFT_CATEGORIES } from '../../../core/models/gift-category';
import { GiftCategory } from '../../../core/models/gift-category';

@Component({
  selector: 'app-gift-category-filter',
  templateUrl: './gift-category-filter.html',
  styleUrl: './gift-category-filter.scss',
})
export class GiftCategoryFilter {
  selectedCategory = input<GiftCategory | 'todos'>('todos');
  categoryChange = output<GiftCategory | 'todos'>();

  readonly categories = GIFT_CATEGORIES;

  select(category: GiftCategory | 'todos'): void {
    this.categoryChange.emit(category);
  }
}
