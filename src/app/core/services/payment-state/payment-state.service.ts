import { Injectable, signal } from '@angular/core';
import {
  PaymentCardDetails,
  PaymentErrorResponse,
  PaymentMethod,
  PaymentStatus,
  PaymentSuccessResponse,
  Product
} from '../../models/payment.models';

@Injectable({
  providedIn: 'root'
})
export class PaymentStateService {
  private readonly productSignal = signal<Product | null>(null);
  private readonly methodSignal = signal<PaymentMethod>('credit');
  private readonly statusSignal = signal<PaymentStatus>('idle');
  private readonly successSignal = signal<PaymentSuccessResponse | null>(null);
  private readonly errorSignal = signal<PaymentErrorResponse | null>(null);
  private readonly cardsSignal = signal<Partial<Record<'credit' | 'debit', Partial<PaymentCardDetails>>>>({});

  readonly product = this.productSignal.asReadonly();
  readonly method = this.methodSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();
  readonly successData = this.successSignal.asReadonly();
  readonly errorData = this.errorSignal.asReadonly();

  getCardData(method: PaymentMethod = this.methodSignal()): Partial<PaymentCardDetails> | null {
    if (method === 'pix') return null;
    return this.cardsSignal()[method] ?? null;
  }

  setProduct(product: Product): void {
    this.productSignal.set(product);
  }

  setMethod(method: PaymentMethod): void {
    this.methodSignal.set(method);
  }

  setCardData({ cvv, ...safeCard }: Partial<PaymentCardDetails>, method: PaymentMethod = this.methodSignal()): void {
    if (method === 'pix') return;
    this.cardsSignal.update((cards) => ({ ...cards, [method]: safeCard }));
  }

  startProcessing(): void {
    this.statusSignal.set('processing');
  }

  setSuccess(response: PaymentSuccessResponse): void {
    this.statusSignal.set('success');
    this.successSignal.set(response);
    this.errorSignal.set(null);
    this.clearUnsavedCards();
  }

  setError(error: PaymentErrorResponse): void {
    this.statusSignal.set('error');
    this.errorSignal.set(error);
    this.successSignal.set(null);
  }

  retryPayment(): void {
    this.statusSignal.set('idle');
    this.errorSignal.set(null);
  }

  chooseAnotherMethod(): void {
    this.retryPayment();
    this.methodSignal.set('credit');
    this.clearUnsavedCards();
  }

  reset(): void {
    this.chooseAnotherMethod();
    this.productSignal.set(null);
    this.successSignal.set(null);
  }

  private clearUnsavedCards(): void {
    this.cardsSignal.update((cards) => ({
      credit: cards.credit?.saveCard ? cards.credit : undefined,
      debit: cards.debit?.saveCard ? cards.debit : undefined
    }));
  }
}
