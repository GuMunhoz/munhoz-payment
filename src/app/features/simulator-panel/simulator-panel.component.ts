import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SimulatorMode } from '../../core/models/payment.models';
import { PaymentStateService } from '../../core/services/payment-state/payment-state.service';
import {
  resetSimulator,
  setSimulatorMode,
  simulatorState
} from '../../mocks/mock-payment.handler';

@Component({
  selector: 'app-simulator-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simulator-panel.component.html',
  styleUrls: ['./simulator-panel.component.css']
})
export class SimulatorPanelComponent {
  readonly state = simulatorState;
  readonly isMockEnabled = environment.useMock;
  private readonly paymentState = inject(PaymentStateService);

  readonly isOpen = signal(false);

  toggleOpen(): void {
    this.isOpen.update((v) => !v);
  }

  setMode(mode: SimulatorMode): void {
    setSimulatorMode(mode);
  }

  resetAll(): void {
    resetSimulator();
    this.paymentState.reset();
    window.location.href = '/pagamento';
  }

  getModeBadgeLabel(): string {
    return this.state().mode === 'success' ? 'Sucesso' : 'Erro';
  }

  getModeBadgeClass(): string {
    return this.state().mode === 'success' ? 'badge-success-mode' : 'badge-error-mode';
  }
}
