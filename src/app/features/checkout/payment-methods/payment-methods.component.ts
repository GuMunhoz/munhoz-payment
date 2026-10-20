import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  InstallmentOption,
  PaymentCardDetails,
  PaymentMethod,
  PaymentSubmitPayload,
  Product
} from '../../../core/models/payment.models';
import { PaymentStateService } from '../../../core/services/payment-state/payment-state.service';
import { CardMaskDirective } from '../../../shared/directives/card-mask.directive';
import { detectCardBrand, generateInstallments } from '../../../shared/utils/payment.utils';
import { CardValidators } from '../../../shared/validators/card.validators';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardMaskDirective],
  templateUrl: './payment-methods.component.html',
  styleUrl: './payment-methods.component.css'
})
export class PaymentMethodsComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly paymentState = inject(PaymentStateService);

  @Input() product: Product | null = null;
  @Output() readonly paymentSubmit = new EventEmitter<PaymentSubmitPayload>();

  readonly selectedMethod = signal<PaymentMethod>('credit');
  readonly pixCopied = signal(false);
  readonly installmentsList = signal<InstallmentOption[]>([]);

  readonly simulatedPixCode =
    '00020126580014br.gov.bcb.pix0136a8e72c44-77bf-4f8e-bf63-mock991823520400005303986540579.905802BR5916Nexo Tecnologia6009Sao Paulo62070503***6304E8A2';

  cardForm!: FormGroup;

  ngOnInit(): void {
    this.buildForm();
    if (this.product?.price) {
      this.installmentsList.set(generateInstallments(this.product.price));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product?.price) {
      this.installmentsList.set(generateInstallments(this.product.price));
    }
  }

  private buildForm(): void {
    if (this.paymentState.method()) {
      this.selectedMethod.set(this.paymentState.method());
    }

    const savedCard = this.paymentState.getCardData(this.selectedMethod());

    this.cardForm = this.fb.group({
      number: [savedCard?.number || '', [Validators.required, CardValidators.luhn()]],
      holderName: [savedCard?.holderName || '', [Validators.required, CardValidators.cardHolder()]],
      expiration: [savedCard?.expiration || '', [Validators.required, CardValidators.expiration()]],
      cvv: ['', [Validators.required, CardValidators.cvv()]],
      installments: [savedCard?.installments || 1],
      saveCard: [savedCard?.saveCard ?? true]
    });

    this.cardForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        if (this.selectedMethod() !== 'pix') {
          this.paymentState.setCardData(
            {
              number: val.number || '',
              holderName: val.holderName || '',
              expiration: val.expiration || '',
              installments: val.installments || 1,
              saveCard: val.saveCard ?? true
            },
            this.selectedMethod()
          );
        }
      });
  }

  selectMethod(method: PaymentMethod): void {
    if (this.selectedMethod() !== 'pix' && this.cardForm) {
      const current = this.cardForm.value;
      this.paymentState.setCardData(
        {
          number: current.number || '',
          holderName: current.holderName || '',
          expiration: current.expiration || '',
          installments: current.installments || 1,
          saveCard: current.saveCard ?? true
        },
        this.selectedMethod()
      );
    }

    this.selectedMethod.set(method);
    this.paymentState.setMethod(method);

    if (method !== 'pix') {
      const savedCard = this.paymentState.getCardData(method);
      this.cardForm.reset(
        {
          number: savedCard?.number || '',
          holderName: savedCard?.holderName || '',
          expiration: savedCard?.expiration || '',
          cvv: '',
          installments: savedCard?.installments || 1,
          saveCard: savedCard?.saveCard ?? true
        },
        { emitEvent: false }
      );
    }
  }

  async copyPixCode(): Promise<void> {
    await navigator.clipboard.writeText(this.simulatedPixCode);
    this.pixCopied.set(true);
    setTimeout(() => this.pixCopied.set(false), 3000);
  }

  onSubmit(): void {
    if (this.selectedMethod() !== 'pix') {
      if (this.cardForm.invalid) {
        this.cardForm.markAllAsTouched();
        return;
      }
    }

    const cardValues: PaymentCardDetails | undefined =
      this.selectedMethod() !== 'pix'
        ? {
            number: this.cardForm.value.number,
            holderName: this.cardForm.value.holderName,
            expiration: this.cardForm.value.expiration,
            cvv: this.cardForm.value.cvv,
            installments: this.cardForm.value.installments || 1,
            saveCard: this.cardForm.value.saveCard
          }
        : undefined;

    if (cardValues) {
      this.paymentState.setCardData(cardValues);
    }

    this.paymentSubmit.emit({
      method: this.selectedMethod(),
      card: cardValues,
      pixCode: this.selectedMethod() === 'pix' ? this.simulatedPixCode : undefined
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.cardForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  get hasTouchedErrors(): boolean {
    if (!this.cardForm || this.cardForm.valid) {
      return false;
    }
    const controls = ['number', 'holderName', 'expiration', 'cvv'];
    return controls.some((ctrlName) => this.isFieldInvalid(ctrlName));
  }

  get detectedBrand(): string | null {
    return detectCardBrand(this.cardForm?.get('number')?.value);
  }
}
