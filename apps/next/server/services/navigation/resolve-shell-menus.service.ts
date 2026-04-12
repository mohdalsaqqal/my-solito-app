import {
  brandProvider,
  categoryProvider,
  menuProvider,
  productQueryProvider,
} from '@real/providers'
import type {
  Brand,
  Category,
  MenuItemRecord,
  MenuRecord,
} from '@real/providers/contracts'
import type {
  CMSHome,
  ShellBrandRail,
  ShellFeaturedSlot,
  ShellMegaMenuColumn,
  ShellMegaMenuSection,
  ShellMenuLink,
  ShellResolvedMenus,
} from '@real/app/lib/types'

type LocaleCode = 'en' | 'ar'

function textForLocale(
  value: { en: string; ar: string } | undefined,
  locale: LocaleCode,
  fallback = ''
) {
  if (!value) return fallback
  return locale === 'ar' ? value.ar : value.en
}

function normalizeSlug(value: string) {
  return value.trim().toLowerCase()
}

function resolveQueryHref(slug: string, fallback?: string) {
  if (fallback) return fallback
  const normalized = normalizeSlug(slug)
  if (normalized.includes('sale') || normalized.includes('deal') || normalized.includes('flash')) {
    return '/sales'
  }
  if (normalized.includes('new')) {
    return '/shop/new'
  }
  if (normalized.includes('luxury')) {
    return '/shop/luxury'
  }
  return '/shop'
}

function resolveItemHref(
  item: MenuItemRecord,
  lookup: {
    categoriesById: Map<string, Category>
    categoriesBySlug: Map<string, Category>
    brandsById: Map<string, Brand>
    brandsBySlug: Map<string, Brand>
  }
) {
  if (item.ref.href?.trim()) return item.ref.href.trim()
  const sourceId = item.ref.sourceId?.trim()
  if (!sourceId) return '#'

  if (item.ref.sourceType === 'category') {
    const category =
      lookup.categoriesById.get(sourceId) ?? lookup.categoriesBySlug.get(normalizeSlug(sourceId))
    return category
      ? `/shop?categories=${encodeURIComponent(category.slug)}`
      : '/categories'
  }

  if (item.ref.sourceType === 'brand') {
    const brand =
      lookup.brandsById.get(sourceId) ?? lookup.brandsBySlug.get(normalizeSlug(sourceId))
    return brand ? `/shop?brands=${encodeURIComponent(brand.slug)}` : '/shop'
  }

  if (item.ref.sourceType === 'query') {
    return resolveQueryHref(sourceId)
  }

  return '#'
}

function resolveFeaturedSlot(
  slot: MenuItemRecord['featuredSlot'],
  locale: LocaleCode
): ShellFeaturedSlot | undefined {
  if (!slot) return undefined
  return {
    id: slot.id,
    type: slot.type,
    title: textForLocale(slot.title, locale),
    subtitle: textForLocale(slot.subtitle, locale),
    ctaLabel: textForLocale(slot.ctaLabel, locale),
    href: slot.href,
    imageUrl: slot.imageUrl,
    analytics: slot.analytics,
  }
}

function resolveLink(
  item: MenuItemRecord,
  locale: LocaleCode,
  lookup: Parameters<typeof resolveItemHref>[1]
): ShellMenuLink {
  const sourceId = item.ref.sourceId?.trim() ?? ''
  const fallbackLabel =
    item.ref.sourceType === 'query' ? sourceId : item.id
  return {
    id: item.id,
    label: textForLocale(item.label, locale, fallbackLabel),
    href: resolveItemHref(item, lookup),
    description: textForLocale(item.description, locale),
    analytics: item.analytics,
    luxury:
      item.ref.sourceType === 'query' &&
      normalizeSlug(sourceId).includes('luxury'),
  }
}

function resolveColumn(
  item: MenuItemRecord,
  locale: LocaleCode,
  lookup: Parameters<typeof resolveItemHref>[1]
): ShellMegaMenuColumn {
  return {
    id: item.id,
    label: textForLocale(item.label, locale, item.id),
    href: resolveItemHref(item, lookup),
    analytics: item.analytics,
    children: (item.children ?? [])
      .filter((child) => child.enabled !== false)
      .map((child) => resolveLink(child, locale, lookup)),
  }
}

