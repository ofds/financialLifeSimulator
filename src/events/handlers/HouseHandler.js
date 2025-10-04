import { BaseEventHandler } from '../BaseEventHandler'

export class HouseHandler extends BaseEventHandler {
  constructor(config) {
    super(config)
    
    this.calculationConfig = {
      immediateImpact: true,
      ongoingImpact: true,
      affectsGrowth: false,
      impactTiming: 'immediate',
      includeInGrowthBase: true,
      priority: 300
    }
  }

  getCalculationConfig() {
    return this.calculationConfig
  }

  calculateImmediateImpact(netWorth, eventData, age, allEvents, context) {
    const downPaymentPercent = (eventData.params.downPayment || 20) / 100
    const purchasePrice = eventData.params.purchasePrice || 0
    const downPayment = purchasePrice * downPaymentPercent
    return netWorth - downPayment
  }

  calculateOngoingImpact(netWorth, eventData, currentAge, context) {
    const appreciationRate = (eventData.params.appreciationRate || 3) / 100
    const purchasePrice = eventData.params.purchasePrice || 0
    const appreciation = purchasePrice * appreciationRate
    
    const maintenance = eventData.params.maintenanceCost || 0
    const propertyTax = eventData.params.propertyTax || 0
    
    return netWorth + appreciation - maintenance - propertyTax
  }

  getHoverStats(eventData, age) {
    const yearsSince = Math.max(0, age - eventData.age)
    const currentValue = eventData.params.purchasePrice * Math.pow(
      1 + (eventData.params.appreciationRate || 3) / 100,
      yearsSince
    )
    
    return {
      'Purchase Price': eventData.params.purchasePrice,
      'Current Value': currentValue,
      'Appreciation Rate': `${eventData.params.appreciationRate}%/year`,
      'Years Owned': yearsSince
    }
  }
}

export const houseConfig = {
  type: 'house',
  label: 'House Purchase',
  icon: '🏠',
  color: '#f59e0b',
  fields: [
    { name: 'purchasePrice', label: 'Purchase Price', type: 'currency', default: 300000 },
    { name: 'downPayment', label: 'Down Payment (%)', type: 'percentage', default: 20 },
    { name: 'mortgageRate', label: 'Mortgage Interest Rate (%)', type: 'percentage', default: 4.5 },
    { name: 'mortgageTerm', label: 'Mortgage Term (years)', type: 'number', default: 30 },
    { name: 'appreciationRate', label: 'Appreciation Rate (%/year)', type: 'percentage', default: 3 },
    { name: 'maintenanceCost', label: 'Annual Maintenance Cost', type: 'currency', default: 3000 },
    { name: 'propertyTax', label: 'Annual Property Tax', type: 'currency', default: 2000 }
  ]
}
