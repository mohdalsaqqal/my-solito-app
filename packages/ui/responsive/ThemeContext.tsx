import { createContext, useContext, useMemo } from 'react'
import { colors, colorsDark } from '@real/tokens'

type ThemeMode = 'light' | 'dark'

export type ColorMap = typeof colors

type ThemeContextValue = {
  mode: ThemeMode
  colors: ColorMap
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  colors: colors as ColorMap,
})

export function ThemeProvider({
  mode = 'light',
  children,
}: {
  mode?: ThemeMode
  children: React.ReactNode
}) {
  const resolvedColors = (mode === 'dark' ? colorsDark : colors) as ColorMap

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, colors: resolvedColors }),
    [mode, resolvedColors],
  )

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Returns the active color token map based on the current theme.
 *
 * Usage:
 *   const c = useThemeColors()
 *   <Box style={{ backgroundColor: c.surface }} />
 *
 * Falls back to light-mode colors if no ThemeProvider is present.
 */
export function useThemeColors(): ColorMap {
  const ctx = useContext(ThemeContext)
  return ctx.colors
}

/**
 * Returns true when the active theme is dark.
 */
export function useIsDark(): boolean {
  const ctx = useContext(ThemeContext)
  return ctx.mode === 'dark'
}
