import { eventRegistry } from '../events/EventRegistry'

// Legacy export for backward compatibility
export const EVENT_TYPES = {
  FINANCIAL_PHASE: 'financial-phase',
  GOAL: 'goal',
  HOUSE: 'house',
  OUTSTANDING_INCOME: 'outstanding-income',
  INVESTMENT: 'investment',
  EXPENSE: 'expense'
}

// Dynamic getter for configs from registry
export const EVENT_CONFIGS = new Proxy({}, {
  get(target, prop) {
    const handler = eventRegistry.getHandler(prop)
    return handler ? handler.config : undefined
  },
  has(target, prop) {
    return eventRegistry.getHandler(prop) !== undefined
  },
  ownKeys() {
    return Array.from(eventRegistry.handlers.keys())
  },
  getOwnPropertyDescriptor(target, prop) {
    if (eventRegistry.getHandler(prop)) {
      return {
        enumerable: true,
        configurable: true
      }
    }
  }
})