function resolveBrandRail(
  menu: MenuRecord,
  sectionId: string,
  locale: LocaleCode,
  lookup: Parameters<typeof resolveItemHref>[1]
): ShellBrandRail | undefined {
  const config = menu.megaMenuConfig?.find((entry) => entry.categoryItemId === sectionId)
  if (!config?.brandRail) return undefined

  if (config.brandRail.mode === 'static') {
    return {
      title: textForLocale(config.brandRail.title, locale),
      analytics: config.brandRail.analytics,
      items: config.brandRail.brands.map((brand) => ({
        id: brand.id,
        label: textForLocale(brand.label, locale, brand.id),
        href: brand.href,
        analytics: brand.analytics,
      })),
    }
  }

  if (config.brandRail.mode === 'query') {
    const relatedBrands = Array.from(lookup.brandsById.values()).slice(0, 5)
    return {
      title: textForLocale(config.brandRail.title, locale, locale === 'ar' ? 'العلامات' : 'Brands'),
      analytics: config.brandRail.analytics,
      items: relatedBrands.map((brand) => ({
        id: brand.id,
        label: textForLocale(brand.name, locale, brand.slug),
        href: `/shop?brands=${encodeURIComponent(brand.slug)}`,
      })),
    }
  }

  return {
    title: textForLocale(
      config.brandRail.title,
      locale,
      locale === 'ar' ? 'الحملة الحالية' : 'Current campaign'
    ),
    analytics: config.brandRail.analytics,
    items: [],
  }
}

function resolveMegaSection(
  menu: MenuRecord,
  item: MenuItemRecord,
  locale: LocaleCode,
  lookup: Parameters<typeof resolveItemHref>[1]
): ShellMegaMenuSection {
  return {
    id: item.id,
    label: textForLocale(item.label, locale, item.id),
    href: resolveItemHref(item, lookup),
    description: textForLocale(item.description, locale),
    analytics: item.analytics,
    columns: (item.children ?? [])
      .filter((child) => child.enabled !== false)
      .map((child) => resolveColumn(child, locale, lookup)),
    brandRail: resolveBrandRail(menu, item.id, locale, lookup),
    featuredSlot: resolveFeaturedSlot(item.featuredSlot, locale),
  }
}

export async function resolveShellMenus(locale: LocaleCode): Promise<ShellResolvedMenus> {
  const [menusResult, categoriesResult, brandsResult, queriesResult] = await Promise.all([
    menuProvider.list(),
    categoryProvider.list(),
    brandProvider.list(),
    productQueryProvider.list(),
  ])

  if (!menusResult.ok) {
    return {}
  }

  const categories = categoriesResult.ok ? categoriesResult.data : []
  const brands = brandsResult.ok ? brandsResult.data : []
  const queries = queriesResult.ok ? queriesResult.data : []

  const lookup = {
    categoriesById: new Map(categories.map((category) => [category.id, category])),
    categoriesBySlug: new Map(categories.map((category) => [normalizeSlug(category.slug), category])),
    brandsById: new Map(brands.map((brand) => [brand.id, brand])),
    brandsBySlug: new Map(brands.map((brand) => [normalizeSlug(brand.slug), brand])),
  }

  void queries

  const enabledMenus = menusResult.data.filter((menu) => menu.enabled !== false)
  const headerPrimaryMenu = enabledMenus.find((menu) => menu.location === 'header_primary')
  const headerMegaMenu = enabledMenus.find(
    (menu) => menu.location === 'header_mega_categories'
  )

  return {
    headerPrimary: headerPrimaryMenu
      ? headerPrimaryMenu.items
          .filter((item) => item.enabled !== false)
          .map((item) => resolveLink(item, locale, lookup))
      : undefined,
    headerMegaCategories: headerMegaMenu
      ? {
          analytics: headerMegaMenu.analytics,
          sections: headerMegaMenu.items
            .filter((item) => item.enabled !== false)
            .map((item) => resolveMegaSection(headerMegaMenu, item, locale, lookup)),
        }
      : undefined,
  }
}

export async function attachResolvedShellMenus<T extends CMSHome>(
  cms: T,
  locale: LocaleCode
): Promise<T> {
  const menus = await resolveShellMenus(locale)
  if (!cms.shell) {
    cms.shell = {}
  }
  if (!cms.shell.navigation) {
    cms.shell.navigation = {}
  }
  cms.shell.navigation.menus = menus
  return cms
}
