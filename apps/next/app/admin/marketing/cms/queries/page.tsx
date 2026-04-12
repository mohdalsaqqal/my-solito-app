'use client'

import { useEffect, useMemo, useState } from 'react'
import { Code, Copy, Download, Eye, Plus, Save, Search, Sliders, Trash2 } from 'lucide-react'
import { Product, ProductFilter, ProductQuery, ProductRow } from '@real/app/lib/types'
import { apiClient } from '../../../../apiClient'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import {
  Button,
  EmptyState,
  Field,
  InlineLoading,
  PageContainer,
  PageHeader,
  Panel,
  Section,
  SelectInput,
  StatusPill,
  TextInput,
} from '../../../_components/AdminPagePrimitives'
import { AdminLoadingSkeleton, AdminErrorState } from '../../../_components/AdminLoadingFeedback'

type QueryUsage = {
  releaseId: string
  environment?: 'production' | 'staging'
  status?: 'draft' | 'published'
  blockId: string
  blockType: string
  position?: number
  enabled?: boolean
}

type QueryRow = ProductQuery & {
  usageCount?: number
  usedBy?: QueryUsage[]
}

type CategoryRow = {
  id: string
  slug: string
  name: { en: string; ar: string }
}

type BrandRow = {
  id: string
  slug: string
  name: { en: string; ar: string }
  isActive: boolean
}

type DraftQuery = {
  slug: string
  active: boolean
  titleEn: string
  titleAr: string
  filters: ProductFilter
}

type PreviewState = {
  loading: boolean
  error: string | null
  items: Product[]
  total: number
}

const UI = {
  title: 'CMS Queries',
  subtitle: 'Shared product rules that power CMS blocks and homepage rails.',
  exportCsv: 'Export CSV',
  newQuery: 'New Query',
  duplicate: 'Duplicate',
  saveQuery: 'Save Query',
  deleteQuery: 'Delete Query',
  searchPlaceholder: 'Search queries...',
  listEmptyTitle: 'No CMS queries found',
  listEmptyDescription: 'Create a query or change the current filters.',
  editorEmptyTitle: 'Select a query',
  editorEmptyDescription: 'Choose a query from the list or start a new one to edit filters and preview products.',
  unsavedChanges: 'You have unsaved query changes. Discard them?',
  createSuccess: 'Query created.',
  updateSuccess: 'Query saved.',
  deleteSuccess: 'Query deleted.',
  duplicateSuffix: '-copy',
  invalidJson: 'Invalid JSON format.',
  loadError: 'Unable to load CMS queries.',
  categoryLoadError: 'Unable to load query categories.',
  previewError: 'Unable to preview query results.',
  deleteError: 'Unable to delete query.',
  saveError: 'Unable to save query.',
  slugRequired: 'Slug is required.',
  filtersRequired: 'Valid filters are required.',
  deleteConfirmPrefix: 'Delete query',
  dirtyIndicator: 'Unsaved changes',
  queryIdentity: 'Query Identity',
  filterConfig: 'Product Filter Configuration',
  previewTitle: 'Product Preview',
  usageTitle: 'Used By',
  usageEmpty: 'Not used by any known block yet.',
  usageUnknown: 'Usage data will appear here when available.',
  slugLabel: 'Slug',
  titleEnLabel: 'Title EN',
  titleArLabel: 'Title AR',
  statusLabel: 'Status',
  activeLabel: 'Active',
  inactiveLabel: 'Inactive',
  modeBuilder: 'Builder',
  modeJson: 'JSON',
  sortLabel: 'Sort Order',
  sortBestsellers: 'Bestsellers',
  sortNewest: 'Newest Arrivals',
  sortPriceAsc: 'Price: Low to High',
  sortPriceDesc: 'Price: High to Low',
  limitLabel: 'Limit Items',
  categoryLabel: 'Category',
  brandLabel: 'Brand',
  productSearchLabel: 'Products',
  productSearchPlaceholder: 'Search products by name, brand, or SKU...',
  productSearchHint: 'Search and add products directly. Selected products become the manual query list.',
  selectedProductsLabel: 'Selected Products',
  selectedProductsEmpty: 'No manual products selected.',
  addProduct: 'Add',
  addedProduct: 'Added',
  clearProducts: 'Clear products',
  removeProduct: 'Remove',
  searchResultsLabel: 'Matching Products',
  searchResultsEmpty: 'No matching products found.',
  onSaleLabel: 'Show on-sale items only',
  allCategories: 'All categories',
  allBrands: 'All brands',
  allStatus: 'All',
  activeStatus: 'Active',
  inactiveStatus: 'Inactive',
  previewDisabled: 'Save or adjust filters to preview matching products.',
  previewEmpty: 'No products match this query yet.',
  previewLoading: 'Loading preview…',
  previewFiltersSummary: 'Previewing the first matching products for this query.',
  queryListTitle: 'Queries',
  filterKeysEmpty: 'No filters',
  jsonHint: 'Advanced mode for direct ProductFilter editing.',
  builderHint: 'Use the builder for marketing-friendly filter editing.',
  createHint: 'New queries create a shared slug that blocks can reuse.',
} as const

const SORT_OPTIONS: Array<{ value: NonNullable<ProductFilter['sort']>; label: string }> = [
  { value: 'bestseller', label: UI.sortBestsellers },
  { value: 'newest', label: UI.sortNewest },
  { value: 'price_asc', label: UI.sortPriceAsc },
  { value: 'price_desc', label: UI.sortPriceDesc },
]

