import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentStateService } from '../../../core/services/payment-state/payment-state.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper.component';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule, StepperComponent],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorComponent {
  private readonly router = inject(Router);
  readonly paymentState = inject(PaymentStateService);

  readonly errorData = this.paymentState.errorData;
  readonly product = this.paymentState.product;

  getMethodFormatted(): string {
    const data = this.errorData();
    if (!data) return '';

    if (data.method === 'pix') return 'Pix';

    const typeLabel = data.method === 'credit' ? 'Crédito' : 'Débito';

    return `${typeLabel} · ${data.cardBrand} •••• ${data.cardLast4}`;
  }

  retry(): void {
    this.paymentState.retryPayment();
    void this.router.navigate(['/pagamento']);
  }

  chooseAnotherMethod(): void {
    this.paymentState.chooseAnotherMethod();
    void this.router.navigate(['/pagamento']);
  }
}
