import { Component, input, output } from '@angular/core';
import { Gift } from '../../../core/models/gift.model';
import { UiButton } from '../../../shared/ui/button/button';

@Component({
  selector: 'app-gift-detail-dialog',
  imports: [UiButton],
  templateUrl: './gift-detail-dialog.html',
  styleUrl: './gift-detail-dialog.scss',
})
export class GiftDetailDialog {
  gift = input.required<Gift>();
  close = output<void>();
}
