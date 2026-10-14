import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { UiButton } from '../../../shared/ui/button/button';
import { UiAlert } from '../../../shared/ui/alert/alert';

@Component({
  selector: 'app-forgot-password-page',
  imports: [ReactiveFormsModule, RouterLink, UiButton, UiAlert],
  templateUrl: './forgot-password-page.html',
  styleUrl: './forgot-password-page.scss',
})
export class ForgotPasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly isConfigured = this.authService.isConfigured();

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { email } = this.form.getRawValue();
    const result = await this.authService.resetPassword(email);

    this.isSubmitting.set(false);

    if (result.success) {
      this.successMessage.set('Se esse e-mail estiver cadastrado, você receberá um link para redefinir sua senha.');
    } else {
      this.errorMessage.set(result.errorMessage);
    }
  }
}
