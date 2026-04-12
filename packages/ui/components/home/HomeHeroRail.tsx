import { useEffect, useMemo, useRef, useState } from 'react'
import { Platform, ScrollView, useWindowDimensions } from 'react-native'
import { spacing } from '@real/tokens'
import { Box } from '../../primitives'
import { HeroCarouselControls } from '../HeroCarouselControls'
import { HeroSlideCard } from '../HeroSlideCard'
import { HomeHeroItem } from './types'

type HomeHeroRailProps = {
  items: HomeHeroItem[]
  autoplay?: boolean
  autoplayMs?: number
  onPressItem?: (href?: string) => void
}

const HERO_GAP = spacing.md

export function HomeHeroRail({
  items,
  autoplay = true,
  autoplayMs = 3500,
  onPressItem,
}: HomeHeroRailProps) {
  const { width } = useWindowDimensions()
  const scrollRef = useRef<ScrollView | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [showNavControls, setShowNavControls] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)
  const isDesktop = width >= 1025 || (Platform.OS === 'web' && width === 0)
  const viewportWidth = Math.max(320, width - spacing.pageX * 2)
  const cardsInViewport = isDesktop ? 2.8 : 1.08
  const cardWidth = useMemo(
    () => Math.max(spacing.xxl * 3, (viewportWidth - HERO_GAP * 3) / cardsInViewport),
    [cardsInViewport, viewportWidth]
  )
  const stepWidth = cardWidth + HERO_GAP

  const scrollToIndex = (index: number) => {
    const maxIndex = Math.max(0, items.length - 1)
    const next = Math.min(Math.max(index, 0), maxIndex)
    setActiveIndex(next)
    scrollRef.current?.scrollTo({
      x: next * stepWidth,
      animated: true,
    })
  }

  useEffect(() => {
    if (!autoplay || items.length < 2 || isInteracting) {
      return
    }
    const timer = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % items.length
        scrollRef.current?.scrollTo({
          x: next * stepWidth,
          animated: true,
        })
        return next
      })
    }, Math.max(1800, autoplayMs))
    return () => clearInterval(timer)
  }, [autoplay, autoplayMs, isInteracting, items.length, stepWidth])

  if (items.length === 0) {
    return null
  }

  return (
    <Box
      style={{ gap: spacing.sm, position: 'relative' }}
      onPointerEnter={
        isDesktop
          ? () => {
              setShowNavControls(true)
              setIsInteracting(true)
            }
          : undefined
      }
      onPointerLeave={
        isDesktop
          ? () => {
              setShowNavControls(false)
              setIsInteracting(false)
            }
          : undefined
      }
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        snapToInterval={stepWidth}
        decelerationRate='fast'
        snapToAlignment='start'
        contentContainerStyle={{ gap: HERO_GAP, paddingEnd: HERO_GAP }}
        onScrollBeginDrag={() => setIsInteracting(true)}
        onMomentumScrollEnd={(event) => {
          const offsetX = event.nativeEvent.contentOffset?.x ?? 0
          const next = Math.round(offsetX / stepWidth)
          if (!Number.isNaN(next)) {
            setActiveIndex(Math.max(0, next))
          }
          if (!showNavControls) {
            setIsInteracting(false)
          }
        }}
      >
        {items.map((item) => (
          <Box key={item.id} role='group' aria-roledescription='slide'>
            <HeroSlideCard
              item={item}
              width={cardWidth}
              imageAspectRatio={3 / 2}
              onPress={onPressItem}
            />
          </Box>
        ))}
      </ScrollView>
      {isDesktop && showNavControls ? (
        <HeroCarouselControls
          activeIndex={activeIndex}
          totalItems={items.length}
          onPrev={() => scrollToIndex(activeIndex - 1)}
          onNext={() => scrollToIndex(activeIndex + 1)}
          top={spacing['96']}
          edgeOffset={spacing.xs}
          buttonRadius='full'
        />
      ) : null}
    </Box>
  )
}
