import {
  ArrowUpRight,
  Eye,
  FacebookLogo,
  Globe,
  Heart,
  House,
  InstagramLogo,
  List,
  MagnifyingGlass,
  Percent,
  Question,
  ShoppingBag,
  SquaresFour,
  TrendUp,
  User,
  YoutubeLogo,
} from 'phosphor-react'
import { colors, spacing } from '@real/tokens'

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'

export type IconName =
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
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'trending'
  | 'trendArrow'
  | 'unknown'

type PhosphorComponent = React.ComponentType<{
  size?: number
  color?: string
  weight?: IconWeight
}>

const ICON_BY_NAME: Record<IconName, PhosphorComponent> = {
  home: House,
  categories: SquaresFour,
  deals: Percent,
  account: User,
  more: List,
  wishlist: Heart,
  cart: ShoppingBag,
  search: MagnifyingGlass,
  quickView: Eye,
  language: Globe,
  instagram: InstagramLogo,
  facebook: FacebookLogo,
  youtube: YoutubeLogo,
  trending: TrendUp,
  trendArrow: ArrowUpRight,
  unknown: Question,
}

type IconProps = {
  name: IconName
  size?: number
  color?: string
  weight?: IconWeight
}

export function Icon({
  name,
  size = spacing['16'],
  color = colors.textPrimary,
  weight = 'light',
}: IconProps) {
  const Glyph = ICON_BY_NAME[name] ?? ICON_BY_NAME.unknown
  return <Glyph size={size} color={color} weight={weight} />
}
