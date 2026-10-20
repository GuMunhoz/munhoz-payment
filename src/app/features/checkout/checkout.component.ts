import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  PaymentErrorResponse,
  PaymentRequest,
  PaymentSubmitPayload,
  PaymentSuccessResponse,
  Product
} from '../../core/models/payment.models';
import { PaymentService } from '../../core/services/payment/payment.service';
import { PaymentStateService } from '../../core/services/payment-state/payment-state.service';
import { detectCardBrand } from '../../shared/utils/payment.utils';
import { StepperComponent } from '../../shared/components/stepper/stepper.component';
import { PaymentMethodsComponent } from './payment-methods/payment-methods.component';
import { OrderSummaryComponent } from './order-summary/order-summary.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    StepperComponent,
    PaymentMethodsComponent,
    OrderSummaryComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly paymentService = inject(PaymentService);
  readonly paymentState = inject(PaymentStateService);
  readonly steps = ['Pedido', 'Pagamento', 'Confirmação'];

  readonly product = signal<Product | null>(null);
  readonly isLoadingProduct = signal(true);
  readonly isProcessing = signal(false);
  readonly currentPaymentPayload = signal<PaymentSubmitPayload | null>(null);

  readonly userCountText = computed(() => {
    const count = this.product()?.usersCount || 1;
    return `${count} ${count > 1 ? 'usuários' : 'usuário'}`;
  });

  readonly paymentMethodSummary = computed(() => {
    const payload = this.currentPaymentPayload();
    const method = payload?.method || this.paymentState.method() || 'credit';

    if (method === 'pix') {
      return 'Pix';
    }

    const card = payload?.card || this.paymentState.getCardData(method);
    const digits = (card?.number ?? '').replace(/\D/g, '');
    const brand = detectCardBrand(digits) || 'Visa';
    const last4 = digits.slice(-4) || '4242';
    const typeLabel = method === 'credit' ? 'Crédito' : 'Débito';

    return `${typeLabel} · ${brand} •••• ${last4}`;
  });

  ngOnInit(): void {
    this.loadProduct();
  }

  private loadProduct(): void {
    this.isLoadingProduct.set(true);
    this.paymentService.getProduct().subscribe({
      next: (prod) => {
        this.product.set(prod);
        this.paymentState.setProduct(prod);
        this.isLoadingProduct.set(false);
      },
      error: () => {
        this.isLoadingProduct.set(false);
      }
    });
  }

  handlePaymentSubmit(payload: PaymentSubmitPayload): void {
    const prod = this.product();
    if (!prod) return;

    this.currentPaymentPayload.set(payload);
    this.isProcessing.set(true);
    this.paymentState.startProcessing();

    const request: PaymentRequest = {
      productId: prod.id,
      method: payload.method,
      card: payload.card,
      pixCode: payload.pixCode
    };

    this.paymentService.processPayment(request).subscribe({
      next: (response: PaymentSuccessResponse) => {
        this.isProcessing.set(false);
        this.paymentState.setSuccess(response);
        void this.router.navigate(['/pagamento/sucesso']);
      },
      error: (errResponse) => {
        this.isProcessing.set(false);
        const errorData: PaymentErrorResponse =
          errResponse.error || {
            code: 'UNKNOWN_ERROR',
            title: 'Não foi possível concluir o pagamento',
            message: 'Ocorreu um erro inesperado ao processar sua solicitação.',
            status: 'error',
            failedAt: new Date().toLocaleTimeString(),
            method: payload.method,
            orderNumber: '#NX-98432',
            amount: prod.price
          };
        this.paymentState.setError(errorData);
        void this.router.navigate(['/pagamento/erro']);
      }
    });
  }
}
