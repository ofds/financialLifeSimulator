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
    // Only apply starting net worth if this is the chronologically first event in the simulation.
    const isFirstEventOverall = !allEvents.some(e => e.age < age);

    if (isFirstEventOverall) {
      return eventData.params.startingNetWorth || 0;
    }
    
    // For all other cases, a new phase just changes the growth parameters, it doesn't have an immediate impact.
    return netWorth;
  }

  contributeToYearlyGrowth(netWorth, eventData, currentAge, context) {
    const phases = context.allEvents?.filter(e => e.type === 'financial-phase') || []
    const activePhase = phases
      .filter(p => p.age <= currentAge)
      .sort((a, b) => b.age - a.age)[0]
    
    if (!activePhase || activePhase.id !== eventData.id) return 0
    
    const annualIncome = eventData.params.annualIncome || (eventData.params.monthlyIncome * 12) || 0;
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

  getHoverStats(eventData, age, t) {
    return {
      [t('hoverStats.financialPhase.annualIncome')]: eventData.params.annualIncome,
      [t('hoverStats.financialPhase.savingsRate')]: `${eventData.params.savingsRate}%`,
      [t('hoverStats.financialPhase.investmentReturn')]: `${eventData.params.investmentReturn}%`
    }
  }
}

export const financialPhaseConfig = {
  type: 'financial-phase',
  label: 'event.financial-phase.label',
  icon: '📊',
  color: '#3b82f6',
  category: 'Core',
  fields: [
    { name: 'startingNetWorth', label: 'event.financial-phase.field.startingNetWorth.label', type: 'currency', default: 0 },
    { name: 'annualIncome', label: 'event.financial-phase.field.annualIncome.label', type: 'currency', default: 50000 },
    { name: 'monthlyIncome', label: 'event.financial-phase.field.monthlyIncome.label', type: 'currency', default: 4167 },
    { name: 'investmentReturn', label: 'event.financial-phase.field.investmentReturn.label', type: 'percentage', default: 7 },
    { name: 'savingsRate', label: 'event.financial-phase.field.savingsRate.label', type: 'percentage', default: 20 }
  ]
}
