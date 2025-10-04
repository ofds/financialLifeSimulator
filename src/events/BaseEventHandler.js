// Fully modular base class with calculation configuration
export class BaseEventHandler {
  constructor(config) {
    this.config = config
    
    // Calculation behavior configuration
    this.calculationConfig = {
      // When should this event's impact be calculated?
      immediateImpact: true,        // Apply on placement year
      ongoingImpact: false,          // Apply every year after
      affectsGrowth: false,          // Contributes to yearly growth
      
      // In what order should calculations happen?
      impactTiming: 'immediate',     // 'immediate' | 'before-growth' | 'after-growth'
      
      // Should this event affect the net worth used for growth calculations?
      includeInGrowthBase: true,     // If true, this event's impact is included before growth calc
      
      // Priority for execution order
      priority: 100
    }
  }

  // Get calculation configuration
  getCalculationConfig() {
    return this.calculationConfig
  }

  getPriority() {
    return this.calculationConfig.priority
  }

  // Check if this event can coexist with another
  canCoexistWith(otherEvent) {
    return true
  }

  // Called before any calculations for this year
  beforeYearCalculation(age, netWorth, allEvents, context) {
    return netWorth
  }

  // Calculate immediate one-time impact when event is placed
  calculateImmediateImpact(netWorth, eventData, age, allEvents, context) {
    return netWorth
  }

  // Calculate recurring impact for years after the event
  calculateOngoingImpact(netWorth, eventData, currentAge, allEvents, context) {
    return netWorth
  }

  // Called after all calculations for this year
  afterYearCalculation(age, netWorth, allEvents, context) {
    return netWorth
  }

  // Allow event to contribute to yearly growth
  contributeToYearlyGrowth(netWorth, eventData, currentAge, context) {
    return 0
  }

  // Modify calculation context (for events that affect other events)
  modifyContext(context, eventData, currentAge) {
    return context
  }

  // Validate if event can be placed at this age
  validate(age, allEvents) {
    return { valid: true }
  }

  // Generate hover statistics
  getHoverStats(eventData, age, t) {
    return {}
  }
}
