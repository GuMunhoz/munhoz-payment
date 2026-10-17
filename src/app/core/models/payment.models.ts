export type PaymentMethod = 'credit' | 'debit' | 'pix';

export type SimulatorMode = 'success' | 'error';

export type ErrorReason = 'declined' | 'insufficient_funds';

export type PaymentStatus = 'idle' | 'processing' | 'success' | 'error';

export interface Product {
  id: string;
  name: string;
  subtitle?: string;
  billingPeriod?: string;
  usersCount?: number;
  price: number;
  currency: string;
  summary: string;
  features: string[];
  renewalText: string;
}

export interface PaymentCardDetails {
  number: string;
  holderName: string;
  expiration: string;
  cvv: string;
  installments: number;
  saveCard?: boolean;
}

export interface PaymentSubmitPayload {
  method: PaymentMethod;
  card?: PaymentCardDetails;
  pixCode?: string;
}

export interface InstallmentOption {
  count: number;
  label: string;
  amount: number;
}

export interface PaymentRequest {
  productId: string;
  method: PaymentMethod;
  card?: {
    number: string;
    holderName: string;
    expiration: string;
    cvv: string;
    installments: number;
    saveCard?: boolean;
  };
  pixCode?: string;
}

export interface PaymentSuccessResponse {
  transactionId: string;
  orderNumber: string;
  status: 'success';
  paidAt: string;
  method: PaymentMethod;
  amount: number;
  installments?: number;
  cardLast4?: string;
  cardBrand?: string;
  customerName?: string;
  nextRenewalDate: string;
}

export interface PaymentErrorResponse {
  code: string;
  title: string;
  message: string;
  status: 'error';
  failedAt: string;
  method: PaymentMethod;
  orderNumber: string;
  amount: number;
  cardLast4?: string;
  cardBrand?: string;
}

export interface SimulatorState {
  mode: SimulatorMode;
}

export interface PersistedState {
  product: Product | null;
  method: PaymentMethod;
  status: PaymentStatus;
  successData: PaymentSuccessResponse | null;
  errorData: PaymentErrorResponse | null;
  savedCardData?: Partial<PaymentCardDetails>;
}
