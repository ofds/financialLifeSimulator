import { BaseEventHandler } from '../BaseEventHandler';

export class MarketEventHandler extends BaseEventHandler {
  constructor(config) {
    super(config);

    this.calculationConfig = {
      immediateImpact: false,
      ongoingImpact: false,
      affectsGrowth: false,
      priority: 100, // High priority to modify context early
    };
  }

  modifyContext(context, eventData, currentAge) {
    const { startAge, duration, returnAdjustment } = eventData.params;
    const endAge = startAge + duration;

    if (currentAge >= startAge && currentAge < endAge) {
      const currentInvestmentReturn = context.investmentReturn || 0;
      context.investmentReturn = currentInvestmentReturn + returnAdjustment;
    }

    return context;
  }

  getHoverStats(eventData) {
    return {
      'Start Age': eventData.params.startAge,
      Duration: `${eventData.params.duration} years`,
      'Return Adjustment': `${eventData.params.returnAdjustment}%`,
    };
  }
}

export const marketEventConfig = {
  type: 'market-event',
  label: 'Market Event',
  icon: '📉',
  color: '#4f46e5',
  fields: [
    { name: 'startAge', label: 'Start Age', type: 'number', default: 40 },
    { name: 'duration', label: 'Duration (years)', type: 'number', default: 2 },
    { name: 'returnAdjustment', label: 'Return Adjustment (%)', type: 'percentage', default: -20 },
  ],
};
