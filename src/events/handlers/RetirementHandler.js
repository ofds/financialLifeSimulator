import { FinancialPhaseHandler } from './FinancialPhaseHandler';

export class RetirementHandler extends FinancialPhaseHandler {
  constructor(config) {
    super(config);
  }

  contributeToYearlyGrowth(netWorth, eventData, currentAge, context) {
    const { withdrawalRate, investmentReturn } = eventData.params;
    const annualWithdrawal = eventData.params.annualWithdrawal || (eventData.params.monthlyWithdrawal * 12) || 0;
    const pensionIncome = eventData.params.pensionIncome || (eventData.params.monthlyPensionIncome * 12) || 0;

    const phases = context.allEvents?.filter(e => e.type === 'retirement') || [];
    const activePhase = phases
      .filter(p => p.age <= currentAge)
      .sort((a, b) => b.age - a.age)[0];

    if (!activePhase || activePhase.id !== eventData.id) return 0;

    const withdrawal = withdrawalRate ? netWorth * (withdrawalRate / 100) : annualWithdrawal;
    const growth = netWorth * (investmentReturn / 100);

    return growth - withdrawal + pensionIncome;
  }

  getHoverStats(eventData) {
    return {
      'Annual Withdrawal': eventData.params.annualWithdrawal,
      'Withdrawal Rate': `${eventData.params.withdrawalRate}%`,
      'Pension Income': eventData.params.pensionIncome,
      'Investment Return': `${eventData.params.investmentReturn}%`,
    };
  }
}

export const retirementConfig = {
  type: 'retirement',
  label: 'Retirement',
  icon: '🏖️',
  color: '#0891b2',
  fields: [
    { name: 'annualWithdrawal', label: 'Annual Withdrawal', type: 'currency', default: 40000 },
    { name: 'monthlyWithdrawal', label: 'Monthly Withdrawal', type: 'currency', default: 3333 },
    { name: 'withdrawalRate', label: 'Withdrawal Rate (% of portfolio)', type: 'percentage', default: 4 },
    { name: 'pensionIncome', label: 'Annual Pension Income', type: 'currency', default: 20000 },
    { name: 'monthlyPensionIncome', label: 'Monthly Pension Income', type: 'currency', default: 1667 },
    { name: 'investmentReturn', label: 'Investment Return Rate (%)', type: 'percentage', default: 5 },
  ],
};
