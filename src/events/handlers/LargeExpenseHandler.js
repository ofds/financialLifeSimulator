import { BaseEventHandler } from '../BaseEventHandler';

export class LargeExpenseHandler extends BaseEventHandler {
  constructor(config) {
    super(config);

    this.calculationConfig = {
      immediateImpact: true,
      ongoingImpact: false,
      affectsGrowth: false,
      impactTiming: 'after-growth',
      includeInGrowthBase: true,
      priority: 500,
    };
  }

  calculateImmediateImpact(netWorth, eventData) {
    const amount = eventData.params.amount || 0;
    return netWorth - amount;
  }

  getHoverStats(eventData) {
    return {
      'Expense Amount': eventData.params.amount,
      Type: 'One-time expense',
      'Impact Timing': 'After growth calculation',
    };
  }
}

export const largeExpenseConfig = {
  type: 'large-expense',
  label: 'Large Expense',
  icon: '💸',
  color: '#ef4444',
  fields: [{ name: 'amount', label: 'Total Amount', type: 'currency', default: 10000 }],
};
