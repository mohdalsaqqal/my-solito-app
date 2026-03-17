'use client'

import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Download, Filter, Search, Settings2 } from 'lucide-react'
import {
  AdminFieldRegistry,
  AdminListInput,
  AdminPagedResponse,
  AdminSavedView,
  CommerceCapabilities,
} from '@real/app/lib/types'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import { apiClient } from '../../apiClient'
import {
  Button,
  EmptyState,
  Field,
  PageContainer,
  PageHeader,
  Panel,
  Section,
  SelectInput,
  StatusPill,
  TableShell,
  TextInput,
} from './AdminPagePrimitives'

type EntityType = 'products' | 'orders' | 'inventory' | 'vendors'

type FilterConfig = {
  key: string
  label: string
  type: 'text' | 'select' | 'boolean'
  options?: Array<{ value: string; label: string }>
}

type BulkAction = {
  key: string
  label: string
  capabilityPath?: string
}

type AdminEntityListPageProps<T extends { id: string }> = {
  title: string
  entity: EntityType
  defaultColumns: string[]
  filters: FilterConfig[]
  bulkActions: BulkAction[]
  fetchRows: (input: AdminListInput) => Promise<AdminPagedResponse<T>>
  fetchFields: () => Promise<AdminFieldRegistry>
  renderCell: (row: T, key: string) => ReactNode
  rowActions?: (row: T) => ReactNode
  onBulkAction?: (actionKey: string, selectedIds: string[]) => Promise<void>
  onExportJob?: () => Promise<void>
  pageActions?: ReactNode
  detailPanel?: ReactNode
  refreshKey?: string | number
  rowStatus?: (row: T) => { tone: 'neutral' | 'success' | 'warning' | 'danger'; label: string } | null
  /** Slot rendered above the auto-generated filter row (e.g. pill tabs, collapse toggle) */
  filterHeaderSlot?: ReactNode
  /** When true, the auto-generated filter row is hidden until revealed by the consumer */
  hideAutoFilters?: boolean
}

function statusTone(value?: string) {
  if (!value) return 'neutral' as const
  const normalized = value.toLowerCase()
  if (normalized.includes('active') || normalized.includes('paid') || normalized.includes('fulfilled')) {
    return 'success' as const
  }
  if (normalized.includes('draft') || normalized.includes('pending') || normalized.includes('low')) {
    return 'warning' as const
  }
  if (normalized.includes('cancel') || normalized.includes('reject') || normalized.includes('fail')) {
    return 'danger' as const
  }
  return 'neutral' as const
}

function resolveCapability(capabilities: CommerceCapabilities | null, path?: string) {
  if (!path || !capabilities) return true
  const parts = path.split('.').filter(Boolean)
  let current: unknown = capabilities
  for (const part of parts) {
    if (!current || typeof current !== 'object') return false
    current = (current as Record<string, unknown>)[part]
  }
  return current === true
}

