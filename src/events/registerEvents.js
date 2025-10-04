import { eventRegistry } from './EventRegistry'
import { FinancialPhaseHandler, financialPhaseConfig } from './handlers/FinancialPhaseHandler'
import { IncomePulseHandler, incomePulseConfig } from './handlers/IncomePulseHandler'
import { HouseHandler, houseConfig } from './handlers/HouseHandler'

// Register all event handlers
export function registerAllEvents() {
  eventRegistry.register(
    financialPhaseConfig.type,
    new FinancialPhaseHandler(financialPhaseConfig)
  )
  
  eventRegistry.register(
    incomePulseConfig.type,
    new IncomePulseHandler(incomePulseConfig)
  )
  
  eventRegistry.register(
    houseConfig.type,
    new HouseHandler(houseConfig)
  )

  // TODO: Register other event types here
  // eventRegistry.register('investment', new InvestmentHandler(investmentConfig))
  // eventRegistry.register('goal', new GoalHandler(goalConfig))
  // eventRegistry.register('expense', new ExpenseHandler(expenseConfig))
}

// Export all configs for use in components
export function getAllEventConfigs() {
  return Array.from(eventRegistry.handlers.values()).map(handler => handler.config)
}
