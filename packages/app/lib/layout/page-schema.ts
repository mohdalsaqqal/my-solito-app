import {
  HOME_PAGE_SLUG,
  HOME_PAGE_TYPE,
  PAGE_BLOCK_CONTRACT_VERSION,
  type PageSlug,
  type PagePayload,
  type PageType,
} from './page-types'

export const pageSchema = {
  page: {
    storeId: 'string',
    slug: 'string',
    pageType: 'string',
    blocks: 'array',
  },
  block: {
    id: 'string',
    type: 'string',
    version: PAGE_BLOCK_CONTRACT_VERSION,
    position: 'number',
    props: 'object',
  },
} as const

export function createPagePayload<TProps extends Record<string, unknown>>(
  storeId: string,
  input: {
    slug: PageSlug
    pageType: PageType | string
    blocks: Array<{
      id: string
      type: string
      position: number
      props: TProps
    }>
  },
): PagePayload<string, TProps> {
  return {
    storeId,
    slug: input.slug,
    pageType: input.pageType,
    blocks: input.blocks.map((block) => ({
      ...block,
      version: PAGE_BLOCK_CONTRACT_VERSION,
    })),
  }
}

export function createHomePagePayload<TProps extends Record<string, unknown>>(
  storeId: string,
  blocks: Array<{
    id: string
    type: string
    position: number
    props: TProps
  }>
): PagePayload<string, TProps> {
  return createPagePayload(storeId, {
    slug: HOME_PAGE_SLUG,
    pageType: HOME_PAGE_TYPE,
    blocks,
  })
}
