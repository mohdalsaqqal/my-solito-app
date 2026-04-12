import {
  AdminListInput,
  AdminProductProvider,
  ProductActionInput,
  ProductDetail,
  ProductUpsertInput,
  PagedResponse,
  ProductRow,
  ProviderResult,
} from '@real/providers/contracts'
import { productFields } from './fields'
import { paginate, projectRow, sortRows } from './_shared'
import { readAdminMockState, updateAdminMockState } from './store'

function applySearch(rows: ProductRow[], search?: string) {
  if (!search) return rows
  const needle = search.trim().toLowerCase()
  if (!needle) return rows

  const scoreRow = (row: ProductRow) => {
    const title = row.title.toLowerCase()
    const brand = (row.brand ?? '').toLowerCase()
    const sku = (row.sku ?? '').toLowerCase()
    const id = row.id.toLowerCase()

    if (title === needle) return 120
    if (brand === needle) return 110
    if (sku === needle || id === needle) return 100
    if (title.startsWith(needle)) return 95
    if (brand.startsWith(needle)) return 80
    if (sku.startsWith(needle) || id.startsWith(needle)) return 75
    if (title.includes(` ${needle}`)) return 70
    if (brand.includes(` ${needle}`)) return 60
    if (title.includes(needle)) return 50
    if (brand.includes(needle)) return 40
    if (sku.includes(needle) || id.includes(needle)) return 35
    return 0
  }

  return rows
    .map((row) => ({ row, score: scoreRow(row) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.row.title.localeCompare(right.row.title))
    .map((entry) => entry.row)
}

function applyFilters(rows: ProductRow[], filters?: Record<string, unknown>) {
  if (!filters) return rows
  let next = rows

  const status = filters.status
  if (typeof status === 'string' && status.trim()) {
    next = next.filter((row) => row.status === status)
  }

  const vendor = filters.vendor
  if (typeof vendor === 'string' && vendor.trim()) {
    next = next.filter((row) => row.vendor === vendor)
  }

  const brand = filters.brand
  if (typeof brand === 'string' && brand.trim()) {
    next = next.filter((row) => row.brand === brand)
  }

  const category = filters.category
  if (typeof category === 'string' && category.trim()) {
    next = next.filter((row) => row.category === category)
  }

  const lowStock = filters.lowStock
  if (lowStock === true) {
    next = next.filter((row) => (row.inventory ?? 0) <= 10)
  }

  const priceMin = filters.priceMin
  if (typeof priceMin === 'number') {
    next = next.filter((row) => (row.price ?? 0) >= priceMin)
  }

  const priceMax = filters.priceMax
  if (typeof priceMax === 'number') {
    next = next.filter((row) => (row.price ?? 0) <= priceMax)
  }

  const updatedFrom = filters.updatedFrom
  if (typeof updatedFrom === 'string' && updatedFrom.trim()) {
    const fromMs = Date.parse(updatedFrom)
    if (!Number.isNaN(fromMs)) {
      next = next.filter((row) => {
        if (!row.updatedAt) return false
        return Date.parse(row.updatedAt) >= fromMs
      })
    }
  }

  const updatedTo = filters.updatedTo
  if (typeof updatedTo === 'string' && updatedTo.trim()) {
    const toMs = Date.parse(updatedTo)
    if (!Number.isNaN(toMs)) {
      next = next.filter((row) => {
        if (!row.updatedAt) return false
        return Date.parse(row.updatedAt) <= toMs
      })
    }
  }

  return next
}

function toRow(product: ProductDetail): ProductRow {
  return {
    id: product.id,
    title: product.title,
    brand: product.brand,
    category: product.category,
    price: product.price,
    comparePrice: product.comparePrice,
    inventory: product.inventory,
    status: product.status,
    sku: product.sku,
    image: product.image,
    vendor: product.vendor,
    updatedAt: product.updatedAt,
    customFields: product.customFields,
  }
}

function findProduct(state: { products: ProductDetail[] }, id: string) {
  return state.products.find((product) => product.id === id)
}

export const mockAdminProductAdapter: AdminProductProvider = {
  async listProducts(input: AdminListInput): Promise<ProviderResult<PagedResponse<ProductRow>>> {
    const state = await readAdminMockState()
    const searched = applySearch(state.products.map(toRow), input.search)
    const filtered = applyFilters(searched, input.filters)
    const sorted = sortRows(filtered, input.sort)
    const projected = sorted.map((row) => projectRow(row, input.fields))
    return { ok: true, data: paginate(projected, input) }
  },
  async productFields() {
    return { ok: true, data: productFields }
  },
  async getProduct(id) {
    const state = await readAdminMockState()
    const product = findProduct(state, id)
    if (!product) {
      return {
        ok: false,
        error: {
          code: 'ADMIN_PRODUCT_NOT_FOUND',
          message: 'Product was not found.',
        },
      }
    }
    return { ok: true, data: product }
  },
  async createProduct(input: ProductUpsertInput) {
    const now = new Date().toISOString()
    const created: ProductDetail = {
      id: `prod-${Date.now()}`,
      title: input.title,
      brand: input.brand,
      category: input.category,
      price: input.price,
      comparePrice: input.comparePrice,
      inventory: input.inventory ?? 0,
      status: input.status ?? 'draft',
      sku: input.sku,
      image: input.image,
      vendor: input.vendor,
      description: input.description,
      currency: input.currency ?? 'USD',
      sales: input.sales ?? 0,
      variantCount: input.variantCount ?? 1,
      sourceColumns: [
        'title', 'brand', 'category', 'price', 'inventory', 'sku',
        'custom.supplier_code', 'custom.erp_margin',
        'source.external_product_id', 'source.vendor_sku', 'source.erp_line_code',
        'source.formulation_family', 'source.shelf_life_months', 'source.price_band',
      ],
      createdAt: now,
      updatedAt: now,
      customFields: input.customFields ?? {},
    }
    await updateAdminMockState((state) => {
      state.products.unshift(created)
    })
    return { ok: true, data: created }
  },
  async updateProduct(id, input) {
    const nextState = await updateAdminMockState((state) => {
      const product = findProduct(state, id)
      if (!product) return
      Object.assign(product, input, { updatedAt: new Date().toISOString() })
    })
    const product = findProduct(nextState, id)
    if (!product) {
      return {
        ok: false,
        error: {
          code: 'ADMIN_PRODUCT_NOT_FOUND',
          message: 'Product was not found.',
        },
      }
    }
    return { ok: true, data: product }
  },
  async runProductAction(id: string, actionInput: ProductActionInput) {
    const nextState = await updateAdminMockState((state) => {
      const product = findProduct(state, id)
      if (!product) return
      if (actionInput.action === 'activate') product.status = 'active'
      if (actionInput.action === 'deactivate') product.status = 'draft'
      if (actionInput.action === 'archive') product.status = 'archived'
      if (actionInput.action === 'assign-category' && typeof actionInput.input?.category === 'string') {
        product.category = actionInput.input.category
      }
      if (actionInput.action === 'assign-vendor' && typeof actionInput.input?.vendor === 'string') {
        product.vendor = actionInput.input.vendor
      }
      product.updatedAt = new Date().toISOString()
    })
    const product = findProduct(nextState, id)
    if (!product) {
      return {
        ok: false,
        error: {
          code: 'ADMIN_PRODUCT_NOT_FOUND',
          message: 'Product was not found.',
        },
      }
    }
    return { ok: true, data: product }
  },
}
