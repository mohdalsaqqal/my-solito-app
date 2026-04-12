import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT_DIR = process.cwd()
const SOURCE_PATH = path.join(ROOT_DIR, 'src/data/products_updated_new.csv')
const OUTPUT_PATH = path.join(ROOT_DIR, 'packages/adapters/mock/product/generated-mock-erp-data.ts')

const TARGET_COUNT = 72
const PER_BRAND_LIMIT = 8

const CATEGORY_ORDER = [
  'skincare',
  'makeup',
  'haircare',
  'suncare',
  'bodycare',
  'nailcare',
  'babycare',
  'fragrance',
]

const IMAGE_POOLS = {
  makeup: [
    'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp',
    'https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/1.webp',
    'https://cdn.dummyjson.com/product-images/beauty/powder-canister/1.webp',
    'https://cdn.dummyjson.com/product-images/beauty/red-lipstick/1.webp',
    'https://cdn.dummyjson.com/product-images/beauty/red-nail-polish/1.webp',
  ],
  skincare: [
    'https://cdn.dummyjson.com/product-images/skin-care/attitude-super-leaves-hand-soap/1.webp',
    'https://cdn.dummyjson.com/product-images/skin-care/olay-ultra-moisture-shea-butter-body-wash/1.webp',
    'https://cdn.dummyjson.com/product-images/skin-care/vaseline-men-body-and-face-lotion/1.webp',
  ],
  haircare: [
    'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp',
    'https://cdn.dummyjson.com/product-images/skin-care/olay-ultra-moisture-shea-butter-body-wash/1.webp',
    'https://cdn.dummyjson.com/product-images/skin-care/attitude-super-leaves-hand-soap/1.webp',
  ],
  suncare: [
    'https://cdn.dummyjson.com/product-images/skin-care/vaseline-men-body-and-face-lotion/1.webp',
    'https://cdn.dummyjson.com/product-images/skin-care/olay-ultra-moisture-shea-butter-body-wash/1.webp',
  ],
  bodycare: [
    'https://cdn.dummyjson.com/product-images/skin-care/attitude-super-leaves-hand-soap/1.webp',
    'https://cdn.dummyjson.com/product-images/skin-care/olay-ultra-moisture-shea-butter-body-wash/1.webp',
    'https://cdn.dummyjson.com/product-images/skin-care/vaseline-men-body-and-face-lotion/1.webp',
  ],
  nailcare: [
    'https://cdn.dummyjson.com/product-images/beauty/red-nail-polish/1.webp',
    'https://cdn.dummyjson.com/product-images/beauty/red-lipstick/1.webp',
  ],
  babycare: [
    'https://cdn.dummyjson.com/product-images/skin-care/vaseline-men-body-and-face-lotion/1.webp',
    'https://cdn.dummyjson.com/product-images/skin-care/attitude-super-leaves-hand-soap/1.webp',
  ],
  fragrance: [
    'https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/1.webp',
    'https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/1.webp',
    "https://cdn.dummyjson.com/product-images/fragrances/dior-j'adore/1.webp",
    'https://cdn.dummyjson.com/product-images/fragrances/dolce-shine-eau-de/1.webp',
    'https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de/1.webp',
  ],
}

