import { BaseEventHandler } from '../BaseEventHandler';

export class CarPurchaseHandler extends BaseEventHandler {
  constructor(config) {
    super(config);

    this.calculationConfig = {
      immediateImpact: true,
      ongoingImpact: true,
      affectsGrowth: false,
      impactTiming: 'immediate',
      includeInGrowthBase: true,
      priority: 300,
    };
  }

  calculateImmediateImpact(netWorth, eventData) {
    const { downPayment } = eventData.params;
    return netWorth - downPayment;
  }

  calculateOngoingImpact(netWorth, eventData, currentAge) {
    const { loanAmount, loanTerm, interestRate, depreciationRate, purchasePrice } = eventData.params;
    const annualInsurance = eventData.params.insuranceCost || (eventData.params.monthlyInsuranceCost * 12) || 0;
    const annualMaintenance = eventData.params.maintenanceCost || (eventData.params.monthlyMaintenanceCost * 12) || 0;
    const yearsSincePurchase = currentAge - eventData.age;

    if (yearsSincePurchase > loanTerm) {
      // After loan is paid off
      const carValue = purchasePrice * Math.pow(1 - depreciationRate / 100, yearsSincePurchase);
      return netWorth - annualInsurance - annualMaintenance + (carValue - (purchasePrice * Math.pow(1 - depreciationRate / 100, yearsSincePurchase -1)));
    }

    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    const monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    const annualPayment = monthlyPayment * 12;

    const carValue = purchasePrice * Math.pow(1 - depreciationRate / 100, yearsSincePurchase);

    return netWorth - annualPayment - annualInsurance - annualMaintenance + (carValue - (purchasePrice * Math.pow(1 - depreciationRate / 100, yearsSincePurchase -1)));
  }

  getHoverStats(eventData, age) {
    const yearsSince = Math.max(0, age - eventData.age);
    const currentValue = eventData.params.purchasePrice * Math.pow(1 - (eventData.params.depreciationRate || 15) / 100, yearsSince);

    return {
      'Purchase Price': eventData.params.purchasePrice,
      'Current Value': currentValue,
      'Depreciation Rate': `${eventData.params.depreciationRate}%/year`,
      'Years Owned': yearsSince,
    };
  }
}

export const carPurchaseConfig = {
  type: 'car-purchase',
  label: 'Car Purchase',
  icon: '🚗',
  color: '#9333ea',
  fields: [
    { name: 'purchasePrice', label: 'Purchase Price', type: 'currency', default: 25000 },
    { name: 'downPayment', label: 'Down Payment', type: 'currency', default: 5000 },
    { name: 'loanAmount', label: 'Loan Amount', type: 'currency', default: 20000 },
    { name: 'loanTerm', label: 'Loan Term (years)', type: 'number', default: 5 },
    { name: 'interestRate', label: 'Interest Rate (%)', type: 'percentage', default: 4 },
    { name: 'insuranceCost', label: 'Annual Insurance Cost', type: 'currency', default: 1500 },
    { name: 'monthlyInsuranceCost', label: 'Monthly Insurance Cost', type: 'currency', default: 125 },
    { name: 'maintenanceCost', label: 'Annual Maintenance Cost', type: 'currency', default: 500 },
    { name: 'monthlyMaintenanceCost', label: 'Monthly Maintenance Cost', type: 'currency', default: 42 },
    { name: 'depreciationRate', label: 'Depreciation Rate (%/year)', type: 'percentage', default: 15 },
  ],
};
