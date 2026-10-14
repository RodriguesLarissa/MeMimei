import { Component, input } from '@angular/core';

export type BadgeTone = 'terracota' | 'sage' | 'neutral';

@Component({
  selector: 'ui-badge',
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
})
export class UiBadge {
  tone = input<BadgeTone>('neutral');
}
