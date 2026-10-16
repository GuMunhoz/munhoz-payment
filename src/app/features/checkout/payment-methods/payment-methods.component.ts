import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
  signal
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  PaymentCardDetails,
  PaymentMethod,
  Product
} from '../../../core/models/payment.models';
import { PaymentStateService } from '../../../core/services/payment-state/payment-state.service';
import { CardMaskDirective } from '../../../shared/directives/card-mask.directive';
import { CardValidators } from '../../../shared/validators/card.validators';

export interface PaymentSubmitPayload {
  method: PaymentMethod;
  card?: PaymentCardDetails;
  pixCode?: string;
}

export interface InstallmentOption {
  count: number;
  label: string;
  amount: number;
}

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardMaskDirective],
  templateUrl: './payment-methods.component.html',
  styleUrl: './payment-methods.component.css'
})
export class PaymentMethodsComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
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
      this.generateInstallments(this.product.price);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product?.price) {
      this.generateInstallments(this.product.price);
    }
  }

  private buildForm(): void {
    const savedCard = this.paymentState.cardData();

    this.cardForm = this.fb.group({
      number: [
        savedCard?.number || '',
        [Validators.required, CardValidators.luhn()]
      ],
      holderName: [
        savedCard?.holderName || '',
        [Validators.required, CardValidators.cardHolder()]
      ],
      expiration: [
        savedCard?.expiration || '',
        [Validators.required, CardValidators.expiration()]
      ],
      cvv: [
        savedCard?.cvv || '',
        [Validators.required, CardValidators.cvv()]
      ],
      installments: [savedCard?.installments || 1],
      saveCard: [true]
    });

    if (this.paymentState.method()) {
      this.selectedMethod.set(this.paymentState.method());
    }
  }

  generateInstallments(price: number): void {
    const options: InstallmentOption[] = [];
    for (let i = 1; i <= 12; i++) {
      const val = (price / i).toFixed(2).replace('.', ',');
      options.push({
        count: i,
        amount: price / i,
        label: `${i}x de R$ ${val} sem juros`
      });
    }
    this.installmentsList.set(options);
  }

  selectMethod(method: PaymentMethod): void {
    this.selectedMethod.set(method);
    this.paymentState.setMethod(method);
  }

  copyPixCode(): void {
    navigator.clipboard
      .writeText(this.simulatedPixCode)
      .then(() => {
        this.pixCopied.set(true);
        setTimeout(() => this.pixCopied.set(false), 3000);
      })
      .catch(() => {
        // Fallback caso permissão de clipboard seja negada
      });
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

  get f() {
    return this.cardForm.controls;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.cardForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
