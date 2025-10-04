import { eventRegistry } from '../events/EventRegistry';

class CalculationContext {
  constructor(params) {
    this.startAge = params.startAge;
    this.endAge = params.endAge;
    this.allEvents = [];
    this.modifiers = {
      taxRate: 0,
      inflationRate: 0,
      extraIncome: 0,
      extraExpenses: 0
    }
  }

  clone() {
    const cloned = new CalculationContext({ 
      startAge: this.startAge, 
      endAge: this.endAge 
    })
    cloned.modifiers = { ...this.modifiers }
    cloned.allEvents = this.allEvents
    return cloned
  }
}

export function calculateProjection(events, params) {
  const context = new CalculationContext(params)
  context.allEvents = events
  const results = []
  
  let currentNetWorth = 0
  
  for (let age = context.startAge; age <= context.endAge; age++) {
    const yearContext = context.clone()
    
    // Get all events sorted by priority
    const sortedEvents = getSortedEventsByPriority(events)
    
    // Phase 1: Before Year Calculation
    sortedEvents.forEach(event => {
      if (event.age <= age) {
        const handler = eventRegistry.getHandler(event.type)
        if (handler) {
          currentNetWorth = handler.beforeYearCalculation(
            age, 
            currentNetWorth, 
            events, 
            yearContext
          )
        }
      }
    })
    
    // Phase 2A: Immediate Impacts - BEFORE GROWTH
    const beforeGrowthEvents = sortedEvents.filter(e => {
      if (e.age !== age) return false
      const handler = eventRegistry.getHandler(e.type)
      if (!handler) return false
      const config = handler.getCalculationConfig()
      return config.immediateImpact && config.impactTiming === 'before-growth'
    })

    beforeGrowthEvents.forEach(event => {
      const handler = eventRegistry.getHandler(event.type)
      handler.modifyContext(yearContext, event, age)
      currentNetWorth = handler.calculateImmediateImpact(
        currentNetWorth,
        event,
        age,
        events,
        yearContext
      )
    })
    
    // Phase 2B: Immediate Impacts - IMMEDIATE (default timing)
    const immediateEvents = sortedEvents.filter(e => {
      if (e.age !== age) return false
      const handler = eventRegistry.getHandler(e.type)
      if (!handler) return false
      const config = handler.getCalculationConfig()
      return config.immediateImpact && config.impactTiming === 'immediate'
    })

    immediateEvents.forEach(event => {
      const handler = eventRegistry.getHandler(event.type)
      handler.modifyContext(yearContext, event, age)
      currentNetWorth = handler.calculateImmediateImpact(
        currentNetWorth,
        event,
        age,
        events,
        yearContext
      )
    })
    
    // Phase 3: Yearly Growth Contributions
    let totalGrowth = 0
    
    sortedEvents.forEach(event => {
      if (event.age <= age) {
        const handler = eventRegistry.getHandler(event.type)
        if (handler) {
          const config = handler.getCalculationConfig()
          if (config.affectsGrowth) {
            totalGrowth += handler.contributeToYearlyGrowth(
              currentNetWorth,
              event,
              age,
              yearContext
            )
          }
        }
      }
    })
    
    currentNetWorth += totalGrowth
    
    // Phase 4: Immediate Impacts - AFTER GROWTH
    const afterGrowthEvents = sortedEvents.filter(e => {
      if (e.age !== age) return false
      const handler = eventRegistry.getHandler(e.type)
      if (!handler) return false
      const config = handler.getCalculationConfig()
      return config.immediateImpact && config.impactTiming === 'after-growth'
    })
    
    afterGrowthEvents.forEach(event => {
      const handler = eventRegistry.getHandler(event.type)
      handler.modifyContext(yearContext, event, age)
      currentNetWorth = handler.calculateImmediateImpact(
        currentNetWorth,
        event,
        age,
        events,
        yearContext
      )
    })
    
    // Phase 5: Ongoing Impacts
    sortedEvents.forEach(event => {
      if (event.age < age) {
        const handler = eventRegistry.getHandler(event.type)
        if (handler) {
          const config = handler.getCalculationConfig()
          if (config.ongoingImpact) {
            currentNetWorth = handler.calculateOngoingImpact(
              currentNetWorth,
              event,
              age,
              events,
              yearContext
            )
          }
        }
      }
    })
    
    // Phase 6: After Year Calculation
    sortedEvents.forEach(event => {
      if (event.age <= age) {
        const handler = eventRegistry.getHandler(event.type)
        if (handler) {
          currentNetWorth = handler.afterYearCalculation(
            age,
            currentNetWorth,
            events,
            yearContext
          )
        }
      }
    })
    
    results.push({
      age,
      netWorth: currentNetWorth
    })
  }
  
  return results
}

function getSortedEventsByPriority(events) {
  return [...events].sort((a, b) => {
    const handlerA = eventRegistry.getHandler(a.type)
    const handlerB = eventRegistry.getHandler(b.type)
    const priorityA = handlerA ? handlerA.getPriority() : 100
    const priorityB = handlerB ? handlerB.getPriority() : 100
    return priorityB - priorityA
  })
}
