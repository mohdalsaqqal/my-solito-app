import { PropsWithChildren, ReactNode, createContext, useContext } from 'react'
import { Platform, ScrollView, View } from 'react-native'
import { colors, layout } from '@real/tokens'
import { Container } from './Container'

type Variant = 'editorial' | 'commerce' | 'product' | 'cart' | 'checkout' | 'account' | 'dashboard'
type Density = 'tight' | 'standard' | 'roomy'
type Surface = 'default' | 'subtle' | 'elevated'
type ScrollMode = 'auto' | 'scroll' | 'none'
type SafeAreaMode = 'auto' | 'on' | 'off'
type ContentContainer = 'center' | 'full'

type PageScaffoldProps = PropsWithChildren<{
  variant: Variant
  density?: Density
  surface?: Surface
  chrome?: 'auto' | 'none'
  scroll?: ScrollMode
  safeArea?: SafeAreaMode
  contentContainer?: ContentContainer
  testID?: string
}>

type PageScaffoldContextValue = {
  variant: Variant
  density: Density
  maxWidthPx: number
  gutterX: number
  sectionY: number
  safeBottom: number
  contentContainer: ContentContainer
}

const PageScaffoldContext = createContext<PageScaffoldContextValue | null>(null)

export function usePageScaffold() {
  const value = useContext(PageScaffoldContext)
  if (!value) {
    throw new Error('usePageScaffold must be used within <PageScaffold />')
  }
  return value
}

function resolveDensity(density: Density) {
  if (density === 'tight') {
    return {
      gutterX: layout.gutterX.sm,
      sectionY: layout.sectionY.tight,
      safeBottom: layout.safeBottom.normal,
    }
  }
  if (density === 'roomy') {
    return {
      gutterX: layout.gutterX.lg,
      sectionY: layout.sectionY.roomy,
      safeBottom: layout.safeBottom.roomy,
    }
  }
  return {
    gutterX: layout.gutterX.md,
    sectionY: layout.sectionY.normal,
    safeBottom: layout.safeBottom.normal,
  }
}

function resolveMaxWidth(variant: Variant) {
  if (variant === 'checkout') return layout.maxWidth.checkout
  if (variant === 'account') return layout.maxWidth.account
  if (variant === 'cart') return layout.maxWidth.cart
  if (variant === 'dashboard') return layout.maxWidth.dashboard
  if (variant === 'product') return layout.maxWidth.product
  if (variant === 'commerce') return layout.maxWidth.commerce
  return layout.maxWidth.editorial
}

function resolveSurfaceColor(surface: Surface) {
  if (surface === 'subtle') return colors.backgroundSecondary
  if (surface === 'elevated') return colors.surfaceMuted
  return colors.background
}

function HeaderSlot({ children }: { children: ReactNode }) {
  const { sectionY } = usePageScaffold()
  return <View style={{ paddingTop: sectionY, paddingBottom: sectionY }}>{children}</View>
}

function BodySlot({ children }: { children: ReactNode }) {
  return <View style={{ width: '100%' }}>{children}</View>
}

function FooterSlot({ children }: { children: ReactNode }) {
  const { sectionY } = usePageScaffold()
  return <View style={{ paddingTop: sectionY, paddingBottom: sectionY }}>{children}</View>
}

type PageScaffoldCompound = typeof PageScaffoldBase & {
  Header: typeof HeaderSlot
  Body: typeof BodySlot
  Footer: typeof FooterSlot
}

const PageScaffoldBase = ({
  variant,
  density = 'standard',
  surface = 'default',
  scroll = 'auto',
  safeArea = 'auto',
  contentContainer = 'center',
  children,
  testID,
}: PageScaffoldProps) => {
  const maxWidthPx = resolveMaxWidth(variant)
  const densityValues = resolveDensity(density)
  const shouldScroll = scroll === 'scroll' ? true : scroll === 'none' ? false : Platform.OS !== 'web'
  const safeBottom =
    safeArea === 'off'
      ? layout.safeBottom.none
      : safeArea === 'on'
      ? densityValues.safeBottom
      : Platform.OS === 'web'
      ? layout.safeBottom.none
      : densityValues.safeBottom

  const contextValue: PageScaffoldContextValue = {
    variant,
    density,
    maxWidthPx,
    gutterX: densityValues.gutterX,
    sectionY: densityValues.sectionY,
    safeBottom,
    contentContainer,
  }

  const inner = (
    <View
      style={{
        width: '100%',
        alignItems: contentContainer === 'center' ? 'center' : 'stretch',
        backgroundColor: resolveSurfaceColor(surface),
      }}
    >
      <View style={{ width: '100%' }}>
        <Container
          variant={variant}
          centered={contentContainer === 'center'}
          gutter={density === 'tight' ? 'sm' : density === 'roomy' ? 'lg' : 'md'}
        >
        {children}
        </Container>
      </View>
    </View>
  )

  if (shouldScroll) {
    return (
      <PageScaffoldContext.Provider value={contextValue}>
        <ScrollView
          testID={testID}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: safeBottom }}
          style={{ flex: 1, backgroundColor: resolveSurfaceColor(surface) }}
        >
          {inner}
        </ScrollView>
      </PageScaffoldContext.Provider>
    )
  }

  return (
    <PageScaffoldContext.Provider value={contextValue}>
      <View testID={testID} style={{ flex: 1, paddingBottom: safeBottom, backgroundColor: resolveSurfaceColor(surface) }}>
        {inner}
      </View>
    </PageScaffoldContext.Provider>
  )
}

export const PageScaffold = PageScaffoldBase as PageScaffoldCompound
PageScaffold.Header = HeaderSlot
PageScaffold.Body = BodySlot
PageScaffold.Footer = FooterSlot
