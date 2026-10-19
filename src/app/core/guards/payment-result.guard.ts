import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PaymentStateService } from '../services/payment-state/payment-state.service';

export const successGuard: CanActivateFn = () => {
  const paymentState = inject(PaymentStateService);
  const router = inject(Router);

  return paymentState.status() === 'success' || router.createUrlTree(['/pagamento']);
};

export const errorGuard: CanActivateFn = () => {
  const paymentState = inject(PaymentStateService);
  const router = inject(Router);

  return paymentState.status() === 'error' || router.createUrlTree(['/pagamento']);
};
