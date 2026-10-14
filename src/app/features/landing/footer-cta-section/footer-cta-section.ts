import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiButton } from '../../../shared/ui/button/button';

@Component({
  selector: 'app-footer-cta-section',
  imports: [RouterLink, UiButton],
  templateUrl: './footer-cta-section.html',
  styleUrl: './footer-cta-section.scss',
})
export class FooterCtaSection {}
