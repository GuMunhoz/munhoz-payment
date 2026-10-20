import { describe, expect, it } from 'vitest';
import { formatPaymentMethodSummary, generateInstallments, getPaymentMethodDisplay } from './payment.utils';

describe('payment.utils', () => {
  it('should generate 12 installment options by default', () => {
    const options = generateInstallments(79.9);
    expect(options).toHaveLength(12);
    expect(options[0]).toEqual({
      count: 1,
      amount: 79.9,
      label: '1x de R$ 79,90 sem juros'
    });
    expect(options[1]).toEqual({
      count: 2,
      amount: 39.95,
      label: '2x de R$ 39,95 sem juros'
    });
  });

  it('should respect custom maxInstallments parameter', () => {
    const options = generateInstallments(100, 3);
    expect(options).toHaveLength(3);
  });

  describe('formatPaymentMethodSummary', () => {
    it('should format Pix correctly', () => {
      expect(formatPaymentMethodSummary({ method: 'pix' })).toBe('Pix · À vista');
      expect(formatPaymentMethodSummary({ method: 'pix' }, { pixLabel: 'Pix' })).toBe('Pix');
    });

    it('should format credit card with installments correctly', () => {
      expect(
        formatPaymentMethodSummary({
          method: 'credit',
          cardBrand: 'Visa',
          cardLast4: '4242',
          installments: 3
        })
      ).toBe('Crédito · Visa •••• 4242 · 3x');
    });

    it('should format debit card correctly', () => {
      expect(
        formatPaymentMethodSummary({
          method: 'debit',
          cardBrand: 'Mastercard',
          cardLast4: '1234'
        })
      ).toBe('Débito · Mastercard •••• 1234');
    });

    it('should return empty string when data is empty', () => {
      expect(formatPaymentMethodSummary(null)).toBe('');
      expect(formatPaymentMethodSummary(undefined)).toBe('');
    });
  });

  describe('getPaymentMethodDisplay', () => {
    it('should return Pix for pix method', () => {
      expect(getPaymentMethodDisplay({ method: 'pix' })).toBe('Pix');
    });

    it('should format credit card with detected brand and last digits', () => {
      expect(
        getPaymentMethodDisplay({
          method: 'credit',
          card: { number: '4242 4242 4242 4242' }
        })
      ).toBe('Crédito · Visa •••• 4242');
    });

    it('should format debit card with detected brand and last digits', () => {
      expect(
        getPaymentMethodDisplay({
          method: 'debit',
          card: { number: '5555 4444 3333 1234' }
        })
      ).toBe('Débito · Mastercard •••• 1234');
    });

    it('should use safe fallbacks when card details are missing', () => {
      expect(getPaymentMethodDisplay(null)).toBe('Crédito · Visa •••• 4242');
      expect(getPaymentMethodDisplay(null, 'debit')).toBe('Débito · Visa •••• 4242');
    });
  });
});

