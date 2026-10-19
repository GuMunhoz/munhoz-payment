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
