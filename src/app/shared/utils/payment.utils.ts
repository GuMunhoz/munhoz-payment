import { InstallmentOption } from '../../core/models/payment.models';

export function generateInstallments(
  price: number,
  maxInstallments: number = 12
): InstallmentOption[] {
  const options: InstallmentOption[] = [];
  for (let i = 1; i <= maxInstallments; i++) {
    const val = (price / i).toFixed(2).replace('.', ',');
    options.push({
      count: i,
      amount: price / i,
      label: `${i}x de R$ ${val} sem juros`
    });
  }
  return options;
}

export function detectCardBrand(cardNumber: string): 'Visa' | 'Mastercard' | 'Elo' | 'Amex' | null {
  const digits = (cardNumber ?? '').replace(/\D/g, '');
  if (!digits) return null;

  if (digits.startsWith('4')) return 'Visa';
  if (digits.startsWith('5') || /^2[2-7]/.test(digits)) return 'Mastercard';
  if (digits.startsWith('34') || digits.startsWith('37')) return 'Amex';
  if (digits.startsWith('6')) return 'Elo';
  return null;
}

export function formatPaymentMethodSummary(
  data: {
    method?: string;
    cardBrand?: string;
    cardLast4?: string;
    installments?: number;
  } | null | undefined,
  options?: { pixLabel?: string }
): string {
  if (!data?.method) return '';
  if (data.method === 'pix') return options?.pixLabel ?? 'Pix · À vista';

  const typeLabel = data.method === 'credit' ? 'Crédito' : 'Débito';
  const installmentsText =
    data.method === 'credit' && data.installments && data.installments > 1
      ? ` · ${data.installments}x`
      : '';

  return `${typeLabel} · ${data.cardBrand ?? ''} •••• ${data.cardLast4 ?? ''}${installmentsText}`.trim();
}

