import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { UiButton } from '../../../shared/ui/button/button';
import { UiAlert } from '../../../shared/ui/alert/alert';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, UiButton, UiAlert],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isConfigured = this.authService.isConfigured();
  readonly showPassword = signal(false);
  readonly showEmailConfirmationNotice = this.route.snapshot.queryParamMap.get('aviso') === 'confirme-email';

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();
    const result = await this.authService.signIn(email, password);

    this.isSubmitting.set(false);

    if (result.success) {
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/painel';
      this.router.navigateByUrl(returnUrl);
    } else {
      this.errorMessage.set(result.errorMessage);
    }
  }
}
