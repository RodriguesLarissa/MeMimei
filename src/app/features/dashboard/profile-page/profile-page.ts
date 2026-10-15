import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProfileService } from '../../../core/services/profile.service';
import { PixKeyType } from '../../../core/models/profile.model';
import { UiButton } from '../../../shared/ui/button/button';
import { UiCard } from '../../../shared/ui/card/card';
import { UiAlert } from '../../../shared/ui/alert/alert';
import { UiLoadingSpinner } from '../../../shared/ui/loading-spinner/loading-spinner';

@Component({
  selector: 'app-profile-page',
  imports: [ReactiveFormsModule, RouterLink, UiButton, UiCard, UiAlert, UiLoadingSpinner],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePage {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);

  readonly loading = signal(true);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly pixKeyTypes: { id: PixKeyType; label: string }[] = [
    { id: 'cpf', label: 'CPF' },
    { id: 'cnpj', label: 'CNPJ' },
    { id: 'telefone', label: 'Telefone' },
    { id: 'email', label: 'E-mail' },
    { id: 'aleatoria', label: 'Chave aleatória' },
  ];

  readonly form = this.fb.nonNullable.group({
    displayName: ['', Validators.required],
    pixKeyType: ['' as PixKeyType | '', Validators.required],
    pixKey: ['', Validators.required],
    pixCity: ['', [Validators.required, Validators.maxLength(15)]],
  });

  constructor() {
    this.loadProfile();
  }

  private async loadProfile(): Promise<void> {
    try {
      const profile = await firstValueFrom(this.profileService.get());
      this.form.setValue({
        displayName: profile.displayName,
        pixKeyType: profile.pixKeyType,
        pixKey: profile.pixKey,
        pixCity: profile.pixCity,
      });
    } catch {
      this.errorMessage.set('Não foi possível carregar seu perfil.');
    } finally {
      this.loading.set(false);
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      await firstValueFrom(this.profileService.update(this.form.getRawValue()));
      this.successMessage.set('Chave Pix salva com sucesso!');
    } catch (error) {
      const message =
        error instanceof HttpErrorResponse && typeof error.error?.error === 'string'
          ? error.error.error
          : 'Não foi possível salvar. Tente novamente.';
      this.errorMessage.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
