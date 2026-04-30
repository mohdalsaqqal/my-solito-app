import { colors } from '@real/tokens'
import { HomeProductItem } from '@real/ui/components/home/types'
import { passThroughPricingService } from './pricing'
import { Product } from './types'

const SWATCH_PALETTE = [
  colors.brandPrimary,
  colors.warning,
  colors.info,
  colors.success,
  colors.textPrimary,
]

const SIZE_PATTERN = /\b(\d+(?:[.,]\d+)?)\s?(ml|mg|g|kg|l)\b/i
const PACKAGING_PATTERN =
  /\b(?:tube|pump|jar|spray|stick|bottle|roll-on|roll on|capsules?|mask|serum|cream|gel|lotion|wash|shampoo|conditioner|oil|foam|mist|fluid|balm)\b/i
const TITLE_STOP_WORDS = new Set(['and', 'with', 'for', 'of', 'the', 'to', 'in', 'on'])
const TITLE_UPPER_TOKENS = new Set(['SPF', 'UV', 'UVA', 'UVB', 'AHA', 'BHA', 'BB', 'CC', 'PH'])
const ATTRIBUTE_KEYWORDS: Array<{ regex: RegExp; label: { en: string; ar: string } }> = [
  { regex: /\bsensitive\b/i, label: { en: 'Sensitive skin', ar: 'للبشرة الحساسة' } },
  { regex: /\bhydrat/i, label: { en: 'Hydrating', ar: 'ترطيب' } },
  { regex: /\bbright|radiance|tone\b/i, label: { en: 'Brightening', ar: 'تفتيح' } },
  { regex: /\brepair|restore|barrier\b/i, label: { en: 'Repair care', ar: 'عناية إصلاحية' } },
  { regex: /\bcleanse|wash\b/i, label: { en: 'Gentle cleanse', ar: 'تنظيف لطيف' } },
  { regex: /\bsun|spf\b/i, label: { en: 'Sun protection', ar: 'حماية من الشمس' } },
  { regex: /\bbaby\b/i, label: { en: 'Baby care', ar: 'عناية بالأطفال' } },
  { regex: /\banti[- ]?aging|firm|wrinkle\b/i, label: { en: 'Firming care', ar: 'عناية مشددة' } },
  { regex: /\bacne|blemish\b/i, label: { en: 'Blemish care', ar: 'عناية للحبوب' } },
]

type Locale = 'en' | 'ar'

type UrgencyOptions = {
  lowStockThreshold?: number
  lowStockLabel?: string
  includeLimitedRelease?: boolean
}

function toTitleCase(value: string) {
  const normalized = value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return normalized
    .split(' ')
    .map((word, index) => {
      if (!word) return word

      const cleanWord = word.replace(/[^A-Za-z]/g, '')
      const upperToken = cleanWord.toUpperCase()
      const lowerWord = cleanWord.toLowerCase()

      if (TITLE_UPPER_TOKENS.has(upperToken)) {
        return word.replace(cleanWord, upperToken)
      }

      if (['ml', 'mg', 'g', 'kg', 'l'].includes(lowerWord)) {
        return word.replace(cleanWord, lowerWord)
      }

      if (index > 0 && TITLE_STOP_WORDS.has(lowerWord)) {
        return word.replace(cleanWord, lowerWord)
      }

      return word.replace(cleanWord, `${lowerWord.slice(0, 1).toUpperCase()}${lowerWord.slice(1)}`)
    })
    .join(' ')
}

function formatBrand(brand?: string, fallbackName?: string) {
  if (brand) {
    return brand
      .split('-')
      .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
      .join(' ')
  }

  const [left] = (fallbackName ?? '').split('-')
  return left?.trim() || 'Brand'
}

function stripBrandPrefix(name: string, brand: string) {
  const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[-\\s]+')
  return name.replace(new RegExp(`^${escapedBrand}\\s*[-:]?\\s*`, 'i'), '').trim()
}

function extractTailSubtitle(name: string) {
  const sizeMatch = name.match(SIZE_PATTERN)
  if (!sizeMatch) return {}
  const amountText = sizeMatch[1]
  const unitText = sizeMatch[2]
  if (!amountText || !unitText) return {}

  const sizeText = `${amountText.replace(',', '.')} ${unitText.toLowerCase()}`
  const subtitleMatch = name.match(
    /((?:tube|pump|jar|spray|stick|bottle|roll-on|roll on|capsules?|mask|serum|cream|gel|lotion|wash|shampoo|conditioner|oil|foam|mist|fluid|balm)\s+)?\d+(?:[.,]\d+)?\s?(?:ml|mg|g|kg|l)(?:\s+(?:tube|pump|jar|spray|stick|bottle|roll-on|roll on|capsules?|mask|serum|cream|gel|lotion|wash|shampoo|conditioner|oil|foam|mist|fluid|balm))?$/i
  )

  if (!subtitleMatch) {
    return { sizeText }
  }

  const rawSubtitle = subtitleMatch[0].trim()
  const title = name.slice(0, -rawSubtitle.length).trim()

  return {
    sizeText,
    title,
    subtitle: toTitleCase(rawSubtitle),
  }
}

function inferFormattedTitle(product: Product) {
  const brand = formatBrand(product.brand, product.name)
  const withoutBrand = stripBrandPrefix(product.name, brand)
  const { title, subtitle } = extractTailSubtitle(withoutBrand)
  const baseTitle = (title || withoutBrand || product.name).trim()

  return {
    displayTitle: toTitleCase(baseTitle),
    displaySubtitle: subtitle,
  }
}