const BRAND_PATTERNS = [
  ['la-roche-posay', 'La Roche-Posay', /^la\s+roche[- ]?posay\b/i],
  ['pierre-rene', 'Pierre Rene', /^pierre\s*rene\b/i],
  ['loreal', "L'Oréal", /^l['’]?or[ée]al(?:\s+paris)?\b/i],
  ['palmers', "Palmer's", /^palmer['’]s\b/i],
  ['maybelline', 'Maybelline', /^maybelline\b/i],
  ['beesline', 'Beesline', /^beesline\b/i],
  ['evagarden', 'Evagarden', /^evagarden\b/i],
  ['vichy', 'Vichy', /^vichy\b/i],
  ['bioderma', 'Bioderma', /^bioderma\b/i],
  ['sebamed', 'Sebamed', /^sebamed\b/i],
  ['filorga', 'Filorga', /^filorga\b/i],
  ['svr', 'SVR', /^svr\b/i],
  ['avene', 'Avene', /^av(?:e|è|Ã¨)?ne(?:ˆne)?\b/i],
  ['eucerin', 'Eucerin', /^eucerin\b/i],
  ['olaplex', 'Olaplex', /^olaplex\b/i],
  ['nashi', 'Nashi', /^nashi\b/i],
  ['joko', 'Joko', /^joko\b/i],
  ['miyo', 'Miyo', /^miyo\b/i],
  ['acm', 'ACM', /^acm\b/i],
  ['cerave', 'CeraVe', /^cerave\b/i],
  ['cetaphil', 'Cetaphil', /^cetaphil\b/i],
  ['uriage', 'Uriage', /^uriage\b/i],
  ['miraculum', 'Miraculum', /^miraculum\b/i],
  ['sinoz', 'Sinoz', /^sinoz\b/i],
  ['redone', 'RedOne', /^redone\b/i],
  ['black', 'Black', /^black\b/i],
]

const GENERIC_BRAND_WORDS = new Set(['the', 'la', 'black', 'acqua', 'balsamo', 'banana', 'brasil', 'brazil'])

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]

    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"'
          index += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
      continue
    }

    if (char === ',') {
      row.push(field)
      field = ''
      continue
    }

    if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') {
        index += 1
      }
      row.push(field)
      field = ''
      if (row.some((value) => value.length > 0)) {
        rows.push(row)
      }
      row = []
      continue
    }

    field += char
  }

  row.push(field)
  if (row.some((value) => value.length > 0)) {
    rows.push(row)
  }

  return rows
}

function mojibakeScore(value) {
  return (value.match(/[ÃÂâ]/g) || []).length
}

function maybeFixEncoding(value) {
  if (!/[ÃÂâ]/.test(value)) return value
  const repaired = Buffer.from(value, 'latin1').toString('utf8')
  return mojibakeScore(repaired) < mojibakeScore(value) ? repaired : value
}

