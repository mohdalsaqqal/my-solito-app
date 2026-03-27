import type {
  PageBlock,
  PagePayload,
  PageType,
  QueryBoundBlockType,
} from '@real/app/lib/layout/page-types'
import type { ProductQuery } from './CatalogProviders'
import type { Product } from './ProductProvider'

export type PageConfigBlock<
  TType extends string = string,
  TProps extends Record<string, unknown> = Record<string, unknown>,
> = PageBlock<TType, TProps>

export type PageConfig<
  TType extends string = string,
  TProps extends Record<string, unknown> = Record<string, unknown>,
> = {
  storeId: string
  slug: string
  pageType: PageType | string
  blocks: Array<PageConfigBlock<TType, TProps>>
}

export type NormalizedPagePayload<
  TType extends string = string,
  TProps extends Record<string, unknown> = Record<string, unknown>,
> = PagePayload<TType, TProps>

export type ProductQueryResolverInput = {
  storeId: string
  blockId: string
  blockType: QueryBoundBlockType
  querySlug: ProductQuery['slug']
}

export type ProductQueryResolverResult = {
  query: ProductQuery
  products: Product[]
}