function inferProductAttributes(product: Product, locale: Locale, subtitle?: string) {
  const candidates: string[] = []
  const name = product.name
  const description = product.description ?? ''
  const attributeRecord = product.attributes ?? {}
  const sizeMatch = name.match(SIZE_PATTERN)
  const subtitleLower = subtitle?.toLowerCase() ?? ''
  const searchableText = [
    name,
    description,
    typeof attributeRecord.formulation_family === 'string' ? attributeRecord.formulation_family : '',
    ...(Array.isArray(attributeRecord.key_features) ? attributeRecord.key_features.filter((value): value is string => typeof value === 'string') : []),
    ...(Array.isArray(attributeRecord.product_tags) ? attributeRecord.product_tags.filter((value): value is string => typeof value === 'string') : []),
  ]
    .join(' ')
    .toLowerCase()

  const spfMatch = name.match(/\bSPF\s?\d+\+?\b/i)
  if (spfMatch) {
    candidates.push(spfMatch[0].toUpperCase().replace(/\s+/g, ' '))
  }

  if (sizeMatch) {
    const amountText = sizeMatch[1]
    const unitText = sizeMatch[2]
    if (amountText && unitText) {
      const formattedSize = `${amountText.replace(',', '.')} ${unitText.toLowerCase()}`
      if (!subtitleLower.includes(formattedSize.toLowerCase())) {
        candidates.push(formattedSize)
      }
    }
  }

  if (typeof attributeRecord.formulation_family === 'string' && !PACKAGING_PATTERN.test(attributeRecord.formulation_family)) {
    candidates.push(toTitleCase(attributeRecord.formulation_family))
  }

  for (const rule of ATTRIBUTE_KEYWORDS) {
    if (rule.regex.test(searchableText)) {
      candidates.push(locale === 'ar' ? rule.label.ar : rule.label.en)
    }
  }

  return candidates.filter((value, index, array) => array.indexOf(value) === index).slice(0, 2)
}

function formatCurrency(value: number, currency: string, locale: Locale) {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-JO' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function inferPricePerUnitLabel(product: Product, locale: Locale, currency: string) {
  if (!product.category || ['makeup', 'fragrance'].includes(product.category)) {
    return undefined
  }

  const sizeMatch = product.name.match(SIZE_PATTERN)
  if (!sizeMatch) return undefined
  const amountText = sizeMatch[1]
  const unitText = sizeMatch[2]
  if (!amountText || !unitText) return undefined

  const amount = Number(amountText.replace(',', '.'))
  const unit = unitText.toLowerCase()
  if (!Number.isFinite(amount) || amount <= 0) return undefined

  let normalizedPrice = 0
  let divisorLabel = ''

  if (unit === 'ml' || unit === 'g') {
    normalizedPrice = (product.price * 100) / amount
    divisorLabel = `100 ${unit}`
  } else if (unit === 'l' || unit === 'kg') {
    normalizedPrice = product.price / amount
    divisorLabel = `1 ${unit}`
  }

  if (!normalizedPrice || !divisorLabel) return undefined

  return `${formatCurrency(normalizedPrice, currency, locale)} / ${divisorLabel}`
}

export function buildHomeProductItem(product: Product, locale: Locale = 'en'): HomeProductItem {
  const resolvedPrice = passThroughPricingService.getProductPrice(product)
  const currency = product.currency || 'USD'
  const brand = formatBrand(product.brand, product.name)
  const swatches =
    product.category === 'makeup'
      ? SWATCH_PALETTE.map((hex, index) => ({
          id: `${product.id}-shade-${index + 1}`,
          hex,
          label: `Shade ${index + 1}`,
        }))
      : undefined
  const { displayTitle, displaySubtitle } = inferFormattedTitle(product)
  const attributesList = inferProductAttributes(product, locale, displaySubtitle)

  return {
    id: product.id,
    name: displayTitle,
    brand,
    price: resolvedPrice.unitPrice,
    currency,
    imageUrl: product.image,
    imageAlt: `${brand} ${displayTitle}`,
    href: `/product/${product.id}`,
    rating: product.rating,
    reviews: product.reviews,
    isNew: product.isNew,
    isLimited: product.isLimited,
    stock: product.stock,
    requiresVariantSelection: product.category === 'makeup',
    swatches,
    badge: product.isLimited ? 'Limited' : product.isNew ? 'New' : undefined,
    displayTitle,
    displaySubtitle,
    attributesList,
    pricePerUnitLabel: inferPricePerUnitLabel(product, locale, currency),
  }
}

export function resolveRealProductCardUrgency(
  product: Product,
  locale: Locale = 'en',
  options: UrgencyOptions = {}
) {
  if (typeof product.stock === 'number' && product.stock <= 0) {
    return undefined
  }

  const threshold = typeof options.lowStockThreshold === 'number' && options.lowStockThreshold > 0
    ? options.lowStockThreshold
    : 8

  if (typeof product.stock === 'number' && product.stock > 0 && product.stock <= threshold) {
    if (options.lowStockLabel) {
      return locale === 'ar'
        ? `${options.lowStockLabel} · ${product.stock} متبقٍ`
        : `${options.lowStockLabel} · ${product.stock} left`
    }

    return locale === 'ar' ? `${product.stock} متبقٍ` : `Only ${product.stock} left`
  }

  if (options.includeLimitedRelease !== false && product.isLimited) {
    return locale === 'ar' ? 'إصدار محدود' : 'Limited release'
  }

  return undefined
}
