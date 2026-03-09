import {
  ArrowUpRight,
  CircleHelp,
  Eye,
  Facebook,
  Globe,
  Grid2x2,
  Heart,
  Home,
  Instagram,
  LucideIcon,
  Menu,
  Percent,
  Search,
  ShoppingCart,
  TrendingUp,
  User,
  Youtube,
} from 'lucide-react'
import { colors, spacing } from '@real/tokens'

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

const ICON_BY_NAME: Record<IconName, LucideIcon> = {
  home: Home,
  categories: Grid2x2,
  deals: Percent,
  account: User,
  more: Menu,
  wishlist: Heart,
  cart: ShoppingCart,
  search: Search,
  quickView: Eye,
  language: Globe,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  trending: TrendingUp,
  trendArrow: ArrowUpRight,
  unknown: CircleHelp,
}

type IconProps = {
  name: IconName
  size?: number
  color?: string
  strokeWidth?: number
}

export function Icon({
  name,
  size = spacing['16'],
  color = colors.textPrimary,
  strokeWidth = 1.8,
}: IconProps) {
  const Glyph = ICON_BY_NAME[name] ?? ICON_BY_NAME.unknown
  return <Glyph size={size} color={color} strokeWidth={strokeWidth} />
}
