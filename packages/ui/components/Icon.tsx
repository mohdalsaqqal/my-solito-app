import React from 'react'
import {
  Bell,
  ArrowsCounterClockwise,
  CaretDown,
  ArrowUpRight,
  CaretLeft,
  CaretRight,
  CreditCard,
  Eye,
  FacebookLogo,
  Gift,
  Globe,
  Headset,
  Heart,
  House,
  InstagramLogo,
  List,
  MagnifyingGlass,
  MapPin,
  Package,
  Percent,
  Question,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SquaresFour,
  Star,
  Tag,
  TiktokLogo,
  Trash,
  TrendUp,
  Truck,
  User,
  X,
  YoutubeLogo,
} from 'phosphor-react'
import { iconSizes } from '@real/tokens'
import { useThemeColors } from '../responsive'

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'

export type EcommerceIconName =
  | 'product'
  | 'price'
  | 'discount'
  | 'shipping'
  | 'order'
  | 'invoice'
  | 'payment'
  | 'secure'
  | 'gift'
  | 'support'
  | 'location'
  | 'returns'

export type IconName =
  | 'notification'
  | 'home'
  | 'categories'
  | 'deals'
  | 'account'
  | 'more'
  | 'wishlist'
  | 'cart'
  | 'search'
  | 'quickView'
  | 'language'
  | 'delete'
  | 'location'
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'tiktok'
  | 'trending'
  | 'trendArrow'
  | 'star'
  | 'caretDown'
  | 'caretLeft'
  | 'caretRight'
  | 'close'
  | EcommerceIconName
  | 'unknown'

type PhosphorComponent = React.ComponentType<{
  size?: number
  color?: string
  weight?: IconWeight
}>

const ICON_BY_NAME: Record<IconName, PhosphorComponent> = {
  // Commerce-focused aliases for storefront and checkout surfaces.
  product: Package,
  price: Tag,
  discount: Percent,
  shipping: Truck,
  order: ShoppingBag,
  invoice: Receipt,
  payment: CreditCard,
  secure: ShieldCheck,
  gift: Gift,
  support: Headset,
  location: MapPin,
  returns: ArrowsCounterClockwise,
  notification: Bell,
  home: House,
  categories: SquaresFour,
  deals: Percent,
  account: User,
  more: List,
  wishlist: Heart,
  cart: ShoppingCart,
  search: MagnifyingGlass,
  quickView: Eye,
  language: Globe,
  delete: Trash,
  instagram: InstagramLogo,
  facebook: FacebookLogo,
  youtube: YoutubeLogo,
  tiktok: TiktokLogo,
  trending: TrendUp,
  trendArrow: ArrowUpRight,
  star: Star,
  caretDown: CaretDown,
  caretLeft: CaretLeft,
  caretRight: CaretRight,
  close: X,
  unknown: Question,
}

type IconProps = {
  name: IconName
  size?: number
  color?: string
  weight?: IconWeight
}

export const Icon = React.memo(function Icon({
  name,
  size = iconSizes.md,   // Figma standard icon: 24px
  color: colorProp,
  weight = 'light',
}: IconProps) {
  const c = useThemeColors()
  const color = colorProp ?? c.textPrimary
  const Glyph = ICON_BY_NAME[name] ?? ICON_BY_NAME.unknown
  return <Glyph size={size} color={color} weight={weight} />
})
