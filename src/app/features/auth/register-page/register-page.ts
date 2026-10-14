import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { UiButton } from '../../../shared/ui/button/button';
import { UiAlert } from '../../../shared/ui/alert/alert';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, UiButton, UiAlert],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly isConfigured = this.authService.isConfigured();

  readonly form = this.fb.nonNullable.group(
    {
      displayName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator },
  );

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const { displayName, email, password } = this.form.getRawValue();
    const result = await this.authService.signUp(email, password, displayName);

    this.isSubmitting.set(false);

    if (result.success) {
      this.successMessage.set('Conta criada! Verifique seu e-mail para confirmar o cadastro antes de entrar.');
      this.form.reset();
    } else {
      this.errorMessage.set(result.errorMessage);
    }
  }
}
