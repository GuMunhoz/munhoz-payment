import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentStateService } from '../../core/services/payment-state/payment-state.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly paymentState = inject(PaymentStateService);

  goToPayment(): void {
    this.paymentState.reset();
    void this.router.navigate(['/pagamento']);
  }
}
