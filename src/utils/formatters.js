export const CURRENCIES = {
  USD: { symbol: '$', code: 'USD', locale: 'en-US' },
  EUR: { symbol: '€', code: 'EUR', locale: 'de-DE' },
  GBP: { symbol: '£', code: 'GBP', locale: 'en-GB' },
  BRL: { symbol: 'R$', code: 'BRL', locale: 'pt-BR' }
}

export function formatCurrency(value, currencyCode = 'USD', compact = true) {
  const currency = CURRENCIES[currencyCode]
  
  if (compact && Math.abs(value) >= 1000) {
    // Format as $100K style
    if (Math.abs(value) >= 1000000) {
      return `${currency.symbol}${(value / 1000000).toFixed(1)}M`
    }
    return `${currency.symbol}${(value / 1000).toFixed(0)}K`
  }
  
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}
