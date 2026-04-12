import { brandProvider, categoryProvider, productProvider } from '@real/providers'

function printEntity(label: string, entity: Record<string, unknown>) {
  const attributes = entity.attributes as Record<string, unknown> | undefined
  const sourceMeta = entity.sourceMeta as Record<string, unknown> | undefined
  console.log(`\n[${label}]`)
  console.log(`id: ${String(entity.id ?? '-')}`)
  console.log(`canonical name: ${String(entity.name ?? '-')}`)
  console.log(`sourceMeta: ${JSON.stringify(sourceMeta ?? {}, null, 2)}`)
  console.log(`attribute keys: ${Object.keys(attributes ?? {}).join(', ') || '(none)'}`)
}

async function main() {
  const [products, categories, brands] = await Promise.all([
    productProvider.list({ limit: 1 }),
    categoryProvider.list(),
    brandProvider.list(),
  ])

  if (!products.ok || products.data.length === 0) {
    throw new Error('No product rows available.')
  }
  if (!categories.ok || categories.data.length === 0) {
    throw new Error('No category rows available.')
  }
  if (!brands.ok || brands.data.length === 0) {
    throw new Error('No brand rows available.')
  }

  printEntity('Product', products.data[0] as unknown as Record<string, unknown>)
  printEntity('Category', categories.data[0] as unknown as Record<string, unknown>)
  printEntity('Brand', brands.data[0] as unknown as Record<string, unknown>)
}

void main()
