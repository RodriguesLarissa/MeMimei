import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-loading-spinner',
  templateUrl: './loading-spinner.html',
  styleUrl: './loading-spinner.scss',
})
export class UiLoadingSpinner {
  label = input('Carregando...');
}
