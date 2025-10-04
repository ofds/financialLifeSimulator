// Field dependency and validation rules
export const fieldRules = {
  'annualIncome': {
    linkedFields: ['monthlyIncome'],
    calculateLinked: (value) => ({
      monthlyIncome: Math.round(value / 12)
    })
  },
  'monthlyIncome': {
    linkedFields: ['annualIncome'],
    calculateLinked: (value) => ({
      annualIncome: Math.round(value * 12)
    })
  }
}

export function applyFieldRules(fieldName, value, currentData) {
  const rule = fieldRules[fieldName]
  
  if (!rule) {
    return { [fieldName]: value }
  }
  
  const updates = { [fieldName]: value }
  
  if (rule.linkedFields && rule.calculateLinked) {
    const linkedValues = rule.calculateLinked(value)
    Object.assign(updates, linkedValues)
  }
  
  return updates
}
