'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, AlignLeft, CheckCircle2, Eye, EyeOff, ExternalLink, GripVertical, Image as ImageIcon, LayoutList, Plus, Save, Star, Trash2, Type, Upload, X } from 'lucide-react'
import { parseHomeBlock } from '@real/app/lib/cms/blocks'
import { DEFAULT_PAGE_BLOCK_SCOPE, type AdminPageBlockScope } from '@real/app/lib/layout/page-types'
import { AdminPageBlockRecord, AdminReleaseRecord, ProductQuery, ProductRow } from '@real/app/lib/types'
import { apiClient } from '../../../../apiClient'
import { colors, elevation, spacing, typography, fontWeights, radius, componentTokens } from '@real/tokens'
import { AdminFormScaffold, Button, EmptyState, InlineLoading, PageContainer, Panel } from '../../../_components/AdminPagePrimitives'
import { AdminLoadingSkeleton, AdminErrorState } from '../../../_components/AdminLoadingFeedback'
import { UploadZone, blockEditorChromeTokens } from './_components/UploadZone'
import { FieldLabel, ErrorHint, LocalizedPair, FullWidthField, SectionDivider } from './_components/BlockEditorChrome'
import { QueryDropdown } from './_components/QueryDropdown'

type BlockType =
  | 'hero'
  | 'product_slider'
  | 'brand_promo'
  | 'promo_strip'
  | 'hero_carousel'
  | 'flash_sale'
  | 'brand_spotlight'
  | 'offer_banners'
  | 'education_banner'
  | 'newsletter_cta'
  | 'top_brands'
  | 'ugc_gallery'
  | 'personalized_rail'
  | 'editorial_hotspot'

function formatAdminBrandName(value?: string) {
  if (!value) return ''
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

const blockTypeOptions: Array<{ value: BlockType; label: string }> = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'product_slider', label: 'Product Slider' },
  { value: 'brand_promo', label: 'Brand Promo' },
  { value: 'promo_strip', label: 'Promo Strip' },
  { value: 'hero_carousel', label: 'Hero Carousel' },
  { value: 'flash_sale', label: 'Flash Sale' },
  { value: 'brand_spotlight', label: 'Brand Spotlight' },
  { value: 'offer_banners', label: 'Offer Banners' },
  { value: 'education_banner', label: 'Education Banner' },
  { value: 'newsletter_cta', label: 'Newsletter CTA' },
  { value: 'top_brands', label: 'Top Brands' },
  { value: 'ugc_gallery', label: 'UGC Gallery' },
  { value: 'personalized_rail', label: 'Personalized Rail' },
  { value: 'editorial_hotspot', label: 'Editorial Hotspot' },
]

const BLOCK_TYPE_LABELS: Record<string, string> = {
  hero: 'Hero Banner',
  product_slider: 'Product Slider',
  brand_promo: 'Brand Promo',
  promo_strip: 'Promo Strip',
  hero_carousel: 'Hero Carousel',
  flash_sale: 'Flash Sale',
  brand_spotlight: 'Brand Spotlight',
  offer_banners: 'Offer Banners',
  education_banner: 'Education Banner',
  newsletter_cta: 'Newsletter CTA',
  top_brands: 'Top Brands',
  ugc_gallery: 'UGC Gallery',
  personalized_rail: 'Personalized Rail',
  editorial_hotspot: 'Editorial Hotspot',
}

const UI_STRINGS = {
  fileUploadTypes: 'JPEG · PNG · WebP · max 6 MB',
  uploading: 'Uploading…',
  queryLabel: 'Query',
  querySearchPlaceholder: 'Search queries by title or slug',
  queryOpenLink: 'Open Queries',
  queryClearButton: 'Clear',
  querySelectedLabel: 'Selected query',
  queryLoading: 'Loading queries…',
  queryLoadFailure: 'Unable to load queries right now.',
  queryNoQueries: 'No queries available yet.',
  queryNoMatches: 'No queries match the current search.',
  queryInactiveLabel: 'Inactive',
  querySelectRequiredPlaceholder: 'Select a query',
  querySelectOptionalPlaceholder: 'Optional query',
  noBlocksTitle: 'No page blocks yet',
  noBlocksDescription: 'Add your first page block to start composing this surface.',
  blockTypeLabel: 'Block Type',
  positionLabel: 'Position',
  imageLabel: 'Image',
  bannerImageLabel: 'Banner Image',
  modeLabel: 'Mode',
  staticModeLabel: 'Static (query-based)',
  ruleBasedModeLabel: 'Rule-based (algorithmic)',
  productIdsLabel: 'Product IDs',
  hotspotMarkersLabel: 'Hotspot Markers',
  productSearchLabel: 'Product Search',
  productSearchPlaceholder: 'Search products by name, brand, or SKU',
  productSearchLoading: 'Searching products…',
  productSearchEmpty: 'No matching products found.',
  productSearchHelp: 'Search and add products directly. The selected order will be used on the homepage.',
  selectedProductsLabel: 'Selected Products',
  addProductButton: 'Add',
  addedProductButton: 'Added',
  removeButton: 'Remove',
  urlPlaceholder: 'https://… or paste URL',
  brandsUrlPlaceholder: 'https://...',
  shopPathPlaceholder: '/shop',
  salesPathPlaceholder: '/sales',
  learnPathPlaceholder: '/learn',
  newsletterPathPlaceholder: '/newsletter',
  brandsPathPlaceholder: '/brands/...',
  centerPercentPlaceholder: '50',
  previewLoading: 'Loading preview…',
  previewFailure: 'Failed to load preview. Make sure the block is saved first.',
  cancelButton: 'Cancel',
  maxTilesReached: 'Maximum 4 tiles reached.',
  productIdsHint: 'One product ID per line or comma-separated. Order controls the product list shown beside the image.',
  ugcGalleryHint: 'Gallery items are managed in the UGC Gallery tab.',
} as const

const DEFAULT_MARKETING_IMAGE_URL =
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1800&h=700&q=80'

const DEFAULT_TILE_IMAGE_URL =
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&h=600&q=80'

function getPayloadError(value: string, expectedType?: BlockType) {
  try {
    const parsed = parseHomeBlock(JSON.parse(value))
    if (!parsed) return 'Payload JSON does not match block schema.'
    if (expectedType && parsed.type !== expectedType) return 'Payload type does not match selected block type.'
    return null
  } catch {
    return 'Payload JSON is invalid.'
  }
}

function blockIcon(type: BlockType) {
  if (type === 'hero') return ImageIcon
  if (type === 'product_slider') return LayoutList
  if (type === 'brand_promo') return Star
  if (type === 'promo_strip') return AlignLeft
  return Type
}

// ---------------------------------------------------------------------------
// Default form fields per block type
// ---------------------------------------------------------------------------

interface HeroFields {
  titleEn: string; titleAr: string
  subtitleEn: string; subtitleAr: string
  imageUrl: string
  ctaLabelEn: string; ctaLabelAr: string
  href: string
}

interface SliderFields {
  titleEn: string; titleAr: string
  subtitleEn: string; subtitleAr: string
  querySlug: string
}

interface BrandPromoFields {
  titleEn: string; titleAr: string
  subtitleEn: string; subtitleAr: string
  imageUrl: string
  ctaLabelEn: string; ctaLabelAr: string
  href: string
  querySlug: string
}

interface PromoStripFields {
  textEn: string; textAr: string
  ctaLabelEn: string; ctaLabelAr: string
  href: string
}

// --- New block field interfaces ---

interface HeroCarouselCardState {
  id: string
  titleEn: string; titleAr: string
  subtitleEn: string; subtitleAr: string
  imageUrl: string
  ctaLabelEn: string; ctaLabelAr: string
  href: string
  badgeLabelEn: string; badgeLabelAr: string
}

interface HeroCarouselFields {
  autoplayMs: string
  cards: HeroCarouselCardState[]
}

interface FlashSaleFields {
  titleEn: string; titleAr: string
  timerEndsAt: string
  urgencyLabelEn: string; urgencyLabelAr: string
  ctaLabelEn: string; ctaLabelAr: string
  href: string
  imageUrl: string
}

interface BrandSpotlightFields {
  bannerTitleEn: string; bannerTitleAr: string
  bannerSubtitleEn: string; bannerSubtitleAr: string
  bannerImageUrl: string
  bannerCtaLabelEn: string; bannerCtaLabelAr: string
  bannerHref: string
  railTitleEn: string; railTitleAr: string
  querySlug: string
}

interface OfferBannerItemState {
  id: string
  imageUrl: string
  href: string
  ctaLabelEn: string; ctaLabelAr: string
}

interface OfferBannersFields {
  items: OfferBannerItemState[]
}

interface EducationBannerFields {
  titleEn: string; titleAr: string
  bodyEn: string; bodyAr: string
  ctaLabelEn: string; ctaLabelAr: string
  href: string
  imageUrl: string
}

interface NewsletterCtaFields {
  titleEn: string; titleAr: string
  subtitleEn: string; subtitleAr: string
  ctaLabelEn: string; ctaLabelAr: string
  href: string
}

interface TopBrandItemState {
  id: string
  name: string
  logoUrl: string
  href: string
}

interface TopBrandsFields {
  titleEn: string; titleAr: string
  items: TopBrandItemState[]
}

interface UgcGalleryFields {
  titleEn: string; titleAr: string
}

interface PersonalizedRailFields {
  titleEn: string; titleAr: string
  mode: 'static' | 'rule-based'
  querySlug: string
}

interface EditorialHotspotMarkerState {
  id: string
  productId: string
  xPercent: string
  yPercent: string
  labelEn: string
  labelAr: string
}

interface EditorialHotspotFields {
  titleEn: string; titleAr: string
  subtitleEn: string; subtitleAr: string
  ctaLabelEn: string; ctaLabelAr: string
  href: string
  imageUrl: string
  productIdsText: string
  hotspots: EditorialHotspotMarkerState[]
}

// --- Defaults ---

const defaultHero: HeroFields = { titleEn: '', titleAr: '', subtitleEn: '', subtitleAr: '', imageUrl: '', ctaLabelEn: '', ctaLabelAr: '', href: '' }
const defaultSlider: SliderFields = { titleEn: '', titleAr: '', subtitleEn: '', subtitleAr: '', querySlug: '' }
const defaultBrandPromo: BrandPromoFields = { titleEn: '', titleAr: '', subtitleEn: '', subtitleAr: '', imageUrl: '', ctaLabelEn: '', ctaLabelAr: '', href: '', querySlug: '' }
const defaultPromoStrip: PromoStripFields = { textEn: '', textAr: '', ctaLabelEn: '', ctaLabelAr: '', href: '' }
const defaultHeroCarousel: HeroCarouselFields = { autoplayMs: '4000', cards: [] }
const defaultFlashSale: FlashSaleFields = { titleEn: '', titleAr: '', timerEndsAt: '', urgencyLabelEn: '', urgencyLabelAr: '', ctaLabelEn: '', ctaLabelAr: '', href: '', imageUrl: '' }
const defaultBrandSpotlight: BrandSpotlightFields = { bannerTitleEn: '', bannerTitleAr: '', bannerSubtitleEn: '', bannerSubtitleAr: '', bannerImageUrl: '', bannerCtaLabelEn: '', bannerCtaLabelAr: '', bannerHref: '', railTitleEn: '', railTitleAr: '', querySlug: '' }
const defaultOfferBanners: OfferBannersFields = { items: [] }
const defaultEducationBanner: EducationBannerFields = { titleEn: '', titleAr: '', bodyEn: '', bodyAr: '', ctaLabelEn: '', ctaLabelAr: '', href: '', imageUrl: '' }
const defaultNewsletterCta: NewsletterCtaFields = { titleEn: '', titleAr: '', subtitleEn: '', subtitleAr: '', ctaLabelEn: '', ctaLabelAr: '', href: '' }
const defaultTopBrands: TopBrandsFields = { titleEn: '', titleAr: '', items: [] }
const defaultUgcGallery: UgcGalleryFields = { titleEn: '', titleAr: '' }
const defaultPersonalizedRail: PersonalizedRailFields = { titleEn: '', titleAr: '', mode: 'static', querySlug: '' }
const defaultEditorialHotspot: EditorialHotspotFields = {
  titleEn: '',
  titleAr: '',
  subtitleEn: '',
  subtitleAr: '',
  ctaLabelEn: '',
  ctaLabelAr: '',
  href: '',
  imageUrl: '',
  productIdsText: '',
  hotspots: [],
}

function makeCarouselCard(): HeroCarouselCardState {
  return { id: `card-${Date.now()}-${Math.random().toString(36).slice(2)}`, titleEn: '', titleAr: '', subtitleEn: '', subtitleAr: '', imageUrl: '', ctaLabelEn: '', ctaLabelAr: '', href: '', badgeLabelEn: '', badgeLabelAr: '' }
}

function makeOfferItem(): OfferBannerItemState {
  return { id: `item-${Date.now()}-${Math.random().toString(36).slice(2)}`, imageUrl: '', href: '', ctaLabelEn: '', ctaLabelAr: '' }
}

function makeTopBrandItem(): TopBrandItemState {
  return { id: `brand-${Date.now()}-${Math.random().toString(36).slice(2)}`, name: '', logoUrl: '', href: '' }
}

