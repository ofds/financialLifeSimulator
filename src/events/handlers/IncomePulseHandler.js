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
    const amount = eventData.params.amount || 0
    console.log(`Income Pulse at age ${age}: Adding ${amount} to ${netWorth}`)
    return netWorth + amount
  }

  getHoverStats(eventData, age) {
    return {
      'Income Amount': eventData.params.amount,
      'Type': 'One-time payment',
      'Impact Timing': 'Before growth calculation',
      'Earns Returns': 'Yes, same year'
    }
  }
}

export const incomePulseConfig = {
  type: 'outstanding-income',
  label: 'Income Pulse',
  icon: '💰',
  color: '#8b5cf6',
  fields: [
    { name: 'amount', label: 'Total Amount', type: 'currency', default: 50000 }
  ]
}
