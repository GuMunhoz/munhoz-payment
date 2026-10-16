import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ErrorReason, SimulatorMode } from '../../core/models/payment.models';
import { PaymentStateService } from '../../core/services/payment-state/payment-state.service';
import {
  resetSimulator,
  setSimulatorErrorReason,
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

  setErrorReason(reason: ErrorReason): void {
    setSimulatorErrorReason(reason);
  }

  resetAll(): void {
    resetSimulator();
    this.paymentState.reset();
    window.location.href = '/pagamento';
  }

  getModeBadgeLabel(): string {
    const s = this.state();
    if (s.mode === 'success') return 'Sucesso';
    if (s.mode === 'random') return 'Aleatório';
    if (s.errorReason === 'insufficient_funds') return 'Erro (Saldo)';
    if (s.errorReason === 'timeout') return 'Erro (Timeout)';
    return 'Erro (Recusado)';
  }

  getModeBadgeClass(): string {
    const s = this.state();
    if (s.mode === 'success') return 'badge-success-mode';
    if (s.mode === 'random') return 'badge-random-mode';
    return 'badge-error-mode';
  }
}
