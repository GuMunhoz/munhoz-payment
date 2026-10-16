import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PaymentRequest } from '../../models/payment.models';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        PaymentService
      ]
    });
    service = TestBed.inject(PaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve mock product when useMock is enabled', () => {
    return new Promise<void>((resolve) => {
      service.getProduct('nexo-pro').subscribe({
        next: (product) => {
          expect(product).toBeTruthy();
          expect(product.id).toBe('nexo-pro');
          expect(product.price).toBe(79.9);
          resolve();
        }
      });
    });
  });

  it('should process payment successfully in mock mode', () => {
    const request: PaymentRequest = {
      productId: 'nexo-pro',
      method: 'pix',
      pixCode: '00020126580014...'
    };

    return new Promise<void>((resolve) => {
      service.processPayment(request).subscribe({
        next: (response) => {
          expect(response).toBeTruthy();
          expect(response.status).toBe('success');
          expect(response.amount).toBe(79.9);
          resolve();
        }
      });
    });
  });
});
