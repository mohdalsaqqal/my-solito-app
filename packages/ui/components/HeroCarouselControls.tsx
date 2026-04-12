import React from 'react'
import { colors, radius, spacing } from '@real/tokens'
import { Box } from '../primitives'
import { IconButton } from './IconButton'
import { Button as ReusableButton } from '../reusables/button'
import { useThemeColors } from '../responsive'

type HeroCarouselControlsProps = {
  activeIndex: number
  totalItems: number
  onPrev: () => void
  onNext: () => void
  onSelect?: (index: number) => void
  showArrows?: boolean
  showDots?: boolean
  top?: number
  edgeOffset?: number
  buttonRadius?: 'xs' | 'full'
}

export const HeroCarouselControls = React.memo(function HeroCarouselControls({
  activeIndex,
  totalItems,
  onPrev,
  onNext,
  onSelect,
  showArrows = true,
  showDots = true,
  top = spacing['40'] * 3,
  edgeOffset = spacing.xs,
  buttonRadius: _buttonRadius = 'full',
}: HeroCarouselControlsProps) {
  const c = useThemeColors()
  if (totalItems <= 1) {
    return null
  }

  return (
    <>
      {showArrows ? (
        <>
          <Box style={{ position: 'absolute', start: edgeOffset, top }}>
            <IconButton
              icon='caretLeft'
              label='Previous slide'
              onPress={onPrev}
              disabled={activeIndex <= 0}
              tone='soft'
              size='md'
            />
          </Box>

          <Box style={{ position: 'absolute', end: edgeOffset, top }}>
            <IconButton
              icon='caretRight'
              label='Next slide'
              onPress={onNext}
              disabled={activeIndex >= totalItems - 1}
              tone='soft'
              size='md'
            />
          </Box>
        </>
      ) : null}

      {showDots ? (
        <Box
          role='tablist'
          aria-label='Carousel slides'
          style={{
            position: 'absolute',
            top: top + spacing['40'] + spacing.sm,
            left: 0,
            right: 0,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: spacing['8'],
          }}
        >
          {Array.from({ length: totalItems }).map((_, index) => {
            const selected = index === activeIndex
            return (
              <ReusableButton
                key={`dot-${index + 1}`}
                onPress={() => onSelect?.(index)}
                accessibilityRole='button'
                accessibilityLabel={`Slide ${index + 1}`}
                aria-current={selected ? 'true' : undefined}
                variant='ghost'
                size='icon'
                style={{
                  width: spacing['40'] + spacing['4'],
                  height: spacing['40'] + spacing['4'],
                  minHeight: spacing['40'] + spacing['4'],
                  minWidth: spacing['40'] + spacing['4'],
                  paddingHorizontal: 0,
                  paddingVertical: 0,
                  borderRadius: radius.full,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                }}
              >
                <Box
                  style={{
                    width: selected ? spacing['16'] : spacing['12'],
                    height: spacing['8'],
                    borderRadius: radius.full,
                    backgroundColor: selected ? c.textPrimary : c.surface,
                  }}
                />
              </ReusableButton>
            )
          })}
        </Box>
      ) : null}
    </>
  )
})
