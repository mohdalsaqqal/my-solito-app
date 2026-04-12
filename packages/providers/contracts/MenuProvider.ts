import type { LocalizedString } from './CatalogProviders'
import type { ProviderResult } from './types'

export type MenuLocation = 'header_primary' | 'header_mega_categories'

export type MenuDisplayStyle = 'default' | 'mega_category'

export type MenuSourceType = 'category' | 'query' | 'brand' | 'custom_link'

export type MenuAnalyticsConfig = {
  impressionKey?: string
  clickKey?: string
}

export type MenuItemReference = {
  sourceType: MenuSourceType
  sourceId?: string
  href?: string
}

export type FeaturedSlotType = 'banner' | 'product' | 'campaign'

export type MenuFeaturedSlot = {
  id: string
  type: FeaturedSlotType
  sourceId: string
  title?: LocalizedString
  subtitle?: LocalizedString
  ctaLabel?: LocalizedString
  href?: string
  imageUrl?: string
  analytics?: MenuAnalyticsConfig
}

export type StaticBrandRailItem = {
  id: string
  label: LocalizedString
  href: string
  analytics?: MenuAnalyticsConfig
}

export type BrandRailSource =
  | {
      mode: 'static'
      title?: LocalizedString
      analytics?: MenuAnalyticsConfig
      brands: StaticBrandRailItem[]
    }
  | {
      mode: 'query'
      title?: LocalizedString
      analytics?: MenuAnalyticsConfig
      queryId: string
    }
  | {
      mode: 'campaign_override'
      title?: LocalizedString
      analytics?: MenuAnalyticsConfig
      campaignId: string
    }

export type MenuItemRecord = {
  id: string
  parentId?: string | null
  label: LocalizedString
  description?: LocalizedString
  ref: MenuItemReference
  order: number
  enabled: boolean
  analytics?: MenuAnalyticsConfig
  featuredSlot?: MenuFeaturedSlot
  children?: MenuItemRecord[]
}

export type MegaMenuCategoryConfig = {
  categoryItemId: string
  brandRail?: BrandRailSource
}

export type MenuRecord = {
  id: string
  name: string
  slug: string
  location: MenuLocation
  displayStyle: MenuDisplayStyle
  enabled: boolean
  analytics?: MenuAnalyticsConfig
  items: MenuItemRecord[]
  megaMenuConfig?: MegaMenuCategoryConfig[]
  createdAt: string
  updatedAt: string
}

export type MenuCreateInput = Omit<MenuRecord, 'createdAt' | 'updatedAt'>

export type MenuUpdateInput = Partial<
  Omit<MenuRecord, 'id' | 'createdAt' | 'updatedAt'>
>

export interface MenuProvider {
  list(): Promise<ProviderResult<MenuRecord[]>>
  getById(id: string): Promise<ProviderResult<MenuRecord>>
  create(input: MenuCreateInput): Promise<ProviderResult<MenuRecord>>
  update(id: string, input: MenuUpdateInput): Promise<ProviderResult<MenuRecord>>
  delete(id: string): Promise<ProviderResult<{ id: string; deleted: true }>>
}
