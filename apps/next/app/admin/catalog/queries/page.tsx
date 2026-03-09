'use client'

import { useEffect, useMemo, useState } from 'react'
import { Code, Sliders, Trash2 } from 'lucide-react'
import { ProductFilter, ProductQuery } from '@real/app/lib/types'
import { apiClient } from '../../../apiClient'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import { Button, EmptyState, PageContainer, PageHeader, Panel, Section, StatusPill, TableShell } from '../../_components/AdminPagePrimitives'

type CategoryRow = {
  id: string
  slug: string
  name: { en: string; ar: string }
}

function normalizeFilterJson(value: string) {
  try {
    return JSON.parse(value) as ProductFilter
  } catch {
    return null
  }
}

export default function AdminCatalogQueriesPage() {
  const [rows, setRows] = useState<ProductQuery[]>([])
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [isBuilderMode, setIsBuilderMode] = useState(true)
  const [slug, setSlug] = useState('')
  const [jsonText, setJsonText] = useState('{\n  "sort": "bestseller",\n  "limit": 8\n}')
  const [sort, setSort] = useState<ProductFilter['sort']>('bestseller')
  const [limit, setLimit] = useState(8)
  const [onSale, setOnSale] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busySlug, setBusySlug] = useState<string | null>(null)
  const [previewMessage, setPreviewMessage] = useState<string | null>(null)

  const load = async () => {
    try {
      const [queries, categoryRows] = await Promise.all([
        apiClient.admin.listProductQueries(),
        apiClient.catalog.categories(),
      ])
      setRows(queries)
      setCategories(categoryRows as CategoryRow[])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load catalog queries.')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    if (!isBuilderMode) return
    const filter: ProductFilter = {
      sort,
      limit: Number.isFinite(limit) ? limit : 8,
    }
    if (onSale) filter.onSale = true
    if (selectedCategory) filter.category = [selectedCategory]
    setJsonText(JSON.stringify(filter, null, 2))
  }, [isBuilderMode, limit, onSale, selectedCategory, sort])

  const canCreate = useMemo(() => {
    return slug.trim().length > 0 && normalizeFilterJson(jsonText) !== null
  }, [jsonText, slug])

  const removeQuery = async (querySlug: string) => {
    const confirmed = window.confirm(`Delete query "${querySlug}"?`)
    if (!confirmed) return
    setBusySlug(querySlug)
    setError(null)
    try {
      await apiClient.admin.deleteProductQuery(querySlug)
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to delete query.')
    } finally {
      setBusySlug(null)
    }
  }

  const previewQuery = async (item: ProductQuery) => {
    setBusySlug(item.slug)
    setError(null)
    setPreviewMessage(null)
    try {
      const products = await apiClient.products.list(item.filters)
      setPreviewMessage(`Preview ${item.slug}: ${products.length} matching product(s).`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to preview query results.')
    } finally {
      setBusySlug(null)
    }
  }

  return (
    <PageContainer>
      <PageHeader title='Catalog / Queries' subtitle='Reusable ProductFilter presets used by rails and CMS.' />
      {error ? <p style={{ marginTop: 0, color: colors.danger }}>{error}</p> : null}
      {previewMessage ? <p style={{ marginTop: 0, color: colors.textSecondary }}>{previewMessage}</p> : null}

      <Section>
        <Panel>
          <div style={{ display: 'grid', gap: spacing['24'] }}>
            <div style={{ display: 'grid', gap: spacing['16'] }}>
              <div style={{ display: 'grid', gap: spacing['4'] }}>
                <label
                  style={{
                    color: colors.textSecondary,
                    fontSize: typography.xs,
                    fontWeight: Number(fontWeights.semibold),
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Query Slug
                </label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder='e.g. home-best-items'
                  style={{
                    minHeight: spacing['40'],
                    borderRadius: radius.xl,
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surface,
                    color: colors.textPrimary,
                    fontSize: typography.sm,
                    paddingInline: spacing['12'],
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing['12'], flexWrap: 'wrap' }}>
                <label
                  style={{
                    color: colors.textSecondary,
                    fontSize: typography.xs,
                    fontWeight: Number(fontWeights.semibold),
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Product Filter Configuration
                </label>
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
                    onClick={() => setIsBuilderMode(true)}
                    style={{
                      border: 0,
                      backgroundColor: isBuilderMode ? colors.surface : 'transparent',
                      color: isBuilderMode ? colors.textPrimary : colors.textSecondary,
                      borderRadius: radius.md,
                      padding: `${spacing['8']}px ${spacing['12']}px`,
                      fontSize: typography.xs,
                      fontWeight: Number(fontWeights.semibold),
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: spacing['4'],
                      cursor: 'pointer',
                    }}
                  >
                    <Sliders size={14} />
                    Builder
                  </button>
                  <button
                    type='button'
                    onClick={() => setIsBuilderMode(false)}
                    style={{
                      border: 0,
                      backgroundColor: !isBuilderMode ? colors.surface : 'transparent',
                      color: !isBuilderMode ? colors.textPrimary : colors.textSecondary,
                      borderRadius: radius.md,
                      padding: `${spacing['8']}px ${spacing['12']}px`,
                      fontSize: typography.xs,
                      fontWeight: Number(fontWeights.semibold),
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: spacing['4'],
                      cursor: 'pointer',
                    }}
                  >
                    <Code size={14} />
                    JSON
                  </button>
                </div>
              </div>

              {isBuilderMode ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: spacing['16'],
                    border: `1px solid ${colors.border}`,
                    borderRadius: radius.xl + 2,
                    backgroundColor: colors.surfaceMuted,
                    padding: spacing['16'],
                  }}
                >
                  <div style={{ display: 'grid', gap: spacing['4'] }}>
                    <label style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium) }}>
                      Sort Order
                    </label>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as ProductFilter['sort'])}
                      style={{
                        minHeight: spacing['40'],
                        borderRadius: radius.xl,
                        border: `1px solid ${colors.border}`,
                        backgroundColor: colors.surface,
                        color: colors.textPrimary,
                        fontSize: typography.sm,
                        paddingInline: spacing['12'],
                      }}
                    >
                      <option value='bestseller'>Bestsellers</option>
                      <option value='newest'>Newest Arrivals</option>
                      <option value='price_asc'>Price: Low to High</option>
                      <option value='price_desc'>Price: High to Low</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gap: spacing['4'] }}>
                    <label style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium) }}>
                      Limit Items
                    </label>
                    <input
                      type='number'
                      min={1}
                      max={50}
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      style={{
                        minHeight: spacing['40'],
                        borderRadius: radius.xl,
                        border: `1px solid ${colors.border}`,
                        backgroundColor: colors.surface,
                        color: colors.textPrimary,
                        fontSize: typography.sm,
                        paddingInline: spacing['12'],
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gap: spacing['4'] }}>
                    <label style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium) }}>
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      style={{
                        minHeight: spacing['40'],
                        borderRadius: radius.xl,
                        border: `1px solid ${colors.border}`,
                        backgroundColor: colors.surface,
                        color: colors.textPrimary,
                        fontSize: typography.sm,
                        paddingInline: spacing['12'],
                      }}
                    >
                      <option value=''>All categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.slug}>
                          {category.name.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing['8'],
                      marginTop: spacing['24'],
                      color: colors.textPrimary,
                      fontSize: typography.sm,
                    }}
                  >
                    <input
                      type='checkbox'
                      checked={onSale}
                      onChange={(e) => setOnSale(e.target.checked)}
                    />
                    Show on-sale items only
                  </label>
                </div>
              ) : (
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  style={{
                    minHeight: 200,
                    width: '100%',
                    borderRadius: radius.xl,
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surface,
                    color: colors.textPrimary,
                    fontSize: typography.xs,
                    fontFamily: 'monospace',
                    padding: spacing['12'],
                  }}
                />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: spacing['12'], flexWrap: 'wrap' }}>
                <code
                  style={{
                    color: colors.textSecondary,
                    fontSize: typography.xs,
                    padding: `${spacing['4']}px ${spacing['8']}px`,
                    borderRadius: radius.md,
                    backgroundColor: colors.surfaceMuted,
                    maxWidth: '70%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Preview: {jsonText.replace(/\s+/g, ' ').slice(0, 90)}
                </code>
                <Button
                  tone='primary'
                  disabled={!canCreate}
                  onClick={async () => {
                    const parsed = normalizeFilterJson(jsonText)
                    if (!parsed) {
                      setError('Invalid JSON format.')
                      return
                    }
                    try {
                      await apiClient.admin.createProductQuery({
                        slug: slug.trim().toLowerCase(),
                        active: true,
                        filters: parsed,
                        title: { en: slug.trim() || 'query', ar: slug.trim() || 'query' },
                      })
                      setSlug('')
                      await load()
                    } catch (cause) {
                      setError(cause instanceof Error ? cause.message : 'Unable to create query.')
                    }
                  }}
                >
                  Create query
                </Button>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: spacing['24'] }}>
              <p style={{ margin: `0 0 ${spacing['12']}px`, color: colors.textSecondary, fontSize: typography.sm }}>
                All filtering is centralized through ProductProvider.list(filters).
              </p>
              {rows.length === 0 ? (
                <EmptyState title='No query presets' description='Create your first query preset.' />
              ) : (
                <TableShell>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Slug', 'Active', 'Filters', ''].map((head) => (
                          <th
                            key={head}
                            scope='col'
                            style={{
                              height: spacing['48'],
                              paddingInline: spacing['12'],
                              textAlign: 'start',
                              verticalAlign: 'middle',
                              color: colors.textSecondary,
                              fontSize: typography.xs,
                              fontWeight: Number(fontWeights.medium),
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              borderBottom: `1px solid ${colors.border}`,
                              backgroundColor: colors.surfaceMuted,
                            }}
                          >
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((item) => (
                        <tr key={item.slug}>
                          <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textPrimary, fontWeight: Number(fontWeights.medium) }}>
                            {item.slug}
                          </td>
                          <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                            <StatusPill tone={item.active ? 'success' : 'warning'}>
                              {item.active ? 'Active' : 'Inactive'}
                            </StatusPill>
                          </td>
                          <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, color: colors.textSecondary, fontSize: typography.xs, fontFamily: 'monospace' }}>
                            {JSON.stringify(item.filters)}
                          </td>
                          <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}`, textAlign: 'end' }}>
                            <button
                              type='button'
                              aria-label={`Delete query ${item.slug}`}
                              disabled={busySlug === item.slug}
                              onClick={() => void removeQuery(item.slug)}
                              style={{
                                border: 0,
                                backgroundColor: 'transparent',
                                width: spacing['32'],
                                height: spacing['32'],
                                borderRadius: radius.md,
                                cursor: 'pointer',
                                color: colors.danger,
                                opacity: busySlug === item.slug ? 0.6 : 1,
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              type='button'
                              aria-label={`Preview query ${item.slug}`}
                              disabled={busySlug === item.slug}
                              onClick={() => void previewQuery(item)}
                              style={{
                                border: 0,
                                backgroundColor: 'transparent',
                                width: spacing['32'],
                                height: spacing['32'],
                                borderRadius: radius.md,
                                cursor: 'pointer',
                                color: colors.textSecondary,
                                opacity: busySlug === item.slug ? 0.6 : 1,
                              }}
                            >
                              <Code size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableShell>
              )}
            </div>
          </div>
        </Panel>
      </Section>
    </PageContainer>
  )
}
