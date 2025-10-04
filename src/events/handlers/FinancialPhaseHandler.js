import { BaseEventHandler } from '../BaseEventHandler'

export class FinancialPhaseHandler extends BaseEventHandler {
  constructor(config) {
    super(config)
    
    this.calculationConfig = {
      immediateImpact: true,
      ongoingImpact: false,
      affectsGrowth: true,
      impactTiming: 'immediate',
      includeInGrowthBase: false,
      priority: 1000
    }
  }

  getCalculationConfig() {
    return this.calculationConfig
  }

  calculateImmediateImpact(netWorth, eventData, age, allEvents, context) {
    return eventData.params.startingNetWorth || 0
  }

  contributeToYearlyGrowth(netWorth, eventData, currentAge, context) {
    const phases = context.allEvents?.filter(e => e.type === 'financial-phase') || []
    const activePhase = phases
      .filter(p => p.age <= currentAge)
      .sort((a, b) => b.age - a.age)[0]
    
    if (!activePhase || activePhase.id !== eventData.id) return 0
    
    const annualIncome = eventData.params.annualIncome || 0
    const savingsRate = (eventData.params.savingsRate || 0) / 100
    const investmentReturn = (eventData.params.investmentReturn || 0) / 100
    
    const annualSavings = annualIncome * savingsRate
    const investmentGrowth = netWorth * investmentReturn
    
    return annualSavings + investmentGrowth
  }

  modifyContext(context, eventData, currentAge) {
    context.allEvents = context.allEvents || []
    return context
  }

  getHoverStats(eventData, age) {
    return {
      'Annual Income': eventData.params.annualIncome,
      'Savings Rate': `${eventData.params.savingsRate}%`,
      'Investment Return': `${eventData.params.investmentReturn}%`
    }
  }
}

export const financialPhaseConfig = {
  type: 'financial-phase',
  label: 'Financial Phase',
  icon: '📊',
  color: '#3b82f6',
  fields: [
    { name: 'startingNetWorth', label: 'Starting Net Worth', type: 'currency', default: 0 },
    { name: 'annualIncome', label: 'Annual Income', type: 'currency', default: 50000 },
    { name: 'monthlyIncome', label: 'Monthly Income', type: 'currency', default: 4167 },
    { name: 'investmentReturn', label: 'Investment Return Rate (%)', type: 'percentage', default: 7 },
    { name: 'savingsRate', label: 'Savings Rate (%)', type: 'percentage', default: 20 }
  ]
}
