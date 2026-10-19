import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentStateService } from '../../../core/services/payment-state/payment-state.service';
import { StepperComponent } from '../../../shared/components/stepper/stepper.component';

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
  readonly steps = ['Produto', 'Pagamento', 'Confirmação'];

  readonly successData = this.paymentState.successData;
  readonly product = this.paymentState.product;

  getMethodFormatted(): string {
    const data = this.successData();
    if (!data) return '';

    if (data.method === 'pix') {
      return 'Pix · À vista';
    }

    const typeLabel = data.method === 'credit' ? 'Crédito' : 'Débito';
    const installmentsText =
      data.method === 'credit' && data.installments && data.installments > 1
        ? ` · ${data.installments}x`
        : '';

    return `${typeLabel} · ${data.cardBrand} •••• ${data.cardLast4}${installmentsText}`;
  }

  goToHome(): void {
    this.paymentState.reset();
    void this.router.navigate(['/']);
  }

  viewReceipt(): void {
    window.print();
  }
}
