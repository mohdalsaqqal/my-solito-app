import { I18nManager } from 'react-native'

export type FontWeight = 'light' | 'regular' | 'medium' | 'bold'

const DM_SANS: Record<FontWeight, string> = {
  light: 'DMSans_300Light',
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  bold: 'DMSans_700Bold',
}

const TAJAWAL: Record<FontWeight, string> = {
  light: 'Tajawal_300Light',
  regular: 'Tajawal_400Regular',
  medium: 'Tajawal_500Medium',
  bold: 'Tajawal_700Bold',
}

export function useFontFamily(weight: FontWeight = 'regular'): string {
  return I18nManager.isRTL ? TAJAWAL[weight] : DM_SANS[weight]
}
