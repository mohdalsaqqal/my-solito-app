import commonEn from './locales/en/common.json'
import navigationEn from './locales/en/navigation.json'
import productEn from './locales/en/product.json'
import cartEn from './locales/en/cart.json'
import checkoutEn from './locales/en/checkout.json'
import ordersEn from './locales/en/orders.json'
import accountEn from './locales/en/account.json'
import authEn from './locales/en/auth.json'
import adminEn from './locales/en/admin.json'
import errorsEn from './locales/en/errors.json'
import validationEn from './locales/en/validation.json'

import commonAr from './locales/ar/common.json'
import navigationAr from './locales/ar/navigation.json'
import productAr from './locales/ar/product.json'
import cartAr from './locales/ar/cart.json'
import checkoutAr from './locales/ar/checkout.json'
import ordersAr from './locales/ar/orders.json'
import accountAr from './locales/ar/account.json'
import authAr from './locales/ar/auth.json'
import adminAr from './locales/ar/admin.json'
import errorsAr from './locales/ar/errors.json'
import validationAr from './locales/ar/validation.json'

export const resources = {
  en: {
    common: commonEn,
    navigation: navigationEn,
    product: productEn,
    cart: cartEn,
    checkout: checkoutEn,
    orders: ordersEn,
    account: accountEn,
    auth: authEn,
    admin: adminEn,
    errors: errorsEn,
    validation: validationEn,
  },
  ar: {
    common: commonAr,
    navigation: navigationAr,
    product: productAr,
    cart: cartAr,
    checkout: checkoutAr,
    orders: ordersAr,
    account: accountAr,
    auth: authAr,
    admin: adminAr,
    errors: errorsAr,
    validation: validationAr,
  },
} as const
