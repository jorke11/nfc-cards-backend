// Placeholder pricing — adjust before going live.
export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  frequency: number;
  frequencyType: 'months' | 'days';
}

export const PLANS: Plan[] = [
  {
    id: 'pro-monthly',
    name: 'Pro',
    description: 'Unlock business profiles, menus and full analytics',
    price: 19900,
    currency: 'COP',
    frequency: 1,
    frequencyType: 'months',
  },
];

export function getPlanById(planId: string): Plan | undefined {
  return PLANS.find((p) => p.id === planId);
}
