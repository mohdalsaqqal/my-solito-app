import { Product } from '../types'

function byIds(catalog: Product[], ids?: string[]) {
  if (!ids || ids.length === 0) return []
  const lookup = new Set(ids)
  return catalog.filter((item) => lookup.has(item.id))
}

export const recommendationService = {
  getRelated(product: Product, catalog: Product[]) {
    return byIds(catalog, product.manualRelatedIds)
  },
  getCrossSell(product: Product, catalog: Product[]) {
    return byIds(catalog, product.crossSellIds)
  },
  getCompleteSet(product: Product, catalog: Product[]) {
    return byIds(catalog, product.completeSetIds)
  },
}
