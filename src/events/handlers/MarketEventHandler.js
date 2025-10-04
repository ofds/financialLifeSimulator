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

  getHoverStats(eventData, t) {
    return {
      [t('hoverStats.marketEvent.startAge')]: eventData.params.startAge,
      [t('hoverStats.marketEvent.duration')]: `${eventData.params.duration} ${t('years')}`,
      [t('hoverStats.marketEvent.returnAdjustment')]: `${eventData.params.returnAdjustment}%`,
    };
  }
}

export const marketEventConfig = {
  type: 'market-event',
  label: 'event.market-event.label',
  icon: '📉',
  color: '#4f46e5',
  fields: [
    { name: 'startAge', label: 'event.market-event.field.startAge.label', type: 'number', default: 40 },
    { name: 'duration', label: 'event.market-event.field.duration.label', type: 'number', default: 2 },
    { name: 'returnAdjustment', label: 'event.market-event.field.returnAdjustment.label', type: 'percentage', default: -20 },
  ],
};
