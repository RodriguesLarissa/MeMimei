import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-empty-state',
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export class UiEmptyState {
  icon = input('🎁');
  title = input.required<string>();
  description = input('');
}
