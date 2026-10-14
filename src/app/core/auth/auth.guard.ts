import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  while (authService.isLoadingSession()) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  if (authService.isConfigured() && authService.currentUser()) {
    return true;
  }

  return router.createUrlTree(['/entrar'], { queryParams: { returnUrl: state.url } });
};
