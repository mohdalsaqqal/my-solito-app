import { borderWidth, colors, radius, spacing } from '@real/tokens'
import { Text, Touchable } from '../primitives'

type HeroCarouselControlsProps = {
  activeIndex: number
  totalItems: number
  onPrev: () => void
  onNext: () => void
  top?: number
  edgeOffset?: number
  buttonRadius?: 'xs' | 'full'
}

export function HeroCarouselControls({
  activeIndex,
  totalItems,
  onPrev,
  onNext,
  top = spacing['40'] * 3,
  edgeOffset = spacing.xs,
  buttonRadius = 'full',
}: HeroCarouselControlsProps) {
  if (totalItems <= 1) {
    return null
  }

  return (
    <>
      <Touchable
        onPress={onPrev}
        disabled={activeIndex <= 0}
        style={{
          position: 'absolute',
          start: edgeOffset,
          top,
          width: spacing['40'],
          height: spacing['40'],
          borderRadius: buttonRadius === 'full' ? radius.full : radius.xs,
          borderWidth: borderWidth.thin,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text variant='title'>{'\u2039'}</Text>
      </Touchable>

      <Touchable
        onPress={onNext}
        disabled={activeIndex >= totalItems - 1}
        style={{
          position: 'absolute',
          end: edgeOffset,
          top,
          width: spacing['40'],
          height: spacing['40'],
          borderRadius: buttonRadius === 'full' ? radius.full : radius.xs,
          borderWidth: borderWidth.thin,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text variant='title'>{'\u203a'}</Text>
      </Touchable>
    </>
  )
}