function normalizeFilterJson(value: string) {
  try {
    return JSON.parse(value) as ProductFilter
  } catch {
    return null
  }
}

function normalizeIds(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function toDraftQuery(row: QueryRow): DraftQuery {
  return {
    slug: row.slug,
    active: row.active,
    titleEn: row.title?.en ?? row.slug,
    titleAr: row.title?.ar ?? row.slug,
    filters: row.filters ?? {},
  }
}

function createEmptyDraft(): DraftQuery {
  return {
    slug: '',
    active: true,
    titleEn: '',
    titleAr: '',
    filters: { sort: 'bestseller', limit: 8 },
  }
}

function serializeDraftQuery(draft: DraftQuery | null) {
  if (!draft) return ''
  return JSON.stringify({
    slug: draft.slug.trim().toLowerCase(),
    active: draft.active,
    title: {
      en: draft.titleEn.trim(),
      ar: draft.titleAr.trim(),
    },
    filters: draft.filters,
  })
}

function usageLabel(count?: number) {
  if (typeof count !== 'number') return null
  return count === 1 ? 'Used by 1 block' : `Used by ${count} blocks`
}

function formatAdminBrandName(value?: string) {
  if (!value) return 'Unknown brand'
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function filterKeySummary(filters: ProductFilter) {
  const keys = Object.entries(filters).filter(([, value]) => {
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'string') return value.trim().length > 0
    return value !== undefined && value !== null
  })
  return keys.length > 0 ? keys.map(([key]) => key) : []
}

export default function AdminCmsQueriesPage() {
  const [rows, setRows] = useState<QueryRow[]>([])
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [brands, setBrands] = useState<BrandRow[]>([])
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [draft, setDraft] = useState<DraftQuery | null>(null)
  const [baselineDraft, setBaselineDraft] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [busySlug, setBusySlug] = useState<string | null>(null)
  const [isBuilderMode, setIsBuilderMode] = useState(true)
  const [jsonText, setJsonText] = useState(JSON.stringify(createEmptyDraft().filters, null, 2))
  const [sort, setSort] = useState<ProductFilter['sort']>('bestseller')
  const [limit, setLimit] = useState(8)
  const [onSale, setOnSale] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [productSearchResults, setProductSearchResults] = useState<ProductRow[]>([])
  const [selectedProducts, setSelectedProducts] = useState<ProductRow[]>([])
  const [productSearchLoading, setProductSearchLoading] = useState(false)
  const [productSearchError, setProductSearchError] = useState<string | null>(null)
  const [preview, setPreview] = useState<PreviewState>({
    loading: false,
    error: null,
    items: [],
    total: 0,
  })

  const loadQueries = async () => {
    try {
      const data = await apiClient.admin.listProductQueries()
      setRows(data as QueryRow[])
      return data as QueryRow[]
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : UI.loadError)
      return null
    }
  }

  const loadCategories = async () => {
    try {
      const data = await apiClient.catalog.categories()
      setCategories((data as CategoryRow[]) ?? [])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : UI.categoryLoadError)
    }
  }

  const loadBrands = async () => {
    try {
      const data = await apiClient.catalog.brands()
      setBrands((data as BrandRow[]) ?? [])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : UI.categoryLoadError)
    }
  }

  const syncBuilderFromFilters = (filters: ProductFilter) => {
    setSort(filters.sort ?? 'bestseller')
    setLimit(typeof filters.limit === 'number' ? filters.limit : 8)
    setOnSale(Boolean(filters.onSale))
    setSelectedCategory(filters.category?.[0] ?? '')
    setSelectedBrand(filters.brand?.[0] ?? '')
    setProductSearch('')
    setProductSearchError(null)
    setProductSearchResults([])
    setJsonText(JSON.stringify(filters, null, 2))
  }

  const selectDraft = (next: DraftQuery, creating: boolean) => {
    setDraft(next)
    const snapshot = serializeDraftQuery(next)
    setBaselineDraft(snapshot)
    setIsCreating(creating)
    syncBuilderFromFilters(next.filters)
  }

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const data = await loadQueries()
      await Promise.all([loadCategories(), loadBrands()])
      if (cancelled || !data || data.length === 0) return
      const initial = data[0] as QueryRow
      setSelectedSlug(initial.slug)
      selectDraft(toDraftQuery(initial), false)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredRows = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase()
    return rows.filter((item) => {
      const haystack = `${item.slug} ${item.title?.en ?? ''} ${item.title?.ar ?? ''}`.toLowerCase()
      const matchesSearch = !needle || haystack.includes(needle)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && item.active) ||
        (statusFilter === 'inactive' && !item.active)
      return matchesSearch && matchesStatus
    })
  }, [rows, searchQuery, statusFilter])

  const selectedRow = useMemo(
    () => rows.find((item) => item.slug === selectedSlug) ?? null,
    [rows, selectedSlug],
  )

  const isDirty = useMemo(
    () => serializeDraftQuery(draft) !== baselineDraft,
    [baselineDraft, draft],
  )

  const selectedUsageLabel = usageLabel(selectedRow?.usageCount)

  useEffect(() => {
    if (!draft || !isBuilderMode) return
    const nextFilters: ProductFilter = {
      sort,
      limit: Number.isFinite(limit) && limit > 0 ? limit : 8,
    }
    if (onSale) nextFilters.onSale = true
    if (selectedCategory) nextFilters.category = [selectedCategory]
    if (selectedBrand) nextFilters.brand = [selectedBrand]
    const ids = selectedProducts.map((product) => product.id)
    if (ids.length > 0) nextFilters.ids = ids
    const serializedNext = JSON.stringify(nextFilters)
    if (serializedNext !== JSON.stringify(draft.filters)) {
      setDraft((current) => (current ? { ...current, filters: nextFilters } : current))
    }
    setJsonText(JSON.stringify(nextFilters, null, 2))
  }, [draft, isBuilderMode, limit, onSale, selectedBrand, selectedCategory, selectedProducts, sort])

  useEffect(() => {
    if (!draft || !isBuilderMode) return

    const productIds = draft.filters.ids ?? []
    if (productIds.length === 0) {
      setSelectedProducts([])
      return
    }

    let cancelled = false
    void Promise.all(
      productIds.map(async (productId) => {
        const existingFromSearch = productSearchResults.find((product) => product.id === productId)
        if (existingFromSearch) return existingFromSearch
        const detail = await apiClient.admin.getProduct(productId)
        return {
          id: detail.id,
          title: detail.title,
          brand: detail.brand,
          sku: detail.sku,
          image: detail.image,
          price: detail.price,
        } satisfies ProductRow
      })
    )
      .then((products) => {
        if (!cancelled) {
          const ordered = productIds
            .map((productId) => products.find((product) => product.id === productId))
            .filter((product): product is ProductRow => Boolean(product))
          setSelectedProducts(ordered)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSelectedProducts([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [draft, isBuilderMode, productSearchResults])

  useEffect(() => {
    if (!isBuilderMode) return

    const query = productSearch.trim()
    if (query.length < 2) {
      setProductSearchResults([])
      setProductSearchLoading(false)
      setProductSearchError(null)
      return
    }

    let cancelled = false
    const timeoutId = window.setTimeout(async () => {
      setProductSearchLoading(true)
      setProductSearchError(null)
      try {
        const response = await apiClient.admin.listProducts({
          limit: 8,
          search: query,
        })
        if (!cancelled) {
          setProductSearchResults(response.nodes)
        }
      } catch (cause) {
        if (!cancelled) {
          setProductSearchResults([])
          setProductSearchError(cause instanceof Error ? cause.message : UI.previewError)
        }
      } finally {
        if (!cancelled) {
          setProductSearchLoading(false)
        }
      }
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [isBuilderMode, productSearch])

  useEffect(() => {
    if (!draft) {
      setPreview({ loading: false, error: null, items: [], total: 0 })
      return
    }

    const filters = draft.filters
    const hasValidFilters = typeof filters === 'object' && filters !== null
    if (!hasValidFilters) {
      setPreview({ loading: false, error: UI.invalidJson, items: [], total: 0 })
      return
    }

    let cancelled = false
    const timer = window.setTimeout(async () => {
      setPreview((current) => ({ ...current, loading: true, error: null }))
      try {
        const items = await apiClient.products.list({
          ...filters,
          limit: typeof filters.limit === 'number' ? Math.min(filters.limit, 8) : 8,
        })
        if (!cancelled) {
          setPreview({
            loading: false,
            error: null,
            items,
            total: items.length,
          })
        }
      } catch (cause) {
        if (!cancelled) {
          setPreview({
            loading: false,
            error: cause instanceof Error ? cause.message : UI.previewError,
            items: [],
            total: 0,
          })
        }
      }
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [draft])

  const downloadCsv = () => {
    const header = ['slug', 'active', 'title_en', 'title_ar', 'filters', 'usage_count']
    const lines = filteredRows.map((item) => [
      item.slug,
      item.active ? 'true' : 'false',
      item.title?.en ?? '',
      item.title?.ar ?? '',
      JSON.stringify(item.filters),
      String(item.usageCount ?? ''),
    ])
    const csv = [header, ...lines]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'cms-queries.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const trySwitchDraft = (next: () => void) => {
    if (isDirty && !window.confirm(UI.unsavedChanges)) {
      return
    }
    setError(null)
    setSuccessMessage(null)
    next()
  }

  const handleSelectRow = (row: QueryRow) => {
    trySwitchDraft(() => {
      setSelectedSlug(row.slug)
      selectDraft(toDraftQuery(row), false)
    })
  }

  const handleStartNew = () => {
    trySwitchDraft(() => {
      setSelectedSlug(null)
      selectDraft(createEmptyDraft(), true)
      setIsBuilderMode(true)
    })
  }

  const handleDuplicate = () => {
    if (!draft) return
    const duplicated: DraftQuery = {
      ...draft,
      slug: `${draft.slug || 'query'}${UI.duplicateSuffix}`,
      titleEn: draft.titleEn ? `${draft.titleEn} Copy` : '',
      titleAr: draft.titleAr ? `${draft.titleAr} Copy` : '',
    }
    trySwitchDraft(() => {
      setSelectedSlug(null)
      selectDraft(duplicated, true)
    })
  }

  const handleJsonTextChange = (value: string) => {
    setJsonText(value)
    if (!draft) return
    const parsed = normalizeFilterJson(value)
    if (parsed) {
      setDraft({ ...draft, filters: parsed })
      if (!isBuilderMode) {
        setSort(parsed.sort ?? 'bestseller')
        setLimit(typeof parsed.limit === 'number' ? parsed.limit : 8)
        setOnSale(Boolean(parsed.onSale))
        setSelectedCategory(parsed.category?.[0] ?? '')
        setSelectedBrand(parsed.brand?.[0] ?? '')
      }
    }
  }

  const handleToggleMode = (nextMode: boolean) => {
    if (!draft) return
    if (nextMode) {
      const parsed = normalizeFilterJson(jsonText)
      if (!parsed) {
        setError(UI.invalidJson)
        return
      }
      setDraft({ ...draft, filters: parsed })
      syncBuilderFromFilters(parsed)
    }
    setIsBuilderMode(nextMode)
  }

  const handleSave = async () => {
    if (!draft || busySlug) return
    const slug = draft.slug.trim().toLowerCase()
    if (!slug) {
      setError(UI.slugRequired)
      return
    }
    if (!normalizeFilterJson(jsonText)) {
      setError(UI.filtersRequired)
      return
    }

    setBusySlug(slug)
    setError(null)
    setSuccessMessage(null)

    const payload = {
      slug,
      active: draft.active,
      title: {
        en: draft.titleEn.trim() || slug,
        ar: draft.titleAr.trim() || slug,
      },
      filters: draft.filters,
    }

    try {
      if (isCreating || !selectedSlug) {
        await apiClient.admin.createProductQuery(payload)
        setSuccessMessage(UI.createSuccess)
      } else {
        await apiClient.admin.updateProductQuery(selectedSlug, {
          active: payload.active,
          title: payload.title,
          filters: payload.filters,
        })
        setSuccessMessage(UI.updateSuccess)
      }
      const nextRows = await loadQueries()
      if (!nextRows) return
      const matched = nextRows.find((item) => item.slug === slug) as QueryRow | undefined
      if (matched) {
        setSelectedSlug(matched.slug)
        selectDraft(toDraftQuery(matched), false)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : UI.saveError)
    } finally {
      setBusySlug(null)
    }
  }

  const handleDelete = async (querySlug: string) => {
    const confirmed = window.confirm(`${UI.deleteConfirmPrefix} "${querySlug}"?`)
    if (!confirmed) return
    setBusySlug(querySlug)
    setError(null)
    setSuccessMessage(null)
    try {
      await apiClient.admin.deleteProductQuery(querySlug)
      const nextRows = await loadQueries()
      setSuccessMessage(UI.deleteSuccess)
      if (!nextRows || nextRows.length === 0) {
        setSelectedSlug(null)
        setDraft(null)
        setBaselineDraft('')
        setIsCreating(false)
        return
      }
      const fallback = nextRows.find((item) => item.slug !== querySlug) as QueryRow | undefined
      if (selectedSlug === querySlug && fallback) {
        setSelectedSlug(fallback.slug)
        selectDraft(toDraftQuery(fallback), false)
      } else if (selectedSlug === querySlug) {
        setSelectedSlug(null)
        setDraft(null)
        setBaselineDraft('')
        setIsCreating(false)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : UI.deleteError)
    } finally {
      setBusySlug(null)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title={UI.title}
        subtitle={UI.subtitle}
        actions={
          <>
            <Button tone='secondary' onClick={downloadCsv}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
                <Download size={14} color={colors.textSecondary} />
                {UI.exportCsv}
              </span>
            </Button>
            <Button tone='primary' onClick={handleStartNew}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
                <Plus size={14} color={colors.white} />
                {UI.newQuery}
              </span>
            </Button>
          </>
        }
      />

      {error ? <p style={{ marginTop: 0, color: colors.danger }}>{error}</p> : null}
      {successMessage ? <p style={{ marginTop: 0, color: colors.textSecondary }}>{successMessage}</p> : null}

      <Section>
        <div style={{ display: 'flex', gap: spacing['16'], alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 340px', width: 340, maxWidth: '100%' }}>
            <Panel density='dense'>
              <div style={{ display: 'grid', gap: spacing['12'] }}>
                <div
                  style={{
                    display: 'grid',
                    gap: spacing['12'],
                    borderBottom: `1px solid ${colors.border}`,
                    paddingBottom: spacing['12'],
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <Search size={16} color={colors.textSecondary} style={{ position: 'absolute', insetInlineStart: 12, top: 12 }} />
                    <TextInput
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={UI.searchPlaceholder}
                      style={{
                        paddingInlineStart: spacing['32'] + spacing['8'],
                        paddingInlineEnd: spacing['12'],
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: spacing['4'], backgroundColor: colors.surfaceMuted, borderRadius: radius.full, padding: '4px' }}>
                    {([
                      { key: 'all', label: UI.allStatus },
                      { key: 'active', label: UI.activeStatus },
                      { key: 'inactive', label: UI.inactiveStatus },
                    ] as const).map((item) => (
                      <button
                        key={item.key}
                        type='button'
                        onClick={() => setStatusFilter(item.key)}
                        style={{
                          flex: 1,
                          border: 0,
                          cursor: 'pointer',
                          borderRadius: radius.full,
                          padding: '6px 12px',
                          fontSize: typography.sm,
                          fontWeight: Number(fontWeights.medium),
                          backgroundColor: statusFilter === item.key ? colors.brandPrimary : 'transparent',
                          color: statusFilter === item.key ? colors.white : colors.textSecondary,
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: spacing['8'] }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing['8'] }}>
                    <span style={{ color: colors.textPrimary, fontWeight: Number(fontWeights.semibold) }}>{UI.queryListTitle}</span>
                    <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>{filteredRows.length}</span>
                  </div>

                  {filteredRows.length === 0 ? (
                    <EmptyState title={UI.listEmptyTitle} description={UI.listEmptyDescription} />
                  ) : (
                    filteredRows.map((item) => {
                      const active = !isCreating && selectedSlug === item.slug
                      const usage = usageLabel(item.usageCount)
                      const filterKeys = filterKeySummary(item.filters)
                      return (
                        <button
                          key={item.slug}
                          type='button'
                          onClick={() => handleSelectRow(item)}
                          style={{
                            border: `1px solid ${active ? colors.brandPrimary : colors.border}`,
                            borderRadius: radius.xl,
                            backgroundColor: active ? colors.brandPrimarySubtle : colors.surface,
                            padding: spacing['12'],
                            display: 'grid',
                            gap: spacing['6'],
                            textAlign: 'start',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing['8'] }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ color: colors.textPrimary, fontWeight: Number(fontWeights.semibold) }}>
                                {item.title?.en ?? item.slug}
                              </div>
                              <div style={{ color: colors.textSecondary, fontSize: typography.xs, fontFamily: 'monospace' }}>
                                {item.slug}
                              </div>
                            </div>
                            <StatusPill tone={item.active ? 'success' : 'neutral'}>
                              {item.active ? UI.activeLabel : UI.inactiveLabel}
                            </StatusPill>
                          </div>
                          <div style={{ display: 'flex', gap: spacing['4'], flexWrap: 'wrap' }}>
                            {(filterKeys.length > 0 ? filterKeys : [UI.filterKeysEmpty]).map((key) => (
                              <span
                                key={`${item.slug}-${key}`}
                                style={{
                                  fontSize: typography.xs,
                                  color: colors.textSecondary,
                                  backgroundColor: colors.surfaceMuted,
                                  borderRadius: radius.full,
                                  padding: '2px 8px',
                                }}
                              >
                                {key}
                              </span>
                            ))}
                            {usage ? (
                              <span
                                style={{
                                  fontSize: typography.xs,
                                  color: colors.textSecondary,
                                  backgroundColor: colors.brandPrimarySubtle,
                                  borderRadius: radius.full,
                                  padding: '2px 8px',
                                }}
                              >
                                {usage}
                              </span>
                            ) : null}
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            </Panel>
          </div>

          <div style={{ flex: '1 1 620px', minWidth: 0 }}>
            <Panel>
              {!draft ? (
                <EmptyState title={UI.editorEmptyTitle} description={UI.editorEmptyDescription} />
              ) : (
                <div style={{ display: 'grid', gap: spacing['20'] }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: spacing['12'],
                      flexWrap: 'wrap',
                      borderBottom: `1px solid ${colors.border}`,
                      paddingBottom: spacing['16'],
                    }}
                  >
                    <div style={{ display: 'grid', gap: spacing['4'] }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], flexWrap: 'wrap' }}>
                        <span style={{ color: colors.textPrimary, fontSize: typography.xl, fontWeight: Number(fontWeights.semibold) }}>
                          {isCreating ? UI.newQuery : draft.titleEn || draft.slug || UI.title}
                        </span>
                        {isDirty ? (
                          <span style={{ fontSize: typography.xs, color: colors.brandPrimary }}>{UI.dirtyIndicator}</span>
                        ) : null}
                        <StatusPill tone={draft.active ? 'success' : 'neutral'}>
                          {draft.active ? UI.activeLabel : UI.inactiveLabel}
                        </StatusPill>
                      </div>
                      <span style={{ color: colors.textSecondary, fontSize: typography.sm }}>
                        {isCreating ? UI.createHint : draft.slug}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: spacing['8'], flexWrap: 'wrap' }}>
                      <Button tone='secondary' onClick={handleDuplicate}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
                          <Copy size={14} color={colors.textSecondary} />
                          {UI.duplicate}
                        </span>
                      </Button>
                      {!isCreating && selectedSlug ? (
                        <Button tone='danger' onClick={() => void handleDelete(selectedSlug)} disabled={busySlug === selectedSlug}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
                            <Trash2 size={14} color={colors.white} />
                            {UI.deleteQuery}
                          </span>
                        </Button>
                      ) : null}
                      <Button tone='primary' onClick={() => void handleSave()} disabled={Boolean(busySlug)}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
                          <Save size={14} color={colors.white} />
                          {UI.saveQuery}
                        </span>
                      </Button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: spacing['16'] }}>
                    <div style={{ color: colors.textPrimary, fontWeight: Number(fontWeights.semibold) }}>{UI.queryIdentity}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: spacing['16'] }}>
                      <Field label={UI.titleEnLabel}>
                        <TextInput
                          value={draft.titleEn}
                          onChange={(e) => setDraft({ ...draft, titleEn: e.target.value })}
                        />
                      </Field>
                      <Field label={UI.titleArLabel}>
                        <TextInput
                          value={draft.titleAr}
                          onChange={(e) => setDraft({ ...draft, titleAr: e.target.value })}
                          dir='rtl'
                          lang='ar'
                        />
                      </Field>
                      <Field label={UI.slugLabel}>
                        <TextInput
                          value={draft.slug}
                          onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                          disabled={!isCreating}
                        />
                      </Field>
                      <Field label={UI.statusLabel}>
                        <SelectInput
                          value={draft.active ? 'active' : 'inactive'}
                          onChange={(e) => setDraft({ ...draft, active: e.target.value === 'active' })}
                        >
                          <option value='active'>{UI.activeLabel}</option>
                          <option value='inactive'>{UI.inactiveLabel}</option>
                        </SelectInput>
                      </Field>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: spacing['16'] }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing['12'], flexWrap: 'wrap' }}>
                      <div style={{ display: 'grid', gap: spacing['4'] }}>
                        <div style={{ color: colors.textPrimary, fontWeight: Number(fontWeights.semibold) }}>{UI.filterConfig}</div>
                        <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>
                          {isBuilderMode ? UI.builderHint : UI.jsonHint}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'inline-flex',
                          border: `1px solid ${colors.border}`,
                          borderRadius: radius.xl,
                          padding: spacing['4'],
                          backgroundColor: colors.surfaceMuted,
                        }}
                      >
                        <button
                          type='button'
                          onClick={() => handleToggleMode(true)}
                          style={{
                            border: 'none',
                            backgroundColor: isBuilderMode ? colors.brandPrimary : 'transparent',
                            color: isBuilderMode ? colors.white : colors.textSecondary,
                            borderRadius: radius.full,
                            padding: '6px 16px',
                            fontSize: typography.xs,
                            fontWeight: Number(fontWeights.semibold),
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: spacing['4'],
                            cursor: 'pointer',
                          }}
                        >
                          <Sliders size={14} />
                          {UI.modeBuilder}
                        </button>
                        <button
                          type='button'
                          onClick={() => handleToggleMode(false)}
                          style={{
                            border: 'none',
                            backgroundColor: !isBuilderMode ? colors.brandPrimary : 'transparent',
                            color: !isBuilderMode ? colors.white : colors.textSecondary,
                            borderRadius: radius.full,
                            padding: '6px 16px',
                            fontSize: typography.xs,
                            fontWeight: Number(fontWeights.semibold),
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: spacing['4'],
                            cursor: 'pointer',
                          }}
                        >
                          <Code size={14} />
                          {UI.modeJson}
                        </button>
                      </div>
                    </div>

                    {isBuilderMode ? (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                          gap: spacing['16'],
                          border: `1px solid ${colors.border}`,
                          borderRadius: radius.xl + 2,
                          backgroundColor: colors.surfaceMuted,
                          padding: spacing['16'],
                        }}
                      >
                        <Field label={UI.sortLabel}>
                          <SelectInput value={sort} onChange={(e) => setSort(e.target.value as ProductFilter['sort'])}>
                            {SORT_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </SelectInput>
                        </Field>
                        <Field label={UI.limitLabel}>
                          <TextInput
                            type='number'
                            min={1}
                            max={50}
                            value={String(limit)}
                            onChange={(e) => setLimit(Number(e.target.value))}
                          />
                        </Field>
                        <Field label={UI.categoryLabel}>
                          <SelectInput value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                            <option value=''>{UI.allCategories}</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.slug}>
                                {category.name.en}
                              </option>
                            ))}
                          </SelectInput>
                        </Field>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: spacing['8'],
                            marginTop: spacing['32'],
                            color: colors.textPrimary,
                            fontSize: typography.sm,
                            alignSelf: 'end',
                          }}
                        >
                          <input
                            checked={onSale}
                            onChange={(e) => setOnSale(e.target.checked)}
                            type='checkbox'
                          />
                          {UI.onSaleLabel}
                        </label>
                        <div
                          style={{
                            gridColumn: '1 / -1',
                            display: 'grid',
                            gridTemplateColumns: 'minmax(220px, 260px) minmax(0, 1fr)',
                            gap: spacing['16'],
                            alignItems: 'start',
                          }}
                        >
                          <Field label={UI.brandLabel}>
                            <SelectInput value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
                              <option value=''>{UI.allBrands}</option>
                              {brands
                                .filter((brand) => brand.isActive)
                                .map((brand) => (
                                  <option key={brand.id} value={brand.slug}>
                                    {brand.name.en}
                                  </option>
                                ))}
                            </SelectInput>
                          </Field>
                          <Field label={UI.productSearchLabel} hint={UI.productSearchHint}>
                            <div style={{ display: 'grid', gap: spacing['12'] }}>
                              <TextInput
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                placeholder={UI.productSearchPlaceholder}
                              />
                              {productSearchLoading ? (
                                <InlineLoading label={UI.previewLoading} />
                              ) : null}
                              {productSearchError ? (
                                <div style={{ fontSize: typography.xs, color: colors.danger }}>{productSearchError}</div>
                              ) : null}
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                                  gap: spacing['12'],
                                  alignItems: 'start',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'grid',
                                    gap: spacing['8'],
                                    minHeight: 180,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: radius.xl,
                                    backgroundColor: colors.surface,
                                    padding: spacing['12'],
                                  }}
                                >
                                  <span style={{ fontSize: typography.xs, color: colors.textSecondary, fontWeight: Number(fontWeights.semibold) }}>
                                    {UI.searchResultsLabel}
                                  </span>
                                  {!productSearchLoading && !productSearchError && productSearch.trim().length >= 2 ? (
                                    <div
                                      style={{
                                        display: 'grid',
                                        gap: spacing['8'],
                                        maxHeight: 280,
                                        overflowY: 'auto',
                                        paddingRight: spacing['4'],
                                      }}
                                    >
                                      {productSearchResults.length > 0 ? (
                                        productSearchResults.map((product) => {
                                          const alreadySelected = selectedProducts.some((item) => item.id === product.id)
                                          return (
                                            <div
                                              key={product.id}
                                              style={{
                                                display: 'grid',
                                                gridTemplateColumns: '48px minmax(0, 1fr) auto',
                                                gap: spacing['8'],
                                                alignItems: 'center',
                                                border: `1px solid ${colors.border}`,
                                                borderRadius: radius.lg,
                                                padding: spacing['8'],
                                                backgroundColor: colors.surfaceMuted,
                                              }}
                                            >
                                              <div
                                                style={{
                                                  width: 48,
                                                  height: 48,
                                                  borderRadius: radius.md,
                                                  overflow: 'hidden',
                                                  backgroundColor: colors.surface,
                                                  border: `1px solid ${colors.border}`,
                                                }}
                                              >
                                                {product.image ? (
                                                  <img
                                                    src={product.image}
                                                    alt={product.title}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                                                  />
                                                ) : null}
                                              </div>
                                              <div style={{ minWidth: 0, display: 'grid', gap: 2 }}>
                                                <div style={{ fontSize: typography.xs, color: colors.textSecondary }}>
                                                  {formatAdminBrandName(product.brand)}
                                                </div>
                                                <div style={{ fontSize: typography.sm, color: colors.textPrimary, fontWeight: Number(fontWeights.medium) }}>
                                                  {product.title}
                                                </div>
                                                <div style={{ fontSize: typography.xs, color: colors.textSecondary }}>
                                                  {[product.sku, product.id].filter(Boolean).join(' · ')}
                                                </div>
                                              </div>
                                              <Button
                                                tone='secondary'
                                                disabled={alreadySelected}
                                                onClick={() =>
                                                  setSelectedProducts((current) =>
                                                    alreadySelected ? current : [...current, product]
                                                  )
                                                }
                                              >
                                                {alreadySelected ? UI.addedProduct : UI.addProduct}
                                              </Button>
                                            </div>
                                          )
                                        })
                                      ) : (
                                        <div style={{ fontSize: typography.xs, color: colors.textSecondary }}>
                                          {UI.searchResultsEmpty}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div style={{ fontSize: typography.xs, color: colors.textSecondary }}>
                                      {UI.productSearchHint}
                                    </div>
                                  )}
                                </div>
                                <div
                                  style={{
                                    display: 'grid',
                                    gap: spacing['8'],
                                    minHeight: 180,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: radius.xl,
                                    backgroundColor: colors.surface,
                                    padding: spacing['12'],
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing['8'] }}>
                                    <span style={{ fontSize: typography.xs, color: colors.textSecondary, fontWeight: Number(fontWeights.semibold) }}>
                                      {UI.selectedProductsLabel}
                                    </span>
                                    {selectedProducts.length > 0 ? (
                                      <button
                                        type='button'
                                        onClick={() => setSelectedProducts([])}
                                        style={{
                                          border: 'none',
                                          background: 'none',
                                          color: colors.textSecondary,
                                          fontSize: typography.xs,
                                          cursor: 'pointer',
                                          padding: 0,
                                        }}
                                      >
                                        {UI.clearProducts}
                                      </button>
                                    ) : null}
                                  </div>
                                  {selectedProducts.length > 0 ? (
                                    <div
                                      style={{
                                        display: 'grid',
                                        gap: spacing['8'],
                                        maxHeight: 280,
                                        overflowY: 'auto',
                                        paddingRight: spacing['4'],
                                      }}
                                    >
                                      {selectedProducts.map((product) => (
                                        <div
                                          key={product.id}
                                          style={{
                                            display: 'grid',
                                            gridTemplateColumns: '48px minmax(0, 1fr) auto',
                                            gap: spacing['8'],
                                            alignItems: 'center',
                                            border: `1px solid ${colors.border}`,
                                            borderRadius: radius.lg,
                                            padding: spacing['8'],
                                            backgroundColor: colors.surfaceMuted,
                                          }}
                                        >
                                          <div
                                            style={{
                                              width: 48,
                                              height: 48,
                                              borderRadius: radius.md,
                                              overflow: 'hidden',
                                              backgroundColor: colors.surface,
                                              border: `1px solid ${colors.border}`,
                                            }}
                                          >
                                            {product.image ? (
                                              <img
                                                src={product.image}
                                                alt={product.title}
                                                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                                              />
                                            ) : null}
                                          </div>
                                          <div style={{ minWidth: 0, display: 'grid', gap: 2 }}>
                                            <div style={{ fontSize: typography.xs, color: colors.textSecondary }}>
                                              {formatAdminBrandName(product.brand)}
                                            </div>
                                            <div style={{ fontSize: typography.sm, color: colors.textPrimary, fontWeight: Number(fontWeights.medium) }}>
                                              {product.title}
                                            </div>
                                            <div style={{ fontSize: typography.xs, color: colors.textSecondary }}>
                                              {[product.sku, product.id].filter(Boolean).join(' · ')}
                                            </div>
                                          </div>
                                          <button
                                            type='button'
                                            onClick={() =>
                                              setSelectedProducts((current) =>
                                                current.filter((item) => item.id !== product.id)
                                              )
                                            }
                                            style={{
                                              border: 'none',
                                              background: 'none',
                                              color: colors.danger,
                                              fontSize: typography.xs,
                                              cursor: 'pointer',
                                            }}
                                          >
                                            {UI.removeProduct}
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div style={{ fontSize: typography.xs, color: colors.textSecondary }}>
                                      {UI.selectedProductsEmpty}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Field>
                        </div>
                      </div>
                    ) : (
                      <Field label={UI.modeJson} hint={UI.jsonHint}>
                        <textarea
                          value={jsonText}
                          onChange={(e) => handleJsonTextChange(e.target.value)}
                          className='admin-focus-ring'
                          style={{
                            width: '100%',
                            minHeight: 220,
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.xl,
                            backgroundColor: colors.surface,
                            color: colors.textPrimary,
                            fontSize: typography.xs,
                            fontFamily: 'monospace',
                            padding: spacing['12'],
                            outline: 'none',
                            resize: 'vertical',
                          }}
                        />
                      </Field>
                    )}
                  </div>

                  <div style={{ display: 'grid', gap: spacing['16'] }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing['12'], flexWrap: 'wrap' }}>
                      <div style={{ color: colors.textPrimary, fontWeight: Number(fontWeights.semibold) }}>{UI.previewTitle}</div>
                      <div style={{ color: colors.textSecondary, fontSize: typography.xs }}>
                        {UI.previewFiltersSummary}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: spacing['8'] }}>
                      {preview.loading ? (
                        <div
                          style={{
                            padding: spacing['24'],
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.xl + 4,
                            backgroundColor: colors.surface,
                            display: 'grid',
                            gap: spacing['8'],
                          }}
                        >
                          <InlineLoading label={UI.previewLoading} />
                          <div style={{ color: colors.textSecondary, fontSize: typography.body2 }}>
                            {UI.previewFiltersSummary}
                          </div>
                        </div>
                      ) : preview.error ? (
                        <EmptyState title={UI.previewTitle} description={preview.error} />
                      ) : preview.items.length === 0 ? (
                        <EmptyState title={UI.previewTitle} description={UI.previewEmpty} />
                      ) : (
                        <>
                          <div style={{ color: colors.textSecondary, fontSize: typography.sm }}>
                            {preview.total} matching product{preview.total === 1 ? '' : 's'}
                          </div>
                          <div style={{ display: 'grid', gap: spacing['8'] }}>
                            {preview.items.map((item) => (
                              <div
                                key={item.id}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '56px minmax(0, 1fr)',
                                  gap: spacing['12'],
                                  alignItems: 'center',
                                  border: `1px solid ${colors.border}`,
                                  borderRadius: radius.xl,
                                  padding: spacing['12'],
                                  backgroundColor: colors.surface,
                                }}
                              >
                                <div
                                  style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: radius.lg,
                                    overflow: 'hidden',
                                    backgroundColor: colors.surfaceMuted,
                                    display: 'grid',
                                    placeItems: 'center',
                                  }}
                                >
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                                    />
                                  ) : (
                                    <Eye size={16} color={colors.textSecondary} />
                                  )}
                                </div>
                                <div style={{ minWidth: 0, display: 'grid', gap: spacing['4'] }}>
                                  <div style={{ color: colors.textSecondary, fontSize: typography.xs }}>
                                    {item.brand ?? 'Unknown brand'}
                                  </div>
                                  <div style={{ color: colors.textPrimary, fontWeight: Number(fontWeights.semibold) }}>
                                    {item.name}
                                  </div>
                                  <div style={{ color: colors.textSecondary, fontSize: typography.xs }}>
                                    {item.currency} {item.price.toFixed(2)} · {item.id}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: spacing['12'] }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing['12'] }}>
                      <div style={{ color: colors.textPrimary, fontWeight: Number(fontWeights.semibold) }}>{UI.usageTitle}</div>
                      {selectedUsageLabel ? (
                        <StatusPill tone='neutral'>{selectedUsageLabel}</StatusPill>
                      ) : null}
                    </div>
                    {selectedRow?.usedBy && selectedRow.usedBy.length > 0 ? (
                      <div style={{ display: 'grid', gap: spacing['8'] }}>
                        {selectedRow.usedBy.map((usage) => (
                          <div
                            key={`${usage.releaseId}-${usage.blockId}`}
                            style={{
                              border: `1px solid ${colors.border}`,
                              borderRadius: radius.xl,
                              padding: spacing['12'],
                              display: 'grid',
                              gap: spacing['4'],
                            }}
                          >
                            <div style={{ color: colors.textPrimary, fontWeight: Number(fontWeights.medium) }}>
                              {usage.blockType}
                            </div>
                            <div style={{ color: colors.textSecondary, fontSize: typography.xs }}>
                              {usage.releaseId}
                              {usage.environment ? ` · ${usage.environment}` : ''}
                              {usage.status ? ` · ${usage.status}` : ''}
                              {typeof usage.position === 'number' ? ` · position ${usage.position}` : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : selectedUsageLabel ? (
                      <EmptyState title={UI.usageTitle} description={UI.usageEmpty} />
                    ) : (
                      <EmptyState title={UI.usageTitle} description={UI.usageUnknown} />
                    )}
                  </div>
                </div>
              )}
            </Panel>
          </div>
        </div>
      </Section>
    </PageContainer>
  )
}
