import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { PaymentStateService } from '../services/payment-state/payment-state.service';
import { errorGuard, successGuard } from './payment-result.guard';

describe('PaymentResultGuards', () => {
  let paymentState: PaymentStateService;
  let router: Router;
  let dummyRoute: ActivatedRouteSnapshot;
  let dummyState: RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    paymentState = TestBed.inject(PaymentStateService);
    router = TestBed.inject(Router);
    dummyRoute = {} as ActivatedRouteSnapshot;
    dummyState = { url: '' } as RouterStateSnapshot;
    paymentState.reset();
  });

  describe('successGuard', () => {
    it('should redirect to /pagamento if state is not success', () => {
      const result = TestBed.runInInjectionContext(() =>
        successGuard(dummyRoute, dummyState)
      );
      expect(result).toBeInstanceOf(UrlTree);
      if (result instanceof UrlTree) {
        expect(result.toString()).toBe('/pagamento');
      }
    });

    it('should allow navigation if state is success', () => {
      paymentState.setSuccess({
        transactionId: 'tx_1',
        orderNumber: '#NX-1',
        status: 'success',
        paidAt: 'now',
        method: 'credit',
        amount: 79.9,
        nextRenewalDate: 'next'
      });

      const result = TestBed.runInInjectionContext(() =>
        successGuard(dummyRoute, dummyState)
      );
      expect(result).toBe(true);
    });
  });

  describe('errorGuard', () => {
    it('should redirect to /pagamento if state is not error', () => {
      const result = TestBed.runInInjectionContext(() =>
        errorGuard(dummyRoute, dummyState)
      );
      expect(result).toBeInstanceOf(UrlTree);
      if (result instanceof UrlTree) {
        expect(result.toString()).toBe('/pagamento');
      }
    });

    it('should allow navigation if state is error', () => {
      paymentState.setError({
        code: 'ERR',
        title: 'Erro',
        message: 'Falha',
        status: 'error',
        failedAt: 'now',
        method: 'credit',
        orderNumber: '#NX-1',
        amount: 79.9
      });

      const result = TestBed.runInInjectionContext(() =>
        errorGuard(dummyRoute, dummyState)
      );
      expect(result).toBe(true);
    });
  });
});
