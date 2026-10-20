import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentStateService } from '../../../core/services/payment-state/payment-state.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper.component';
import { formatPaymentMethodSummary } from '../../../shared/utils/payment.utils';

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
  readonly steps = ['Pedido', 'Pagamento', 'Confirmação'];

  readonly errorData = this.paymentState.errorData;
  readonly product = this.paymentState.product;

  getMethodFormatted(): string {
    return formatPaymentMethodSummary(this.errorData(), { pixLabel: 'Pix' });
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
