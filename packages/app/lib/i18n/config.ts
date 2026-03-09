export const supportedLocales = ['en', 'ar'] as const
export type AppLocale = (typeof supportedLocales)[number]

export const defaultLocale: AppLocale = 'en'

export const namespaces = [
  'common',
  'navigation',
  'product',
  'cart',
  'checkout',
  'orders',
  'account',
  'auth',
  'admin',
  'errors',
  'validation',
] as const

export type AppNamespace = (typeof namespaces)[number]
