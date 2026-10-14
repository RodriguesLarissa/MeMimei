import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'layout-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class LayoutFooter {
  readonly currentYear = new Date().getFullYear();
}