function cleanText(value) {
  if (typeof value !== 'string') return ''
  return maybeFixEncoding(value)
    .replace(/\uFEFF/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function splitTags(value) {
  return cleanText(value)
    .split(/[\n,;|]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function slugify(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function titleCase(value) {
  return cleanText(value)
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function hashString(value) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

function inferBrand(title, tags) {
  const cleaned = cleanText(title)
  const tagText = tags.join(' ')
  for (const [slug, display, regex] of BRAND_PATTERNS) {
    if (regex.test(cleaned) || regex.test(tagText)) {
      return { slug, display, confidence: 'high' }
    }
  }

  const firstToken = slugify(cleaned.split(/\s+/)[0] || '')
  if (!firstToken || GENERIC_BRAND_WORDS.has(firstToken)) {
    return { slug: 'miscellaneous', display: 'Miscellaneous', confidence: 'low' }
  }
  return { slug: firstToken, display: titleCase(firstToken), confidence: 'low' }
}

function inferCategory(title, description, tags) {
  const haystack = [title, description, tags.join(' ')].map(cleanText).join(' ').toLowerCase()

  if (/(perfume|fragrance|eau de|cologne|deodorant)/.test(haystack)) return 'fragrance'
  if (/(baby|infant|newborn)/.test(haystack)) return 'babycare'
  if (/(nail|manicure|cuticle)/.test(haystack)) return 'nailcare'
  if (/(spf|sunscreen|sun care|sun protection|uv protection|after sun)/.test(haystack)) return 'suncare'
  if (/(shampoo|conditioner|hair|keratin|frizz|scalp|hair mask|hair oil|hair serum|hair color|blonde)/.test(haystack))
    return 'haircare'
  if (/(body milk|body wash|body lotion|body scrub|body care|hand soap|hand cream|shower gel|deodorant)/.test(haystack))
    return 'bodycare'
  if (/(lipstick|lip gloss|foundation|concealer|mascara|eyeshadow|eyeliner|blush|powder|makeup|complexion|eye makeup|lip color)/.test(haystack))
    return 'makeup'
  return 'skincare'
}

function inferFormulationFamily(title, description, tags, category) {
  const haystack = [title, description, tags.join(' ')].map(cleanText).join(' ').toLowerCase()
  const rules = [
    ['serum', /(serum)/],
    ['cream', /(cream)/],
    ['gel-cleanser', /(foaming gel|gel cleanser|cleanser)/],
    ['mask', /(mask|peel off)/],
    ['body-lotion', /(body lotion|body milk)/],
    ['body-wash', /(body wash|shower gel)/],
    ['hand-soap', /(hand soap)/],
    ['sunscreen', /(spf|sunscreen|sun care)/],
    ['shampoo', /(shampoo)/],
    ['conditioner', /(conditioner)/],
    ['hair-mask', /(hair mask)/],
    ['hair-serum', /(hair serum|argan serum|hair oil)/],
    ['foundation', /(foundation)/],
    ['concealer', /(concealer)/],
    ['powder', /(powder)/],
    ['mascara', /(mascara)/],
    ['eyeshadow', /(eyeshadow|palette)/],
    ['lipstick', /(lipstick|lip color|lip paint)/],
    ['lip-gloss', /(lip gloss|lip oil)/],
    ['nail-polish', /(nail polish)/],
    ['eau-de-parfum', /(eau de parfum)/],
    ['eau-de-toilette', /(eau de toilette|cologne)/],
  ]

  for (const [family, regex] of rules) {
    if (regex.test(haystack)) return family
  }

  switch (category) {
    case 'haircare':
      return 'treatment'
    case 'bodycare':
      return 'body-care'
    case 'makeup':
      return 'color-cosmetic'
    case 'fragrance':
      return 'fragrance'
    default:
      return 'treatment'
  }
}

function priceRangeForCategory(category) {
  switch (category) {
    case 'makeup':
      return [6, 30]
    case 'skincare':
      return [12, 52]
    case 'haircare':
      return [10, 38]
    case 'suncare':
      return [14, 34]
    case 'bodycare':
      return [8, 24]
    case 'nailcare':
      return [5, 18]
    case 'babycare':
      return [9, 26]
    case 'fragrance':
      return [42, 128]
    default:
      return [10, 30]
  }
}

function derivePrice(category, seed) {
  const [min, max] = priceRangeForCategory(category)
  const steps = 20
  const raw = min + ((seed % steps) / (steps - 1)) * (max - min)
  return Number((Math.round(raw) - 0.01).toFixed(2))
}

function derivePriceBand(price) {
  if (price > 60) return 'premium'
  if (price > 25) return 'mid'
  return 'entry'
}

function deriveStock(seed) {
  if (seed % 17 === 0) return 0
  return 3 + (seed % 95)
}

function deriveRating(seed) {
  const value = 3.8 + ((seed % 12) * 0.1)
  return Number(Math.min(4.9, value).toFixed(1))
}

function deriveReviews(seed) {
  return 24 + (seed % 420)
}

function deriveShelfLife(category) {
  switch (category) {
    case 'fragrance':
      return 36
    case 'haircare':
      return 24
    case 'suncare':
      return 18
    default:
      return 24
  }
}

function deriveErpLineCode(category) {
  switch (category) {
    case 'makeup':
    case 'nailcare':
      return 'COLOR_COSMETIC'
    case 'skincare':
      return 'SKINCARE'
    case 'haircare':
      return 'HAIRCARE'
    case 'suncare':
      return 'SUNCARE'
    case 'bodycare':
      return 'BODYCARE'
    case 'babycare':
      return 'BABYCARE'
    case 'fragrance':
      return 'FRAGRANCE_PREMIUM'
    default:
      return 'GENERAL_MERCH'
  }
}

function deriveComplianceTags(category, tags) {
  const values = new Set(['cosmetic'])
  const lowerTags = tags.map((tag) => tag.toLowerCase())
  if (lowerTags.some((tag) => tag.includes('dermocos'))) values.add('dermocosmetic')
  if (category === 'fragrance') values.add('flammable')
  if (category === 'suncare') values.add('spf')
  return [...values]
}

function deriveImage(category, seed) {
  const pool = IMAGE_POOLS[category] ?? IMAGE_POOLS.skincare
  return pool[seed % pool.length]
}

function normalizeKeyFeatures(value) {
  return cleanText(value)
    .split('\n')
    .map((item) => item.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean)
}

function parsePrice(value) {
  const parsed = Number.parseFloat(cleanText(value).replace(/,/g, ''))
  return Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : null
}

function buildBaseProduct(row, index) {
  const title = cleanText(row.NameEn || row.MetaTitle)
  const description = cleanText(row.DescriptionTextEn || row.Description || row.MetaDescription)
  const categoryTags = [
    cleanText(row.CategoryNameEn),
    cleanText(row.SubCategoryNameEn),
    cleanText(row.SubSubCategoryNameEn),
  ].filter(Boolean)
  const tags = [
    ...new Set([
      ...categoryTags,
      ...splitTags(row.ProductTags),
      ...splitTags(row.KeyFeaturesEn),
    ]),
  ]
  const rawBrand = cleanText(row.BrandName)
  const brand = rawBrand
    ? { slug: slugify(rawBrand), display: rawBrand, confidence: 'high' }
    : inferBrand(title, tags)
  const category = inferCategory(title, `${description} ${categoryTags.join(' ')}`, tags)
  const formulationFamily = inferFormulationFamily(title, description, tags, category)
  const seed = hashString(`${row.ItemID}-${brand.slug}-${category}`)
  const price = parsePrice(row.Price) ?? derivePrice(category, seed)
  const itemId = cleanText(row.ItemID) || `CSV-${index + 1}`
  const vendorSku = `${brand.slug.slice(0, 3).toUpperCase()}-${category.slice(0, 3).toUpperCase()}-${itemId}`
  const inventoryPrefix = category.slice(0, 1).toUpperCase()
  const inventoryMiddle = String((seed % 24) + 1).padStart(2, '0')
  const inventoryEnd = String((seed % 12) + 1).padStart(2, '0')

  return {
    id: itemId,
    name: title,
    description,
    price,
    currency: 'USD',
    image: cleanText(row.imageUrl),
    rating: deriveRating(seed),
    reviews: deriveReviews(seed),
    isNew: seed % 7 === 0,
    isLimited: seed % 11 === 0,
    stock: deriveStock(seed),
    brand: brand.slug,
    category,
    manualRelatedIds: [],
    crossSellIds: [],
    completeSetIds: [],
    external_product_id: `ODOO-P-${itemId}`,
    vendor_sku: vendorSku,
    erp_line_code: deriveErpLineCode(category),
    inventory_bin: `${inventoryPrefix}-${inventoryMiddle}-${inventoryEnd}`,
    formulation_family: formulationFamily,
    shelf_life_months: deriveShelfLife(category),
    compliance_tags: deriveComplianceTags(category, tags),
    price_band: derivePriceBand(price),
    source_csv_item_id: itemId,
    source_row_number: index + 2,
    meta_title: title,
    meta_description: description,
    key_features: normalizeKeyFeatures(row.KeyFeaturesEn),
    how_to_use: cleanText(row.HowtoUseEn),
    seo_keywords: tags,
    product_tags: tags,
    csv_brand_label: brand.display,
    brand_confidence: brand.confidence,
  }
}

function selectBalancedProducts(products) {
  const brandFrequency = new Map()
  for (const product of products) {
    brandFrequency.set(product.brand, (brandFrequency.get(product.brand) ?? 0) + 1)
  }

  const preferredProducts = products.filter(
    (product) => product.brand_confidence === 'high' || (brandFrequency.get(product.brand) ?? 0) >= 4
  )

  const productPool = preferredProducts.length >= TARGET_COUNT ? preferredProducts : products
  const grouped = new Map()
  for (const product of productPool) {
    if (!grouped.has(product.category)) {
      grouped.set(product.category, new Map())
    }
    const byBrand = grouped.get(product.category)
    if (!byBrand.has(product.brand)) {
      byBrand.set(product.brand, [])
    }
    byBrand.get(product.brand).push(product)
  }

  for (const byBrand of grouped.values()) {
    for (const list of byBrand.values()) {
      list.sort((left, right) => left.name.localeCompare(right.name))
    }
  }

  const selected = []
  const selectedIds = new Set()
  const brandCounts = new Map()

  while (selected.length < TARGET_COUNT) {
    let progress = false

    for (const category of CATEGORY_ORDER) {
      const byBrand = grouped.get(category)
      if (!byBrand) continue

      const brandEntries = [...byBrand.entries()].sort((left, right) => {
        const leftCount = brandCounts.get(left[0]) ?? 0
        const rightCount = brandCounts.get(right[0]) ?? 0
        return leftCount - rightCount || right[1].length - left[1].length || left[0].localeCompare(right[0])
      })

      for (const [brand, items] of brandEntries) {
        if ((brandCounts.get(brand) ?? 0) >= PER_BRAND_LIMIT) continue
        const nextItem = items.find((item) => !selectedIds.has(item.id))
        if (!nextItem) continue
        selected.push(nextItem)
        selectedIds.add(nextItem.id)
        brandCounts.set(brand, (brandCounts.get(brand) ?? 0) + 1)
        progress = true
        break
      }

      if (selected.length >= TARGET_COUNT) {
        break
      }
    }

    if (!progress) break
  }

  if (selected.length < TARGET_COUNT) {
    const remaining = productPool
      .filter((product) => !selectedIds.has(product.id))
      .sort((left, right) => left.brand.localeCompare(right.brand) || left.name.localeCompare(right.name))

    for (const product of remaining) {
      if ((brandCounts.get(product.brand) ?? 0) >= PER_BRAND_LIMIT + 2) continue
      selected.push(product)
      selectedIds.add(product.id)
      brandCounts.set(product.brand, (brandCounts.get(product.brand) ?? 0) + 1)
      if (selected.length >= TARGET_COUNT) break
    }
  }

  return selected.sort(
    (left, right) =>
      left.category.localeCompare(right.category) ||
      left.brand.localeCompare(right.brand) ||
      left.name.localeCompare(right.name)
  )
}

function attachRelations(products) {
  const byBrand = new Map()
  const byCategory = new Map()

  for (const product of products) {
    if (!byBrand.has(product.brand)) byBrand.set(product.brand, [])
    if (!byCategory.has(product.category)) byCategory.set(product.category, [])
    byBrand.get(product.brand).push(product)
    byCategory.get(product.category).push(product)
  }

  return products.map((product) => {
    const sameBrand = (byBrand.get(product.brand) || []).filter((item) => item.id !== product.id)
    const sameCategory = (byCategory.get(product.category) || []).filter((item) => item.id !== product.id)
    const otherCategories = products.filter(
      (item) => item.id !== product.id && item.category !== product.category && item.brand !== product.brand
    )

    const manualRelatedIds = sameBrand.slice(0, 2).map((item) => item.id)
    const crossSellIds = otherCategories.slice(0, 2).map((item) => item.id)
    const completeSetIds = [product.id, ...sameCategory.slice(0, 2).map((item) => item.id)].filter(
      (value, index, list) => list.indexOf(value) === index
    )

    return {
      ...product,
      manualRelatedIds,
      crossSellIds,
      completeSetIds,
    }
  })
}

async function main() {
  const sourceText = await fs.readFile(SOURCE_PATH, 'utf8')
  const rows = parseCsv(sourceText)
  const [header, ...dataRows] = rows
  const keys = header.map((item) => cleanText(item))
  const rawRows = dataRows
    .map((values) => Object.fromEntries(keys.map((key, index) => [key, values[index] ?? ''])))
    .filter((row) => {
      const visibility = cleanText(row.isVisible || '').toLowerCase()
      return visibility === '' || visibility === '1' || visibility === 'true' || visibility === 'yes'
    })

  const baseProducts = rawRows.map((row, index) => buildBaseProduct(row, index))
  const selectedProducts = attachRelations(selectBalancedProducts(baseProducts))

  const byCategory = new Map()
  const byBrand = new Map()
  for (const product of selectedProducts) {
    byCategory.set(product.category, (byCategory.get(product.category) ?? 0) + 1)
    byBrand.set(product.brand, (byBrand.get(product.brand) ?? 0) + 1)
  }

  const fileContent = `// Generated from src/data/products_updated_new.csv for the mock ERP adapter.\nexport const generatedMockProductRows = ${JSON.stringify(
    selectedProducts,
    null,
    2
  )}\n`

  await fs.writeFile(OUTPUT_PATH, fileContent, 'utf8')

  console.log(`Generated ${selectedProducts.length} mock ERP products.`)
  console.log('Categories:', Object.fromEntries([...byCategory.entries()].sort()))
  console.log('Brands:', Object.fromEntries([...byBrand.entries()].sort()))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