export function AdminEntityListPage<T extends { id: string }>(props: AdminEntityListPageProps<T>) {
  const {
    title,
    entity,
    defaultColumns,
    filters,
    bulkActions,
    fetchRows,
    fetchFields,
    renderCell,
    rowActions,
    onBulkAction,
    onExportJob,
    pageActions,
    detailPanel,
    refreshKey,
    rowStatus,
    filterHeaderSlot,
    hideAutoFilters,
  } = props
  const uiText = {
    columns: 'Columns',
    saveView: 'Save View',
    noSavedView: 'No saved view',
    exportJob: 'Export Job',
    sort: 'Sort',
    direction: 'Direction',
    descending: 'Descending',
    ascending: 'Ascending',
    all: 'All',
    loadingTitle: 'Loading...',
    loadingDescription: 'Fetching current page rows from server.',
    emptyTitle: 'No results',
    emptyDescription: 'Adjust filters or change search keywords.',
    state: 'State',
    actions: 'Actions',
    previous: 'Previous',
    next: 'Next',
    selected: 'selected',
    showingRecords: (count: number) => `Showing ${count} records`,
  }
  const [rows, setRows] = useState<T[]>([])
  const [pageInfo, setPageInfo] = useState<AdminPagedResponse<T>['pageInfo']>({
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>({})
  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultColumns)
  const [registry, setRegistry] = useState<AdminFieldRegistry | null>(null)
  const [sortKey, setSortKey] = useState(defaultColumns[0] ?? 'id')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [cursorHistory, setCursorHistory] = useState<string[]>([])
  const [savedViews, setSavedViews] = useState<AdminSavedView[]>([])
  const [selectedViewId, setSelectedViewId] = useState('')
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({})
  const [capabilities, setCapabilities] = useState<CommerceCapabilities | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [workingActionKey, setWorkingActionKey] = useState<string | null>(null)
  const [exportingJob, setExportingJob] = useState(false)

  const selectedCount = useMemo(
    () => Object.values(selectedIds).filter(Boolean).length,
    [selectedIds]
  )

  const allFields = useMemo(() => {
    if (!registry) return []
    return [...registry.coreFields, ...registry.computedFields, ...registry.customFields]
  }, [registry])

  useEffect(() => {
    let cancelled = false
    void Promise.all([
      fetchFields(),
      apiClient.admin.listSavedViews(entity),
      apiClient.admin.capabilities(),
    ])
      .then(([fields, views, caps]) => {
        if (cancelled) return
        setRegistry(fields)
        setSavedViews(views)
        setCapabilities(caps)
      })
      .catch((cause) => {
        if (cancelled) return
        setError(cause instanceof Error ? cause.message : 'Unable to load table configuration.')
      })
    return () => {
      cancelled = true
    }
  }, [entity, fetchFields])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    void fetchRows({
      limit: 25,
      cursor,
      search: search || undefined,
      filters: activeFilters,
      sort: { key: sortKey, direction: sortDirection },
      fields: visibleColumns,
      viewId: selectedViewId || undefined,
    })
      .then((result) => {
        if (cancelled) return
        setRows(result.nodes)
        setPageInfo(result.pageInfo)
      })
      .catch((cause) => {
        if (cancelled) return
        setError(cause instanceof Error ? cause.message : 'Unable to load rows.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeFilters, cursor, fetchRows, refreshKey, search, selectedViewId, sortDirection, sortKey, visibleColumns])

  const onNext = () => {
    if (!pageInfo.hasNextPage || !pageInfo.endCursor) return
    setCursorHistory((prev) => [...prev, cursor ?? ''])
    setCursor(pageInfo.endCursor)
  }

  const onPrevious = () => {
    setCursorHistory((prev) => {
      if (prev.length === 0) return prev
      const next = [...prev]
      const previousCursor = next.pop() ?? ''
      setCursor(previousCursor || undefined)
      return next
    })
  }

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => {
      if (prev.includes(key)) return prev.filter((entry) => entry !== key)
      return [...prev, key]
    })
    setCursor(undefined)
    setCursorHistory([])
  }

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleAllRows = () => {
    const allSelected = rows.every((row) => selectedIds[row.id])
    if (allSelected) {
      setSelectedIds({})
      return
    }
    const next: Record<string, boolean> = {}
    for (const row of rows) next[row.id] = true
    setSelectedIds(next)
  }

  const saveView = async () => {
    const name = window.prompt('Saved view name')
    if (!name) return
    const view: AdminSavedView = {
      id: `${entity}-${Date.now()}`,
      entity,
      name,
      filters: activeFilters,
      sort: { key: sortKey, direction: sortDirection },
      visibleColumns,
    }
    try {
      const created = await apiClient.admin.upsertSavedView(view)
      setSavedViews((prev) => [created, ...prev.filter((entry) => entry.id !== created.id)])
      setSelectedViewId(created.id)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save view.')
    }
  }

  const applyView = (viewId: string) => {
    setSelectedViewId(viewId)
    const view = savedViews.find((entry) => entry.id === viewId)
    if (!view) return
    setVisibleColumns(view.visibleColumns)
    setActiveFilters(view.filters ?? {})
    if (view.sort?.key) {
      setSortKey(view.sort.key)
      setSortDirection(view.sort.direction)
    }
    setCursor(undefined)
    setCursorHistory([])
  }

  const runBulkAction = async (actionKey: string) => {
    if (!onBulkAction) return
    const ids = Object.entries(selectedIds)
      .filter(([, selected]) => selected)
      .map(([id]) => id)
    if (ids.length === 0) return
    setWorkingActionKey(actionKey)
    try {
      await onBulkAction(actionKey, ids)
      setSelectedIds({})
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to run bulk action.')
    } finally {
      setWorkingActionKey(null)
    }
  }

  const runExportJob = async () => {
    if (!onExportJob) return
    setExportingJob(true)
    try {
      await onExportJob()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create export job.')
    } finally {
      setExportingJob(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title={title}
        actions={
          <>
            {pageActions}
            <Button tone='secondary' onClick={() => setPickerOpen((prev) => !prev)}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
                <Settings2 size={14} color={colors.textSecondary} />
                {uiText.columns}
              </span>
            </Button>
            <Button tone='secondary' onClick={saveView}>
              {uiText.saveView}
            </Button>
          </>
        }
      />
      {error ? <p style={{ marginTop: 0, color: colors.danger }}>{error}</p> : null}

      <Section>
        <Panel density='dense'>
          <div
            style={{
              borderBottom: `1px solid ${colors.border}`,
              paddingBottom: spacing['16'],
              marginBottom: spacing['16'],
              display: 'grid',
              gap: spacing['12'],
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: spacing['12'],
              }}
            >
              <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
                <Search
                  size={16}
                  color={colors.textSecondary}
                  style={{ position: 'absolute', insetInlineStart: 12, top: 12 }}
                />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setCursor(undefined)
                    setCursorHistory([])
                  }}
                  placeholder={`Search ${entity}...`}
                  style={{
                    width: '100%',
                    minHeight: spacing['40'],
                    borderRadius: radius.xl,
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.surface,
                    color: colors.textPrimary,
                    paddingInlineStart: spacing['32'] + spacing['8'],
                    paddingInlineEnd: spacing['12'],
                    fontSize: typography.sm,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], flexWrap: 'wrap' }}>
                <SelectInput
                  value={selectedViewId}
                  onChange={(event) => applyView(event.target.value)}
                  style={{ width: 220 }}
                >
                  <option value=''>{uiText.noSavedView}</option>
                  {savedViews.map((view) => (
                    <option key={view.id} value={view.id}>
                      {view.name}
                    </option>
                  ))}
                </SelectInput>
                <Button tone='secondary' onClick={() => void runExportJob()} disabled={exportingJob}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['8'] }}>
                    <Download size={14} color={colors.textSecondary} />
                    {exportingJob ? 'Creating Job...' : uiText.exportJob}
                  </span>
                </Button>
              </div>
            </div>

            {filterHeaderSlot ? filterHeaderSlot : null}

            {!hideAutoFilters ? (
            <div
              style={{
                display: 'grid',
                gap: spacing['8'],
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              }}
            >
              <Field label={uiText.sort}>
                <SelectInput
                  value={sortKey}
                  onChange={(event) => {
                    setSortKey(event.target.value)
                    setCursor(undefined)
                    setCursorHistory([])
                  }}
                >
                  {allFields.map((field) => (
                    <option key={field.key} value={field.key}>
                      {field.label}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field label={uiText.direction}>
                <SelectInput
                  value={sortDirection}
                  onChange={(event) => {
                    setSortDirection(event.target.value as 'asc' | 'desc')
                    setCursor(undefined)
                    setCursorHistory([])
                  }}
                >
                  <option value='desc'>{uiText.descending}</option>
                  <option value='asc'>{uiText.ascending}</option>
                </SelectInput>
              </Field>
              {filters.map((filter) => {
                if (filter.type === 'boolean') {
                  const checked = activeFilters[filter.key] === true
                  return (
                    <label
                      key={filter.key}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: spacing['8'],
                        minHeight: spacing['40'],
                        color: colors.textSecondary,
                        fontSize: typography.sm,
                        paddingTop: spacing['24'],
                      }}
                    >
                      <input
                        type='checkbox'
                        checked={checked}
                        onChange={(event) => {
                          setActiveFilters((prev) => ({
                            ...prev,
                            [filter.key]: event.target.checked || undefined,
                          }))
                          setCursor(undefined)
                          setCursorHistory([])
                        }}
                      />
                      <Filter size={14} />
                      {filter.label}
                    </label>
                  )
                }

                return (
                  <Field key={filter.key} label={filter.label}>
                    {filter.type === 'select' ? (
                      <SelectInput
                        value={String(activeFilters[filter.key] ?? '')}
                        onChange={(event) => {
                          const nextValue = event.target.value || undefined
                          setActiveFilters((prev) => ({ ...prev, [filter.key]: nextValue }))
                          setCursor(undefined)
                          setCursorHistory([])
                        }}
                      >
                        <option value=''>{uiText.all}</option>
                        {filter.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </SelectInput>
                    ) : (
                      <TextInput
                        value={String(activeFilters[filter.key] ?? '')}
                        onChange={(event) => {
                          const nextValue = event.target.value || undefined
                          setActiveFilters((prev) => ({ ...prev, [filter.key]: nextValue }))
                          setCursor(undefined)
                          setCursorHistory([])
                        }}
                      />
                    )}
                  </Field>
                )
              })}
            </div>
            ) : null}

            {pickerOpen ? (
              <div
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: radius.xl,
                  backgroundColor: colors.surface,
                  padding: spacing['12'],
                  display: 'grid',
                  gap: spacing['8'],
                  maxHeight: 220,
                  overflowY: 'auto',
                }}
              >
                {allFields.map((field) => (
                  <label
                    key={field.key}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: spacing['8'],
                      color: colors.textSecondary,
                      fontSize: typography.sm,
                    }}
                  >
                    <input
                      type='checkbox'
                      checked={visibleColumns.includes(field.key)}
                      onChange={() => toggleColumn(field.key)}
                    />
                    {field.label}
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], flexWrap: 'wrap', marginBottom: spacing['12'] }}>
            {bulkActions.map((action) => (
              <Button
                key={action.key}
                tone='secondary'
                disabled={
                  selectedCount === 0 ||
                  !resolveCapability(capabilities, action.capabilityPath) ||
                  Boolean(workingActionKey)
                }
                onClick={() => void runBulkAction(action.key)}
              >
                {action.label}
              </Button>
            ))}
            <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>
              {`${selectedCount} ${uiText.selected}`}
            </span>
          </div>

          {loading ? (
            <EmptyState title={uiText.loadingTitle} description={uiText.loadingDescription} />
          ) : rows.length === 0 ? (
            <EmptyState title={uiText.emptyTitle} description={uiText.emptyDescription} />
          ) : (
            <>
              <TableShell>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          width: 40,
                          height: spacing['48'],
                          borderBottom: `1px solid ${colors.border}`,
                          backgroundColor: colors.surfaceMuted,
                        }}
                      >
                        <input
                          type='checkbox'
                          checked={rows.length > 0 && rows.every((row) => selectedIds[row.id])}
                          onChange={toggleAllRows}
                        />
                      </th>
                      {visibleColumns.map((column) => (
                        <th
                          key={column}
                          style={{
                            height: spacing['48'],
                            paddingInline: spacing['12'],
                            textAlign: 'start',
                            color: colors.textSecondary,
                            fontSize: typography.xs,
                            fontWeight: Number(fontWeights.medium),
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            borderBottom: `1px solid ${colors.border}`,
                            backgroundColor: colors.surfaceMuted,
                          }}
                        >
                          {allFields.find((field) => field.key === column)?.label ?? column}
                        </th>
                      ))}
                      {rowStatus ? (
                        <th
                          style={{
                            height: spacing['48'],
                            paddingInline: spacing['12'],
                            textAlign: 'start',
                            color: colors.textSecondary,
                            fontSize: typography.xs,
                            fontWeight: Number(fontWeights.medium),
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            borderBottom: `1px solid ${colors.border}`,
                            backgroundColor: colors.surfaceMuted,
                          }}
                        >
                          {uiText.state}
                        </th>
                      ) : null}
                      {rowActions ? (
                        <th
                          style={{
                            height: spacing['48'],
                            paddingInline: spacing['12'],
                            textAlign: 'start',
                            color: colors.textSecondary,
                            fontSize: typography.xs,
                            fontWeight: Number(fontWeights.medium),
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            borderBottom: `1px solid ${colors.border}`,
                            backgroundColor: colors.surfaceMuted,
                          }}
                        >
                          {uiText.actions}
                        </th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td style={{ paddingInline: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                          <input
                            type='checkbox'
                            checked={Boolean(selectedIds[row.id])}
                            onChange={() => toggleRow(row.id)}
                          />
                        </td>
                        {visibleColumns.map((column) => (
                          <td
                            key={column}
                            style={{
                              padding: spacing['12'],
                              borderBottom: `1px solid ${colors.border}`,
                              color: colors.textPrimary,
                              fontSize: typography.sm,
                            }}
                          >
                            {renderCell(row, column)}
                          </td>
                        ))}
                        {rowStatus ? (
                          <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                            {(() => {
                              const status = rowStatus(row)
                              if (!status) return null
                              return (
                                <StatusPill tone={status.tone ?? statusTone(status.label)}>
                                  {status.label}
                                </StatusPill>
                              )
                            })()}
                          </td>
                        ) : null}
                        {rowActions ? (
                          <td style={{ padding: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
                            {rowActions(row)}
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableShell>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: spacing['12'],
                  marginTop: spacing['12'],
                }}
              >
                <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>
                  {uiText.showingRecords(rows.length)}
                </span>
                <div style={{ display: 'flex', gap: spacing['8'] }}>
                  <Button tone='secondary' disabled={cursorHistory.length === 0} onClick={onPrevious}>
                    {uiText.previous}
                  </Button>
                  <Button tone='secondary' disabled={!pageInfo.hasNextPage} onClick={onNext}>
                    {uiText.next}
                  </Button>
                </div>
              </div>
            </>
          )}
        </Panel>
      </Section>
      {detailPanel ? <Section>{detailPanel}</Section> : null}
    </PageContainer>
  )
}
