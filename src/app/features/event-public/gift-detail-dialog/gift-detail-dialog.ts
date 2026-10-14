import { Component, DestroyRef, OnInit, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, interval, Subscription } from 'rxjs';
import { Gift } from '../../../core/models/gift.model';
import { ContributionService } from '../../../core/services/contribution.service';
import { UiButton } from '../../../shared/ui/button/button';
import { UiAlert } from '../../../shared/ui/alert/alert';

type Step = 'form' | 'summary' | 'payment' | 'success' | 'failed';

const POLL_INTERVAL_MS = 4000;

@Component({
  selector: 'app-gift-detail-dialog',
  imports: [ReactiveFormsModule, UiButton, UiAlert],
  templateUrl: './gift-detail-dialog.html',
  styleUrl: './gift-detail-dialog.scss',
})
export class GiftDetailDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly contributionService = inject(ContributionService);
  private readonly destroyRef = inject(DestroyRef);

  gift = input.required<Gift>();
  eventId = input.required<string>();
  close = output<void>();

  readonly step = signal<Step>('form');
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly qrCodeBase64 = signal<string | null>(null);
  readonly qrCodeText = signal<string | null>(null);
  readonly copied = signal(false);

  private pollingSubscription: Subscription | null = null;

  readonly form: FormGroup<{
    amount: FormControl<number | null>;
    guestName: FormControl<string>;
    guestMessage: FormControl<string>;
  }> = this.fb.group({
    amount: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    guestName: this.fb.nonNullable.control(''),
    guestMessage: this.fb.nonNullable.control(''),
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.pollingSubscription?.unsubscribe());
  }

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
      this.startPolling(result.contributionId);
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

  private startPolling(contributionId: string): void {
    this.pollingSubscription = interval(POLL_INTERVAL_MS).subscribe(async () => {
      try {
        const { status } = await firstValueFrom(this.contributionService.getStatus(contributionId));
        if (status === 'confirmed') {
          this.pollingSubscription?.unsubscribe();
          this.step.set('success');
        } else if (status === 'cancelled' || status === 'expired') {
          this.pollingSubscription?.unsubscribe();
          this.step.set('failed');
        }
      } catch {
        // tenta de novo no próximo ciclo
      }
    });
  }

  async copyPixCode(): Promise<void> {
    const text = this.qrCodeText();
    if (!text) return;
    await navigator.clipboard.writeText(text);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  tryAgain(): void {
    this.step.set('form');
    this.errorMessage.set(null);
  }
}
