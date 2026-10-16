import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Product } from '../../../core/models/payment.models';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent {
  @Input() product: Product | null = null;

  getUserCountText(): string {
    const count = this.product?.usersCount || 1;
    return `${count} ${count > 1 ? 'usuários' : 'usuário'}`;
  }
}
