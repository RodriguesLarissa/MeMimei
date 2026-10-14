import { Injectable, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { SupabaseClientService } from '../supabase/supabase-client.service';

export interface AuthResult {
  success: boolean;
  errorMessage: string | null;
}

const NOT_CONFIGURED_MESSAGE =
  'O MeMimei ainda não está conectado a um banco de dados. Essa funcionalidade estará disponível em breve.';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<User | null>(null);
  readonly isLoadingSession = signal(true);

  constructor(private readonly supabase: SupabaseClientService) {
    if (this.supabase.isConfigured()) {
      this.supabase.client.auth.getSession().then(({ data }) => {
        this.currentUser.set(data.session?.user ?? null);
        this.isLoadingSession.set(false);
      });
      this.supabase.client.auth.onAuthStateChange((_event, session) => {
        this.currentUser.set(session?.user ?? null);
      });
    } else {
      this.isLoadingSession.set(false);
    }
  }

  isConfigured(): boolean {
    return this.supabase.isConfigured();
  }

  async signUp(email: string, password: string, displayName: string): Promise<AuthResult> {
    if (!this.supabase.isConfigured()) {
      return { success: false, errorMessage: NOT_CONFIGURED_MESSAGE };
    }
    const { error } = await this.supabase.client.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    return { success: !error, errorMessage: error ? translateAuthError(error.message) : null };
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    if (!this.supabase.isConfigured()) {
      return { success: false, errorMessage: NOT_CONFIGURED_MESSAGE };
    }
    const { error } = await this.supabase.client.auth.signInWithPassword({ email, password });
    return { success: !error, errorMessage: error ? translateAuthError(error.message) : null };
  }

  async signOut(): Promise<void> {
    if (this.supabase.isConfigured()) {
      await this.supabase.client.auth.signOut();
    }
  }

  async resetPassword(email: string): Promise<AuthResult> {
    if (!this.supabase.isConfigured()) {
      return { success: false, errorMessage: NOT_CONFIGURED_MESSAGE };
    }
    const { error } = await this.supabase.client.auth.resetPasswordForEmail(email);
    return { success: !error, errorMessage: error ? translateAuthError(error.message) : null };
  }
}

function translateAuthError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (normalized.includes('already registered') || normalized.includes('already been registered')) {
    return 'Este e-mail já está cadastrado.';
  }
  if (normalized.includes('password should be at least')) {
    return 'A senha precisa ter pelo menos 6 caracteres.';
  }
  return 'Não foi possível concluir a ação. Tente novamente em instantes.';
}
