import { BaseEventHandler } from '../BaseEventHandler';

export class StudentLoanHandler extends BaseEventHandler {
  constructor(config) {
    super(config);

    this.calculationConfig = {
      immediateImpact: true,
      ongoingImpact: true,
      affectsGrowth: false,
      impactTiming: 'immediate',
      priority: 450,
    };
  }

  calculateImmediateImpact(netWorth, eventData) {
    return netWorth - eventData.params.loanAmount;
  }

  calculateOngoingImpact(netWorth, eventData, currentAge) {
    const { repaymentTerm, monthlyPayment } = eventData.params;
    const yearsSinceStart = currentAge - eventData.age;

    if (yearsSinceStart > repaymentTerm) {
      return netWorth;
    }

    return netWorth - monthlyPayment * 12;
  }

  getHoverStats(eventData, age) {
    const { loanAmount, interestRate, repaymentTerm, monthlyPayment } = eventData.params;
    const yearsSinceStart = Math.max(0, age - eventData.age);
    const totalPaid = monthlyPayment * 12 * yearsSinceStart;
    const remainingBalance = loanAmount * Math.pow(1 + interestRate / 100, yearsSinceStart) - totalPaid;

    return {
      'Loan Amount': loanAmount,
      'Interest Rate': `${interestRate}%`,
      'Monthly Payment': monthlyPayment,
      'Remaining Balance': remainingBalance > 0 ? remainingBalance : 0,
      'Years Left': repaymentTerm - yearsSinceStart > 0 ? repaymentTerm - yearsSinceStart : 0,
    };
  }
}

export const studentLoanConfig = {
  type: 'student-loan',
  label: 'event.student-loan.label',
  icon: '🎓',
  color: '#10b981',
  fields: [
    { name: 'loanAmount', label: 'event.student-loan.field.loanAmount.label', type: 'currency', default: 40000 },
    { name: 'interestRate', label: 'event.student-loan.field.interestRate.label', type: 'percentage', default: 5 },
    { name: 'repaymentTerm', label: 'event.student-loan.field.repaymentTerm.label', type: 'number', default: 10 },
    { name: 'monthlyPayment', label: 'event.student-loan.field.monthlyPayment.label', type: 'currency', default: 424 },
  ],
};
