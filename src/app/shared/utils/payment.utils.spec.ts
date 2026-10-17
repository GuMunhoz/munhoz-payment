import { describe, expect, it } from 'vitest';
import { generateInstallments } from './payment.utils';

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
});
