import { BaseEventHandler } from '../BaseEventHandler';

export class RecurringExpenseHandler extends BaseEventHandler {
  constructor(config) {
    super(config);

    this.calculationConfig = {
      immediateImpact: false,
      ongoingImpact: true,
      affectsGrowth: false,
      impactTiming: 'after-growth',
      priority: 400,
    };
  }

  calculateOngoingImpact(netWorth, eventData, currentAge) {
    const { amount, frequency, startDate, endDate } = eventData.params;

    if (currentAge < startDate || (endDate && currentAge > endDate)) {
      return netWorth;
    }

    const expense = frequency === 'annually' ? amount : amount * 12;
    return netWorth - expense;
  }

  getHoverStats(eventData, age) {
    const { amount, frequency, startDate, endDate } = eventData.params;
    const status = age >= startDate && (!endDate || age <= endDate) ? 'Active' : 'Inactive';

    return {
      Amount: `${amount} (${frequency})`,
      Status: status,
      Period: `${startDate} - ${endDate || 'End'}`,
    };
  }
}

export const recurringExpenseConfig = {
  type: 'recurring-expense',
  label: 'Recurring Expense',
  icon: '🧾',
  color: '#f97316',
  fields: [
    { name: 'amount', label: 'Amount', type: 'currency', default: 100 },
    { name: 'frequency', label: 'Frequency', type: 'select', options: ['monthly', 'annually'], default: 'monthly' },
    { name: 'startDate', label: 'Start Age', type: 'number', default: 30 },
    { name: 'endDate', label: 'End Age (optional)', type: 'number', default: null },
  ],
};
