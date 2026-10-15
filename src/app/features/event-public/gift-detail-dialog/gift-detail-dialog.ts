import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Gift } from '../../../core/models/gift.model';
import { ContributionService } from '../../../core/services/contribution.service';
import { UiButton } from '../../../shared/ui/button/button';
import { UiAlert } from '../../../shared/ui/alert/alert';

type Step = 'form' | 'summary' | 'payment' | 'success';

@Component({
  selector: 'app-gift-detail-dialog',
  imports: [ReactiveFormsModule, UiButton, UiAlert],
  templateUrl: './gift-detail-dialog.html',
  styleUrl: './gift-detail-dialog.scss',
})
export class GiftDetailDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly contributionService = inject(ContributionService);

  gift = input.required<Gift>();
  eventId = input.required<string>();
  close = output<void>();

  readonly step = signal<Step>('form');
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly qrCodeBase64 = signal<string | null>(null);
  readonly qrCodeText = signal<string | null>(null);
  readonly copied = signal(false);

  readonly form: FormGroup<{
    amount: FormControl<number | null>;
    guestName: FormControl<string>;
    guestMessage: FormControl<string>;
  }> = this.fb.group({
    amount: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    guestName: this.fb.nonNullable.control(''),
    guestMessage: this.fb.nonNullable.control(''),
  });

  ngOnInit(): void {
    this.form.controls.amount.setValue(this.gift().suggestedAmount);
  }

  goToSummary(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.step.set('summary');
  }

  backToForm(): void {
    this.step.set('form');
  }

  async confirmAndPay(): Promise<void> {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { amount, guestName, guestMessage } = this.form.getRawValue();
    const gift = this.gift();

    try {
      const result = await firstValueFrom(
        this.contributionService.create({
          eventId: this.eventId(),
          giftId: gift.id === 'free-contribution' ? null : gift.id,
          amount: amount!,
          guestName: guestName.trim() || null,
          guestMessage: guestMessage.trim() || null,
        }),
      );

      this.qrCodeBase64.set(result.qrCodeBase64);
      this.qrCodeText.set(result.qrCodeText);
      this.step.set('payment');
    } catch (error) {
      const message =
        error instanceof HttpErrorResponse && typeof error.error?.error === 'string'
          ? error.error.error
          : 'Não foi possível gerar o Pix. Tente novamente.';
      this.errorMessage.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async copyPixCode(): Promise<void> {
    const text = this.qrCodeText();
    if (!text) return;
    await navigator.clipboard.writeText(text);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  finish(): void {
    this.step.set('success');
  }
}
