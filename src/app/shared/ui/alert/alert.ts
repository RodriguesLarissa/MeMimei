import { Component, input } from '@angular/core';

export type AlertVariant = 'success' | 'error' | 'info';

@Component({
  selector: 'ui-alert',
  templateUrl: './alert.html',
  styleUrl: './alert.scss',
})
export class UiAlert {
  variant = input<AlertVariant>('info');
}
