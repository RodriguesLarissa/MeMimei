import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, firstValueFrom, of } from 'rxjs';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
}

export interface AuthResult {
  success: boolean;
  errorMessage: string | null;
}

interface MeResponse {
  configured: boolean;
  user: AuthUser | null;
}

const GENERIC_ERROR = 'Não foi possível concluir a ação. Tente novamente em instantes.';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly currentUser = signal<AuthUser | null>(null);
  readonly isLoadingSession = signal(true);
  private configured = false;

  constructor() {
    if (this.isBrowser) {
      this.refreshSession();
    } else {
      // No servidor (SSR/prerender) não há como resolver uma URL relativa de API sem
      // uma origem; o estado real de sessão só é carregado depois, no navegador.
      this.isLoadingSession.set(false);
    }
  }

  isConfigured(): boolean {
    return this.configured;
  }

  private async refreshSession(): Promise<void> {
    const response = await firstValueFrom(
      this.http.get<MeResponse>('/api/auth/me').pipe(catchError(() => of<MeResponse>({ configured: false, user: null }))),
    );
    this.configured = response.configured;
    this.currentUser.set(response.user);
    this.isLoadingSession.set(false);
  }

  async signUp(email: string, password: string, displayName: string): Promise<AuthResult> {
    return this.postAuth('/api/auth/signup', { email, password, displayName });
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    const result = await this.postAuth('/api/auth/login', { email, password });
    if (result.success) {
      await this.refreshSession();
    }
    return result;
  }

  async signOut(): Promise<void> {
    await firstValueFrom(this.http.post('/api/auth/logout', {}).pipe(catchError(() => of(null))));
    this.currentUser.set(null);
  }

  async resetPassword(email: string): Promise<AuthResult> {
    return this.postAuth('/api/auth/reset-password', { email });
  }

  private async postAuth(url: string, body: unknown): Promise<AuthResult> {
    try {
      await firstValueFrom(this.http.post(url, body));
      return { success: true, errorMessage: null };
    } catch (error) {
      const message =
        error instanceof HttpErrorResponse && typeof error.error?.error === 'string'
          ? (error.error.error as string)
          : GENERIC_ERROR;
      return { success: false, errorMessage: message };
    }
  }
}
