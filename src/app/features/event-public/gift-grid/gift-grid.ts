import { Component, input, output } from '@angular/core';
import { Gift } from '../../../core/models/gift.model';
import { GiftCard } from '../gift-card/gift-card';

@Component({
  selector: 'app-gift-grid',
  imports: [GiftCard],
  templateUrl: './gift-grid.html',
  styleUrl: './gift-grid.scss',
})
export class GiftGrid {
  gifts = input.required<Gift[]>();
  giftSelected = output<Gift>();
}
