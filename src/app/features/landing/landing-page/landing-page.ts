import { Component } from '@angular/core';
import { HeroSection } from '../hero-section/hero-section';
import { HowItWorksSection } from '../how-it-works-section/how-it-works-section';
import { OccasionsSection } from '../occasions-section/occasions-section';
import { DemoPreviewSection } from '../demo-preview-section/demo-preview-section';
import { BenefitsSection } from '../benefits-section/benefits-section';
import { FaqSection } from '../faq-section/faq-section';
import { FooterCtaSection } from '../footer-cta-section/footer-cta-section';

@Component({
  selector: 'app-landing-page',
  imports: [
    HeroSection,
    HowItWorksSection,
    OccasionsSection,
    DemoPreviewSection,
    BenefitsSection,
    FaqSection,
    FooterCtaSection,
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage {}
