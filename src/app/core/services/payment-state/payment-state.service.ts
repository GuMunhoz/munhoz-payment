import { Injectable, signal } from '@angular/core';
import {
  PaymentCardDetails,
  PaymentErrorResponse,
  PaymentMethod,
  PaymentStatus,
  PaymentSuccessResponse,
  PersistedState,
  Product
} from '../../models/payment.models';

const STORAGE_KEY = 'nexo_payment_session';

@Injectable({
  providedIn: 'root'
})
export class PaymentStateService {
  private readonly productSignal = signal<Product | null>(null);
  private readonly methodSignal = signal<PaymentMethod>('credit');
  private readonly statusSignal = signal<PaymentStatus>('idle');
  private readonly successSignal = signal<PaymentSuccessResponse | null>(null);
  private readonly errorSignal = signal<PaymentErrorResponse | null>(null);
  private readonly cardSignal = signal<Partial<PaymentCardDetails> | null>(null);

  readonly product = this.productSignal.asReadonly();
  readonly method = this.methodSignal.asReadonly();
  readonly status = this.statusSignal.asReadonly();
  readonly successData = this.successSignal.asReadonly();
  readonly errorData = this.errorSignal.asReadonly();
  readonly cardData = this.cardSignal.asReadonly();

  constructor() {
    this.hydrateFromStorage();
  }

  setProduct(product: Product): void {
    this.productSignal.set(product);
    this.persist();
  }

  setMethod(method: PaymentMethod): void {
    this.methodSignal.set(method);
    this.persist();
  }

  setCardData(card: Partial<PaymentCardDetails>): void {
    this.cardSignal.set(card);
    this.persist();
  }

  startProcessing(): void {
    this.statusSignal.set('processing');
    this.persist();
  }

  setSuccess(response: PaymentSuccessResponse): void {
    this.statusSignal.set('success');
    this.successSignal.set(response);
    this.errorSignal.set(null);
    this.persist();
  }

  setError(error: PaymentErrorResponse): void {
    this.statusSignal.set('error');
    this.errorSignal.set(error);
    this.successSignal.set(null);
    this.persist();
  }

  retryPayment(): void {
    this.statusSignal.set('idle');
    this.errorSignal.set(null);
    this.persist();
  }

  chooseAnotherMethod(): void {
    this.statusSignal.set('idle');
    this.errorSignal.set(null);
    this.methodSignal.set('credit');
    this.cardSignal.set(null);
    this.persist();
  }

  reset(): void {
    this.productSignal.set(null);
    this.methodSignal.set('credit');
    this.statusSignal.set('idle');
    this.successSignal.set(null);
    this.errorSignal.set(null);
    this.cardSignal.set(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  isSuccess(): boolean {
    return this.statusSignal() === 'success' && this.successSignal() !== null;
  }

  isError(): boolean {
    return this.statusSignal() === 'error' && this.errorSignal() !== null;
  }

  private persist(): void {
    try {
      const state: PersistedState = {
        product: this.productSignal(),
        method: this.methodSignal(),
        status: this.statusSignal(),
        successData: this.successSignal(),
        errorData: this.errorSignal(),
        savedCardData: this.cardSignal()
          ? {
              // Never save full CVV to session storage for security best practice
              holderName: this.cardSignal()?.holderName,
              installments: this.cardSignal()?.installments,
              expiration: this.cardSignal()?.expiration,
              number: this.cardSignal()?.number
            }
          : undefined
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage quota or disabled
    }
  }

  private hydrateFromStorage(): void {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: PersistedState = JSON.parse(raw);
      if (parsed.product) this.productSignal.set(parsed.product);
      if (parsed.method) this.methodSignal.set(parsed.method);
      if (parsed.status) this.statusSignal.set(parsed.status);
      if (parsed.successData) this.successSignal.set(parsed.successData);
      if (parsed.errorData) this.errorSignal.set(parsed.errorData);
      if (parsed.savedCardData) this.cardSignal.set(parsed.savedCardData);
    } catch {
      // ignore parse errors
    }
  }
}
