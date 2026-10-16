import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PaymentStateService } from '../services/payment-state/payment-state.service';

export const successGuard: CanActivateFn = () => {
  const paymentState = inject(PaymentStateService);
  const router = inject(Router);

  if (paymentState.isSuccess()) {
    return true;
  }

  return router.createUrlTree(['/pagamento']);
};

export const errorGuard: CanActivateFn = () => {
  const paymentState = inject(PaymentStateService);
  const router = inject(Router);

  if (paymentState.isError()) {
    return true;
  }

  return router.createUrlTree(['/pagamento']);
};
