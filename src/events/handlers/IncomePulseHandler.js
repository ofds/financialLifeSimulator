import { BaseEventHandler } from '../BaseEventHandler'

export class IncomePulseHandler extends BaseEventHandler {
  constructor(config) {
    super(config)
    
    // Configure calculation behavior
    this.calculationConfig = {
      immediateImpact: true,
      ongoingImpact: false,
      affectsGrowth: false,
      impactTiming: 'before-growth',
      includeInGrowthBase: true,
      priority: 500
    }
  }

  getCalculationConfig() {
    return this.calculationConfig
  }

  calculateImmediateImpact(netWorth, eventData, age, allEvents, context) {
    const amount = eventData.params.amount || 0;
    return netWorth + amount;
  }

  getHoverStats(eventData, age, t) {
    return {
      [t('hoverStats.incomePulse.incomeAmount')]: eventData.params.amount,
      [t('hoverStats.incomePulse.type')]: t('hoverStats.incomePulse.typeValue'),
      [t('hoverStats.incomePulse.impactTiming')]: t('hoverStats.incomePulse.impactTimingValue'),
      [t('hoverStats.incomePulse.earnsReturns')]: t('hoverStats.incomePulse.earnsReturnsValue')
    }
  }
}

export const incomePulseConfig = {
  type: 'outstanding-income',
  label: 'event.outstanding-income.label',
  icon: '💰',
  color: '#8b5cf6',
  category: 'Income & Growth',
  fields: [
    { name: 'amount', label: 'event.outstanding-income.field.amount.label', type: 'currency', default: 50000 }
  ]
}
