import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SupabaseClientService } from '../supabase/supabase-client.service';

/** Impede quem já está logado de ver as telas de entrar/cadastro/recuperar senha — manda direto para o painel. */
export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const supabase = inject(SupabaseClientService);
  const router = inject(Router);

  if (!supabase.isConfigured()) {
    return true;
  }

  while (authService.isLoadingSession()) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  if (authService.currentUser()) {
    return router.createUrlTree(['/painel']);
  }

  return true;
};
