import { eventRegistry } from './EventRegistry'
import { FinancialPhaseHandler, financialPhaseConfig } from './handlers/FinancialPhaseHandler'
import { IncomePulseHandler, incomePulseConfig } from './handlers/IncomePulseHandler'
import { HouseHandler, houseConfig } from './handlers/HouseHandler';
import { LargeExpenseHandler, largeExpenseConfig } from './handlers/LargeExpenseHandler';
import { RecurringExpenseHandler, recurringExpenseConfig } from './handlers/RecurringExpenseHandler';
import { CarPurchaseHandler, carPurchaseConfig } from './handlers/CarPurchaseHandler';
import { StudentLoanHandler, studentLoanConfig } from './handlers/StudentLoanHandler';
import { InvestmentHandler, investmentConfig } from './handlers/InvestmentHandler';
import { SideHustleHandler, sideHustleConfig } from './handlers/SideHustleHandler';
import { MarketEventHandler, marketEventConfig } from './handlers/MarketEventHandler';
import { RetirementHandler, retirementConfig } from './handlers/RetirementHandler';

// Register all event handlers
export function registerAllEvents() {
  eventRegistry.handlers.clear(); // Clear existing handlers
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

  eventRegistry.register(
    largeExpenseConfig.type,
    new LargeExpenseHandler(largeExpenseConfig)
  );

  eventRegistry.register(
    recurringExpenseConfig.type,
    new RecurringExpenseHandler(recurringExpenseConfig)
  );

  eventRegistry.register(
    carPurchaseConfig.type,
    new CarPurchaseHandler(carPurchaseConfig)
  );

  eventRegistry.register(
    studentLoanConfig.type,
    new StudentLoanHandler(studentLoanConfig)
  );

  eventRegistry.register(
    investmentConfig.type,
    new InvestmentHandler(investmentConfig)
  );

  eventRegistry.register(
    sideHustleConfig.type,
    new SideHustleHandler(sideHustleConfig)
  );

  eventRegistry.register(
    marketEventConfig.type,
    new MarketEventHandler(marketEventConfig)
  );

  eventRegistry.register(
    retirementConfig.type,
    new RetirementHandler(retirementConfig)
  );

  // TODO: Register other event types here
  // eventRegistry.register('investment', new InvestmentHandler(investmentConfig))
  // eventRegistry.register('goal', new GoalHandler(goalConfig))
  // eventRegistry.register('expense', new ExpenseHandler(expenseConfig))
}

// Export all configs for use in components
export function getAllEventConfigs() {
  return Array.from(eventRegistry.handlers.values()).map(handler => handler.config)
}
