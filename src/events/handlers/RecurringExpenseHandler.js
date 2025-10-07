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

  getHoverStats(eventData, age, t) {
    const { amount, frequency, startDate, endDate } = eventData.params;
    const status = age >= startDate && (!endDate || age <= endDate) ? t('status.active') : t('status.inactive');

    return {
      [t('hoverStats.recurringExpense.amount')]: `${amount} (${t(frequency)})`,
      [t('hoverStats.recurringExpense.status')]: status,
      [t('hoverStats.recurringExpense.period')]: `${startDate} - ${endDate || t('period.end')}`,
    };
  }
}

export const recurringExpenseConfig = {
  type: 'recurring-expense',
  label: 'event.recurring-expense.label',
  icon: '🧾',
  color: '#f97316',
  category: 'Major Expenses',
  fields: [
    { name: 'amount', label: 'event.recurring-expense.field.amount.label', type: 'currency', default: 100 },
    { name: 'frequency', label: 'event.recurring-expense.field.frequency.label', type: 'select', options: ['monthly', 'annually'], default: 'monthly' },
    { name: 'startDate', label: 'event.recurring-expense.field.startDate.label', type: 'number', default: 30 },
    { name: 'endDate', label: 'event.recurring-expense.field.endDate.label', type: 'number', default: null },
  ],
};
