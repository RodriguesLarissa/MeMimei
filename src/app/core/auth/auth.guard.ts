import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SupabaseClientService } from '../supabase/supabase-client.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const supabase = inject(SupabaseClientService);
  const router = inject(Router);

  if (!supabase.isConfigured()) {
    return router.createUrlTree(['/entrar'], { queryParams: { returnUrl: state.url } });
  }

  while (authService.isLoadingSession()) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  if (authService.currentUser()) {
    return true;
  }

  return router.createUrlTree(['/entrar'], { queryParams: { returnUrl: state.url } });
};
