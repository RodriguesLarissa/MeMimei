import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'MeMimei — Listas de presentes virtuais para ocasiões especiais',
    loadComponent: () => import('./features/landing/landing-page/landing-page').then((m) => m.LandingPage),
  },
  {
    path: 'e/:slug',
    title: 'MeMimei — Lista de presentes',
    loadComponent: () =>
      import('./features/event-public/event-public-page/event-public-page').then((m) => m.EventPublicPage),
  },
  {
    path: 'termos',
    title: 'MeMimei — Termos de uso',
    loadComponent: () => import('./features/legal/terms-page/terms-page').then((m) => m.TermsPage),
  },
  {
    path: 'privacidade',
    title: 'MeMimei — Política de privacidade',
    loadComponent: () => import('./features/legal/privacy-page/privacy-page').then((m) => m.PrivacyPage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
