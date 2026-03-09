import type { AppLocale } from './config'

function resolveIntlLocale(locale: AppLocale): string {
  return locale === 'ar' ? 'ar-JO' : 'en-US'
}

export function formatPrice(value: number, currency: string, locale: AppLocale) {
  return new Intl.NumberFormat(resolveIntlLocale(locale), {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatDate(value: string | number | Date, locale: AppLocale, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(resolveIntlLocale(locale), options).format(new Date(value))
}

export function formatNumber(value: number, locale: AppLocale, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(resolveIntlLocale(locale), options).format(value)
}

export function formatPercentage(value: number, locale: AppLocale, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(resolveIntlLocale(locale), {
    style: 'percent',
    maximumFractionDigits: 2,
    ...options,
  }).format(value)
}
