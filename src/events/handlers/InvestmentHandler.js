import { BaseEventHandler } from '../BaseEventHandler';

export class InvestmentHandler extends BaseEventHandler {
  constructor(config) {
    super(config);

    this.calculationConfig = {
      immediateImpact: true,
      ongoingImpact: false,
      affectsGrowth: true,
      impactTiming: 'immediate',
      includeInGrowthBase: false, // The investment itself is not part of the base for other growth
      priority: 200,
    };
  }

  calculateImmediateImpact(netWorth, eventData) {
    // Moving money, so net worth impact is 0
    return netWorth;
  }

  contributeToYearlyGrowth(netWorth, eventData, currentAge, context) {
    if (currentAge < eventData.age) {
      return 0;
    }
    const { amount, returnRate } = eventData.params;
    return amount * (returnRate / 100);
  }

  getHoverStats(eventData, t) {
    return {
      [t('hoverStats.investment.amount')]: eventData.params.amount,
      [t('hoverStats.investment.returnRate')]: `${eventData.params.returnRate}%`,
    };
  }
}

export const investmentConfig = {
  type: 'investment',
  label: 'event.investment.label',
  icon: '📈',
  color: '#14b8a6',
  fields: [
    { name: 'amount', label: 'event.investment.field.amount.label', type: 'currency', default: 25000 },
    { name: 'returnRate', label: 'event.investment.field.returnRate.label', type: 'percentage', default: 10 },
  ],
};
