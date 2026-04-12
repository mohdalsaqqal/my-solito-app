import { menuProvider } from '@real/providers'
import type {
  BrandRailSource,
  MenuCreateInput,
  MenuFeaturedSlot,
  MenuItemRecord,
  MenuRecord,
  MenuUpdateInput,
} from '@real/providers/contracts'
import { pushAudit, readAdminControlsState, writeAdminControlsState } from '../../../app/api/_lib/admin-controls-store'
import { ServiceError } from '../_lib/service-error'

type Actor = {
  userId: string
  email: string
}

type MenuPayload = Partial<MenuCreateInput>

const MAX_MEGA_DEPTH = 3

function trimOrUndefined(value: string | undefined) {
  const next = value?.trim()
  return next ? next : undefined
}

function normalizeLocalizedText(
  value: { en?: string; ar?: string } | undefined,
  fallback: string
) {
  return {
    en: value?.en?.trim() || fallback,
    ar: value?.ar?.trim() || fallback,
  }
}

function walkItems(
  items: MenuItemRecord[],
  visit: (item: MenuItemRecord, depth: number) => void,
  depth = 1
) {
  for (const item of items) {
    visit(item, depth)
    if (item.children?.length) {
      walkItems(item.children, visit, depth + 1)
    }
  }
}

function collectItemIds(items: MenuItemRecord[]) {
  const ids = new Set<string>()
  walkItems(items, (item) => {
    ids.add(item.id)
  })
  return ids
}

function validateFeaturedSlot(featuredSlot: MenuFeaturedSlot | undefined, depth: number) {
  if (!featuredSlot) return
  if (depth > 2) {
    throw new ServiceError(
      'ADMIN_MENU_FEATURED_SLOT_DEPTH_INVALID',
      'Featured slots are allowed only on level 1 or level 2 items.',
      400
    )
  }
  if (!featuredSlot.id?.trim()) {
    throw new ServiceError(
      'ADMIN_MENU_FEATURED_SLOT_ID_REQUIRED',
      'Featured slots require an id.',
      400
    )
  }
  if (!featuredSlot.sourceId?.trim()) {
    throw new ServiceError(
      'ADMIN_MENU_FEATURED_SLOT_SOURCE_REQUIRED',
      'Featured slots require a sourceId.',
      400
    )
  }
}

function validateBrandRail(brandRail: BrandRailSource | undefined) {
  if (!brandRail) return
  if (brandRail.mode === 'static' && brandRail.brands.length === 0) {
    throw new ServiceError(
      'ADMIN_MENU_BRAND_RAIL_EMPTY',
      'Static brand rails must include at least one brand.',
      400
    )
  }
  if (brandRail.mode === 'query' && !brandRail.queryId?.trim()) {
    throw new ServiceError(
      'ADMIN_MENU_BRAND_RAIL_QUERY_REQUIRED',
      'Query-driven brand rails require a queryId.',
      400
    )
  }
  if (brandRail.mode === 'campaign_override' && !brandRail.campaignId?.trim()) {
    throw new ServiceError(
      'ADMIN_MENU_BRAND_RAIL_CAMPAIGN_REQUIRED',
      'Campaign override brand rails require a campaignId.',
      400
    )
  }
}

function validateItems(items: MenuItemRecord[], displayStyle: MenuRecord['displayStyle']) {
  walkItems(items, (item, depth) => {
    if (!item.id?.trim()) {
      throw new ServiceError('ADMIN_MENU_ITEM_ID_REQUIRED', 'Every menu item requires an id.', 400)
    }
    if (!item.label?.en?.trim() && !item.label?.ar?.trim()) {
      throw new ServiceError(
        'ADMIN_MENU_ITEM_LABEL_REQUIRED',
        `Menu item "${item.id}" requires a label.`,
        400
      )
    }
    if (item.ref.sourceType === 'custom_link') {
      if (!trimOrUndefined(item.ref.href)) {
        throw new ServiceError(
          'ADMIN_MENU_ITEM_HREF_REQUIRED',
          `Custom link item "${item.id}" requires an href.`,
          400
        )
      }
    } else if (!trimOrUndefined(item.ref.sourceId)) {
      throw new ServiceError(
        'ADMIN_MENU_ITEM_SOURCE_REQUIRED',
        `Menu item "${item.id}" requires a sourceId.`,
        400
      )
    }

    if (displayStyle === 'mega_category' && depth > MAX_MEGA_DEPTH) {
      throw new ServiceError(
        'ADMIN_MENU_DEPTH_INVALID',
        `Mega menu items cannot exceed depth ${MAX_MEGA_DEPTH}.`,
        400
      )
    }

    validateFeaturedSlot(item.featuredSlot, depth)
  })
}

