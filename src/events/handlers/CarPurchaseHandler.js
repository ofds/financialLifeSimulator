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

  getHoverStats(eventData, age, t) {
    const yearsSince = Math.max(0, age - eventData.age);
    const currentValue = eventData.params.purchasePrice * Math.pow(1 - (eventData.params.depreciationRate || 15) / 100, yearsSince);

    return {
      [t('hoverStats.carPurchase.purchasePrice')]: eventData.params.purchasePrice,
      [t('hoverStats.carPurchase.currentValue')]: currentValue,
      [t('hoverStats.carPurchase.depreciationRate')]: `${eventData.params.depreciationRate}%/year`,
      [t('hoverStats.carPurchase.yearsOwned')]: yearsSince,
    };
  }
}

export const carPurchaseConfig = {
  type: 'car-purchase',
  label: 'event.car-purchase.label',
  icon: '🚗',
  color: '#9333ea',
  fields: [
    { name: 'purchasePrice', label: 'event.car-purchase.field.purchasePrice.label', type: 'currency', default: 25000 },
    { name: 'downPayment', label: 'event.car-purchase.field.downPayment.label', type: 'currency', default: 5000 },
    { name: 'loanAmount', label: 'event.car-purchase.field.loanAmount.label', type: 'currency', default: 20000 },
    { name: 'loanTerm', label: 'event.car-purchase.field.loanTerm.label', type: 'number', default: 5 },
    { name: 'interestRate', label: 'event.car-purchase.field.interestRate.label', type: 'percentage', default: 4 },
    { name: 'insuranceCost', label: 'event.car-purchase.field.insuranceCost.label', type: 'currency', default: 1500 },
    { name: 'monthlyInsuranceCost', label: 'event.car-purchase.field.monthlyInsuranceCost.label', type: 'currency', default: 125 },
    { name: 'maintenanceCost', label: 'event.car-purchase.field.maintenanceCost.label', type: 'currency', default: 500 },
    { name: 'monthlyMaintenanceCost', label: 'event.car-purchase.field.monthlyMaintenanceCost.label', type: 'currency', default: 42 },
    { name: 'depreciationRate', label: 'event.car-purchase.field.depreciationRate.label', type: 'percentage', default: 15 },
  ],
};
