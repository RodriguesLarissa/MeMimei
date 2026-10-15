import { Directive, ElementRef, HostListener, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** Formata o campo como dinheiro (R$ 1.234,56) enquanto expõe um número (ou null) ao FormControl. */
@Directive({
  selector: 'input[appMoneyMask]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MoneyMaskDirective),
      multi: true,
    },
  ],
})
export class MoneyMaskDirective implements ControlValueAccessor {
  private readonly element = inject(ElementRef<HTMLInputElement>);
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  @HostListener('input', ['$event'])
  handleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const digits = value.replace(/\D/g, '');

    if (!digits) {
      this.element.nativeElement.value = '';
      this.onChange(null);
      return;
    }

    const amount = Number(digits) / 100;
    this.element.nativeElement.value = this.format(amount);
    this.onChange(amount);
  }

  @HostListener('blur')
  handleBlur(): void {
    this.onTouched();
  }

  writeValue(value: number | null): void {
    this.element.nativeElement.value = value === null || value === undefined ? '' : this.format(value);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.element.nativeElement.disabled = isDisabled;
  }

  private format(amount: number): string {
    return `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
