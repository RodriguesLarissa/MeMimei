import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

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
    path: 'entrar',
    title: 'MeMimei — Entrar',
    loadComponent: () => import('./features/auth/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'cadastro',
    title: 'MeMimei — Criar conta',
    loadComponent: () => import('./features/auth/register-page/register-page').then((m) => m.RegisterPage),
  },
  {
    path: 'recuperar-senha',
    title: 'MeMimei — Recuperar senha',
    loadComponent: () =>
      import('./features/auth/forgot-password-page/forgot-password-page').then((m) => m.ForgotPasswordPage),
  },
  {
    path: 'painel',
    title: 'MeMimei — Painel do anfitrião',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
  },
  {
    path: 'painel/eventos/novo',
    title: 'MeMimei — Criar evento',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/event-form-page/event-form-page').then((m) => m.EventFormPage),
  },
  {
    path: 'painel/eventos/:id',
    title: 'MeMimei — Editar evento',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/event-form-page/event-form-page').then((m) => m.EventFormPage),
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
