import { signal } from '@angular/core';
import {
  ErrorReason,
  PaymentErrorResponse,
  PaymentRequest,
  PaymentSuccessResponse,
  SimulatorMode,
  SimulatorState
} from '../core/models/payment.models';

const STORAGE_KEY = 'nexo_simulator_state';

const DEFAULT_STATE: SimulatorState = {
  mode: 'success',
  errorReason: 'declined'
};

function loadStoredState(): SimulatorState {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // fallback
  }
  return DEFAULT_STATE;
}

export const simulatorState = signal<SimulatorState>(loadStoredState());

export function setSimulatorMode(mode: SimulatorMode): void {
  const updated: SimulatorState = { ...simulatorState(), mode };
  saveState(updated);
}

export function setSimulatorErrorReason(errorReason: ErrorReason): void {
  const updated: SimulatorState = { ...simulatorState(), errorReason };
  saveState(updated);
}

export function resetSimulator(): void {
  saveState(DEFAULT_STATE);
}

function saveState(state: SimulatorState): void {
  simulatorState.set(state);
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function handleMockPayment(
  request: PaymentRequest,
  productPrice: number,
  simulator: SimulatorState = simulatorState()
): { success: true; response: PaymentSuccessResponse } | { success: false; error: PaymentErrorResponse } {
  let shouldSucceed = false;

  if (simulator.mode === 'success') {
    shouldSucceed = true;
  } else if (simulator.mode === 'error') {
    shouldSucceed = false;
  } else {
    // Random: 70% success, 30% error
    shouldSucceed = Math.random() < 0.7;
  }

  const rawNumber = request.card?.number?.replace(/\D/g, '') || '';
  const last4 = rawNumber.length >= 4 ? rawNumber.slice(-4) : '4242';
  const brand = getCardBrand(rawNumber);
  const now = new Date();
  const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const formattedRenewal = `${String(nextMonth.getDate()).padStart(2, '0')}/${String(nextMonth.getMonth() + 1).padStart(2, '0')}/${nextMonth.getFullYear()}`;

  const orderNumber = '#NX-98432';

  if (shouldSucceed) {
    return {
      success: true,
      response: {
        transactionId: 'tx_' + Math.random().toString(36).substring(2, 10),
        orderNumber,
        status: 'success',
        paidAt: formattedDate,
        method: request.method,
        amount: productPrice,
        installments: request.card?.installments || 1,
        cardLast4: request.method !== 'pix' ? last4 : undefined,
        cardBrand: request.method !== 'pix' ? brand : undefined,
        customerEmail: 'maria.almeida@exemplo.com',
        nextRenewalDate: formattedRenewal
      }
    };
  }

  // Handle error scenario
  const reason: ErrorReason = simulator.mode === 'error'
    ? simulator.errorReason
    : (['declined', 'insufficient_funds', 'timeout'][Math.floor(Math.random() * 3)] as ErrorReason);

  const errorDetails = getErrorDetails(reason);

  return {
    success: false,
    error: {
      code: errorDetails.code,
      title: errorDetails.title,
      message: errorDetails.message,
      status: 'error',
      failedAt: formattedDate,
      method: request.method,
      orderNumber,
      amount: productPrice,
      cardLast4: request.method !== 'pix' ? last4 : undefined,
      cardBrand: request.method !== 'pix' ? brand : undefined
    }
  };
}

function getErrorDetails(reason: ErrorReason): { code: string; title: string; message: string } {
  switch (reason) {
    case 'insufficient_funds':
      return {
        code: 'INSUFFICIENT_FUNDS',
        title: 'Saldo insuficiente',
        message: 'Não há limite ou saldo disponível suficiente para concluir esta transação. Tente outro cartão ou pague via Pix.'
      };
    case 'timeout':
      return {
        code: 'COMMUNICATION_TIMEOUT',
        title: 'Falha de comunicação',
        message: 'Ocorreu uma instabilidade na conexão com a instituição financeira. Por favor, tente novamente.'
      };
    case 'declined':
    default:
      return {
        code: 'CARD_DECLINED',
        title: 'Cartão não autorizado',
        message: 'Seu banco recusou a transação. Verifique os dados e o limite disponível, ou use outro meio de pagamento.'
      };
  }
}

function getCardBrand(number: string): string {
  if (number.startsWith('4')) return 'Visa';
  if (number.startsWith('5')) return 'Mastercard';
  if (number.startsWith('34') || number.startsWith('37')) return 'Amex';
  if (number.startsWith('6')) return 'Elo';
  return 'Visa';
}
