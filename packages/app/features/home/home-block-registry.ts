/**
 * home-block-registry.ts
 *
 * Single lookup point for home block renderers by block type string.
 * Wraps the shared block-registry so the home engine never needs to know
 * about the internal `type:version` key format.
 */

import {
  blockRegistry,
  getBlockRegistryKey,
} from '../../sections/blocks/block-registry'
import type { HomeBlockRendererComponent } from '../../sections/blocks/block-types'

/**
 * All block type strings that have at least one registered renderer.
 * Derived from the live registry so it stays in sync automatically.
 */
export const SUPPORTED_HOME_BLOCK_TYPES: readonly string[] = [
  'hero_carousel',
  'hero',
  'flash_sale',
  'product_slider',
  'personalized_rail',
  'brand_spotlight',
  'brand_promo',
  'offer_banners',
  'education_banner',
  'offer_stack',
  'sticky_listing_promo',
  'newsletter_cta',
  'top_brands',
  'ugc_gallery',
  'category_shortcuts',
  'editorial_hotspot',
  'promo_strip',
  'brand_deal_banner',
  'faq_accordion',
] as const

/**
 * Look up a renderer component by block type string.
 *
 * Uses the canonical `v1` version for every type — the only version
 * registered in the current registry.  Returns `null` for unknown types
 * so callers can skip or log unrecognised blocks gracefully.
 */
export function getHomeBlockRenderer(
  type: string,
): HomeBlockRendererComponent | null {
  const key = getBlockRegistryKey(type, 'v1')
  return (blockRegistry as Record<string, HomeBlockRendererComponent>)[key] ?? null
}
