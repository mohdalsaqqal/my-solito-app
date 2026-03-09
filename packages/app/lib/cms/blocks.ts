import { z } from 'zod'
import { LocalizedString, Product } from '../types'

export type HeroBlock = {
  id: string
  type: 'hero'
  title: LocalizedString
  subtitle?: LocalizedString
  ctaLabel?: LocalizedString
  imageUrl?: string
  href?: string
}

export type ProductSliderBlock = {
  id: string
  type: 'product_slider'
  title: LocalizedString
  subtitle?: LocalizedString
  querySlug: string
  products?: Product[]
}

export type BrandPromoBlock = {
  id: string
  type: 'brand_promo'
  title: LocalizedString
  subtitle?: LocalizedString
  ctaLabel?: LocalizedString
  imageUrl?: string
  href?: string
  querySlug?: string
  products?: Product[]
}

export type PromoStripBlock = {
  id: string
  type: 'promo_strip'
  text: LocalizedString
  ctaLabel?: LocalizedString
  href?: string
}

export type HomeBlock = HeroBlock | ProductSliderBlock | BrandPromoBlock | PromoStripBlock

const localizedStringSchema = z
  .object({
    en: z.string().default(''),
    ar: z.string().default(''),
  })
  .strict()

const heroBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('hero'),
    title: localizedStringSchema,
    subtitle: localizedStringSchema.optional(),
    ctaLabel: localizedStringSchema.optional(),
    imageUrl: z.string().url().optional(),
    href: z.string().optional(),
  })
  .strict()

const sliderBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('product_slider'),
    title: localizedStringSchema,
    subtitle: localizedStringSchema.optional(),
    querySlug: z.string().min(1),
  })
  .strict()

const brandPromoBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('brand_promo'),
    title: localizedStringSchema,
    subtitle: localizedStringSchema.optional(),
    ctaLabel: localizedStringSchema.optional(),
    imageUrl: z.string().url().optional(),
    href: z.string().optional(),
    querySlug: z.string().min(1).optional(),
  })
  .strict()

const promoStripBlockSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('promo_strip'),
    text: localizedStringSchema,
    ctaLabel: localizedStringSchema.optional(),
    href: z.string().optional(),
  })
  .strict()

export const homeBlockSchema = z.discriminatedUnion('type', [
  heroBlockSchema,
  sliderBlockSchema,
  brandPromoBlockSchema,
  promoStripBlockSchema,
])

export function parseHomeBlock(value: unknown): HomeBlock | null {
  const parsed = homeBlockSchema.safeParse(value)
  if (!parsed.success) return null
  return parsed.data
}

export function localizeString(value: LocalizedString | undefined, locale: 'en' | 'ar', fallback = '') {
  if (!value) return fallback
  const selected = value[locale]
  if (selected && selected.trim().length > 0) return selected
  const fallbackLocale = locale === 'en' ? 'ar' : 'en'
  return value[fallbackLocale] || fallback
}
