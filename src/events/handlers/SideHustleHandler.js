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

  getHoverStats(eventData, age, t) {
    const { monthlyIncome, growthRate, startDate, endDate } = eventData.params;
    const status = age >= startDate && (!endDate || age <= endDate) ? t('status.active') : t('status.inactive');
    const yearsActive = Math.max(0, age - startDate);
    const currentMonthlyIncome = monthlyIncome * Math.pow(1 + growthRate / 100, yearsActive);

    return {
      [t('hoverStats.sideHustle.startingIncome')]: `${monthlyIncome}/${t('month')}`,
      [t('hoverStats.sideHustle.currentIncome')]: `${currentMonthlyIncome.toFixed(2)}/${t('month')}`,
      [t('hoverStats.sideHustle.growthRate')]: `${growthRate}%/${t('year')}`,
      [t('hoverStats.sideHustle.status')]: status,
    };
  }
}

export const sideHustleConfig = {
  type: 'side-hustle',
  label: 'event.side-hustle.label',
  icon: '🚀',
  color: '#d946ef',
  category: 'Income & Growth',
  fields: [
    { name: 'monthlyIncome', label: 'event.side-hustle.field.monthlyIncome.label', type: 'currency', default: 500 },
    { name: 'annualIncome', label: 'event.side-hustle.field.annualIncome.label', type: 'currency', default: 6000 },
    { name: 'growthRate', label: 'event.side-hustle.field.growthRate.label', type: 'percentage', default: 10 },
    { name: 'startDate', label: 'event.side-hustle.field.startDate.label', type: 'number', default: 30 },
    { name: 'endDate', label: 'event.side-hustle.field.endDate.label', type: 'number', default: null },
  ],
};