function validateMegaConfig(
  items: MenuItemRecord[],
  megaMenuConfig: MenuRecord['megaMenuConfig'] | undefined
) {
  if (!megaMenuConfig?.length) return
  const itemIds = collectItemIds(items)
  const topLevelIds = new Set(items.map((item) => item.id))

  for (const config of megaMenuConfig) {
    if (!itemIds.has(config.categoryItemId)) {
      throw new ServiceError(
        'ADMIN_MENU_MEGA_CONFIG_ITEM_MISSING',
        `Mega menu config references unknown item "${config.categoryItemId}".`,
        400
      )
    }
    if (!topLevelIds.has(config.categoryItemId)) {
      throw new ServiceError(
        'ADMIN_MENU_BRAND_RAIL_DEPTH_INVALID',
        'Brand rails are allowed only on level 1 mega-menu items.',
        400
      )
    }
    validateBrandRail(config.brandRail)
  }
}

function validateMenuPayload(payload: MenuPayload) {
  const name = trimOrUndefined(payload.name)
  const slug = trimOrUndefined(payload.slug)
  if (!name) {
    throw new ServiceError('ADMIN_MENU_NAME_REQUIRED', 'Menu name is required.', 400)
  }
  if (!slug) {
    throw new ServiceError('ADMIN_MENU_SLUG_REQUIRED', 'Menu slug is required.', 400)
  }
  if (!payload.location) {
    throw new ServiceError('ADMIN_MENU_LOCATION_REQUIRED', 'Menu location is required.', 400)
  }
  if (!payload.displayStyle) {
    throw new ServiceError(
      'ADMIN_MENU_DISPLAY_STYLE_REQUIRED',
      'Menu displayStyle is required.',
      400
    )
  }
  if (
    payload.location === 'header_mega_categories' &&
    payload.displayStyle !== 'mega_category'
  ) {
    throw new ServiceError(
      'ADMIN_MENU_DISPLAY_STYLE_INVALID',
      'header_mega_categories menus must use mega_category displayStyle.',
      400
    )
  }
  if (
    payload.displayStyle === 'mega_category' &&
    payload.location !== 'header_mega_categories'
  ) {
    throw new ServiceError(
      'ADMIN_MENU_LOCATION_INVALID',
      'mega_category displayStyle is allowed only for header_mega_categories.',
      400
    )
  }

  const items = payload.items ?? []
  validateItems(items, payload.displayStyle)
  validateMegaConfig(items, payload.megaMenuConfig)
}

function normalizeMenuItems(items: MenuItemRecord[]): MenuItemRecord[] {
  return items.map((item) => ({
    ...item,
    id: item.id.trim(),
    parentId: item.parentId ?? null,
    label: normalizeLocalizedText(item.label, item.id),
    description: item.description
      ? normalizeLocalizedText(item.description, '')
      : undefined,
    ref: {
      sourceType: item.ref.sourceType,
      sourceId: trimOrUndefined(item.ref.sourceId),
      href: trimOrUndefined(item.ref.href),
    },
    featuredSlot: item.featuredSlot
      ? {
          ...item.featuredSlot,
          id: item.featuredSlot.id.trim(),
          sourceId: item.featuredSlot.sourceId.trim(),
          title: item.featuredSlot.title
            ? normalizeLocalizedText(item.featuredSlot.title, item.featuredSlot.id)
            : undefined,
          subtitle: item.featuredSlot.subtitle
            ? normalizeLocalizedText(item.featuredSlot.subtitle, '')
            : undefined,
          ctaLabel: item.featuredSlot.ctaLabel
            ? normalizeLocalizedText(item.featuredSlot.ctaLabel, '')
            : undefined,
          href: trimOrUndefined(item.featuredSlot.href),
          imageUrl: trimOrUndefined(item.featuredSlot.imageUrl),
        }
      : undefined,
    children: normalizeMenuItems(item.children ?? []),
  }))
}

