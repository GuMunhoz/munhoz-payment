import { signal } from '@angular/core';
import {
  ErrorReason,
  PaymentErrorResponse,
  PaymentMethod,
  PaymentRequest,
  PaymentSuccessResponse,
  SimulatorMode,
  SimulatorState
} from '../core/models/payment.models';

const STORAGE_KEY = 'nexo_simulator_state';

const DEFAULT_STATE: SimulatorState = {
  mode: 'success'
};

const VALID_MODES: ReadonlySet<SimulatorMode> = new Set<SimulatorMode>(['success', 'error']);

function loadStoredState(): SimulatorState {
  try {
    const mode = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null')?.mode;
    return VALID_MODES.has(mode) ? { mode } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

export const simulatorState = signal<SimulatorState>(loadStoredState());

export function setSimulatorMode(mode: SimulatorMode): void {
  saveState({ mode });
}

export function resetSimulator(): void {
  saveState(DEFAULT_STATE);
}

function saveState(state: SimulatorState): void {
  simulatorState.set(state);
  persistState(state);
}

/** Persistência é "best effort": se o storage estiver indisponível, o simulador segue só em memória. */
function persistState(state: SimulatorState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Simulador: não foi possível persistir o estado.', error);
  }
}

type MockPaymentOutcome =
  | { success: true; response: PaymentSuccessResponse }
  | { success: false; error: PaymentErrorResponse };

const MOCK_ORDER_NUMBER = '#NX-98432';
const FALLBACK_CARD_LAST4 = '4242';

export function handleMockPayment(
  request: PaymentRequest,
  productPrice: number,
  simulator: SimulatorState = simulatorState()
): MockPaymentOutcome {
  return simulator.mode === 'success'
    ? { success: true, response: buildSuccessResponse(request, productPrice) }
    : { success: false, error: buildErrorResponse(request, productPrice) };
}

function buildSuccessResponse(request: PaymentRequest, amount: number): PaymentSuccessResponse {
  const now = new Date();

  return {
    transactionId: 'tx_' + crypto.randomUUID().slice(0, 8),
    orderNumber: MOCK_ORDER_NUMBER,
    status: 'success',
    paidAt: formatDateTime(now),
    method: request.method,
    amount,
    installments: request.card?.installments || 1,
    ...getCardSummary(request),
    customerName: getCustomerFirstName(request),
    nextRenewalDate: formatDate(addMonths(now, 1))
  };
}

function buildErrorResponse(request: PaymentRequest, amount: number): PaymentErrorResponse {
  // Débito -> Saldo insuficiente | Crédito ou Pix -> Recusado
  const reason: ErrorReason = request.method === 'debit' ? 'insufficient_funds' : 'declined';

  return {
    ...getErrorDetails(reason, request.method),
    status: 'error',
    failedAt: formatDateTime(new Date()),
    method: request.method,
    orderNumber: MOCK_ORDER_NUMBER,
    amount,
    ...getCardSummary(request)
  };
}

/** Dados do cartão exibidos nas telas de resultado (não se aplicam ao Pix). */
function getCardSummary(request: PaymentRequest): { cardLast4?: string; cardBrand?: string } {
  if (request.method === 'pix') return {};

  const digits = request.card?.number?.replace(/\D/g, '') ?? '';

  return {
    cardLast4: digits.length >= 4 ? digits.slice(-4) : FALLBACK_CARD_LAST4,
    cardBrand: getCardBrand(digits)
  };
}

/** Primeiro nome do titular, capitalizado (ex.: "MARIA A ALMEIDA" -> "Maria"). */
function getCustomerFirstName(request: PaymentRequest): string | undefined {
  const firstName = request.card?.holderName?.trim().split(/\s+/)[0];
  return firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase() : undefined;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

/** dd/MM/yyyy */
function formatDate(date: Date): string {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** dd/MM/yyyy, HH:mm */
function formatDateTime(date: Date): string {
  return `${formatDate(date)}, ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function getErrorDetails(
  reason: ErrorReason,
  method: PaymentMethod
): { code: string; title: string; message: string } {
  if (reason === 'insufficient_funds') {
    return {
      code: 'INSUFFICIENT_FUNDS',
      title: 'Saldo insuficiente',
      message:
        'Não há saldo disponível suficiente para concluir esta transação no débito. Tente outro cartão ou pague via Pix.'
    };
  }

  return {
    code: 'PAYMENT_DECLINED',
    title: method === 'pix' ? 'Pagamento recusado' : 'Cartão não autorizado',
    message:
      method === 'pix'
        ? 'Sua instituição financeira recusou a transação via Pix. Tente novamente ou use outro meio de pagamento.'
        : 'Seu banco recusou a transação. Verifique os dados e o limite disponível, ou use outro meio de pagamento.'
  };
}

function getCardBrand(number: string): string {
  if (number.startsWith('4')) return 'Visa';
  if (number.startsWith('5')) return 'Mastercard';
  if (number.startsWith('34') || number.startsWith('37')) return 'Amex';
  if (number.startsWith('6')) return 'Elo';
  return 'Visa';
}
