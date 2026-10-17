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