function normalizeMenuInput(payload: MenuPayload): MenuCreateInput {
  const name = trimOrUndefined(payload.name)!
  const slug = trimOrUndefined(payload.slug)!.toLowerCase()

  return {
    id: trimOrUndefined(payload.id) || `menu-${slug}`,
    name,
    slug,
    location: payload.location!,
    displayStyle: payload.displayStyle!,
    enabled: payload.enabled ?? true,
    analytics: payload.analytics,
    items: normalizeMenuItems(payload.items ?? []),
    megaMenuConfig: payload.megaMenuConfig,
  }
}

export async function listAdminMenus() {
  const result = await menuProvider.list()
  if (!result.ok) {
    throw new ServiceError(result.error.code, result.error.message, 500)
  }
  return result.data
}

export async function getAdminMenu(id: string) {
  const result = await menuProvider.getById(id)
  if (!result.ok) {
    throw new ServiceError(
      result.error.code,
      result.error.message,
      result.error.code === 'MENU_NOT_FOUND' ? 404 : 400
    )
  }
  return result.data
}

export async function createAdminMenu(payload: MenuPayload, actor: Actor) {
  validateMenuPayload(payload)
  const input = normalizeMenuInput(payload)
  const created = await menuProvider.create(input)
  if (!created.ok) {
    throw new ServiceError(
      created.error.code,
      created.error.message,
      created.error.code === 'MENU_EXISTS' ? 409 : 400
    )
  }

  const state = await readAdminControlsState()
  pushAudit(state, {
    type: 'marketing',
    targetId: created.data.id,
    actor,
    changes: { action: 'menu.create', location: created.data.location },
  })
  await writeAdminControlsState(state)

  return created.data
}

export async function updateAdminMenu(id: string, payload: MenuPayload, actor: Actor) {
  const current = await getAdminMenu(id)
  const merged: MenuPayload = {
    ...current,
    ...payload,
    id: current.id,
    items: payload.items ?? current.items,
    megaMenuConfig: payload.megaMenuConfig ?? current.megaMenuConfig,
  }

  validateMenuPayload(merged)
  const normalized = normalizeMenuInput(merged)
  const updateInput: MenuUpdateInput = {
    name: normalized.name,
    slug: normalized.slug,
    location: normalized.location,
    displayStyle: normalized.displayStyle,
    enabled: normalized.enabled,
    analytics: normalized.analytics,
    items: normalized.items,
    megaMenuConfig: normalized.megaMenuConfig,
  }

  const updated = await menuProvider.update(id, updateInput)
  if (!updated.ok) {
    throw new ServiceError(
      updated.error.code,
      updated.error.message,
      updated.error.code === 'MENU_NOT_FOUND' ? 404 : 400
    )
  }

  const state = await readAdminControlsState()
  pushAudit(state, {
    type: 'marketing',
    targetId: updated.data.id,
    actor,
    changes: { action: 'menu.update', location: updated.data.location },
  })
  await writeAdminControlsState(state)

  return updated.data
}

export async function deleteAdminMenu(id: string, actor: Actor) {
  const deleted = await menuProvider.delete(id)
  if (!deleted.ok) {
    throw new ServiceError(
      deleted.error.code,
      deleted.error.message,
      deleted.error.code === 'MENU_NOT_FOUND' ? 404 : 400
    )
  }

  const state = await readAdminControlsState()
  pushAudit(state, {
    type: 'marketing',
    targetId: id,
    actor,
    changes: { action: 'menu.delete' },
  })
  await writeAdminControlsState(state)

  return deleted.data
}
