import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const PAGE_PATH = path.join(process.cwd(), 'apps', 'next', 'app', 'admin', 'marketing', 'cms', 'blocks', 'page.tsx')
const QUERY_DROPDOWN_PATH = path.join(process.cwd(), 'apps', 'next', 'app', 'admin', 'marketing', 'cms', 'blocks', '_components', 'QueryDropdown.tsx')
const UPLOAD_ZONE_PATH = path.join(process.cwd(), 'apps', 'next', 'app', 'admin', 'marketing', 'cms', 'blocks', '_components', 'UploadZone.tsx')

test('admin cms blocks page defers homepage order persistence until save order and guards publish on dirty state', async () => {
  const source = await fs.readFile(PAGE_PATH, 'utf8')

  assert.match(source, /Save order/)
  assert.match(source, /editorial_hotspot/)
  assert.match(source, /Editorial Hotspot/)
  assert.match(source, /const \[draftOrderDirty, setDraftOrderDirty\] = useState\(false\)/)
  assert.match(source, /const \[publishGuardOpen, setPublishGuardOpen\] = useState\(false\)/)
  assert.match(source, /You have unsaved homepage changes/)
  assert.match(source, /event\.dataTransfer\.effectAllowed = 'move'/)
  assert.match(source, /event\.dataTransfer\.setData\('text\/plain', block\.id\)/)
  assert.match(source, /await handleDrop\(block\.id, event\.dataTransfer\.getData\('text\/plain'\)\)/)
  assert.match(source, /await saveOrderDraft\(\)/)
  assert.match(source, /await saveSelectedBlock\(\)/)
  assert.doesNotMatch(source, /await persistOrderedBlocks\(normalized\)/)
})

