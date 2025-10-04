import { BaseEventHandler } from '../BaseEventHandler';

export class SideHustleHandler extends BaseEventHandler {
  constructor(config) {
    super(config);

    this.calculationConfig = {
      immediateImpact: false,
      ongoingImpact: false,
      affectsGrowth: true,
      impactTiming: 'immediate',
      priority: 250,
    };
  }

  contributeToYearlyGrowth(netWorth, eventData, currentAge) {
    const { growthRate, startDate, endDate } = eventData.params;
    const annualIncome = eventData.params.annualIncome || (eventData.params.monthlyIncome * 12) || 0;

    if (currentAge < startDate || (endDate && currentAge > endDate)) {
      return 0;
    }

    const yearsActive = currentAge - startDate;
    const currentAnnualIncome = annualIncome * Math.pow(1 + growthRate / 100, yearsActive);
    return currentAnnualIncome;
  }

  getHoverStats(eventData, age) {
    const { monthlyIncome, growthRate, startDate, endDate } = eventData.params;
    const status = age >= startDate && (!endDate || age <= endDate) ? 'Active' : 'Inactive';
    const yearsActive = Math.max(0, age - startDate);
    const currentMonthlyIncome = monthlyIncome * Math.pow(1 + growthRate / 100, yearsActive);

    return {
      'Starting Income': `${monthlyIncome}/month`,
      'Current Income': `${currentMonthlyIncome.toFixed(2)}/month`,
      'Growth Rate': `${growthRate}%/year`,
      Status: status,
    };
  }
}

export const sideHustleConfig = {
  type: 'side-hustle',
  label: 'Side Hustle',
  icon: '🚀',
  color: '#d946ef',
  fields: [
    { name: 'monthlyIncome', label: 'Monthly Income', type: 'currency', default: 500 },
    { name: 'annualIncome', label: 'Annual Income', type: 'currency', default: 6000 },
    { name: 'growthRate', label: 'Annual Growth Rate (%)', type: 'percentage', default: 10 },
    { name: 'startDate', label: 'Start Age', type: 'number', default: 30 },
    { name: 'endDate', label: 'End Age (optional)', type: 'number', default: null },
  ],
};
