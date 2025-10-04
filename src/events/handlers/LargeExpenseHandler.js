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

  getHoverStats(eventData, t) {
    return {
      [t('hoverStats.largeExpense.expenseAmount')]: eventData.params.amount,
      [t('hoverStats.largeExpense.type')]: t('hoverStats.largeExpense.typeValue'),
      [t('hoverStats.largeExpense.impactTiming')]: t('hoverStats.largeExpense.impactTimingValue'),
    };
  }
}

export const largeExpenseConfig = {
  type: 'large-expense',
  label: 'event.large-expense.label',
  icon: '💸',
  color: '#ef4444',
  fields: [{ name: 'amount', label: 'event.large-expense.field.amount.label', type: 'currency', default: 10000 }],
};
