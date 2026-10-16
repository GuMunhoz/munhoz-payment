import { Product } from '../core/models/payment.models';

export const MOCK_PRODUCT_NEXO_PRO: Product = {
  id: 'nexo-pro',
  name: 'Nexo Pro',
  subtitle: 'Plano mensal · 1 usuário',
  billingPeriod: 'Plano mensal',
  usersCount: 1,
  price: 79.90,
  currency: 'BRL',
  summary: 'Falta só um passo para começar com o Nexo Pro.',
  features: [
    'Acesso a todos recursos',
    'Relatórios e automações',
    'Suporte prioritário'
  ],
  renewalText: 'Renovação mensal. Cancele quando quiser, sem taxas adicionais.'
};
