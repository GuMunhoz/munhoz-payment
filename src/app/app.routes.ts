import { Routes } from '@angular/router';
import { errorGuard, successGuard } from './core/guards/payment-result.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'pagamento',
    loadComponent: () =>
      import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent)
  },
  {
    path: 'pagamento/sucesso',
    loadComponent: () =>
      import('./features/result/success/success.component').then((m) => m.SuccessComponent),
    canActivate: [successGuard]
  },
  {
    path: 'pagamento/erro',
    loadComponent: () =>
      import('./features/result/error/error.component').then((m) => m.ErrorComponent),
    canActivate: [errorGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
