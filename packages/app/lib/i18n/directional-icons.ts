import { resolveDirection } from '../rtl-manager'

const mirroredPairs = new Map<string, string>([
  ['chevron-left', 'chevron-right'],
  ['chevron-right', 'chevron-left'],
  ['arrow-forward', 'arrow-back'],
  ['arrow-back', 'arrow-forward'],
  ['carousel-prev', 'carousel-next'],
  ['carousel-next', 'carousel-prev'],
])

export function getDirectionalIcon(iconName: string, directionInput?: string): string {
  const direction = resolveDirection(directionInput)
  if (direction === 'ltr') return iconName
  return mirroredPairs.get(iconName) ?? iconName
}
