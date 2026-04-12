import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const PAGE_PATH = path.join(process.cwd(), 'apps', 'next', 'app', 'admin', 'marketing', 'cms', 'queries', 'page.tsx')

test('cms queries page uses a split list-and-editor layout with draft selection flow', async () => {
  const source = await fs.readFile(PAGE_PATH, 'utf8')

  assert.match(source, /const \[selectedSlug, setSelectedSlug\] = useState<string \| null>\(null\)/)
  assert.match(source, /const \[draft, setDraft\] = useState<DraftQuery \| null>\(null\)/)
  assert.match(source, /const \[baselineDraft, setBaselineDraft\] = useState\(''\)/)
  assert.match(source, /const \[isCreating, setIsCreating\] = useState\(false\)/)
  assert.match(source, /handleStartNew/)
  assert.match(source, /handleSelectRow/)
  assert.match(source, /display: 'flex', gap: spacing\['16'\], alignItems: 'flex-start', flexWrap: 'wrap'/)
  assert.match(source, /flex: '0 0 340px', width: 340, maxWidth: '100%'/)
  assert.match(source, /flex: '1 1 620px', minWidth: 0/)
})

test('cms queries page supports create save duplicate and dirty-state guard', async () => {
  const source = await fs.readFile(PAGE_PATH, 'utf8')

  assert.match(source, /const \[successMessage, setSuccessMessage\] = useState<string \| null>\(null\)/)
  assert.match(source, /const isDirty = useMemo\(/)
  assert.match(source, /window\.confirm\(UI\.unsavedChanges\)/)
  assert.match(source, /await apiClient\.admin\.createProductQuery\(payload\)/)
  assert.match(source, /await apiClient\.admin\.updateProductQuery\(selectedSlug, \{/)
  assert.match(source, /const handleDuplicate = \(\) => \{/)
  assert.match(source, /duplicateSuffix: '-copy'/)
})

test('cms queries page includes builder json mode and live product preview', async () => {
  const source = await fs.readFile(PAGE_PATH, 'utf8')

  assert.match(source, /InlineLoading/)
  assert.match(source, /const \[isBuilderMode, setIsBuilderMode\] = useState\(true\)/)
  assert.match(source, /const \[jsonText, setJsonText\] = useState\(JSON\.stringify\(createEmptyDraft\(\)\.filters, null, 2\)\)/)
  assert.match(source, /const \[selectedBrand, setSelectedBrand\] = useState\(''\)/)
  assert.match(source, /const \[productSearch, setProductSearch\] = useState\(''\)/)
  assert.match(source, /const \[productSearchResults, setProductSearchResults\] = useState<ProductRow\[]>\(\[]\)/)
  assert.match(source, /const \[selectedProducts, setSelectedProducts\] = useState<ProductRow\[]>\(\[]\)/)
  assert.match(source, /const parsed = normalizeFilterJson\(value\)/)
  assert.match(source, /if \(selectedBrand\) nextFilters\.brand = \[selectedBrand\]/)
  assert.match(source, /const ids = selectedProducts\.map\(\(product\) => product\.id\)/)
  assert.match(source, /await apiClient\.admin\.listProducts\(\{\s*limit: 8,\s*search: query,/)
  assert.match(source, /await apiClient\.admin\.getProduct\(productId\)/)
  assert.match(source, /await apiClient\.products\.list\(\{/)
  assert.match(source, /limit: typeof filters\.limit === 'number' \? Math\.min\(filters\.limit, 8\) : 8/)
  assert.match(source, /gridTemplateColumns: 'repeat\(3, minmax\(0, 1fr\)\)'/)
  assert.match(source, /gridColumn: '1 \/ -1'/)
  assert.match(source, /gridTemplateColumns: 'minmax\(220px, 260px\) minmax\(0, 1fr\)'/)
  assert.match(source, /Matching Products/)
  assert.match(source, /Brand/)
  assert.match(source, /Selected Products/)
  assert.match(source, /Product Preview/)
  assert.match(source, /Used By/)
  assert.match(source, /<InlineLoading label=\{UI\.previewLoading\} \/>/)
})