function makeEditorialHotspotMarker(): EditorialHotspotMarkerState {
  return {
    id: `hotspot-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    productId: '',
    xPercent: '50',
    yPercent: '50',
    labelEn: '',
    labelAr: '',
  }
}

function populateFromPayload(
  blockType: BlockType,
  payload: Record<string, unknown> | null
): {
  hero: HeroFields
  slider: SliderFields
  brandPromo: BrandPromoFields
  promoStrip: PromoStripFields
  heroCarousel: HeroCarouselFields
  flashSale: FlashSaleFields
  brandSpotlight: BrandSpotlightFields
  offerBanners: OfferBannersFields
  educationBanner: EducationBannerFields
  newsletterCta: NewsletterCtaFields
  topBrands: TopBrandsFields
  ugcGallery: UgcGalleryFields
  personalizedRail: PersonalizedRailFields
  editorialHotspot: EditorialHotspotFields
} {
  const p = payload ?? {}
  const loc = (key: string) => {
    const val = p[key] as { en?: string; ar?: string } | undefined
    return { en: val?.en ?? '', ar: val?.ar ?? '' }
  }
  const str = (key: string) => (p[key] as string) ?? ''

  const hero = { ...defaultHero }
  const slider = { ...defaultSlider }
  const brandPromo = { ...defaultBrandPromo }
  const promoStrip = { ...defaultPromoStrip }
  const heroCarousel: HeroCarouselFields = { autoplayMs: '4000', cards: [] }
  const flashSale = { ...defaultFlashSale }
  const brandSpotlight = { ...defaultBrandSpotlight }
  const offerBanners: OfferBannersFields = { items: [] }
  const educationBanner = { ...defaultEducationBanner }
  const newsletterCta = { ...defaultNewsletterCta }
  const topBrands: TopBrandsFields = { titleEn: '', titleAr: '', items: [] }
  const ugcGallery = { ...defaultUgcGallery }
  const personalizedRail = { ...defaultPersonalizedRail }
  const editorialHotspot = { ...defaultEditorialHotspot }

  if (blockType === 'hero') {
    const t = loc('title'); hero.titleEn = t.en; hero.titleAr = t.ar
    const s = loc('subtitle'); hero.subtitleEn = s.en; hero.subtitleAr = s.ar
    hero.imageUrl = str('imageUrl')
    const c = loc('ctaLabel'); hero.ctaLabelEn = c.en; hero.ctaLabelAr = c.ar
    hero.href = str('href')
  } else if (blockType === 'product_slider') {
    const t = loc('title'); slider.titleEn = t.en; slider.titleAr = t.ar
    const s = loc('subtitle'); slider.subtitleEn = s.en; slider.subtitleAr = s.ar
    slider.querySlug = str('querySlug')
  } else if (blockType === 'brand_promo') {
    const t = loc('title'); brandPromo.titleEn = t.en; brandPromo.titleAr = t.ar
    const s = loc('subtitle'); brandPromo.subtitleEn = s.en; brandPromo.subtitleAr = s.ar
    brandPromo.imageUrl = str('imageUrl')
    const c = loc('ctaLabel'); brandPromo.ctaLabelEn = c.en; brandPromo.ctaLabelAr = c.ar
    brandPromo.href = str('href')
    brandPromo.querySlug = str('querySlug')
  } else if (blockType === 'promo_strip') {
    const t = loc('text'); promoStrip.textEn = t.en; promoStrip.textAr = t.ar
    const c = loc('ctaLabel'); promoStrip.ctaLabelEn = c.en; promoStrip.ctaLabelAr = c.ar
    promoStrip.href = str('href')
  } else if (blockType === 'hero_carousel') {
    heroCarousel.autoplayMs = String((p.autoplayMs as number) ?? 4000)
    const rawCards = Array.isArray(p.cards) ? (p.cards as Record<string, unknown>[]) : []
    heroCarousel.cards = rawCards.map((c) => ({
      id: (c.id as string) ?? `card-${Math.random().toString(36).slice(2)}`,
      titleEn: (c.titleEn as string) ?? '',
      titleAr: (c.titleAr as string) ?? '',
      subtitleEn: (c.subtitleEn as string) ?? '',
      subtitleAr: (c.subtitleAr as string) ?? '',
      imageUrl: (c.imageUrl as string) ?? '',
      ctaLabelEn: (c.ctaLabelEn as string) ?? '',
      ctaLabelAr: (c.ctaLabelAr as string) ?? '',
      href: (c.href as string) ?? '',
      badgeLabelEn: (c.badgeLabelEn as string) ?? '',
      badgeLabelAr: (c.badgeLabelAr as string) ?? '',
    }))
  } else if (blockType === 'flash_sale') {
    flashSale.titleEn = str('titleEn')
    flashSale.titleAr = str('titleAr')
    flashSale.timerEndsAt = str('timerEndsAt')
    flashSale.urgencyLabelEn = str('urgencyLabelEn')
    flashSale.urgencyLabelAr = str('urgencyLabelAr')
    flashSale.ctaLabelEn = str('ctaLabelEn')
    flashSale.ctaLabelAr = str('ctaLabelAr')
    flashSale.href = str('href')
    flashSale.imageUrl = str('imageUrl')
  } else if (blockType === 'brand_spotlight') {
    brandSpotlight.bannerTitleEn = str('bannerTitleEn')
    brandSpotlight.bannerTitleAr = str('bannerTitleAr')
    brandSpotlight.bannerSubtitleEn = str('bannerSubtitleEn')
    brandSpotlight.bannerSubtitleAr = str('bannerSubtitleAr')
    brandSpotlight.bannerImageUrl = str('bannerImageUrl')
    brandSpotlight.bannerCtaLabelEn = str('bannerCtaLabelEn')
    brandSpotlight.bannerCtaLabelAr = str('bannerCtaLabelAr')
    brandSpotlight.bannerHref = str('bannerHref')
    brandSpotlight.railTitleEn = str('railTitleEn')
    brandSpotlight.railTitleAr = str('railTitleAr')
    brandSpotlight.querySlug = str('querySlug')
  } else if (blockType === 'offer_banners') {
    const rawItems = Array.isArray(p.items) ? (p.items as Record<string, unknown>[]) : []
    offerBanners.items = rawItems.map((item) => ({
      id: (item.id as string) ?? `item-${Math.random().toString(36).slice(2)}`,
      imageUrl: (item.imageUrl as string) ?? '',
      href: (item.href as string) ?? '',
      ctaLabelEn: (item.ctaLabelEn as string) ?? '',
      ctaLabelAr: (item.ctaLabelAr as string) ?? '',
    }))
  } else if (blockType === 'education_banner') {
    educationBanner.titleEn = str('titleEn')
    educationBanner.titleAr = str('titleAr')
    educationBanner.bodyEn = str('bodyEn')
    educationBanner.bodyAr = str('bodyAr')
    educationBanner.ctaLabelEn = str('ctaLabelEn')
    educationBanner.ctaLabelAr = str('ctaLabelAr')
    educationBanner.href = str('href')
    educationBanner.imageUrl = str('imageUrl')
  } else if (blockType === 'newsletter_cta') {
    newsletterCta.titleEn = str('titleEn')
    newsletterCta.titleAr = str('titleAr')
    newsletterCta.subtitleEn = str('subtitleEn')
    newsletterCta.subtitleAr = str('subtitleAr')
    newsletterCta.ctaLabelEn = str('ctaLabelEn')
    newsletterCta.ctaLabelAr = str('ctaLabelAr')
    newsletterCta.href = str('href')
  } else if (blockType === 'top_brands') {
    topBrands.titleEn = str('titleEn')
    topBrands.titleAr = str('titleAr')
    const rawItems = Array.isArray(p.items) ? (p.items as Record<string, unknown>[]) : []
    topBrands.items = rawItems.map((item) => ({
      id: (item.id as string) ?? `brand-${Math.random().toString(36).slice(2)}`,
      name: (item.name as string) ?? '',
      logoUrl: (item.logoUrl as string) ?? '',
      href: (item.href as string) ?? '',
    }))
  } else if (blockType === 'ugc_gallery') {
    ugcGallery.titleEn = str('titleEn')
    ugcGallery.titleAr = str('titleAr')
  } else if (blockType === 'personalized_rail') {
    personalizedRail.titleEn = str('titleEn')
    personalizedRail.titleAr = str('titleAr')
    const rawMode = p.mode as string | undefined
    personalizedRail.mode = rawMode === 'rule-based' ? 'rule-based' : 'static'
    personalizedRail.querySlug = str('querySlug')
  } else if (blockType === 'editorial_hotspot') {
    const title = loc('title'); editorialHotspot.titleEn = title.en; editorialHotspot.titleAr = title.ar
    const subtitle = loc('subtitle'); editorialHotspot.subtitleEn = subtitle.en; editorialHotspot.subtitleAr = subtitle.ar
    const cta = loc('ctaLabel'); editorialHotspot.ctaLabelEn = cta.en; editorialHotspot.ctaLabelAr = cta.ar
    editorialHotspot.href = str('href')
    editorialHotspot.imageUrl = str('imageUrl')
    editorialHotspot.productIdsText = Array.isArray(p.productIds) ? (p.productIds as string[]).join('\n') : ''
    const rawHotspots = Array.isArray(p.hotspots) ? (p.hotspots as Record<string, unknown>[]) : []
    editorialHotspot.hotspots = rawHotspots.map((hotspot) => ({
      id: (hotspot.id as string) ?? `hotspot-${Math.random().toString(36).slice(2)}`,
      productId: (hotspot.productId as string) ?? '',
      xPercent: String((hotspot.xPercent as number) ?? 50),
      yPercent: String((hotspot.yPercent as number) ?? 50),
      labelEn: ((hotspot.label as { en?: string } | undefined)?.en) ?? '',
      labelAr: ((hotspot.label as { ar?: string } | undefined)?.ar) ?? '',
    }))
  }

  return { hero, slider, brandPromo, promoStrip, heroCarousel, flashSale, brandSpotlight, offerBanners, educationBanner, newsletterCta, topBrands, ugcGallery, personalizedRail, editorialHotspot }
}

if (typeof document !== 'undefined') {
  const id = 'blocks-spin'
  if (!document.getElementById(id)) {
    const s = document.createElement('style')
    s.id = id
    s.textContent = '@keyframes spin { to { transform: rotate(360deg) } }'
    document.head.appendChild(s)
  }
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function AdminCmsBlocksPage() {
  const searchParams = useSearchParams()
  const requestedReleaseId = searchParams.get('releaseId')?.trim() ?? ''
  const [releases, setReleases] = useState<AdminReleaseRecord[]>([])
  const [releaseId, setReleaseId] = useState('')
  const [pageScope, setPageScope] = useState<AdminPageBlockScope>(DEFAULT_PAGE_BLOCK_SCOPE)
  const [blocks, setBlocks] = useState<AdminPageBlockRecord[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [position, setPosition] = useState('1')
  const [type, setType] = useState<BlockType>('hero')
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [savingOrder, setSavingOrder] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [queries, setQueries] = useState<ProductQuery[]>([])
  const [queriesLoading, setQueriesLoading] = useState(false)
  const [queriesError, setQueriesError] = useState<string | null>(null)
  const [saveAttempted, setSaveAttempted] = useState(false)
  const [draftOrderDirty, setDraftOrderDirty] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addModalType, setAddModalType] = useState<BlockType>('hero_carousel')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewToken, setPreviewToken] = useState<string | null>(null)
  const [previewTokenLoading, setPreviewTokenLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [savingBlock, setSavingBlock] = useState(false)
  const [publishGuardOpen, setPublishGuardOpen] = useState(false)
  const [pendingSelectId, setPendingSelectId] = useState<string | null>(null)
  const [dirtyWarningOpen, setDirtyWarningOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadingCardIdx, setUploadingCardIdx] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileInputCardRef = useRef<HTMLInputElement>(null)
  const activeCardUploadIdx = useRef<number>(-1)

  // Per-type form state — original 4
  const [heroFields, setHeroFields] = useState<HeroFields>({ ...defaultHero })
  const [sliderFields, setSliderFields] = useState<SliderFields>({ ...defaultSlider })
  const [brandPromoFields, setBrandPromoFields] = useState<BrandPromoFields>({ ...defaultBrandPromo })
  const [promoStripFields, setPromoStripFields] = useState<PromoStripFields>({ ...defaultPromoStrip })

  // Per-type form state — 9 new types
  const [heroCarouselFields, setHeroCarouselFields] = useState<HeroCarouselFields>({ ...defaultHeroCarousel })
  const [flashSaleFields, setFlashSaleFields] = useState<FlashSaleFields>({ ...defaultFlashSale })
  const [brandSpotlightFields, setBrandSpotlightFields] = useState<BrandSpotlightFields>({ ...defaultBrandSpotlight })
  const [offerBannersFields, setOfferBannersFields] = useState<OfferBannersFields>({ ...defaultOfferBanners })
  const [educationBannerFields, setEducationBannerFields] = useState<EducationBannerFields>({ ...defaultEducationBanner })
  const [newsletterCtaFields, setNewsletterCtaFields] = useState<NewsletterCtaFields>({ ...defaultNewsletterCta })
  const [topBrandsFields, setTopBrandsFields] = useState<TopBrandsFields>({ ...defaultTopBrands })
  const [ugcGalleryFields, setUgcGalleryFields] = useState<UgcGalleryFields>({ ...defaultUgcGallery })
  const [personalizedRailFields, setPersonalizedRailFields] = useState<PersonalizedRailFields>({ ...defaultPersonalizedRail })
  const [editorialHotspotFields, setEditorialHotspotFields] = useState<EditorialHotspotFields>({ ...defaultEditorialHotspot })
  const [editorialHotspotSearch, setEditorialHotspotSearch] = useState('')
  const [editorialHotspotSearchResults, setEditorialHotspotSearchResults] = useState<ProductRow[]>([])
  const [editorialHotspotSelectedProducts, setEditorialHotspotSelectedProducts] = useState<ProductRow[]>([])
  const [editorialHotspotSearchLoading, setEditorialHotspotSearchLoading] = useState(false)
  const [editorialHotspotSearchError, setEditorialHotspotSearchError] = useState<string | null>(null)

  useEffect(() => {
    setPageScope((current) => ({
      storeId: searchParams.get('storeId')?.trim() || current.storeId,
      slug: searchParams.get('slug')?.trim() || current.slug,
      pageType: searchParams.get('pageType')?.trim() || current.pageType,
    }))
  }, [searchParams])

  const orderedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.position - b.position),
    [blocks]
  )

  const selected = useMemo(() => blocks.find((item) => item.id === selectedBlockId) ?? null, [blocks, selectedBlockId])
  const hasPublishGuardIssues = draftOrderDirty || isDirty
  const editorialHotspotSelectedProductIds = useMemo(
    () =>
      editorialHotspotFields.productIdsText
        .split(/[\n,]/)
        .map((value) => value.trim())
        .filter(Boolean),
    [editorialHotspotFields.productIdsText]
  )

  const addEditorialHotspotProduct = (productId: string) => {
    setEditorialHotspotFields((current) => {
      const nextIds = current.productIdsText
        .split(/[\n,]/)
        .map((value) => value.trim())
        .filter(Boolean)

      if (nextIds.includes(productId) || nextIds.length >= 4) {
        return current
      }

      return {
        ...current,
        productIdsText: [...nextIds, productId].join('\n'),
      }
    })
    setEditorialHotspotSearch('')
    setEditorialHotspotSearchResults([])
    setEditorialHotspotSearchError(null)
  }

  const removeEditorialHotspotProduct = (productId: string) => {
    setEditorialHotspotFields((current) => ({
      ...current,
      productIdsText: current.productIdsText
        .split(/[\n,]/)
        .map((value) => value.trim())
        .filter((value) => value && value !== productId)
        .join('\n'),
    }))
  }

  const editorialHotspotSelectedProductsById = useMemo(
    () => new Map(editorialHotspotSelectedProducts.map((product) => [product.id, product])),
    [editorialHotspotSelectedProducts]
  )

  // The effective type is always derived from the selected block when one is active.
  // `type` state is only used for the "add new block" modal flow.
  const activeType: BlockType = selected ? (selected.type as BlockType) : type

  // Build payload from current form state for the active type
  const builtPayload = useMemo(() => {
    if (!selected) return null
    const blockId = (selected.payloadJson as Record<string, unknown> | null)?.id as string | undefined ?? `${activeType}-${Date.now()}`

    if (activeType === 'hero') {
      const f = heroFields
      return {
        id: blockId,
        type: 'hero' as const,
        title: { en: f.titleEn, ar: f.titleAr },
        ...(f.subtitleEn || f.subtitleAr ? { subtitle: { en: f.subtitleEn, ar: f.subtitleAr } } : {}),
        ...(f.imageUrl ? { imageUrl: f.imageUrl } : {}),
        ...(f.ctaLabelEn || f.ctaLabelAr ? { ctaLabel: { en: f.ctaLabelEn, ar: f.ctaLabelAr } } : {}),
        ...(f.href ? { href: f.href } : {}),
      }
    }
    if (activeType === 'product_slider') {
      const f = sliderFields
      return {
        id: blockId,
        type: 'product_slider' as const,
        title: { en: f.titleEn, ar: f.titleAr },
        ...(f.subtitleEn || f.subtitleAr ? { subtitle: { en: f.subtitleEn, ar: f.subtitleAr } } : {}),
        querySlug: f.querySlug,
      }
    }
    if (activeType === 'brand_promo') {
      const f = brandPromoFields
      return {
        id: blockId,
        type: 'brand_promo' as const,
        title: { en: f.titleEn, ar: f.titleAr },
        ...(f.subtitleEn || f.subtitleAr ? { subtitle: { en: f.subtitleEn, ar: f.subtitleAr } } : {}),
        ...(f.imageUrl ? { imageUrl: f.imageUrl } : {}),
        ...(f.ctaLabelEn || f.ctaLabelAr ? { ctaLabel: { en: f.ctaLabelEn, ar: f.ctaLabelAr } } : {}),
        ...(f.href ? { href: f.href } : {}),
        ...(f.querySlug ? { querySlug: f.querySlug } : {}),
      }
    }
    if (activeType === 'promo_strip') {
      const f = promoStripFields
      return {
        id: blockId,
        type: 'promo_strip' as const,
        text: { en: f.textEn, ar: f.textAr },
        ...(f.ctaLabelEn || f.ctaLabelAr ? { ctaLabel: { en: f.ctaLabelEn, ar: f.ctaLabelAr } } : {}),
        ...(f.href ? { href: f.href } : {}),
      }
    }
    if (activeType === 'hero_carousel') {
      const f = heroCarouselFields
      return {
        id: blockId,
        type: 'hero_carousel' as const,
        autoplayMs: Number(f.autoplayMs) || 4000,
        cards: f.cards.map((c) => ({
          id: c.id,
          titleEn: c.titleEn,
          titleAr: c.titleAr,
          ...(c.subtitleEn ? { subtitleEn: c.subtitleEn } : {}),
          ...(c.subtitleAr ? { subtitleAr: c.subtitleAr } : {}),
          imageUrl: c.imageUrl,
          ...(c.ctaLabelEn ? { ctaLabelEn: c.ctaLabelEn } : {}),
          ...(c.ctaLabelAr ? { ctaLabelAr: c.ctaLabelAr } : {}),
          ...(c.href ? { href: c.href } : {}),
          ...(c.badgeLabelEn ? { badgeLabelEn: c.badgeLabelEn } : {}),
          ...(c.badgeLabelAr ? { badgeLabelAr: c.badgeLabelAr } : {}),
        })),
      }
    }
    if (activeType === 'flash_sale') {
      const f = flashSaleFields
      return {
        id: blockId,
        type: 'flash_sale' as const,
        titleEn: f.titleEn,
        titleAr: f.titleAr,
        timerEndsAt: f.timerEndsAt,
        ...(f.urgencyLabelEn ? { urgencyLabelEn: f.urgencyLabelEn } : {}),
        ...(f.urgencyLabelAr ? { urgencyLabelAr: f.urgencyLabelAr } : {}),
        ...(f.ctaLabelEn ? { ctaLabelEn: f.ctaLabelEn } : {}),
        ...(f.ctaLabelAr ? { ctaLabelAr: f.ctaLabelAr } : {}),
        ...(f.href ? { href: f.href } : {}),
        ...(f.imageUrl ? { imageUrl: f.imageUrl } : {}),
      }
    }
    if (activeType === 'brand_spotlight') {
      const f = brandSpotlightFields
      return {
        id: blockId,
        type: 'brand_spotlight' as const,
        bannerTitleEn: f.bannerTitleEn,
        bannerTitleAr: f.bannerTitleAr,
        ...(f.bannerSubtitleEn ? { bannerSubtitleEn: f.bannerSubtitleEn } : {}),
        ...(f.bannerSubtitleAr ? { bannerSubtitleAr: f.bannerSubtitleAr } : {}),
        bannerImageUrl: f.bannerImageUrl,
        ...(f.bannerCtaLabelEn ? { bannerCtaLabelEn: f.bannerCtaLabelEn } : {}),
        ...(f.bannerCtaLabelAr ? { bannerCtaLabelAr: f.bannerCtaLabelAr } : {}),
        ...(f.bannerHref ? { bannerHref: f.bannerHref } : {}),
        ...(f.railTitleEn ? { railTitleEn: f.railTitleEn } : {}),
        ...(f.railTitleAr ? { railTitleAr: f.railTitleAr } : {}),
        ...(f.querySlug ? { querySlug: f.querySlug } : {}),
      }
    }
    if (activeType === 'offer_banners') {
      const f = offerBannersFields
      return {
        id: blockId,
        type: 'offer_banners' as const,
        items: f.items.map((item) => ({
          id: item.id,
          imageUrl: item.imageUrl,
          ...(item.href ? { href: item.href } : {}),
          ...(item.ctaLabelEn ? { ctaLabelEn: item.ctaLabelEn } : {}),
          ...(item.ctaLabelAr ? { ctaLabelAr: item.ctaLabelAr } : {}),
        })),
      }
    }
    if (activeType === 'education_banner') {
      const f = educationBannerFields
      return {
        id: blockId,
        type: 'education_banner' as const,
        titleEn: f.titleEn,
        titleAr: f.titleAr,
        ...(f.bodyEn ? { bodyEn: f.bodyEn } : {}),
        ...(f.bodyAr ? { bodyAr: f.bodyAr } : {}),
        ...(f.ctaLabelEn ? { ctaLabelEn: f.ctaLabelEn } : {}),
        ...(f.ctaLabelAr ? { ctaLabelAr: f.ctaLabelAr } : {}),
        ...(f.href ? { href: f.href } : {}),
        ...(f.imageUrl ? { imageUrl: f.imageUrl } : {}),
      }
    }
    if (activeType === 'newsletter_cta') {
      const f = newsletterCtaFields
      return {
        id: blockId,
        type: 'newsletter_cta' as const,
        titleEn: f.titleEn,
        titleAr: f.titleAr,
        ...(f.subtitleEn ? { subtitleEn: f.subtitleEn } : {}),
        ...(f.subtitleAr ? { subtitleAr: f.subtitleAr } : {}),
        ...(f.ctaLabelEn ? { ctaLabelEn: f.ctaLabelEn } : {}),
        ...(f.ctaLabelAr ? { ctaLabelAr: f.ctaLabelAr } : {}),
        ...(f.href ? { href: f.href } : {}),
      }
    }
    if (activeType === 'top_brands') {
      const f = topBrandsFields
      return {
        id: blockId,
        type: 'top_brands' as const,
        ...(f.titleEn ? { titleEn: f.titleEn } : {}),
        ...(f.titleAr ? { titleAr: f.titleAr } : {}),
        items: f.items.map((item) => ({
          id: item.id,
          name: item.name,
          ...(item.logoUrl ? { logoUrl: item.logoUrl } : {}),
          ...(item.href ? { href: item.href } : {}),
        })),
      }
    }
    if (activeType === 'ugc_gallery') {
      const f = ugcGalleryFields
      return {
        id: blockId,
        type: 'ugc_gallery' as const,
        ...(f.titleEn ? { titleEn: f.titleEn } : {}),
        ...(f.titleAr ? { titleAr: f.titleAr } : {}),
      }
    }
    if (activeType === 'editorial_hotspot') {
      const f = editorialHotspotFields
      const productIds = f.productIdsText
        .split(/[\n,]/)
        .map((value) => value.trim())
        .filter(Boolean)
      return {
        id: blockId,
        type: 'editorial_hotspot' as const,
        ...(f.titleEn || f.titleAr ? { title: { en: f.titleEn, ar: f.titleAr } } : {}),
        ...(f.subtitleEn || f.subtitleAr ? { subtitle: { en: f.subtitleEn, ar: f.subtitleAr } } : {}),
        ...(f.ctaLabelEn || f.ctaLabelAr ? { ctaLabel: { en: f.ctaLabelEn, ar: f.ctaLabelAr } } : {}),
        ...(f.href ? { href: f.href } : {}),
        imageUrl: f.imageUrl,
        productIds,
        ...(f.hotspots.length > 0
          ? {
              hotspots: f.hotspots.map((hotspot) => ({
                id: hotspot.id,
                productId: hotspot.productId,
                xPercent: Number(hotspot.xPercent) || 0,
                yPercent: Number(hotspot.yPercent) || 0,
                ...(hotspot.labelEn || hotspot.labelAr
                  ? { label: { en: hotspot.labelEn, ar: hotspot.labelAr } }
                  : {}),
              })),
            }
          : {}),
      }
    }
    // personalized_rail
    const f = personalizedRailFields
    return {
      id: blockId,
      type: 'personalized_rail' as const,
      titleEn: f.titleEn,
      titleAr: f.titleAr,
      mode: f.mode,
      ...(f.mode === 'static' && f.querySlug ? { querySlug: f.querySlug } : {}),
    }
  }, [
    activeType,
    heroFields,
    sliderFields,
    brandPromoFields,
    promoStripFields,
    heroCarouselFields,
    flashSaleFields,
    brandSpotlightFields,
    offerBannersFields,
    educationBannerFields,
    newsletterCtaFields,
    topBrandsFields,
    ugcGalleryFields,
    personalizedRailFields,
    editorialHotspotFields,
    selected,
  ])

  // Derive payload error from the built payload
  const payloadError = useMemo(() => {
    if (!builtPayload) return null
    return getPayloadError(JSON.stringify(builtPayload), activeType)
  }, [builtPayload, activeType])

  // Per-field validation errors (only shown after save attempt)
  const fieldErrors = useMemo(() => {
    if (!saveAttempted) return {}
    const errs: Record<string, string> = {}
    if (activeType === 'hero' && !heroFields.titleEn) errs.heroTitleEn = 'Required'
    if (activeType === 'product_slider') {
      if (!sliderFields.titleEn) errs.sliderTitleEn = 'Required'
      if (!sliderFields.querySlug) errs.sliderQuerySlug = 'Required'
    }
    if (activeType === 'brand_promo' && !brandPromoFields.titleEn) errs.brandPromoTitleEn = 'Required'
    if (activeType === 'promo_strip' && !promoStripFields.textEn) errs.promoStripTextEn = 'Required'
    if (activeType === 'hero_carousel') {
      if (heroCarouselFields.cards.length === 0) errs.heroCarouselCards = 'At least one card is required'
      heroCarouselFields.cards.forEach((card, i) => {
        if (!card.titleEn) errs[`heroCarouselCard${i}TitleEn`] = 'Required'
        if (!card.imageUrl) errs[`heroCarouselCard${i}ImageUrl`] = 'Required'
      })
    }
    if (activeType === 'flash_sale') {
      if (!flashSaleFields.titleEn) errs.flashSaleTitleEn = 'Required'
      if (!flashSaleFields.timerEndsAt) errs.flashSaleTimerEndsAt = 'Required'
    }
    if (activeType === 'brand_spotlight') {
      if (!brandSpotlightFields.bannerImageUrl) errs.brandSpotlightBannerImageUrl = 'Required'
    }
    if (activeType === 'offer_banners') {
      if (offerBannersFields.items.length === 0) errs.offerBannersItems = 'At least one tile is required'
      offerBannersFields.items.forEach((item, i) => {
        if (!item.imageUrl) errs[`offerBannersItem${i}ImageUrl`] = 'Required'
      })
    }
    if (activeType === 'education_banner') {
      if (!educationBannerFields.titleEn) errs.educationBannerTitleEn = 'Required'
    }
    if (activeType === 'newsletter_cta') {
      if (!newsletterCtaFields.titleEn) errs.newsletterCtaTitleEn = 'Required'
    }
    if (activeType === 'top_brands') {
      if (topBrandsFields.items.length === 0) errs.topBrandsItems = 'At least one brand is required'
      topBrandsFields.items.forEach((item, i) => {
        if (!item.name) errs[`topBrandsItem${i}Name`] = 'Required'
      })
    }
    if (activeType === 'personalized_rail') {
      if (!personalizedRailFields.titleEn) errs.personalizedRailTitleEn = 'Required'
    }
    if (activeType === 'editorial_hotspot') {
      if (!editorialHotspotFields.imageUrl) errs.editorialHotspotImageUrl = 'Required'
      const productIds = editorialHotspotFields.productIdsText
        .split(/[\n,]/)
        .map((value) => value.trim())
        .filter(Boolean)
      if (productIds.length === 0) errs.editorialHotspotProductIds = 'At least one product ID is required'
      editorialHotspotFields.hotspots.forEach((hotspot, i) => {
        if (!hotspot.productId) errs[`editorialHotspotHotspot${i}ProductId`] = 'Required'
        const x = Number(hotspot.xPercent)
        const y = Number(hotspot.yPercent)
        if (Number.isNaN(x) || x < 0 || x > 100) errs[`editorialHotspotHotspot${i}XPercent`] = 'Use 0 to 100'
        if (Number.isNaN(y) || y < 0 || y > 100) errs[`editorialHotspotHotspot${i}YPercent`] = 'Use 0 to 100'
      })
    }
    return errs
  }, [
    saveAttempted,
    activeType,
    heroFields,
    sliderFields,
    brandPromoFields,
    promoStripFields,
    heroCarouselFields,
    flashSaleFields,
    brandSpotlightFields,
    offerBannersFields,
    educationBannerFields,
    newsletterCtaFields,
    topBrandsFields,
    personalizedRailFields,
    editorialHotspotFields,
  ])

  const canSave = !payloadError && Object.keys(fieldErrors).length === 0

  const loadReleases = async () => {
    try {
      const releaseRows = await apiClient.admin.listReleases()
      setReleases(releaseRows)
      if (!releaseId && releaseRows.length > 0) {
        const preferred = releaseRows.find((row) => row.id === requestedReleaseId)
        setReleaseId(preferred?.id ?? releaseRows[0].id)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load releases.')
    }
  }

  const getDefaultQuerySlug = () => queries.find((query) => query.active)?.slug ?? queries[0]?.slug ?? null

  const buildDefaultPayload = (blockType: BlockType, pos: number): unknown => {
    const querySlug = getDefaultQuerySlug()

    if (blockType === 'hero_carousel') {
      return {
        id: `hero-carousel-${pos}`,
        type: 'hero_carousel',
        autoplayMs: 4000,
        cards: [
          {
            id: `hero-carousel-card-${pos}`,
            titleEn: 'New Arrival',
            titleAr: 'وصل حديثاً',
            imageUrl: DEFAULT_MARKETING_IMAGE_URL,
          },
        ],
      }
    }

    if (blockType === 'promo_strip') {
      return {
        id: `promo-strip-${pos}`,
        type: 'promo_strip',
        text: { en: 'Free shipping over 20 JDS', ar: 'شحن مجاني فوق 20 دينار' },
      }
    }

    if (blockType === 'flash_sale') {
      return {
        id: `flash-sale-${pos}`,
        type: 'flash_sale',
        titleEn: 'Flash Sale',
        titleAr: 'عروض سريعة',
        timerEndsAt: new Date(Date.now() + 7 * 24 * 3600_000).toISOString(),
        imageUrl: DEFAULT_MARKETING_IMAGE_URL,
      }
    }

    if (blockType === 'product_slider') {
      if (!querySlug) throw new Error('Create a product query first, then add a product slider.')
      return {
        id: `product-slider-${pos}`,
        type: 'product_slider',
        title: { en: 'Featured Products', ar: 'المنتجات المميزة' },
        querySlug,
      }
    }

    if (blockType === 'offer_banners') {
      return {
        id: `offer-banners-${pos}`,
        type: 'offer_banners',
        items: [
          {
            id: `offer-banner-item-${pos}`,
            imageUrl: DEFAULT_TILE_IMAGE_URL,
          },
        ],
      }
    }

    if (blockType === 'brand_spotlight') {
      return {
        id: `brand-spotlight-${pos}`,
        type: 'brand_spotlight',
        bannerTitleEn: 'Brand Spotlight',
        bannerTitleAr: 'أضواء العلامة',
        bannerImageUrl: DEFAULT_MARKETING_IMAGE_URL,
      }
    }

    if (blockType === 'education_banner') {
      return {
        id: `education-banner-${pos}`,
        type: 'education_banner',
        titleEn: 'Find Your Routine',
        titleAr: 'ابحثي عن روتينك',
        imageUrl: DEFAULT_MARKETING_IMAGE_URL,
      }
    }

    if (blockType === 'newsletter_cta') {
      return {
        id: `newsletter-cta-${pos}`,
        type: 'newsletter_cta',
        titleEn: 'Join Our Rewards',
        titleAr: 'انضم لمكافآتنا',
      }
    }

    if (blockType === 'top_brands') {
      return {
        id: `top-brands-${pos}`,
        type: 'top_brands',
        items: [
          {
            id: `top-brand-item-${pos}`,
            name: 'Featured Brand',
          },
        ],
      }
    }

    if (blockType === 'ugc_gallery') {
      return {
        id: `ugc-gallery-${pos}`,
        type: 'ugc_gallery',
      }
    }

    if (blockType === 'personalized_rail') {
      return {
        id: `personalized-rail-${pos}`,
        type: 'personalized_rail',
        titleEn: 'Recommended for You',
        titleAr: 'موصى لك',
        mode: querySlug ? 'static' : 'rule-based',
        ...(querySlug ? { querySlug } : {}),
      }
    }

    if (blockType === 'editorial_hotspot') {
      return {
        id: `editorial-hotspot-${pos}`,
        type: 'editorial_hotspot',
        imageUrl: DEFAULT_TILE_IMAGE_URL,
        productIds: ['prod_1'],
      }
    }

    if (blockType === 'hero') {
      return {
        id: `hero-${pos}`,
        type: 'hero',
        title: { en: 'Hero', ar: 'البطل' },
        imageUrl: DEFAULT_MARKETING_IMAGE_URL,
      }
    }

    if (blockType === 'brand_promo') {
      return {
        id: `brand-promo-${pos}`,
        type: 'brand_promo',
        title: { en: 'Brand Promo', ar: 'عرض العلامة' },
        imageUrl: DEFAULT_MARKETING_IMAGE_URL,
        ...(querySlug ? { querySlug } : {}),
      }
    }

    throw new Error(`Unsupported block type: ${blockType}`)
  }

  // Canonical ordered list of block types every release should have
  // personalized_rail is intentionally excluded — it requires manual querySlug + mode setup
  const CANONICAL_BLOCK_TYPES: BlockType[] = [
    'hero_carousel',
    'promo_strip',
    'flash_sale',
    'offer_banners',
    'product_slider',
    'brand_spotlight',
    'education_banner',
    'top_brands',
    'ugc_gallery',
    'newsletter_cta',
  ]

  const syncMissingBlocks = async (targetReleaseId: string, existing: AdminPageBlockRecord[]) => {
    const presentTypes = new Set(existing.map((b) => b.type))
    const missing = CANONICAL_BLOCK_TYPES.filter((t) => !presentTypes.has(t))
    if (missing.length === 0) return existing

    let nextPos = existing.length > 0 ? Math.max(...existing.map((b) => b.position)) + 1 : 1
    const created: AdminPageBlockRecord[] = []

    for (const blockType of missing) {
      try {
        const payloadJson = buildDefaultPayload(blockType, nextPos)
        const createdBlock = await apiClient.admin.createReleaseBlock({
          releaseId: targetReleaseId,
          position: nextPos,
          type: blockType,
          payloadJson,
          storeId: pageScope.storeId,
          slug: pageScope.slug,
          pageType: pageScope.pageType,
        })
        if (createdBlock) {
          created.push({
            ...createdBlock,
            storeId: pageScope.storeId,
            slug: pageScope.slug,
            pageType: pageScope.pageType,
            version: 'v1',
          })
          nextPos++
        }
      } catch {
        // non-fatal — skip this block type
      }
    }

    return [...existing, ...created]
  }

  const loadBlocks = async (targetReleaseId: string) => {
    if (!targetReleaseId) return
    try {
      const rows = await apiClient.admin.listPageBlocks({
        releaseId: targetReleaseId,
        storeId: pageScope.storeId,
        slug: pageScope.slug,
        pageType: pageScope.pageType,
      })
      const synced = await syncMissingBlocks(targetReleaseId, rows)
      setBlocks(synced)
      setDraftOrderDirty(false)
      if (!selectedBlockId && synced.length > 0) {
        setSelectedBlockId(synced[0].id)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load blocks.')
    }
  }

  const loadQueries = async () => {
    setQueriesLoading(true)
    setQueriesError(null)
    try {
      const rows = await apiClient.admin.listProductQueries()
      setQueries(rows)
    } catch (cause) {
      setQueries([])
      setQueriesError(cause instanceof Error ? cause.message : UI_STRINGS.queryLoadFailure)
    } finally {
      setQueriesLoading(false)
    }
  }

  useEffect(() => {
    void loadReleases()
    void loadQueries()
  }, [requestedReleaseId])

  useEffect(() => {
    if (!releaseId) return
    void loadBlocks(releaseId)
  }, [releaseId, pageScope])

  useEffect(() => {
    if (activeType !== 'editorial_hotspot') {
      setEditorialHotspotSearchResults([])
      setEditorialHotspotSearchError(null)
      setEditorialHotspotSearchLoading(false)
      return
    }

    const query = editorialHotspotSearch.trim()
    if (query.length < 2) {
      setEditorialHotspotSearchResults([])
      setEditorialHotspotSearchError(null)
      setEditorialHotspotSearchLoading(false)
      return
    }

    let cancelled = false
    const timeoutId = window.setTimeout(async () => {
      setEditorialHotspotSearchLoading(true)
      setEditorialHotspotSearchError(null)
      try {
        const response = await apiClient.admin.listProducts({
          limit: 8,
          search: query,
        })
        if (!cancelled) {
          setEditorialHotspotSearchResults(response.nodes)
        }
      } catch (cause) {
        if (!cancelled) {
          setEditorialHotspotSearchResults([])
          setEditorialHotspotSearchError(cause instanceof Error ? cause.message : 'Unable to search products.')
        }
      } finally {
        if (!cancelled) {
          setEditorialHotspotSearchLoading(false)
        }
      }
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [activeType, editorialHotspotSearch])

  useEffect(() => {
    if (activeType !== 'editorial_hotspot') {
      setEditorialHotspotSelectedProducts([])
      return
    }

    const productIds = editorialHotspotSelectedProductIds
    if (productIds.length === 0) {
      setEditorialHotspotSelectedProducts([])
      return
    }

    let cancelled = false
    void Promise.all(
      productIds.map(async (productId) => {
        const existingFromSearch = editorialHotspotSearchResults.find((product) => product.id === productId)
        if (existingFromSearch) return existingFromSearch
        const detail = await apiClient.admin.getProduct(productId)
        return {
          id: detail.id,
          title: detail.title,
          brand: detail.brand,
          sku: detail.sku,
          image: detail.image,
          price: detail.price,
        } satisfies ProductRow
      })
    )
      .then((products) => {
        if (!cancelled) {
          const orderedProducts = productIds
            .map((productId) => products.find((product) => product.id === productId))
            .filter((product): product is ProductRow => Boolean(product))
          setEditorialHotspotSelectedProducts(orderedProducts)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEditorialHotspotSelectedProducts([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [activeType, editorialHotspotSearchResults, editorialHotspotSelectedProductIds])

  // Populate form when a block is selected
  useEffect(() => {
    if (!selected) return
    const blockType = selected.type as BlockType
    setType(blockType)
    setPosition(String(selected.position))
    setSaveAttempted(false)
    setIsDirty(false)
    const payload = selected.payloadJson as Record<string, unknown> | null
    const populated = populateFromPayload(blockType, payload)
    setHeroFields(populated.hero)
    setSliderFields(populated.slider)
    setBrandPromoFields(populated.brandPromo)
    setPromoStripFields(populated.promoStrip)
    setHeroCarouselFields(populated.heroCarousel)
    setFlashSaleFields(populated.flashSale)
    setBrandSpotlightFields(populated.brandSpotlight)
    setOfferBannersFields(populated.offerBanners)
    setEducationBannerFields(populated.educationBanner)
    setNewsletterCtaFields(populated.newsletterCta)
    setTopBrandsFields(populated.topBrands)
    setUgcGalleryFields(populated.ugcGallery)
    setPersonalizedRailFields(populated.personalizedRail)
    setEditorialHotspotFields(populated.editorialHotspot)
    setEditorialHotspotSearch('')
    setEditorialHotspotSearchResults([])
    setEditorialHotspotSelectedProducts([])
    setEditorialHotspotSearchError(null)
  }, [selected])

  // Track dirty state — compare current form payload vs saved payload
  useEffect(() => {
    if (!selected || !builtPayload) { setIsDirty(false); return }
    setIsDirty(JSON.stringify(selected.payloadJson ?? {}) !== JSON.stringify(builtPayload))
  }, [builtPayload, selected])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty || draftOrderDirty) { e.preventDefault(); e.returnValue = '' }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [draftOrderDirty, isDirty])

  // Guard block selection when there are unsaved changes
  function requestSelectBlock(id: string) {
    if (isDirty && selectedBlockId !== id) {
      setPendingSelectId(id)
      setDirtyWarningOpen(true)
    } else {
      setSelectedBlockId(id)
    }
  }

  // Reset fields on type change (only if user manually changes type, not when block selection changes)
  const handleTypeChange = (newType: BlockType) => {
    setType(newType)
    setSaveAttempted(false)
    if (newType === 'hero') setHeroFields({ ...defaultHero })
    else if (newType === 'product_slider') setSliderFields({ ...defaultSlider })
    else if (newType === 'brand_promo') setBrandPromoFields({ ...defaultBrandPromo })
    else if (newType === 'promo_strip') setPromoStripFields({ ...defaultPromoStrip })
    else if (newType === 'hero_carousel') setHeroCarouselFields({ ...defaultHeroCarousel })
    else if (newType === 'flash_sale') setFlashSaleFields({ ...defaultFlashSale })
    else if (newType === 'brand_spotlight') setBrandSpotlightFields({ ...defaultBrandSpotlight })
    else if (newType === 'offer_banners') setOfferBannersFields({ ...defaultOfferBanners })
    else if (newType === 'education_banner') setEducationBannerFields({ ...defaultEducationBanner })
    else if (newType === 'newsletter_cta') setNewsletterCtaFields({ ...defaultNewsletterCta })
    else if (newType === 'top_brands') setTopBrandsFields({ ...defaultTopBrands })
    else if (newType === 'ugc_gallery') setUgcGalleryFields({ ...defaultUgcGallery })
    else if (newType === 'personalized_rail') setPersonalizedRailFields({ ...defaultPersonalizedRail })
    else if (newType === 'editorial_hotspot') setEditorialHotspotFields({ ...defaultEditorialHotspot })
  }

  const uploadImage = async (file: File, onDone: (url: string) => void) => {
    setUploading(true)
    setError(null)
    try {
      const upload = await apiClient.admin.uploadCmsBlockImage(file)
      if (!upload?.url) throw new Error('Upload failed')
      onDone(upload.url)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Upload failed.')
    } finally {
      setUploading(false)
      setUploadingCardIdx(null)
    }
  }

  const uploadCardImage = async (file: File, cardIdx: number) => {
    setUploadingCardIdx(cardIdx)
    setUploading(true)
    setError(null)
    try {
      const upload = await apiClient.admin.uploadCmsBlockImage(file)
      if (!upload?.url) throw new Error('Upload failed')
      setHeroCarouselFields((f) => ({ ...f, cards: f.cards.map((c, idx) => idx === cardIdx ? { ...c, imageUrl: upload.url } : c) }))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Upload failed.')
    } finally {
      setUploading(false)
      setUploadingCardIdx(null)
    }
  }

  const saveOrderDraft = async () => {
    if (!releaseId || !draftOrderDirty || savingOrder) return true
    setSavingOrder(true)
    setError(null)
    try {
      await Promise.all(
        orderedBlocks.map((item, index) =>
          apiClient.admin.updateReleaseBlock(item.id, {
            position: index + 1,
            storeId: pageScope.storeId,
            slug: pageScope.slug,
            pageType: pageScope.pageType,
          })
        )
      )
      await loadBlocks(releaseId)
      setDraftOrderDirty(false)
      setMessage('Order saved.')
      setTimeout(() => setMessage(null), 3000)
      return true
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to reorder blocks.')
      await loadBlocks(releaseId)
      return false
    } finally {
      setSavingOrder(false)
    }
  }

  const saveSelectedBlock = async () => {
    setSaveAttempted(true)
    if (!selected || !builtPayload) return false
    const payloadStr = JSON.stringify(builtPayload)
    const err = getPayloadError(payloadStr, activeType)
    if (err) return false

    setSavingBlock(true)
    setError(null)
    try {
      await apiClient.admin.updateReleaseBlock(selected.id, {
        type: activeType,
        position: Number(position) || 1,
        payloadJson: builtPayload,
        storeId: pageScope.storeId,
        slug: pageScope.slug,
        pageType: pageScope.pageType,
      })
      await loadBlocks(releaseId)
      setIsDirty(false)
      setMessage('Block saved.')
      setTimeout(() => setMessage(null), 3000)
      return true
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update block.')
      return false
    } finally {
      setSavingBlock(false)
    }
  }

  const publishRelease = async () => {
    if (!releaseId || publishing) return
    setPublishing(true)
    setError(null)
    setMessage(null)
    try {
      await apiClient.admin.publishRelease(releaseId)
      setMessage(`Release ${releaseId} published successfully.`)
      setPublishGuardOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to publish release.')
    } finally {
      setPublishing(false)
    }
  }

  const handleDrop = async (targetBlockId: string, sourceBlockId?: string | null) => {
    const draggingId = sourceBlockId?.trim() || draggingBlockId
    if (!draggingId || draggingId === targetBlockId) return
    const fromIndex = orderedBlocks.findIndex((item) => item.id === draggingId)
    const toIndex = orderedBlocks.findIndex((item) => item.id === targetBlockId)
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return
    const next = [...orderedBlocks]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    const normalized = next.map((item, index) => ({ ...item, position: index + 1 }))
    setBlocks(normalized)
    setDraftOrderDirty(true)
  }

  return (
    <PageContainer dense>
      <AdminFormScaffold
        title='Page Blocks'
        notice={
          error
            ? { tone: 'danger', message: error }
            : message
              ? { tone: 'success', message }
              : undefined
        }
        actions={
          <div style={{ display: 'flex', gap: spacing['8'] }}>
            <Button
              tone='secondary'
              onClick={() => {
                window.open('/', '_blank', 'noopener,noreferrer')
              }}
            >
              Preview
            </Button>
            <Button
              tone='primary'
              disabled={!releaseId || publishing}
              onClick={async () => {
                if (!releaseId || publishing) return
                if (hasPublishGuardIssues) {
                  setPublishGuardOpen(true)
                  return
                }
                await publishRelease()
              }}
            >
              {publishing ? 'Publishing...' : 'Publish Changes'}
            </Button>
          </div>
        }
      >
        <div />
      </AdminFormScaffold>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 380px) minmax(0, 1fr)',
          gap: spacing['20'],
          alignItems: 'start',
        }}
      >
        {/* ----------------------------------------------------------------- */}
        {/* LEFT PANEL — Block list + drag-drop */}
        {/* ----------------------------------------------------------------- */}
        <Panel density='dense'>
          <div
            style={{
              borderBottom: `1px solid ${colors.border}`,
              marginBottom: spacing['12'],
              paddingBottom: spacing['12'],
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: spacing['8'],
            }}
          >
            <div style={{ display: 'grid', gap: spacing['4'], flex: 1 }}>
              <label style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>
                Release
              </label>
              <select
                value={releaseId}
                onChange={(e) => {
                  setReleaseId(e.target.value)
                  setSelectedBlockId(null)
                }}
                style={inputStyle}
              >
                {releases.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gap: spacing['4'], minWidth: 180 }}>
              <label style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>
                Page
              </label>
              <div style={{ ...inputStyle, display: 'grid', gap: spacing['2'], alignContent: 'center' }}>
                <span>{pageScope.pageType}</span>
                <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>
                  {pageScope.storeId}: {pageScope.slug}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: spacing['8'], flexWrap: 'wrap' }}>
              <Button
                tone='secondary'
                onClick={() => {
                  if (!releaseId) return
                  setAddModalOpen(true)
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                  <Plus size={14} />
                  Add
                </span>
              </Button>
              <Button
                tone='primary'
                disabled={!releaseId || !draftOrderDirty || savingOrder}
                onClick={async () => {
                  await saveOrderDraft()
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                  <Save size={14} color={colors.textInverted} />
                  {savingOrder ? 'Saving...' : 'Save order'}
                </span>
              </Button>
            </div>
          </div>

          <div style={{ marginBottom: spacing['12'] }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing['8'] }}>
              <span style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.semibold) }}>
                Page Blocks ({blocks.length})
              </span>
              {draftOrderDirty ? (
                <span style={{ fontSize: typography.xs, color: '#d97706', fontWeight: Number(fontWeights.semibold) }}>
                  Order has unsaved changes
                </span>
              ) : null}
            </div>
          </div>

          {blocks.length === 0 ? (
            <div style={{ padding: spacing['48'], textAlign: 'center', color: colors.textSecondary }}>
              <LayoutList size={32} style={{ marginBottom: spacing['12'] }} />
              <p style={{ margin: '0 0 4px', fontSize: typography.base, fontWeight: Number(fontWeights.semibold), color: colors.textPrimary }}>{UI_STRINGS.noBlocksTitle}</p>
              <p style={{ margin: 0, fontSize: typography.sm }}>{UI_STRINGS.noBlocksDescription}</p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: spacing['6'],
                paddingBottom: spacing['6'],
              }}
            >
              {orderedBlocks.map((block) => {
                const Icon = blockIcon(block.type as BlockType)
                const valid = !getPayloadError(JSON.stringify(block.payloadJson), block.type as BlockType)
                const active = selectedBlockId === block.id
                return (
                  <button
                    className='admin-focus-ring'
                    key={block.id}
                    type='button'
                    draggable
                    onDragStart={(event) => {
                      setDraggingBlockId(block.id)
                      event.dataTransfer.effectAllowed = 'move'
                      event.dataTransfer.setData('text/plain', block.id)
                    }}
                    onDragEnd={() => { setDraggingBlockId(null); setDragOverBlockId(null) }}
                    onDragOver={(event) => { event.preventDefault(); setDragOverBlockId(block.id) }}
                    onDragLeave={() => setDragOverBlockId(null)}
                    onDrop={async (event) => {
                      event.preventDefault()
                      setDragOverBlockId(null)
                      await handleDrop(block.id, event.dataTransfer.getData('text/plain'))
                      setDraggingBlockId(null)
                    }}
                    onClick={() => requestSelectBlock(block.id)}
                    style={{
                      border: `1px solid ${active ? colors.brandPrimary : dragOverBlockId === block.id ? colors.brandPrimary : colors.border}`,
                      backgroundColor:
                        dragOverBlockId === block.id
                          ? colors.brandPrimarySubtle
                          : draggingBlockId === block.id
                          ? colors.surfaceMuted
                          : active
                          ? colors.surfaceMuted
                          : colors.surface,
                      borderRadius: radius.xl,
                      padding: `${spacing['8']}px ${spacing['12']}px`,
                      height: 40,
                      width: '100%',
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing['10'],
                      cursor: draggingBlockId === block.id ? 'grabbing' : 'grab',
                      textAlign: 'start',
                      transition: 'background-color 180ms ease, border-color 180ms ease, opacity 180ms ease',
                      opacity: (block.enabled ?? true) ? 1 : 0.45,
                      boxShadow: active ? `0 0 0 3px ${colors.brandPrimarySubtle}` : 'none',
                      overflow: 'hidden',
                    }}
                  >
                    <GripVertical size={13} color={colors.textSecondary} style={{ flexShrink: 0 }} />
                    <span style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], flex: 1, minWidth: 0 }}>
                      <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>
                        {BLOCK_TYPE_LABELS[block.type] ?? block.type}
                      </span>
                      <span style={{ fontSize: typography.xs, fontWeight: Number(fontWeights.semibold), color: colors.textSecondary, backgroundColor: colors.surfaceMuted, borderRadius: radius.full, padding: '1px 7px', flexShrink: 0 }}>
                        {block.position}
                      </span>
                    </span>
                    {valid ? (
                      <CheckCircle2 size={14} color={colors.success} />
                    ) : (
                      <AlertCircle size={14} color={colors.danger} />
                    )}
                    {(block.enabled ?? true) ? (
                      <Eye size={14} color={colors.success} />
                    ) : (
                      <EyeOff size={14} color={colors.textSecondary} />
                    )}
                    {active && isDirty ? (
                      <span style={{ width: 6, height: 6, borderRadius: radius.full, backgroundColor: '#f59e0b', flexShrink: 0 }} title="Unsaved changes" />
                    ) : null}
                  </button>
                )
              })}
            </div>
          )}
        </Panel>

        {/* ----------------------------------------------------------------- */}
        {/* RIGHT PANEL — Structured block editor */}
        {/* ----------------------------------------------------------------- */}
        {!selected ? (
          <AdminFormScaffold
            title='Block Editor'
            subtitle='Choose a block from the left panel to edit content.'
          >
            <EmptyState title='Select a block to edit' description='Choose a block from the left panel to edit content.' />
          </AdminFormScaffold>
        ) : (
          <AdminFormScaffold
            title='Block Editor'
            subtitle={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
                <span>{selected.id}</span>
                <span style={{
                  fontSize: typography.xs,
                  fontWeight: Number(fontWeights.semibold),
                  padding: '2px 8px',
                  borderRadius: radius.full,
                  backgroundColor: (selected.enabled ?? true) ? '#dcfce7' : colors.surfaceMuted,
                  color: (selected.enabled ?? true) ? '#16a34a' : colors.textSecondary,
                }}>
                  {(selected.enabled ?? true) ? 'Enabled' : 'Disabled'}
                </span>
              </span>
            }
            actions={
              <div style={{ display: 'inline-flex', gap: spacing['8'], alignItems: 'center' }}>
                <Button
                  tone='secondary'
                  disabled={!builtPayload || previewTokenLoading}
                  onClick={async () => {
                    if (!releaseId) return
                    setPreviewTokenLoading(true)
                    setPreviewToken(null)
                    try {
                      const preview = await apiClient.admin.getPreviewToken(releaseId, pageScope.storeId)
                      if (preview?.token) setPreviewToken(preview.token)
                      else setError('Could not get preview token.')
                    } catch {
                      setError('Could not get preview token.')
                    } finally {
                      setPreviewTokenLoading(false)
                    }
                    setPreviewOpen(true)
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                    <ExternalLink size={14} />
                    {previewTokenLoading ? 'Loading…' : 'Preview'}
                  </span>
                </Button>
                <Button
                  tone='secondary'
                  onClick={async () => {
                    if (!selected) return
                    const next = !(selected.enabled ?? true)
                    try {
                      await apiClient.admin.updateReleaseBlock(selected.id, {
                        enabled: next,
                        storeId: pageScope.storeId,
                        slug: pageScope.slug,
                        pageType: pageScope.pageType,
                      })
                      setBlocks((prev) => prev.map((b) => b.id === selected.id ? { ...b, enabled: next } : b))
                    } catch {
                      setError('Could not update block status.')
                    }
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                    {(selected.enabled ?? true) ? <EyeOff size={14} /> : <Eye size={14} />}
                    {(selected.enabled ?? true) ? 'Disable' : 'Enable'}
                  </span>
                </Button>
                <Button
                  tone='danger'
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                    <Trash2 size={14} color={colors.textInverted} />
                    Delete
                  </span>
                </Button>
                <Button
                  tone='primary'
                  disabled={savingBlock || (saveAttempted && !canSave)}
                  onClick={async () => {
                    await saveSelectedBlock()
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                    <Save size={14} color={colors.textInverted} />
                    {savingBlock ? 'Saving...' : 'Save Block'}
                  </span>
                </Button>
              </div>
            }
          >
              {/* Form fields */}
              <div style={{ display: 'grid', gap: spacing['16'] }}>
                {/* Block type + position row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                    gap: spacing['12'],
                  }}
                >
                  <label style={{ display: 'grid', gap: spacing['4'] }}>
                    <FieldLabel>{UI_STRINGS.blockTypeLabel}</FieldLabel>
                    <select className='admin-focus-ring' value={activeType} onChange={(e) => handleTypeChange(e.target.value as BlockType)} style={inputStyle}>
                      {blockTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label style={{ display: 'grid', gap: spacing['4'] }}>
                    <FieldLabel>{UI_STRINGS.positionLabel}</FieldLabel>
                    <input className='admin-focus-ring' value={position} onChange={(e) => setPosition(e.target.value)} style={inputStyle} />
                  </label>
                </div>

                {/* Divider */}
                <div style={{ borderTop: `1px solid ${colors.border}` }} />

                {/* ---- HERO fields ---- */}
              {activeType === 'hero' && (
                  <>
                    <LocalizedPair
                      labelEn="Title EN"
                      labelAr="Title AR"
                      valueEn={heroFields.titleEn}
                      valueAr={heroFields.titleAr}
                      onChangeEn={(v) => setHeroFields((f) => ({ ...f, titleEn: v }))}
                      onChangeAr={(v) => setHeroFields((f) => ({ ...f, titleAr: v }))}
                      required
                      errorEn={fieldErrors.heroTitleEn}
                    />
                    <LocalizedPair
                      labelEn="Subtitle EN"
                      labelAr="Subtitle AR"
                      valueEn={heroFields.subtitleEn}
                      valueAr={heroFields.subtitleAr}
                      onChangeEn={(v) => setHeroFields((f) => ({ ...f, subtitleEn: v }))}
                      onChangeAr={(v) => setHeroFields((f) => ({ ...f, subtitleAr: v }))}
                    />
                    <div style={{ display: 'grid', gap: spacing['4'] }}>
                      <FieldLabel>{UI_STRINGS.imageLabel}</FieldLabel>
                      <UploadZone
                        imageUrl={heroFields.imageUrl}
                        uploading={uploading && uploadingCardIdx === null}
                        onPick={() => { activeCardUploadIdx.current = -1; fileInputRef.current?.click() }}
                        onClear={() => setHeroFields((f) => ({ ...f, imageUrl: '' }))}
                        onDropFile={(file) => uploadImage(file, (url) => setHeroFields((f) => ({ ...f, imageUrl: url })))}
                        aspectW={16} aspectH={6}
                      />
                      <input className='admin-focus-ring' value={heroFields.imageUrl} onChange={(e) => setHeroFields((f) => ({ ...f, imageUrl: e.target.value }))} placeholder={UI_STRINGS.urlPlaceholder} style={{ ...inputStyle, fontSize: typography.xs }} />
                    </div>
                    <LocalizedPair
                      labelEn="CTA Label EN"
                      labelAr="CTA Label AR"
                      valueEn={heroFields.ctaLabelEn}
                      valueAr={heroFields.ctaLabelAr}
                      onChangeEn={(v) => setHeroFields((f) => ({ ...f, ctaLabelEn: v }))}
                      onChangeAr={(v) => setHeroFields((f) => ({ ...f, ctaLabelAr: v }))}
                    />
                    <FullWidthField
                      label="CTA Link (href)"
                      value={heroFields.href}
                      onChange={(v) => setHeroFields((f) => ({ ...f, href: v }))}
                      placeholder={UI_STRINGS.shopPathPlaceholder}
                    />
                  </>
                )}

                {/* ---- PRODUCT SLIDER fields ---- */}
              {activeType === 'product_slider' && (
                  <>
                    <LocalizedPair
                      labelEn="Title EN"
                      labelAr="Title AR"
                      valueEn={sliderFields.titleEn}
                      valueAr={sliderFields.titleAr}
                      onChangeEn={(v) => setSliderFields((f) => ({ ...f, titleEn: v }))}
                      onChangeAr={(v) => setSliderFields((f) => ({ ...f, titleAr: v }))}
                      required
                      errorEn={fieldErrors.sliderTitleEn}
                    />
                    <LocalizedPair
                      labelEn="Subtitle EN"
                      labelAr="Subtitle AR"
                      valueEn={sliderFields.subtitleEn}
                      valueAr={sliderFields.subtitleAr}
                      onChangeEn={(v) => setSliderFields((f) => ({ ...f, subtitleEn: v }))}
                      onChangeAr={(v) => setSliderFields((f) => ({ ...f, subtitleAr: v }))}
                    />
                    <QueryDropdown
                      value={sliderFields.querySlug}
                      onChange={(v) => setSliderFields((f) => ({ ...f, querySlug: v }))}
                      queries={queries}
                      required
                      errorMsg={fieldErrors.sliderQuerySlug}
                      loading={queriesLoading}
                      loadError={queriesError}
                    />
                  </>
                )}

                {/* ---- BRAND PROMO fields ---- */}
              {activeType === 'brand_promo' && (
                  <>
                    <LocalizedPair
                      labelEn="Title EN"
                      labelAr="Title AR"
                      valueEn={brandPromoFields.titleEn}
                      valueAr={brandPromoFields.titleAr}
                      onChangeEn={(v) => setBrandPromoFields((f) => ({ ...f, titleEn: v }))}
                      onChangeAr={(v) => setBrandPromoFields((f) => ({ ...f, titleAr: v }))}
                      required
                      errorEn={fieldErrors.brandPromoTitleEn}
                    />
                    <LocalizedPair
                      labelEn="Subtitle EN"
                      labelAr="Subtitle AR"
                      valueEn={brandPromoFields.subtitleEn}
                      valueAr={brandPromoFields.subtitleAr}
                      onChangeEn={(v) => setBrandPromoFields((f) => ({ ...f, subtitleEn: v }))}
                      onChangeAr={(v) => setBrandPromoFields((f) => ({ ...f, subtitleAr: v }))}
                    />
                    <div style={{ display: 'grid', gap: spacing['4'] }}>
                      <FieldLabel>{UI_STRINGS.imageLabel}</FieldLabel>
                      <UploadZone
                        imageUrl={brandPromoFields.imageUrl}
                        uploading={uploading && uploadingCardIdx === null}
                        onPick={() => { activeCardUploadIdx.current = -1; fileInputRef.current?.click() }}
                        onClear={() => setBrandPromoFields((f) => ({ ...f, imageUrl: '' }))}
                        onDropFile={(file) => uploadImage(file, (url) => setBrandPromoFields((f) => ({ ...f, imageUrl: url })))}
                        aspectW={16} aspectH={6}
                      />
                      <input className='admin-focus-ring' value={brandPromoFields.imageUrl} onChange={(e) => setBrandPromoFields((f) => ({ ...f, imageUrl: e.target.value }))} placeholder={UI_STRINGS.urlPlaceholder} style={{ ...inputStyle, fontSize: typography.xs }} />
                    </div>
                    <LocalizedPair
                      labelEn="CTA Label EN"
                      labelAr="CTA Label AR"
                      valueEn={brandPromoFields.ctaLabelEn}
                      valueAr={brandPromoFields.ctaLabelAr}
                      onChangeEn={(v) => setBrandPromoFields((f) => ({ ...f, ctaLabelEn: v }))}
                      onChangeAr={(v) => setBrandPromoFields((f) => ({ ...f, ctaLabelAr: v }))}
                    />
                    <FullWidthField
                      label="CTA Link (href)"
                      value={brandPromoFields.href}
                      onChange={(v) => setBrandPromoFields((f) => ({ ...f, href: v }))}
                      placeholder={UI_STRINGS.shopPathPlaceholder}
                    />
                    <QueryDropdown
                      value={brandPromoFields.querySlug}
                      onChange={(v) => setBrandPromoFields((f) => ({ ...f, querySlug: v }))}
                      queries={queries}
                      loading={queriesLoading}
                      loadError={queriesError}
                    />
                  </>
                )}

                {/* ---- PROMO STRIP fields ---- */}
              {activeType === 'promo_strip' && (
                  <>
                    <LocalizedPair
                      labelEn="Text EN"
                      labelAr="Text AR"
                      valueEn={promoStripFields.textEn}
                      valueAr={promoStripFields.textAr}
                      onChangeEn={(v) => setPromoStripFields((f) => ({ ...f, textEn: v }))}
                      onChangeAr={(v) => setPromoStripFields((f) => ({ ...f, textAr: v }))}
                      required
                      errorEn={fieldErrors.promoStripTextEn}
                    />
                    <LocalizedPair
                      labelEn="CTA Label EN"
                      labelAr="CTA Label AR"
                      valueEn={promoStripFields.ctaLabelEn}
                      valueAr={promoStripFields.ctaLabelAr}
                      onChangeEn={(v) => setPromoStripFields((f) => ({ ...f, ctaLabelEn: v }))}
                      onChangeAr={(v) => setPromoStripFields((f) => ({ ...f, ctaLabelAr: v }))}
                    />
                    <FullWidthField
                      label="CTA Link (href)"
                      value={promoStripFields.href}
                      onChange={(v) => setPromoStripFields((f) => ({ ...f, href: v }))}
                      placeholder={UI_STRINGS.shopPathPlaceholder}
                    />
                  </>
                )}

                {/* ---- HERO CAROUSEL fields ---- */}
              {activeType === 'hero_carousel' && (
                  <>
                    <FullWidthField
                      label="Autoplay (ms)"
                      value={heroCarouselFields.autoplayMs}
                      onChange={(v) => setHeroCarouselFields((f) => ({ ...f, autoplayMs: v }))}
                      placeholder="4000"
                    />
                    {fieldErrors.heroCarouselCards ? (
                      <ErrorHint message={fieldErrors.heroCarouselCards} />
                    ) : null}
                    {heroCarouselFields.cards.map((card, i) => (
                      <div
                        key={card.id}
                        style={{
                          border: `1px solid ${colors.border}`,
                          borderRadius: radius.xl,
                          padding: spacing['12'],
                          display: 'grid',
                          gap: spacing['12'],
                          backgroundColor: colors.surfaceMuted,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold) }}>
                            Card {i + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => setHeroCarouselFields((f) => ({ ...f, cards: f.cards.filter((_, idx) => idx !== i) }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.danger, display: 'inline-flex', alignItems: 'center', gap: spacing['4'], fontSize: typography.xs, padding: '2px 6px' }}
                          >
                            <Trash2 size={12} />
                            Remove
                          </button>
                        </div>
                        <LocalizedPair
                          labelEn="Title EN"
                          labelAr="Title AR"
                          valueEn={card.titleEn}
                          valueAr={card.titleAr}
                          onChangeEn={(v) => setHeroCarouselFields((f) => ({ ...f, cards: f.cards.map((c, idx) => idx === i ? { ...c, titleEn: v } : c) }))}
                          onChangeAr={(v) => setHeroCarouselFields((f) => ({ ...f, cards: f.cards.map((c, idx) => idx === i ? { ...c, titleAr: v } : c) }))}
                          required
                          errorEn={fieldErrors[`heroCarouselCard${i}TitleEn`]}
                        />
                        <LocalizedPair
                          labelEn="Subtitle EN"
                          labelAr="Subtitle AR"
                          valueEn={card.subtitleEn}
                          valueAr={card.subtitleAr}
                          onChangeEn={(v) => setHeroCarouselFields((f) => ({ ...f, cards: f.cards.map((c, idx) => idx === i ? { ...c, subtitleEn: v } : c) }))}
                          onChangeAr={(v) => setHeroCarouselFields((f) => ({ ...f, cards: f.cards.map((c, idx) => idx === i ? { ...c, subtitleAr: v } : c) }))}
                        />
                        <div style={{ display: 'grid', gap: spacing['4'] }}>
                          <FieldLabel required>{UI_STRINGS.imageLabel}</FieldLabel>
                          <UploadZone
                            imageUrl={card.imageUrl}
                            uploading={uploadingCardIdx === i}
                            onPick={() => { activeCardUploadIdx.current = i; fileInputCardRef.current?.click() }}
                            onClear={() => setHeroCarouselFields((f) => ({ ...f, cards: f.cards.map((c, idx) => idx === i ? { ...c, imageUrl: '' } : c) }))}
                            onDropFile={(file) => uploadCardImage(file, i)}
                            aspectW={16} aspectH={6}
                          />
                          <input
                            value={card.imageUrl}
                            onChange={(e) => setHeroCarouselFields((f) => ({ ...f, cards: f.cards.map((c, idx) => idx === i ? { ...c, imageUrl: e.target.value } : c) }))}
                            placeholder={UI_STRINGS.urlPlaceholder}
                            style={{ ...inputStyle, fontSize: typography.xs }}
                          />
                          <ErrorHint message={fieldErrors[`heroCarouselCard${i}ImageUrl`] ?? null} />
                        </div>
                        <LocalizedPair
                          labelEn="CTA Label EN"
                          labelAr="CTA Label AR"
                          valueEn={card.ctaLabelEn}
                          valueAr={card.ctaLabelAr}
                          onChangeEn={(v) => setHeroCarouselFields((f) => ({ ...f, cards: f.cards.map((c, idx) => idx === i ? { ...c, ctaLabelEn: v } : c) }))}
                          onChangeAr={(v) => setHeroCarouselFields((f) => ({ ...f, cards: f.cards.map((c, idx) => idx === i ? { ...c, ctaLabelAr: v } : c) }))}
                        />
                        <FullWidthField
                          label="CTA Link (href)"
                          value={card.href}
                          onChange={(v) => setHeroCarouselFields((f) => ({ ...f, cards: f.cards.map((c, idx) => idx === i ? { ...c, href: v } : c) }))}
                          placeholder={UI_STRINGS.shopPathPlaceholder}
                        />
                        <LocalizedPair
                          labelEn="Badge EN"
                          labelAr="Badge AR"
                          valueEn={card.badgeLabelEn}
                          valueAr={card.badgeLabelAr}
                          onChangeEn={(v) => setHeroCarouselFields((f) => ({ ...f, cards: f.cards.map((c, idx) => idx === i ? { ...c, badgeLabelEn: v } : c) }))}
                          onChangeAr={(v) => setHeroCarouselFields((f) => ({ ...f, cards: f.cards.map((c, idx) => idx === i ? { ...c, badgeLabelAr: v } : c) }))}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setHeroCarouselFields((f) => ({ ...f, cards: [...f.cards, makeCarouselCard()] }))}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'], cursor: 'pointer', border: `1px dashed ${colors.border}`, borderRadius: radius.xl, padding: `${spacing['8']} ${spacing['12']}`, backgroundColor: 'transparent', color: colors.textSecondary, fontSize: typography.sm }}
                    >
                      <Plus size={14} />
                      Add Card
                    </button>
                  </>
                )}

                {/* ---- FLASH SALE fields ---- */}
              {activeType === 'flash_sale' && (
                  <>
                    <LocalizedPair
                      labelEn="Title EN"
                      labelAr="Title AR"
                      valueEn={flashSaleFields.titleEn}
                      valueAr={flashSaleFields.titleAr}
                      onChangeEn={(v) => setFlashSaleFields((f) => ({ ...f, titleEn: v }))}
                      onChangeAr={(v) => setFlashSaleFields((f) => ({ ...f, titleAr: v }))}
                      required
                      errorEn={fieldErrors.flashSaleTitleEn}
                    />
                    <FullWidthField
                      label="Timer Ends At"
                      value={flashSaleFields.timerEndsAt}
                      onChange={(v) => setFlashSaleFields((f) => ({ ...f, timerEndsAt: v }))}
                      type="datetime-local"
                      required
                      errorMsg={fieldErrors.flashSaleTimerEndsAt}
                    />
                    <LocalizedPair
                      labelEn="Urgency Label EN"
                      labelAr="Urgency Label AR"
                      valueEn={flashSaleFields.urgencyLabelEn}
                      valueAr={flashSaleFields.urgencyLabelAr}
                      onChangeEn={(v) => setFlashSaleFields((f) => ({ ...f, urgencyLabelEn: v }))}
                      onChangeAr={(v) => setFlashSaleFields((f) => ({ ...f, urgencyLabelAr: v }))}
                    />
                    <LocalizedPair
                      labelEn="CTA Label EN"
                      labelAr="CTA Label AR"
                      valueEn={flashSaleFields.ctaLabelEn}
                      valueAr={flashSaleFields.ctaLabelAr}
                      onChangeEn={(v) => setFlashSaleFields((f) => ({ ...f, ctaLabelEn: v }))}
                      onChangeAr={(v) => setFlashSaleFields((f) => ({ ...f, ctaLabelAr: v }))}
                    />
                    <FullWidthField
                      label="CTA Link (href)"
                      value={flashSaleFields.href}
                      onChange={(v) => setFlashSaleFields((f) => ({ ...f, href: v }))}
                      placeholder={UI_STRINGS.salesPathPlaceholder}
                    />
                    <div style={{ display: 'grid', gap: spacing['4'] }}>
                      <FieldLabel>{UI_STRINGS.imageLabel}</FieldLabel>
                      <UploadZone
                        imageUrl={flashSaleFields.imageUrl}
                        uploading={uploading && uploadingCardIdx === null}
                        onPick={() => { activeCardUploadIdx.current = -1; fileInputRef.current?.click() }}
                        onClear={() => setFlashSaleFields((f) => ({ ...f, imageUrl: '' }))}
                        onDropFile={(file) => uploadImage(file, (url) => setFlashSaleFields((f) => ({ ...f, imageUrl: url })))}
                        aspectW={16} aspectH={9}
                      />
                      <input className='admin-focus-ring' value={flashSaleFields.imageUrl} onChange={(e) => setFlashSaleFields((f) => ({ ...f, imageUrl: e.target.value }))} placeholder={UI_STRINGS.urlPlaceholder} style={{ ...inputStyle, fontSize: typography.xs }} />
                    </div>
                  </>
                )}

                {/* ---- BRAND SPOTLIGHT fields ---- */}
              {activeType === 'brand_spotlight' && (
                  <>
                    <SectionDivider label="Banner" />
                    <LocalizedPair
                      labelEn="Banner Title EN"
                      labelAr="Banner Title AR"
                      valueEn={brandSpotlightFields.bannerTitleEn}
                      valueAr={brandSpotlightFields.bannerTitleAr}
                      onChangeEn={(v) => setBrandSpotlightFields((f) => ({ ...f, bannerTitleEn: v }))}
                      onChangeAr={(v) => setBrandSpotlightFields((f) => ({ ...f, bannerTitleAr: v }))}
                      errorEn={fieldErrors.brandSpotlightBannerTitleEn}
                    />
                    <LocalizedPair
                      labelEn="Banner Subtitle EN"
                      labelAr="Banner Subtitle AR"
                      valueEn={brandSpotlightFields.bannerSubtitleEn}
                      valueAr={brandSpotlightFields.bannerSubtitleAr}
                      onChangeEn={(v) => setBrandSpotlightFields((f) => ({ ...f, bannerSubtitleEn: v }))}
                      onChangeAr={(v) => setBrandSpotlightFields((f) => ({ ...f, bannerSubtitleAr: v }))}
                    />
                    <div style={{ display: 'grid', gap: spacing['4'] }}>
                      <FieldLabel required>{UI_STRINGS.bannerImageLabel}</FieldLabel>
                      <UploadZone
                        imageUrl={brandSpotlightFields.bannerImageUrl}
                        uploading={uploading && uploadingCardIdx === null}
                        onPick={() => { activeCardUploadIdx.current = -1; fileInputRef.current?.click() }}
                        onClear={() => setBrandSpotlightFields((f) => ({ ...f, bannerImageUrl: '' }))}
                        onDropFile={(file) => uploadImage(file, (url) => setBrandSpotlightFields((f) => ({ ...f, bannerImageUrl: url })))}
                        aspectW={16} aspectH={6}
                      />
                      <input className='admin-focus-ring' value={brandSpotlightFields.bannerImageUrl} onChange={(e) => setBrandSpotlightFields((f) => ({ ...f, bannerImageUrl: e.target.value }))} placeholder={UI_STRINGS.urlPlaceholder} style={{ ...inputStyle, fontSize: typography.xs }} />
                      <ErrorHint message={fieldErrors.brandSpotlightBannerImageUrl ?? null} />
                    </div>
                    <LocalizedPair
                      labelEn="Banner CTA Label EN"
                      labelAr="Banner CTA Label AR"
                      valueEn={brandSpotlightFields.bannerCtaLabelEn}
                      valueAr={brandSpotlightFields.bannerCtaLabelAr}
                      onChangeEn={(v) => setBrandSpotlightFields((f) => ({ ...f, bannerCtaLabelEn: v }))}
                      onChangeAr={(v) => setBrandSpotlightFields((f) => ({ ...f, bannerCtaLabelAr: v }))}
                    />
                    <FullWidthField
                      label="Banner CTA Link (href)"
                      value={brandSpotlightFields.bannerHref}
                      onChange={(v) => setBrandSpotlightFields((f) => ({ ...f, bannerHref: v }))}
                      placeholder={UI_STRINGS.brandsPathPlaceholder}
                    />
                    <SectionDivider label="Product Rail" />
                    <LocalizedPair
                      labelEn="Rail Title EN"
                      labelAr="Rail Title AR"
                      valueEn={brandSpotlightFields.railTitleEn}
                      valueAr={brandSpotlightFields.railTitleAr}
                      onChangeEn={(v) => setBrandSpotlightFields((f) => ({ ...f, railTitleEn: v }))}
                      onChangeAr={(v) => setBrandSpotlightFields((f) => ({ ...f, railTitleAr: v }))}
                    />
                    <QueryDropdown
                      value={brandSpotlightFields.querySlug}
                      onChange={(v) => setBrandSpotlightFields((f) => ({ ...f, querySlug: v }))}
                      queries={queries}
                      loading={queriesLoading}
                      loadError={queriesError}
                    />
                  </>
                )}

                {/* ---- OFFER BANNERS fields ---- */}
              {activeType === 'offer_banners' && (
                  <>
                    {fieldErrors.offerBannersItems ? (
                      <ErrorHint message={fieldErrors.offerBannersItems} />
                    ) : null}
                    {offerBannersFields.items.map((item, i) => (
                      <div
                        key={item.id}
                        style={{
                          border: `1px solid ${colors.border}`,
                          borderRadius: radius.xl,
                          padding: spacing['12'],
                          display: 'grid',
                          gap: spacing['12'],
                          backgroundColor: colors.surfaceMuted,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold) }}>
                            Tile {i + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => setOfferBannersFields((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.danger, display: 'inline-flex', alignItems: 'center', gap: spacing['4'], fontSize: typography.xs, padding: '2px 6px' }}
                          >
                            <Trash2 size={12} />
                            Remove
                          </button>
                        </div>
                        <div style={{ display: 'grid', gap: spacing['4'] }}>
                          <FieldLabel required>{UI_STRINGS.imageLabel}</FieldLabel>
                          <UploadZone
                            imageUrl={item.imageUrl}
                            uploading={uploadingCardIdx === i}
                            onPick={() => { activeCardUploadIdx.current = i; fileInputCardRef.current?.click() }}
                            onClear={() => setOfferBannersFields((f) => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, imageUrl: '' } : it) }))}
                            onDropFile={(file) => {
                              setUploadingCardIdx(i)
                              uploadImage(file, (url) => setOfferBannersFields((f) => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, imageUrl: url } : it) })))
                            }}
                            aspectW={3} aspectH={1}
                          />
                          <input
                            value={item.imageUrl}
                            onChange={(e) => setOfferBannersFields((f) => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, imageUrl: e.target.value } : it) }))}
                            placeholder={UI_STRINGS.urlPlaceholder}
                            style={{ ...inputStyle, fontSize: typography.xs }}
                          />
                          <ErrorHint message={fieldErrors[`offerBannersItem${i}ImageUrl`] ?? null} />
                        </div>
                        <FullWidthField
                          label="Link (href)"
                          value={item.href}
                          onChange={(v) => setOfferBannersFields((f) => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, href: v } : it) }))}
                          placeholder={UI_STRINGS.shopPathPlaceholder}
                        />
                        <LocalizedPair
                          labelEn="CTA Label EN"
                          labelAr="CTA Label AR"
                          valueEn={item.ctaLabelEn}
                          valueAr={item.ctaLabelAr}
                          onChangeEn={(v) => setOfferBannersFields((f) => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, ctaLabelEn: v } : it) }))}
                          onChangeAr={(v) => setOfferBannersFields((f) => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, ctaLabelAr: v } : it) }))}
                        />
                      </div>
                    ))}
                    {offerBannersFields.items.length < 4 ? (
                      <button
                        type="button"
                        onClick={() => setOfferBannersFields((f) => ({ ...f, items: [...f.items, makeOfferItem()] }))}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'], cursor: 'pointer', border: `1px dashed ${colors.border}`, borderRadius: radius.xl, padding: `${spacing['8']} ${spacing['12']}`, backgroundColor: 'transparent', color: colors.textSecondary, fontSize: typography.sm }}
                      >
                        <Plus size={14} />
                        Add Tile
                      </button>
                    ) : (
                      <span style={{ fontSize: typography.xs, color: colors.textSecondary }}>{UI_STRINGS.maxTilesReached}</span>
                    )}
                  </>
                )}

                {/* ---- EDUCATION BANNER fields ---- */}
              {activeType === 'education_banner' && (
                  <>
                    <LocalizedPair
                      labelEn="Title EN"
                      labelAr="Title AR"
                      valueEn={educationBannerFields.titleEn}
                      valueAr={educationBannerFields.titleAr}
                      onChangeEn={(v) => setEducationBannerFields((f) => ({ ...f, titleEn: v }))}
                      onChangeAr={(v) => setEducationBannerFields((f) => ({ ...f, titleAr: v }))}
                      required
                      errorEn={fieldErrors.educationBannerTitleEn}
                    />
                    <LocalizedPair
                      labelEn="Body EN"
                      labelAr="Body AR"
                      valueEn={educationBannerFields.bodyEn}
                      valueAr={educationBannerFields.bodyAr}
                      onChangeEn={(v) => setEducationBannerFields((f) => ({ ...f, bodyEn: v }))}
                      onChangeAr={(v) => setEducationBannerFields((f) => ({ ...f, bodyAr: v }))}
                    />
                    <LocalizedPair
                      labelEn="CTA Label EN"
                      labelAr="CTA Label AR"
                      valueEn={educationBannerFields.ctaLabelEn}
                      valueAr={educationBannerFields.ctaLabelAr}
                      onChangeEn={(v) => setEducationBannerFields((f) => ({ ...f, ctaLabelEn: v }))}
                      onChangeAr={(v) => setEducationBannerFields((f) => ({ ...f, ctaLabelAr: v }))}
                    />
                    <FullWidthField
                      label="CTA Link (href)"
                      value={educationBannerFields.href}
                      onChange={(v) => setEducationBannerFields((f) => ({ ...f, href: v }))}
                      placeholder={UI_STRINGS.learnPathPlaceholder}
                    />
                    <div style={{ display: 'grid', gap: spacing['4'] }}>
                      <FieldLabel>{UI_STRINGS.imageLabel}</FieldLabel>
                      <UploadZone
                        imageUrl={educationBannerFields.imageUrl}
                        uploading={uploading && uploadingCardIdx === null}
                        onPick={() => { activeCardUploadIdx.current = -1; fileInputRef.current?.click() }}
                        onClear={() => setEducationBannerFields((f) => ({ ...f, imageUrl: '' }))}
                        onDropFile={(file) => uploadImage(file, (url) => setEducationBannerFields((f) => ({ ...f, imageUrl: url })))}
                        aspectW={16} aspectH={6}
                      />
                      <input className='admin-focus-ring' value={educationBannerFields.imageUrl} onChange={(e) => setEducationBannerFields((f) => ({ ...f, imageUrl: e.target.value }))} placeholder={UI_STRINGS.urlPlaceholder} style={{ ...inputStyle, fontSize: typography.xs }} />
                    </div>
                  </>
                )}

                {/* ---- NEWSLETTER CTA fields ---- */}
              {activeType === 'newsletter_cta' && (
                  <>
                    <LocalizedPair
                      labelEn="Title EN"
                      labelAr="Title AR"
                      valueEn={newsletterCtaFields.titleEn}
                      valueAr={newsletterCtaFields.titleAr}
                      onChangeEn={(v) => setNewsletterCtaFields((f) => ({ ...f, titleEn: v }))}
                      onChangeAr={(v) => setNewsletterCtaFields((f) => ({ ...f, titleAr: v }))}
                      required
                      errorEn={fieldErrors.newsletterCtaTitleEn}
                    />
                    <LocalizedPair
                      labelEn="Subtitle EN"
                      labelAr="Subtitle AR"
                      valueEn={newsletterCtaFields.subtitleEn}
                      valueAr={newsletterCtaFields.subtitleAr}
                      onChangeEn={(v) => setNewsletterCtaFields((f) => ({ ...f, subtitleEn: v }))}
                      onChangeAr={(v) => setNewsletterCtaFields((f) => ({ ...f, subtitleAr: v }))}
                    />
                    <LocalizedPair
                      labelEn="CTA Label EN"
                      labelAr="CTA Label AR"
                      valueEn={newsletterCtaFields.ctaLabelEn}
                      valueAr={newsletterCtaFields.ctaLabelAr}
                      onChangeEn={(v) => setNewsletterCtaFields((f) => ({ ...f, ctaLabelEn: v }))}
                      onChangeAr={(v) => setNewsletterCtaFields((f) => ({ ...f, ctaLabelAr: v }))}
                    />
                    <FullWidthField
                      label="CTA Link (href)"
                      value={newsletterCtaFields.href}
                      onChange={(v) => setNewsletterCtaFields((f) => ({ ...f, href: v }))}
                      placeholder={UI_STRINGS.newsletterPathPlaceholder}
                    />
                  </>
                )}

                {/* ---- TOP BRANDS fields ---- */}
              {activeType === 'top_brands' && (
                  <>
                    <LocalizedPair
                      labelEn="Section Title EN"
                      labelAr="Section Title AR"
                      valueEn={topBrandsFields.titleEn}
                      valueAr={topBrandsFields.titleAr}
                      onChangeEn={(v) => setTopBrandsFields((f) => ({ ...f, titleEn: v }))}
                      onChangeAr={(v) => setTopBrandsFields((f) => ({ ...f, titleAr: v }))}
                    />
                    {fieldErrors.topBrandsItems ? (
                      <ErrorHint message={fieldErrors.topBrandsItems} />
                    ) : null}
                    {topBrandsFields.items.map((item, i) => (
                      <div
                        key={item.id}
                        style={{
                          border: `1px solid ${colors.border}`,
                          borderRadius: radius.xl,
                          padding: spacing['12'],
                          display: 'grid',
                          gap: spacing['12'],
                          backgroundColor: colors.surfaceMuted,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold) }}>
                            Brand {i + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => setTopBrandsFields((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.danger, display: 'inline-flex', alignItems: 'center', gap: spacing['4'], fontSize: typography.xs, padding: '2px 6px' }}
                          >
                            <Trash2 size={12} />
                            Remove
                          </button>
                        </div>
                        <FullWidthField
                          label="Brand Name"
                          value={item.name}
                          onChange={(v) => setTopBrandsFields((f) => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, name: v } : it) }))}
                          required
                          errorMsg={fieldErrors[`topBrandsItem${i}Name`]}
                        />
                        <FullWidthField
                          label="Logo URL"
                          value={item.logoUrl}
                          onChange={(v) => setTopBrandsFields((f) => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, logoUrl: v } : it) }))}
                          placeholder={UI_STRINGS.brandsUrlPlaceholder}
                        />
                        <FullWidthField
                          label="Link (href)"
                          value={item.href}
                          onChange={(v) => setTopBrandsFields((f) => ({ ...f, items: f.items.map((it, idx) => idx === i ? { ...it, href: v } : it) }))}
                          placeholder={UI_STRINGS.brandsPathPlaceholder}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setTopBrandsFields((f) => ({ ...f, items: [...f.items, makeTopBrandItem()] }))}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'], cursor: 'pointer', border: `1px dashed ${colors.border}`, borderRadius: radius.xl, padding: `${spacing['8']} ${spacing['12']}`, backgroundColor: 'transparent', color: colors.textSecondary, fontSize: typography.sm }}
                    >
                      <Plus size={14} />
                      Add Brand
                    </button>
                  </>
                )}

                {/* ---- UGC GALLERY fields ---- */}
              {activeType === 'ugc_gallery' && (
                  <>
                    <LocalizedPair
                      labelEn="Title EN"
                      labelAr="Title AR"
                      valueEn={ugcGalleryFields.titleEn}
                      valueAr={ugcGalleryFields.titleAr}
                      onChangeEn={(v) => setUgcGalleryFields((f) => ({ ...f, titleEn: v }))}
                      onChangeAr={(v) => setUgcGalleryFields((f) => ({ ...f, titleAr: v }))}
                    />
                    <div
                      style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: radius.xl,
                        padding: spacing['12'],
                        backgroundColor: colors.surfaceMuted,
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing['8'],
                      }}
                    >
                      <AlertCircle size={14} color={colors.textSecondary} />
                      <span style={{ fontSize: typography.xs, color: colors.textSecondary }}>
                        {UI_STRINGS.ugcGalleryHint}
                      </span>
                    </div>
                  </>
                )}

                {/* ---- PERSONALIZED RAIL fields ---- */}
              {activeType === 'personalized_rail' && (
                  <>
                    <LocalizedPair
                      labelEn="Title EN"
                      labelAr="Title AR"
                      valueEn={personalizedRailFields.titleEn}
                      valueAr={personalizedRailFields.titleAr}
                      onChangeEn={(v) => setPersonalizedRailFields((f) => ({ ...f, titleEn: v }))}
                      onChangeAr={(v) => setPersonalizedRailFields((f) => ({ ...f, titleAr: v }))}
                      required
                      errorEn={fieldErrors.personalizedRailTitleEn}
                    />
                    <label style={{ display: 'grid', gap: spacing['4'] }}>
                      <FieldLabel required>{UI_STRINGS.modeLabel}</FieldLabel>
                      <select
                        value={personalizedRailFields.mode}
                        onChange={(e) => setPersonalizedRailFields((f) => ({ ...f, mode: e.target.value as 'static' | 'rule-based' }))}
                        style={inputStyle}
                      >
                        <option value="static">{UI_STRINGS.staticModeLabel}</option>
                        <option value="rule-based">{UI_STRINGS.ruleBasedModeLabel}</option>
                      </select>
                    </label>
                    {personalizedRailFields.mode === 'static' && (
                      <QueryDropdown
                        value={personalizedRailFields.querySlug}
                        onChange={(v) => setPersonalizedRailFields((f) => ({ ...f, querySlug: v }))}
                        queries={queries}
                        loading={queriesLoading}
                        loadError={queriesError}
                      />
                    )}
                  </>
                )}

                {/* ---- EDITORIAL HOTSPOT fields ---- */}
              {activeType === 'editorial_hotspot' && (
                  <>
                    <LocalizedPair
                      labelEn="Title EN"
                      labelAr="Title AR"
                      valueEn={editorialHotspotFields.titleEn}
                      valueAr={editorialHotspotFields.titleAr}
                      onChangeEn={(v) => setEditorialHotspotFields((f) => ({ ...f, titleEn: v }))}
                      onChangeAr={(v) => setEditorialHotspotFields((f) => ({ ...f, titleAr: v }))}
                    />
                    <LocalizedPair
                      labelEn="Subtitle EN"
                      labelAr="Subtitle AR"
                      valueEn={editorialHotspotFields.subtitleEn}
                      valueAr={editorialHotspotFields.subtitleAr}
                      onChangeEn={(v) => setEditorialHotspotFields((f) => ({ ...f, subtitleEn: v }))}
                      onChangeAr={(v) => setEditorialHotspotFields((f) => ({ ...f, subtitleAr: v }))}
                    />
                    <LocalizedPair
                      labelEn="CTA Label EN"
                      labelAr="CTA Label AR"
                      valueEn={editorialHotspotFields.ctaLabelEn}
                      valueAr={editorialHotspotFields.ctaLabelAr}
                      onChangeEn={(v) => setEditorialHotspotFields((f) => ({ ...f, ctaLabelEn: v }))}
                      onChangeAr={(v) => setEditorialHotspotFields((f) => ({ ...f, ctaLabelAr: v }))}
                    />
                    <FullWidthField
                      label="CTA Link (href)"
                      value={editorialHotspotFields.href}
                      onChange={(v) => setEditorialHotspotFields((f) => ({ ...f, href: v }))}
                      placeholder={UI_STRINGS.shopPathPlaceholder}
                    />
                    <div style={{ display: 'grid', gap: spacing['4'] }}>
                      <FieldLabel required>{UI_STRINGS.imageLabel}</FieldLabel>
                      <UploadZone
                        imageUrl={editorialHotspotFields.imageUrl}
                        uploading={uploading && uploadingCardIdx === null}
                        onPick={() => { activeCardUploadIdx.current = -1; fileInputRef.current?.click() }}
                        onClear={() => setEditorialHotspotFields((f) => ({ ...f, imageUrl: '' }))}
                        onDropFile={(file) => uploadImage(file, (url) => setEditorialHotspotFields((f) => ({ ...f, imageUrl: url })))}
                        aspectW={1} aspectH={1}
                        frameWidth={componentTokens.storefrontHome.editorialHotspot.desktopImageSize}
                        frameHeight={componentTokens.storefrontHome.editorialHotspot.desktopImageSize}
                        previewFit='cover'
                      />
                      <input
                        className='admin-focus-ring'
                        value={editorialHotspotFields.imageUrl}
                        onChange={(e) => setEditorialHotspotFields((f) => ({ ...f, imageUrl: e.target.value }))}
                        placeholder={UI_STRINGS.urlPlaceholder}
                        style={{ ...inputStyle, fontSize: typography.xs }}
                      />
                      <ErrorHint message={fieldErrors.editorialHotspotImageUrl ?? null} />
                    </div>
                    <div style={{ display: 'grid', gap: spacing['8'] }}>
                      <label style={{ display: 'grid', gap: spacing['4'] }}>
                        <FieldLabel required>{UI_STRINGS.productSearchLabel}</FieldLabel>
                        <input
                          className='admin-focus-ring'
                          value={editorialHotspotSearch}
                          onChange={(e) => setEditorialHotspotSearch(e.target.value)}
                          placeholder={UI_STRINGS.productSearchPlaceholder}
                          style={inputStyle}
                        />
                        <span style={{ fontSize: typography.xs, color: colors.textSecondary }}>
                          {UI_STRINGS.productSearchHelp}
                        </span>
                      </label>
                      {editorialHotspotSearchLoading ? (
                        <InlineLoading label={UI_STRINGS.productSearchLoading} />
                      ) : null}
                      {editorialHotspotSearchError ? (
                        <ErrorHint message={editorialHotspotSearchError} />
                      ) : null}
                      {!editorialHotspotSearchLoading && !editorialHotspotSearchError && editorialHotspotSearch.trim().length >= 2 ? (
                        <div
                          style={{
                            display: 'grid',
                            gap: spacing['8'],
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.xl,
                            padding: spacing['12'],
                            backgroundColor: colors.surfaceMuted,
                          }}
                        >
                          {editorialHotspotSearchResults.length > 0 ? (
                            editorialHotspotSearchResults.map((product) => {
                              const alreadySelected = editorialHotspotSelectedProductIds.includes(product.id)
                              const reachedLimit = !alreadySelected && editorialHotspotSelectedProductIds.length >= 4

                              return (
                                <div
                                  key={product.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: spacing['12'],
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing['10'], minWidth: 0, flex: 1 }}>
                                    <div
                                      style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: radius.md,
                                        overflow: 'hidden',
                                        border: `1px solid ${colors.border}`,
                                        backgroundColor: colors.surface,
                                        flexShrink: 0,
                                      }}
                                    >
                                      {product.image ? (
                                        <img
                                          src={product.image}
                                          alt={product.title}
                                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                        />
                                      ) : null}
                                    </div>
                                    <div style={{ display: 'grid', gap: spacing['2'], minWidth: 0, flex: 1 }}>
                                      <span style={{ color: colors.textSecondary, fontSize: typography.xs, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                                        {formatAdminBrandName(product.brand)}
                                      </span>
                                      <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {product.title}
                                      </span>
                                      <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>
                                        {[product.sku, product.id].filter(Boolean).join(' · ')}
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    tone={alreadySelected ? 'secondary' : 'primary'}
                                    disabled={alreadySelected || reachedLimit}
                                    onClick={() => addEditorialHotspotProduct(product.id)}
                                  >
                                    {alreadySelected ? UI_STRINGS.addedProductButton : UI_STRINGS.addProductButton}
                                  </Button>
                                </div>
                              )
                            })
                          ) : (
                            <span style={{ fontSize: typography.xs, color: colors.textSecondary }}>
                              {UI_STRINGS.productSearchEmpty}
                            </span>
                          )}
                        </div>
                      ) : null}
                      <div style={{ display: 'grid', gap: spacing['6'] }}>
                        <FieldLabel required>{UI_STRINGS.selectedProductsLabel}</FieldLabel>
                        {editorialHotspotSelectedProductIds.length > 0 ? (
                          editorialHotspotSelectedProductIds.map((productId, index) => (
                            <div
                              key={productId}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: spacing['12'],
                                border: `1px solid ${colors.border}`,
                                borderRadius: radius.lg,
                                padding: spacing['10'],
                                backgroundColor: colors.surface,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: spacing['10'], minWidth: 0, flex: 1 }}>
                                <span style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.semibold), width: 24, flexShrink: 0 }}>
                                  #{index + 1}
                                </span>
                                <div
                                  style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: radius.md,
                                    overflow: 'hidden',
                                    border: `1px solid ${colors.border}`,
                                    backgroundColor: colors.surfaceMuted,
                                    flexShrink: 0,
                                  }}
                                >
                                  {editorialHotspotSelectedProductsById.get(productId)?.image ? (
                                    <img
                                      src={editorialHotspotSelectedProductsById.get(productId)!.image}
                                      alt={editorialHotspotSelectedProductsById.get(productId)!.title}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    />
                                  ) : null}
                                </div>
                                <div style={{ display: 'grid', gap: spacing['2'], minWidth: 0, flex: 1 }}>
                                  <span style={{ color: colors.textSecondary, fontSize: typography.xs, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                                    {formatAdminBrandName(editorialHotspotSelectedProductsById.get(productId)?.brand)}
                                  </span>
                                  <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {editorialHotspotSelectedProductsById.get(productId)?.title ?? productId}
                                  </span>
                                  <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>
                                    {[editorialHotspotSelectedProductsById.get(productId)?.sku, productId].filter(Boolean).join(' · ')}
                                  </span>
                                </div>
                              </div>
                              <Button tone='secondary' onClick={() => removeEditorialHotspotProduct(productId)}>
                                {UI_STRINGS.removeButton}
                              </Button>
                            </div>
                          ))
                        ) : (
                          <span style={{ fontSize: typography.xs, color: colors.textSecondary }}>
                            {UI_STRINGS.productIdsHint}
                          </span>
                        )}
                        <ErrorHint message={fieldErrors.editorialHotspotProductIds ?? null} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: spacing['8'] }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <FieldLabel>{UI_STRINGS.hotspotMarkersLabel}</FieldLabel>
                        <button
                          type='button'
                          onClick={() => setEditorialHotspotFields((f) => ({ ...f, hotspots: [...f.hotspots, makeEditorialHotspotMarker()] }))}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'], cursor: 'pointer', border: `1px dashed ${colors.border}`, borderRadius: radius.xl, padding: `${spacing['6']} ${spacing['10']}`, backgroundColor: 'transparent', color: colors.textSecondary, fontSize: typography.xs }}
                        >
                          <Plus size={12} />
                          Add Hotspot
                        </button>
                      </div>
                      {editorialHotspotFields.hotspots.map((hotspot, i) => (
                        <div
                          key={hotspot.id}
                          style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.xl,
                            padding: spacing['12'],
                            display: 'grid',
                            gap: spacing['12'],
                            backgroundColor: colors.surfaceMuted,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold) }}>
                              Hotspot {i + 1}
                            </span>
                            <button
                              type='button'
                              onClick={() => setEditorialHotspotFields((f) => ({ ...f, hotspots: f.hotspots.filter((_, idx) => idx !== i) }))}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.danger, display: 'inline-flex', alignItems: 'center', gap: spacing['4'], fontSize: typography.xs, padding: '2px 6px' }}
                            >
                              <Trash2 size={12} />
                              Remove
                            </button>
                          </div>
                          <FullWidthField
                            label="Product ID"
                            value={hotspot.productId}
                            onChange={(v) => setEditorialHotspotFields((f) => ({ ...f, hotspots: f.hotspots.map((item, idx) => idx === i ? { ...item, productId: v } : item) }))}
                            required
                            errorMsg={fieldErrors[`editorialHotspotHotspot${i}ProductId`]}
                          />
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing['12'] }}>
                            <FullWidthField
                              label="X %"
                              value={hotspot.xPercent}
                              onChange={(v) => setEditorialHotspotFields((f) => ({ ...f, hotspots: f.hotspots.map((item, idx) => idx === i ? { ...item, xPercent: v } : item) }))}
                              placeholder={UI_STRINGS.centerPercentPlaceholder}
                              errorMsg={fieldErrors[`editorialHotspotHotspot${i}XPercent`]}
                            />
                            <FullWidthField
                              label="Y %"
                              value={hotspot.yPercent}
                              onChange={(v) => setEditorialHotspotFields((f) => ({ ...f, hotspots: f.hotspots.map((item, idx) => idx === i ? { ...item, yPercent: v } : item) }))}
                              placeholder={UI_STRINGS.centerPercentPlaceholder}
                              errorMsg={fieldErrors[`editorialHotspotHotspot${i}YPercent`]}
                            />
                          </div>
                          <LocalizedPair
                            labelEn="Label EN"
                            labelAr="Label AR"
                            valueEn={hotspot.labelEn}
                            valueAr={hotspot.labelAr}
                            onChangeEn={(v) => setEditorialHotspotFields((f) => ({ ...f, hotspots: f.hotspots.map((item, idx) => idx === i ? { ...item, labelEn: v } : item) }))}
                            onChangeAr={(v) => setEditorialHotspotFields((f) => ({ ...f, hotspots: f.hotspots.map((item, idx) => idx === i ? { ...item, labelAr: v } : item) }))}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Hidden file inputs for image uploads */}
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/jpeg,image/png,image/webp'
                  aria-label='Upload block image'
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    e.target.value = ''
                    const idx = activeCardUploadIdx.current
                    if (idx >= 0 && activeType === 'hero_carousel') {
                      await uploadCardImage(file, idx)
                    } else {
                      // route to correct field based on active block type
                      if (activeType === 'hero') await uploadImage(file, (url) => setHeroFields((f) => ({ ...f, imageUrl: url })))
                      else if (activeType === 'brand_promo') await uploadImage(file, (url) => setBrandPromoFields((f) => ({ ...f, imageUrl: url })))
                      else if (activeType === 'flash_sale') await uploadImage(file, (url) => setFlashSaleFields((f) => ({ ...f, imageUrl: url })))
                      else if (activeType === 'brand_spotlight') await uploadImage(file, (url) => setBrandSpotlightFields((f) => ({ ...f, bannerImageUrl: url })))
                      else if (activeType === 'education_banner') await uploadImage(file, (url) => setEducationBannerFields((f) => ({ ...f, imageUrl: url })))
                      else if (activeType === 'editorial_hotspot') await uploadImage(file, (url) => setEditorialHotspotFields((f) => ({ ...f, imageUrl: url })))
                    }
                  }}
                />
                <input
                  ref={fileInputCardRef}
                  type='file'
                  accept='image/jpeg,image/png,image/webp'
                  aria-label='Upload card image'
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    e.target.value = ''
                    const idx = activeCardUploadIdx.current
                    if (idx >= 0) {
                      if (activeType === 'hero_carousel') await uploadCardImage(file, idx)
                      else if (activeType === 'offer_banners') {
                        setUploadingCardIdx(idx)
                        await uploadImage(file, (url) => setOfferBannersFields((f) => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, imageUrl: url } : it) })))
                      }
                    }
                  }}
                />

                {/* Payload validation error (schema-level) */}
                {saveAttempted && payloadError ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing['8'],
                      border: `1px solid ${colors.danger}`,
                      borderRadius: radius.xl,
                      backgroundColor: colors.surface,
                      color: colors.danger,
                      padding: spacing['12'],
                      fontSize: typography.xs,
                    }}
                  >
                    <AlertCircle size={14} />
                    {payloadError}
                  </div>
                ) : null}
              </div>
          </AdminFormScaffold>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* PREVIEW MODAL                                                       */}
      {/* ----------------------------------------------------------------- */}
      {previewOpen && selected ? (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', flexDirection: 'column',
            backgroundColor: 'rgba(0,0,0,0.72)',
          }}
          onClick={() => setPreviewOpen(false)}
        >
          {/* Toolbar */}
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: `${spacing['8']}px ${spacing['16']}px`,
              backgroundColor: colors.surface,
              borderBottom: `1px solid ${colors.border}`,
              flexShrink: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'] }}>
              <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold) }}>
                Homepage Preview
              </span>
              <span style={{ fontSize: typography.xs, color: colors.textSecondary, backgroundColor: colors.surfaceMuted, borderRadius: radius.full, padding: '2px 10px' }}>
                {BLOCK_TYPE_LABELS[activeType] ?? activeType}
              </span>
              {payloadError ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'], fontSize: typography.xs, color: colors.danger }}>
                  <AlertCircle size={12} color={colors.danger} />
                  Unsaved changes have schema errors
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'], fontSize: typography.xs, color: colors.success }}>
                  <CheckCircle2 size={12} color={colors.success} />
                  Showing saved release data
                </span>
              )}
            </div>
            <div style={{ display: 'inline-flex', gap: spacing['8'], alignItems: 'center' }}>
              {previewToken ? (
                <a
                  href={`/?previewToken=${encodeURIComponent(previewToken)}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'], fontSize: typography.xs, color: colors.textSecondary, textDecoration: 'none' }}
                >
                  <ExternalLink size={12} />
                  Open in tab
                </a>
              ) : null}
              <button
                type='button'
                aria-label='Close preview'
                onClick={() => setPreviewOpen(false)}
                style={{
                  width: 28, height: 28, borderRadius: radius.full, border: 'none',
                  backgroundColor: colors.surfaceMuted, color: colors.textSecondary,
                  display: 'grid', placeItems: 'center', cursor: 'pointer',
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* iframe fills remaining space */}
          <div style={{ flex: 1, overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            {previewToken ? (
              <iframe
                src={`/?previewToken=${encodeURIComponent(previewToken)}`}
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                title='Homepage preview'
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing['12'], backgroundColor: colors.surfaceMuted }}>
                {previewTokenLoading ? (
                  <>
                    <InlineLoading label={UI_STRINGS.previewLoading} size={24} />
                  </>
                ) : (
                  <span style={{ fontSize: typography.sm, color: colors.danger }}>{UI_STRINGS.previewFailure}</span>
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* ----------------------------------------------------------------- */}
      {/* PUBLISH GUARD MODAL                                                */}
      {/* ----------------------------------------------------------------- */}
      {publishGuardOpen ? (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.55)',
          }}
          onClick={() => setPublishGuardOpen(false)}
        >
          <div
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.xl,
              padding: spacing['24'],
              width: 440,
              maxWidth: '90vw',
              display: 'grid',
              gap: spacing['16'],
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing['12'] }}>
              <span style={{ width: 36, height: 36, borderRadius: radius.full, backgroundColor: '#fef3c7', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <AlertCircle size={18} color='#d97706' />
              </span>
              <div style={{ display: 'grid', gap: spacing['6'] }}>
                <span style={{ color: colors.textPrimary, fontSize: typography.base, fontWeight: Number(fontWeights.semibold) }}>
                  You have unsaved homepage changes
                </span>
                <span style={{ color: colors.textSecondary, fontSize: typography.sm }}>
                  Save everything you still want included before publishing this release.
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: spacing['8'] }}>
              {draftOrderDirty ? (
                <div style={{ border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: spacing['12'], display: 'grid', gap: spacing['4'] }}>
                  <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium) }}>
                    Unsaved homepage order
                  </span>
                  <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>
                    The left-side block order changed and still needs `Save order`.
                  </span>
                </div>
              ) : null}
              {isDirty ? (
                <div style={{ border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: spacing['12'], display: 'grid', gap: spacing['4'] }}>
                  <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium) }}>
                    Unsaved edits in the selected block
                  </span>
                  <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>
                    The open block editor still has changes that are not part of the release yet.
                  </span>
                </div>
              ) : null}
              {!hasPublishGuardIssues ? (
                <div style={{ border: `1px solid ${colors.border}`, borderRadius: radius.lg, padding: spacing['12'], display: 'grid', gap: spacing['4'], backgroundColor: colors.surfaceMuted }}>
                  <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium) }}>
                    All required saves are complete
                  </span>
                  <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>
                    You can publish this release now.
                  </span>
                </div>
              ) : null}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing['8'], flexWrap: 'wrap' }}>
              <Button tone='secondary' onClick={() => setPublishGuardOpen(false)}>
                Cancel
              </Button>
              {draftOrderDirty ? (
                <Button
                  tone='primary'
                  disabled={savingOrder}
                  onClick={async () => {
                    await saveOrderDraft()
                  }}
                >
                  {savingOrder ? 'Saving order...' : 'Save order'}
                </Button>
              ) : null}
              {isDirty ? (
                <Button
                  tone='primary'
                  disabled={savingBlock}
                  onClick={async () => {
                    await saveSelectedBlock()
                  }}
                >
                  {savingBlock ? 'Saving block...' : 'Save block'}
                </Button>
              ) : null}
              {!hasPublishGuardIssues ? (
                <Button
                  tone='primary'
                  disabled={publishing}
                  onClick={async () => {
                    await publishRelease()
                  }}
                >
                  {publishing ? 'Publishing...' : 'Publish'}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {/* ----------------------------------------------------------------- */}
      {/* ADD BLOCK MODAL — pick type before creating                        */}
      {/* ----------------------------------------------------------------- */}
      {addModalOpen ? (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.55)',
          }}
          onClick={() => setAddModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.xl,
              padding: spacing['24'],
              width: 360,
              maxWidth: '90vw',
              display: 'grid',
              gap: spacing['16'],
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ color: colors.textPrimary, fontSize: typography.base, fontWeight: Number(fontWeights.semibold) }}>
              Add Block
            </span>

            <label style={{ display: 'grid', gap: spacing['4'] }}>
              <span style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>
                {UI_STRINGS.blockTypeLabel}
              </span>
              <select
                value={addModalType}
                onChange={(e) => setAddModalType(e.target.value as BlockType)}
                style={{ ...inputStyle, width: '100%' }}
              >
                {blockTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>

            <div style={{ display: 'flex', gap: spacing['8'], justifyContent: 'flex-end' }}>
              <Button tone='secondary' onClick={() => setAddModalOpen(false)}>{UI_STRINGS.cancelButton}</Button>
              <Button
                tone='primary'
                onClick={async () => {
                  if (!releaseId) return
                  setError(null)
                  const t = addModalType
                  try {
                    const payload = buildDefaultPayload(t, blocks.length + 1)
                    const created = await apiClient.admin.createReleaseBlock({
                      releaseId,
                      position: blocks.length + 1,
                      type: t,
                      payloadJson: payload,
                      storeId: pageScope.storeId,
                      slug: pageScope.slug,
                      pageType: pageScope.pageType,
                    })
                    await loadBlocks(releaseId)
                    setSelectedBlockId(created.id)
                    setAddModalOpen(false)
                  } catch (cause) {
                    setError(cause instanceof Error ? cause.message : 'Unable to add block.')
                  }
                }}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ----------------------------------------------------------------- */}
      {/* UNSAVED CHANGES WARNING MODAL                                       */}
      {/* ----------------------------------------------------------------- */}
      {dirtyWarningOpen ? (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.55)',
          }}
          onClick={() => setDirtyWarningOpen(false)}
        >
          <div
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.xl,
              padding: spacing['24'],
              width: 380,
              maxWidth: '90vw',
              display: 'grid',
              gap: spacing['16'],
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing['12'] }}>
              <span style={{ width: 36, height: 36, borderRadius: radius.full, backgroundColor: '#fef3c7', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <AlertCircle size={18} color='#d97706' />
              </span>
              <div style={{ display: 'grid', gap: spacing['4'] }}>
                <span style={{ color: colors.textPrimary, fontSize: typography.base, fontWeight: Number(fontWeights.semibold) }}>
                  Unsaved changes
                </span>
                <span style={{ color: colors.textSecondary, fontSize: typography.sm }}>
                  You have unsaved changes to this block. If you switch now, your changes will be lost.
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing['8'] }}>
              <Button tone='secondary' onClick={() => setDirtyWarningOpen(false)}>
                Keep editing
              </Button>
              <Button
                tone='danger'
                onClick={() => {
                  setDirtyWarningOpen(false)
                  setIsDirty(false)
                  if (pendingSelectId) {
                    setSelectedBlockId(pendingSelectId)
                    setPendingSelectId(null)
                  }
                }}
              >
                Discard &amp; switch
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ----------------------------------------------------------------- */}
      {/* DELETE CONFIRMATION MODAL                                          */}
      {/* ----------------------------------------------------------------- */}
      {deleteConfirmOpen && selected ? (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.55)',
          }}
          onClick={() => setDeleteConfirmOpen(false)}
        >
          <div
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: radius.xl,
              padding: spacing['24'],
              width: 380,
              maxWidth: '90vw',
              display: 'grid',
              gap: spacing['16'],
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing['12'] }}>
              <span style={{ width: 36, height: 36, borderRadius: radius.full, backgroundColor: '#fee2e2', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Trash2 size={18} color={colors.danger} />
              </span>
              <div style={{ display: 'grid', gap: spacing['4'] }}>
                <span style={{ color: colors.textPrimary, fontSize: typography.base, fontWeight: Number(fontWeights.semibold) }}>
                  Delete block?
                </span>
                <span style={{ color: colors.textSecondary, fontSize: typography.sm }}>
                  This will permanently remove the <strong>{BLOCK_TYPE_LABELS[selected.type] ?? selected.type}</strong> block from this release. This action cannot be undone.
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: spacing['8'] }}>
              <Button tone='secondary' onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                tone='danger'
                onClick={async () => {
                  setDeleteConfirmOpen(false)
                  try {
                    await apiClient.admin.deleteReleaseBlock(selected.id, {
                      storeId: pageScope.storeId,
                      slug: pageScope.slug,
                      pageType: pageScope.pageType,
                    })
                    setSelectedBlockId(null)
                    setIsDirty(false)
                    await loadBlocks(releaseId)
                  } catch (cause) {
                    setError(cause instanceof Error ? cause.message : 'Unable to delete block.')
                  }
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                  <Trash2 size={14} color={colors.textInverted} />
                  Delete block
                </span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  )
}

const inputStyle = {
  width: '100%',
  minHeight: spacing['40'],
  borderRadius: radius.xl,
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
  color: colors.textPrimary,
  fontSize: typography.sm,
  paddingInline: spacing['12'],
  outline: 'none',
} as const
