import type { CMSHomeBlock } from '@real/app/lib/types'

type CMSHomePayload = {
  page?: {
    blocks?: Array<{
      position: number
      props: CMSHomeBlock
    }>
  }
  marketing?: {
    homeBlocks?: CMSHomeBlock[]
  }
}

/**
 * Extracts the normalized home block list from a CMS home payload.
 * Returns an empty array if the payload has no published blocks.
 *
 * Canonical source is cmsHome.page.blocks[].props, which matches
 * the HomeScreen published-blocks render path. Keep marketing.homeBlocks
 * as a backward-compatible fallback during migration.
 */
export function extractHomeBlocks(
  cmsHome: CMSHomePayload | null | undefined,
): CMSHomeBlock[] {
  const pageBlocks = cmsHome?.page?.blocks
  if (pageBlocks && pageBlocks.length > 0) {
    return [...pageBlocks]
      .sort((left, right) => left.position - right.position)
      .map((entry) => entry.props)
  }

  return cmsHome?.marketing?.homeBlocks ?? []
}

/**
 * Returns true when the CMS home payload contains at least one published block.
 */
export function hasPublishedBlocks(
  cmsHome: CMSHomePayload | null | undefined,
): boolean {
  return extractHomeBlocks(cmsHome).length > 0
}
