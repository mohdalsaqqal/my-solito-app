import { useCallback, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFonts } from 'expo-font'
import {
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans'
import {
  Tajawal_300Light,
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
} from '@expo-google-fonts/tajawal'
import {
  getCurrentLocale,
  initI18n,
  setCurrentLocale,
} from '@real/app/lib/i18n/client'
import { syncNativeRtlDirection } from '@real/app/lib/rtl-manager'

const LOCALE_STORAGE_KEY = 'rc_locale'

export type AppLocale = 'en' | 'ar'

export function useAppBootstrap() {
  const [fontsLoaded] = useFonts({
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Tajawal_300Light,
    Tajawal_400Regular,
    Tajawal_500Medium,
    Tajawal_700Bold,
  })

  const [locale, setLocale] = useState<AppLocale>(getCurrentLocale())

  const applyLocale = useCallback(async (nextLocale: AppLocale) => {
    setCurrentLocale(nextLocale)
    await initI18n(nextLocale)
    await AsyncStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
    syncNativeRtlDirection(nextLocale)
  }, [])

  useEffect(() => {
    let active = true

    const hydrateLocale = async () => {
      const stored = await AsyncStorage.getItem(LOCALE_STORAGE_KEY)
      if (!active || (stored !== 'en' && stored !== 'ar')) {
        await initI18n(locale)
        return
      }
      if (stored !== locale) {
        setLocale(stored)
      }
      await applyLocale(stored)
    }

    void hydrateLocale()

    return () => {
      active = false
    }
  }, [applyLocale, locale])

  const onLocaleChange = useCallback(
    (nextLocale: AppLocale) => {
      setLocale(nextLocale)
      void applyLocale(nextLocale)
    },
    [applyLocale],
  )

  return { fontsLoaded, locale, onLocaleChange }
}
