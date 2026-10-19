import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PaymentErrorResponse, PaymentSuccessResponse, Product } from '../../models/payment.models';
import { PaymentStateService } from './payment-state.service';

describe('PaymentStateService', () => {
  let service: PaymentStateService;

  const mockProduct: Product = {
    id: 'nexo-pro',
    name: 'Nexo Pro',
    subtitle: 'Plano mensal',
    price: 79.9,
    currency: 'BRL',
    summary: 'Resumo',
    features: ['Feature 1'],
    renewalText: 'Renovação'
  };

  const mockSuccess: PaymentSuccessResponse = {
    transactionId: 'tx_123',
    orderNumber: '#NX-98432',
    status: 'success',
    paidAt: '15/10/2026, 17:30',
    method: 'credit',
    amount: 79.9,
    nextRenewalDate: '15/11/2026'
  };

  const mockError: PaymentErrorResponse = {
    code: 'CARD_DECLINED',
    title: 'Cartão não autorizado',
    message: 'Banco recusou',
    status: 'error',
    failedAt: '15/10/2026, 17:30',
    method: 'credit',
    orderNumber: '#NX-98432',
    amount: 79.9
  };

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentStateService);
    service.reset();
  });

  it('should initialize with default idle state', () => {
    expect(service.status()).toBe('idle');
    expect(service.method()).toBe('credit');
  });

  it('should set product and method correctly', () => {
    service.setProduct(mockProduct);
    service.setMethod('pix');
    expect(service.product()?.name).toBe('Nexo Pro');
    expect(service.method()).toBe('pix');
  });

  it('should transition to success', () => {
    service.setSuccess(mockSuccess);
    expect(service.status()).toBe('success');
    expect(service.successData()?.transactionId).toBe('tx_123');
    expect(service.errorData()).toBeNull();
  });

  it('should transition to error', () => {
    service.setError(mockError);
    expect(service.status()).toBe('error');
    expect(service.errorData()?.code).toBe('CARD_DECLINED');
    expect(service.successData()).toBeNull();
  });

  it('should reset error on retryPayment', () => {
    service.setError(mockError);
    service.retryPayment();
    expect(service.status()).toBe('idle');
    expect(service.errorData()).toBeNull();
  });

  it('should clear all data on reset', () => {
    service.setSuccess(mockSuccess);
    service.reset();
    expect(service.status()).toBe('idle');
    expect(service.successData()).toBeNull();
    expect(service.product()).toBeNull();
  });
});
