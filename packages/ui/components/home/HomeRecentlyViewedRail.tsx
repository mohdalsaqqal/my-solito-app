import { HomeProductItem } from './types'
import { HomeProductRail } from './HomeProductRail'

type HomeRecentlyViewedRailProps = {
  items: HomeProductItem[]
  onPressProduct?: (item: HomeProductItem) => void
  onAddToCart?: (item: HomeProductItem) => void
}

export function HomeRecentlyViewedRail({
  items,
  onPressProduct,
  onAddToCart,
}: HomeRecentlyViewedRailProps) {
  return (
    <HomeProductRail
      title='Recently viewed'
      items={items}
      onPressProduct={onPressProduct}
      onAddToCart={onAddToCart}
    />
  )
}
