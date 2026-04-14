import { getHomePageInitialData } from './home-page.service'
import { extractHomeBlocks, hasPublishedBlocks } from './normalize-home-blocks'
import { buildHomeLayout } from '@real/app/features/home/home-layout-engine'
import { buildLayoutProfile } from '@real/ui/responsive/profiles'
import type { ResolvedRenderSlot } from '@real/app/features/home/home-types'
import type { StorefrontServiceContext } from '../_lib/storefront-service-context'

export type HomeLayoutData = Awaited<ReturnType<typeof getHomePageInitialData>> & {
  /** Pre-resolved render slots using the SSR mobile baseline profile (width = 0). */
  renderSlots: ResolvedRenderSlot[]
  /** True when at least one published CMS block exists. */
  hasBlocks: boolean
}

/**
 * Fetches all home page data and pre-resolves render slots using the
 * SSR-safe mobile baseline profile (width=0).
 *
 * The client re-runs buildHomeLayout after hydration using the real
 * measured width from useBreakpoint — so the server output is always
 * the mobile baseline, never causing layout shift.
 */
export async function getHomeLayoutData(
  context: Pick<StorefrontServiceContext, 'previewToken' | 'requestUrl'>,
): Promise<HomeLayoutData> {
  const data = await getHomePageInitialData(context)
  const blocks = extractHomeBlocks(data.cmsHome)

  // Server always uses mobile baseline — client refines after hydration
  const ssrProfile = buildLayoutProfile(0)
  const renderSlots = buildHomeLayout(blocks, ssrProfile)

  return {
    ...data,
    renderSlots,
    hasBlocks: hasPublishedBlocks(data.cmsHome),
  }
}
