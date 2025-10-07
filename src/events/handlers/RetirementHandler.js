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

  getHoverStats(eventData, t) {
    return {
      [t('hoverStats.retirement.annualWithdrawal')]: eventData.params.annualWithdrawal,
      [t('hoverStats.retirement.withdrawalRate')]: `${eventData.params.withdrawalRate}%`,
      [t('hoverStats.retirement.pensionIncome')]: eventData.params.pensionIncome,
      [t('hoverStats.retirement.investmentReturn')]: `${eventData.params.investmentReturn}%`,
    };
  }
}

export const retirementConfig = {
  type: 'retirement',
  label: 'event.retirement.label',
  icon: '🏖️',
  color: '#0891b2',
  category: 'Market & Life',
  fields: [
    { name: 'annualWithdrawal', label: 'event.retirement.field.annualWithdrawal.label', type: 'currency', default: 40000 },
    { name: 'monthlyWithdrawal', label: 'event.retirement.field.monthlyWithdrawal.label', type: 'currency', default: 3333 },
    { name: 'withdrawalRate', label: 'event.retirement.field.withdrawalRate.label', type: 'percentage', default: 4 },
    { name: 'pensionIncome', label: 'event.retirement.field.pensionIncome.label', type: 'currency', default: 20000 },
    { name: 'monthlyPensionIncome', label: 'event.retirement.field.monthlyPensionIncome.label', type: 'currency', default: 1667 },
    { name: 'investmentReturn', label: 'event.retirement.field.investmentReturn.label', type: 'percentage', default: 5 },
  ],
};