test('admin cms blocks page creates new blocks from schema-valid default payloads and only closes modal after success', async () => {
  const source = await fs.readFile(PAGE_PATH, 'utf8')

  assert.match(source, /const buildDefaultPayload = \(blockType: BlockType, pos: number\): unknown =>/)
  assert.match(source, /const getDefaultQuerySlug = \(\) => queries\.find\(\(query\) => query\.active\)\?\.slug \?\? queries\[0\]\?\.slug \?\? null/)
  assert.match(source, /const payload = buildDefaultPayload\(t, blocks\.length \+ 1\)/)
  assert.match(source, /setAddModalOpen\(false\)/)
  assert.match(source, /createReleaseBlock\(\{/)
  assert.match(source, /setSelectedBlockId\(created\.id\)/)
})

test('admin cms blocks page lets editorial hotspot products be searched and selected from admin catalog results', async () => {
  const source = await fs.readFile(PAGE_PATH, 'utf8')

  assert.match(source, /const \[editorialHotspotSearch, setEditorialHotspotSearch\] = useState\(''\)/)
  assert.match(source, /const \[editorialHotspotSearchResults, setEditorialHotspotSearchResults\] = useState<ProductRow\[]>\(\[]\)/)
  assert.match(source, /await apiClient\.admin\.listProducts\(\{\s*limit: 8,\s*search: query,/)
  assert.match(source, /const addEditorialHotspotProduct = \(productId: string\) =>/)
  assert.match(source, /const removeEditorialHotspotProduct = \(productId: string\) =>/)
  assert.match(source, /const \[editorialHotspotSelectedProducts, setEditorialHotspotSelectedProducts\] = useState<ProductRow\[]>\(\[]\)/)
  assert.match(source, /await apiClient\.admin\.getProduct\(productId\)/)
  assert.match(source, /formatAdminBrandName\(product\.brand\)/)
  assert.match(source, /<img/)
  assert.match(source, /UI_STRINGS\.productSearchLabel/)
  assert.match(source, /UI_STRINGS\.selectedProductsLabel/)
})

test('admin cms blocks page lets the left block list expand to fit all blocks for drag ordering', async () => {
  const source = await fs.readFile(PAGE_PATH, 'utf8')

  assert.match(source, /gridTemplateColumns: 'minmax\(340px, 380px\) minmax\(0, 1fr\)'/)
  assert.match(source, /paddingBottom: spacing\['6'\]/)
  assert.match(source, /boxShadow: active \? `0 0 0 3px \$\{colors\.brandPrimarySubtle\}` : 'none'/)
  assert.match(source, /overflow: 'hidden'/)
  assert.doesNotMatch(source, /maxHeight: 'calc\(100vh - 340px\)'/)
})

test('admin cms blocks page preserves real uploaded image previews and shows actual image dimensions', async () => {
  const source = await fs.readFile(PAGE_PATH, 'utf8')
  const uploadZoneSource = await fs.readFile(UPLOAD_ZONE_PATH, 'utf8')

  assert.match(uploadZoneSource, /const \[naturalSize, setNaturalSize\] = useState<\{ width: number; height: number \} \| null>\(null\)/)
  assert.match(uploadZoneSource, /setNaturalSize\(\{ width: image\.naturalWidth, height: image\.naturalHeight \}\)/)
  assert.match(uploadZoneSource, /Recommended frame \{aspectW\}:\{aspectH\}/)
  assert.match(uploadZoneSource, /height: frameHeight/)
  assert.match(uploadZoneSource, /maxHeight: '100%'/)
  assert.match(uploadZoneSource, /boxSizing: 'border-box'/)
  assert.match(uploadZoneSource, /objectFit: previewFit/)
  assert.match(uploadZoneSource, /padding: previewFit === 'cover' \? 0 : spacing\['12'\]/)
  assert.match(source, /frameWidth=\{componentTokens\.storefrontHome\.editorialHotspot\.desktopImageSize\}/)
  assert.match(source, /frameHeight=\{componentTokens\.storefrontHome\.editorialHotspot\.desktopImageSize\}/)
  assert.match(source, /previewFit='cover'/)
  assert.match(source, /aspectW=\{1\} aspectH=\{1\}/)
  assert.match(source, /apiClient\.admin\.uploadCmsBlockImage\(file\)/)
  assert.match(source, /if \(!upload\?\.url\) throw new Error\('Upload failed'\)/)
  assert.doesNotMatch(source, /fetch\('\/api\/admin\/cms\/blocks\/upload'/)
  assert.doesNotMatch(source, /cropToCanvas\(/)
})

test('admin cms blocks page uses a searchable query picker with explicit query load states and quick-linking', async () => {
  const source = await fs.readFile(PAGE_PATH, 'utf8')
  const queryDropdownSource = await fs.readFile(QUERY_DROPDOWN_PATH, 'utf8')

  assert.match(source, /InlineLoading/)
  assert.match(source, /import \{ QueryDropdown \} from '\.\/_components\/QueryDropdown'/)
  assert.match(source, /<QueryDropdown/)
  assert.match(queryDropdownSource, /export function QueryDropdown\(/)
  assert.match(queryDropdownSource, /const \[search, setSearch\] = useState\(''\)/)
  assert.match(queryDropdownSource, /const filteredQueries = useMemo\(/)
  assert.match(queryDropdownSource, /querySearchPlaceholder: 'Search queries by title or slug'/)
  assert.match(queryDropdownSource, /queryOpenLink: 'Open Queries'/)
  assert.match(queryDropdownSource, /href='\/admin\/marketing\/cms\/queries'/)
  assert.match(source, /loading=\{queriesLoading\}/)
  assert.match(source, /loadError=\{queriesError\}/)
  assert.match(source, /const \[queriesLoading, setQueriesLoading\] = useState\(false\)/)
  assert.match(source, /const \[queriesError, setQueriesError\] = useState<string \| null>\(null\)/)
  assert.match(source, /setQueriesError\(cause instanceof Error \? cause\.message : UI_STRINGS\.queryLoadFailure\)/)
  assert.match(queryDropdownSource, /gap: spacing\['8'\],\s*maxHeight: 220,/)
  assert.match(queryDropdownSource, /<InlineLoading label=\{UI\.queryLoading\} \/>/)
  assert.match(queryDropdownSource, /padding: spacing\['12'\],\s*display: 'grid',\s*gap: spacing\['6'\]/)
  assert.match(queryDropdownSource, /fontFamily: 'monospace'/)
  assert.match(queryDropdownSource, /backgroundColor: colors\.surfaceMuted,\s*color: colors\.textSecondary,\s*padding: `2px \$\{spacing\['8'\]\}px`/)
  assert.match(source, /personalizedRailFields\.mode === 'static'/)
})

test('admin cms blocks page uses inline loading cues for product search and preview states', async () => {
  const source = await fs.readFile(PAGE_PATH, 'utf8')

  assert.match(source, /<InlineLoading label=\{UI_STRINGS\.productSearchLoading\} \/>/)
  assert.match(source, /<InlineLoading label=\{UI_STRINGS\.previewLoading\} size=\{24\} \/>/)
})

test('admin cms blocks page treats brand spotlight banner titles as optional', async () => {
  const source = await fs.readFile(PAGE_PATH, 'utf8')

  assert.doesNotMatch(source, /if \(!brandSpotlightFields\.bannerTitleEn\) errs\.brandSpotlightBannerTitleEn = 'Required'/)
  assert.doesNotMatch(source, /labelEn="Banner Title EN"[\s\S]*required[\s\S]*errorEn=\{fieldErrors\.brandSpotlightBannerTitleEn\}/)
})
