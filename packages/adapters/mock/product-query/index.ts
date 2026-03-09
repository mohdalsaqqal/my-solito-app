import { ProductQueryProvider, ProductQuery } from '@real/providers/contracts'
import { promises as fs } from 'node:fs'
import * as path from 'node:path'

const STORAGE_DIR = path.join(process.cwd(), '.tmp')
const STORAGE_FILE = path.join(STORAGE_DIR, 'mock-product-queries.json')

const seedQueries: ProductQuery[] = [
  {
    slug: 'home-best-items',
    active: true,
    title: { en: 'Best Items for This Month', ar: 'أفضل المنتجات لهذا الشهر' },
    filters: {
      sort: 'bestseller',
      limit: 12,
      onSale: true,
    },
  },
  {
    slug: 'home-new-arrivals',
    active: true,
    title: { en: 'New Arrivals', ar: 'وصل حديثاً' },
    filters: {
      sort: 'newest',
      limit: 12,
    },
  },
]

async function readQueries(): Promise<ProductQuery[]> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as ProductQuery[]
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true })
    await fs.writeFile(STORAGE_FILE, JSON.stringify(seedQueries), 'utf8')
    return seedQueries
  }
}

async function writeQueries(queries: ProductQuery[]) {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(STORAGE_FILE, JSON.stringify(queries), 'utf8')
}

export const mockProductQueryAdapter: ProductQueryProvider = {
  async list() {
    return { ok: true, data: await readQueries() }
  },
  async getBySlug(slug: string) {
    const queries = await readQueries()
    const found = queries.find((item) => item.slug === slug)
    if (!found) {
      return {
        ok: false,
        error: {
          code: 'PRODUCT_QUERY_NOT_FOUND',
          message: 'The requested product query does not exist.',
        },
      }
    }
    return { ok: true, data: found }
  },
  async create(input) {
    const queries = await readQueries()
    if (queries.some((item) => item.slug === input.slug)) {
      return {
        ok: false,
        error: {
          code: 'PRODUCT_QUERY_EXISTS',
          message: 'Product query slug already exists.',
        },
      }
    }
    const next: ProductQuery = {
      slug: input.slug,
      active: input.active ?? true,
      title: input.title,
      filters: input.filters ?? {},
    }
    queries.push(next)
    await writeQueries(queries)
    return { ok: true, data: next }
  },
  async update(slug, input) {
    const queries = await readQueries()
    const index = queries.findIndex((item) => item.slug === slug)
    if (index < 0) {
      return {
        ok: false,
        error: {
          code: 'PRODUCT_QUERY_NOT_FOUND',
          message: 'The requested product query does not exist.',
        },
      }
    }

    const current = queries[index]
    const updated: ProductQuery = {
      ...current,
      active: input.active ?? current.active,
      title: input.title ?? current.title,
      filters: input.filters ?? current.filters,
    }
    queries[index] = updated
    await writeQueries(queries)
    return { ok: true, data: updated }
  },
  async delete(slug) {
    const queries = await readQueries()
    const index = queries.findIndex((item) => item.slug === slug)
    if (index < 0) {
      return {
        ok: false,
        error: {
          code: 'PRODUCT_QUERY_NOT_FOUND',
          message: 'The requested product query does not exist.',
        },
      }
    }
    queries.splice(index, 1)
    await writeQueries(queries)
    return { ok: true, data: { slug, deleted: true } }
  },
}
