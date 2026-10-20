import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentStateService } from '../../../core/services/payment-state/payment-state.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper.component';
import { formatPaymentMethodSummary } from '../../../shared/utils/payment.utils';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule, StepperComponent],
  templateUrl: './success.component.html',
  styleUrl: './success.component.css'
})
export class SuccessComponent {
  private readonly router = inject(Router);
  readonly paymentState = inject(PaymentStateService);
  readonly steps = ['Pedido', 'Pagamento', 'Confirmação'];

  readonly successData = this.paymentState.successData;
  readonly product = this.paymentState.product;

  getMethodFormatted(): string {
    return formatPaymentMethodSummary(this.successData());
  }

  getReceiptEmail(): string {
    const data = this.successData();
    const name = data?.customerName ? data.customerName.toLowerCase() : 'cliente';
    return `${name}@exemplo.com`;
  }

  goToHome(): void {
    this.paymentState.reset();
    void this.router.navigate(['/']);
  }

  viewReceipt(): void {
    window.print();
  }
}
