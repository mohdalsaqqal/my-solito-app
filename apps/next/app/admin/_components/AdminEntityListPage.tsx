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
  AdminCommandBar,
  AdminPanelHeader,
  Button,
  EmptyState,
  Field,
  InlineLoading,
  MetricList,
  PageContainer,
  Panel,
  SelectInput,
  StatusPill,
  TableShell,
  TextInput,
  WorkspaceLayout,
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
  eyebrow?: string
  title: string
  subtitle?: string
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
  detailPanelPlacement?: 'rail' | 'main'
  refreshKey?: string | number
  rowStatus?: (
    row: T,
  ) => {
    tone: 'neutral' | 'success' | 'warning' | 'danger'
    label: string
  } | null
  filterHeaderSlot?: ReactNode
  hideAutoFilters?: boolean
  summaryCards?: ReactNode
}

function statusTone(value?: string) {
  if (!value) return 'neutral' as const
  const normalized = value.toLowerCase()
  if (
    normalized.includes('active') ||
    normalized.includes('paid') ||
    normalized.includes('fulfilled') ||
    normalized.includes('approved')
  ) {
    return 'success' as const
  }
  if (
    normalized.includes('draft') ||
    normalized.includes('pending') ||
    normalized.includes('low') ||
    normalized.includes('hold')
  ) {
    return 'warning' as const
  }
  if (
    normalized.includes('cancel') ||
    normalized.includes('reject') ||
    normalized.includes('fail') ||
    normalized.includes('archive')
  ) {
    return 'danger' as const
  }
  return 'neutral' as const
}

function resolveCapability(
  capabilities: CommerceCapabilities | null,
  path?: string,
) {
  if (!path || !capabilities) return true
  const parts = path.split('.').filter(Boolean)
  let current: unknown = capabilities
  for (const part of parts) {
    if (!current || typeof current !== 'object') return false
    current = (current as Record<string, unknown>)[part]
  }
  return current === true
}

function entityLabel(input: string) {
  return input.charAt(0).toUpperCase() + input.slice(1)
}

export function AdminEntityListPage<T extends { id: string }>(
  props: AdminEntityListPageProps<T>,
) {
  const {
    eyebrow,
    title,
    subtitle,
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
    detailPanelPlacement = 'rail',
    refreshKey,
    rowStatus,
    filterHeaderSlot,
    hideAutoFilters,
    summaryCards,
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
    loadingTitle: 'Loading workspace',
    loadingDescription: 'Fetching the latest records from the admin layer.',
    emptyTitle: 'No results',
    emptyDescription: 'Adjust filters, search terms, or saved views to widen the result set.',
    state: 'State',
    actions: 'Actions',
    previous: 'Previous',
    next: 'Next',
    selected: 'selected',
    searchPlaceholder: `Search ${entity}...`,
    controlsTitle: 'List controls',
    controlsSubtitle:
      'Tune saved views, filters, sort order, and visible fields without leaving the operational lane.',
    tableTitle: `${entityLabel(entity)} queue`,
    tableSubtitle:
      'Use bulk actions for background work and open the right-side workspace for record-level intervention.',
    visibilityTitle: 'Visible columns',
    visibilitySubtitle:
      'Show only the fields operators need for the current task.',
    listStatus: (count: number) => `${count.toLocaleString()} records in the current page`,
    resultsMeta: (selectedCount: number, views: number) =>
      `${selectedCount.toLocaleString()} selected - ${views.toLocaleString()} saved views`,
    savedViewActive: 'Saved view active',
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
  const [capabilities, setCapabilities] = useState<CommerceCapabilities | null>(
    null,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [workingActionKey, setWorkingActionKey] = useState<string | null>(null)
  const [exportingJob, setExportingJob] = useState(false)

  const selectedCount = useMemo(
    () => Object.values(selectedIds).filter(Boolean).length,
    [selectedIds],
  )

  const allFields = useMemo(() => {
    if (!registry) return []
    return [
      ...registry.coreFields,
      ...registry.computedFields,
      ...registry.customFields,
    ]
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
        setError(
          cause instanceof Error
            ? cause.message
            : 'Unable to load table configuration.',
        )
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
        setError(
          cause instanceof Error ? cause.message : 'Unable to load rows.',
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [
    activeFilters,
    cursor,
    fetchRows,
    refreshKey,
    search,
    selectedViewId,
    sortDirection,
    sortKey,
    visibleColumns,
  ])

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

  const resetPagination = () => {
    setCursor(undefined)
    setCursorHistory([])
  }

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => {
      if (prev.includes(key)) return prev.filter((entry) => entry !== key)
      return [...prev, key]
    })
    resetPagination()
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
      setSavedViews((prev) => [
        created,
        ...prev.filter((entry) => entry.id !== created.id),
      ])
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
    resetPagination()
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
      setError(
        cause instanceof Error ? cause.message : 'Unable to run bulk action.',
      )
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
      setError(
        cause instanceof Error ? cause.message : 'Unable to create export job.',
      )
    } finally {
      setExportingJob(false)
    }
  }

  const commandActions = (
    <>
      {pageActions}
      <Button tone='secondary' onClick={() => setPickerOpen((prev) => !prev)}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: spacing['8'],
          }}
        >
          <Settings2 size={14} color={colors.textSecondary} />
          {uiText.columns}
        </span>
      </Button>
      <Button tone='secondary' onClick={saveView}>
        {uiText.saveView}
      </Button>
      {onExportJob ? (
        <Button tone='secondary' onClick={() => void runExportJob()} disabled={exportingJob}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: spacing['8'],
            }}
          >
            <Download size={14} color={colors.textSecondary} />
            {exportingJob ? 'Creating Job...' : uiText.exportJob}
          </span>
        </Button>
      ) : null}
    </>
  )

  const controlPanel = (
    <Panel tone='brand'>
      <AdminPanelHeader
        title={uiText.controlsTitle}
        subtitle={uiText.controlsSubtitle}
      />
      <div style={{ display: 'grid', gap: spacing['16'] }}>
        <div
          style={{
            display: 'grid',
            gap: spacing['12'],
            gridTemplateColumns: 'minmax(0, 1.4fr) repeat(3, minmax(160px, 0.7fr))',
          }}
        >
          <div style={{ position: 'relative', minWidth: 0 }}>
            <Search
              size={16}
              color={colors.textSecondary}
              style={{
                position: 'absolute',
                insetInlineStart: 12,
                top: 12,
              }}
            />
            <input
              className='admin-focus-ring'
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                resetPagination()
              }}
              placeholder={uiText.searchPlaceholder}
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

          <Field label='Saved view'>
            <SelectInput
              value={selectedViewId}
              onChange={(event) => applyView(event.target.value)}
            >
              <option value=''>{uiText.noSavedView}</option>
              {savedViews.map((view) => (
                <option key={view.id} value={view.id}>
                  {view.name}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field label={uiText.sort}>
            <SelectInput
              value={sortKey}
              onChange={(event) => {
                setSortKey(event.target.value)
                resetPagination()
              }}
            >
              {allFields
                .filter((field) => field.sortable)
                .map((field) => (
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
                resetPagination()
              }}
            >
              <option value='desc'>{uiText.descending}</option>
              <option value='asc'>{uiText.ascending}</option>
            </SelectInput>
          </Field>
        </div>

        {filterHeaderSlot ? filterHeaderSlot : null}

        {!hideAutoFilters ? (
          <div
            style={{
              display: 'grid',
              gap: spacing['10'],
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            }}
          >
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
                      border: `1px solid ${colors.border}`,
                      borderRadius: radius.xl,
                      backgroundColor: colors.surface,
                      padding: `${spacing['10']}px ${spacing['12']}px`,
                    }}
                  >
                    <input
                      type='checkbox'
                      className='admin-focus-ring'
                      checked={checked}
                      onChange={(event) => {
                        setActiveFilters((prev) => ({
                          ...prev,
                          [filter.key]: event.target.checked || undefined,
                        }))
                        resetPagination()
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
                        setActiveFilters((prev) => ({
                          ...prev,
                          [filter.key]: nextValue,
                        }))
                        resetPagination()
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
                        setActiveFilters((prev) => ({
                          ...prev,
                          [filter.key]: nextValue,
                        }))
                        resetPagination()
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
              gap: spacing['10'],
            }}
          >
            <div style={{ display: 'grid', gap: spacing['4'] }}>
              <span
                style={{
                  color: colors.textPrimary,
                  fontSize: typography.sm,
                  fontWeight: Number(fontWeights.semibold),
                }}
              >
                {uiText.visibilityTitle}
              </span>
              <span
                style={{
                  color: colors.textSecondary,
                  fontSize: typography.xs,
                }}
              >
                {uiText.visibilitySubtitle}
              </span>
            </div>
            <div
              style={{
                display: 'grid',
                gap: spacing['8'],
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                maxHeight: 240,
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
                    border: `1px solid ${colors.border}`,
                    borderRadius: radius.lg,
                    backgroundColor: colors.surfaceMuted,
                    padding: `${spacing['10']}px ${spacing['12']}px`,
                  }}
                >
                  <input
                    type='checkbox'
                    className='admin-focus-ring'
                    checked={visibleColumns.includes(field.key)}
                    onChange={() => toggleColumn(field.key)}
                  />
                  {field.label}
                </label>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Panel>
  )

  const tablePanel = (
    <Panel>
      <AdminPanelHeader
        title={uiText.tableTitle}
        subtitle={uiText.tableSubtitle}
        actions={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing['8'],
              flexWrap: 'wrap',
            }}
          >
            <StatusPill tone='neutral'>{uiText.listStatus(rows.length)}</StatusPill>
            <StatusPill tone={selectedCount > 0 ? 'warning' : 'neutral'}>
              {uiText.resultsMeta(selectedCount, savedViews.length)}
            </StatusPill>
          </div>
        }
      />

      <div style={{ display: 'grid', gap: spacing['16'] }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: spacing['12'],
            flexWrap: 'wrap',
            border: `1px solid ${colors.border}`,
            borderRadius: radius.xl,
            backgroundColor: colors.surfaceMuted,
            padding: `${spacing['10']}px ${spacing['12']}px`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing['8'],
              flexWrap: 'wrap',
            }}
          >
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
          </div>
          <span
            style={{
              color: colors.textSecondary,
              fontSize: typography.xs,
            }}
          >
            {selectedCount.toLocaleString()} {uiText.selected}
          </span>
        </div>

        {loading ? (
          <Panel density='dense'>
            <InlineLoading label={uiText.loadingDescription} />
          </Panel>
        ) : rows.length === 0 ? (
          <EmptyState
            title={uiText.emptyTitle}
            description={uiText.emptyDescription}
          />
        ) : (
          <>
            <TableShell
              minHeight={520}
              maxHeight='calc(100dvh - 300px)'
            >
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr>
                    <th style={checkboxHeadCellStyle}>
                      <input
                        type='checkbox'
                        className='admin-focus-ring'
                        checked={rows.length > 0 && rows.every((row) => selectedIds[row.id])}
                        onChange={toggleAllRows}
                      />
                    </th>
                    {visibleColumns.map((column) => (
                      <th key={column} style={headCellStyle}>
                        {allFields.find((field) => field.key === column)?.label ?? column}
                      </th>
                    ))}
                    {rowStatus ? <th style={headCellStyle}>{uiText.state}</th> : null}
                    {rowActions ? <th style={headCellStyle}>{uiText.actions}</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td style={checkboxCellStyle}>
                        <input
                          type='checkbox'
                          className='admin-focus-ring'
                          checked={Boolean(selectedIds[row.id])}
                          onChange={() => toggleRow(row.id)}
                        />
                      </td>
                      {visibleColumns.map((column) => (
                        <td key={column} style={bodyCellStyle}>
                          {renderCell(row, column)}
                        </td>
                      ))}
                      {rowStatus ? (
                        <td style={bodyCellStyle}>
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
                      {rowActions ? <td style={bodyCellStyle}>{rowActions(row)}</td> : null}
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
                flexWrap: 'wrap',
              }}
            >
              <MetricList
                rows={[
                  {
                    label: 'Visible fields',
                    value: visibleColumns.length.toLocaleString(),
                  },
                  {
                    label: 'Page records',
                    value: rows.length.toLocaleString(),
                  },
                ]}
              />
              <div style={{ display: 'flex', gap: spacing['8'] }}>
                <Button
                  tone='secondary'
                  disabled={cursorHistory.length === 0}
                  onClick={onPrevious}
                >
                  {uiText.previous}
                </Button>
                <Button
                  tone='secondary'
                  disabled={!pageInfo.hasNextPage}
                  onClick={onNext}
                >
                  {uiText.next}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Panel>
  )

  const mainContent = (
    <>
      {controlPanel}
      {tablePanel}
      {detailPanel && detailPanelPlacement === 'main' ? detailPanel : null}
    </>
  )

  return (
    <PageContainer>
      <AdminCommandBar
        eyebrow={eyebrow ?? 'Operations Workspace'}
        title={title}
        subtitle={
          subtitle ??
          `Operate the ${entity} lane with saved views, structured filters, and a persistent right-side workspace.`
        }
        status={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing['8'],
              flexWrap: 'wrap',
            }}
          >
            <StatusPill tone='neutral'>{entityLabel(entity)}</StatusPill>
            <StatusPill tone={selectedCount > 0 ? 'warning' : 'neutral'}>
              {selectedCount.toLocaleString()} selected
            </StatusPill>
            {selectedViewId ? (
              <StatusPill tone='success'>{uiText.savedViewActive}</StatusPill>
            ) : null}
          </div>
        }
        actions={commandActions}
      />

      {error ? (
        <Panel tone='danger'>
          <div style={{ color: colors.danger, fontSize: typography.sm }}>{error}</div>
        </Panel>
      ) : null}

      {summaryCards ? <div style={{ marginBottom: spacing['24'] }}>{summaryCards}</div> : null}

      <WorkspaceLayout
        main={mainContent}
        rail={
          detailPanelPlacement === 'main' ? null : detailPanel ? (
            <div style={{ display: 'grid', gap: spacing['20'] }}>{detailPanel}</div>
          ) : (
            <Panel>
              <AdminPanelHeader
                title='Workspace guidance'
                subtitle='This lane supports saved views, bulk actions, and a focused record workspace when one is available.'
              />
              <MetricList
                rows={[
                  {
                    label: 'Saved views',
                    value: savedViews.length.toLocaleString(),
                  },
                  {
                    label: 'Active filters',
                    value: Object.values(activeFilters).filter(Boolean).length.toLocaleString(),
                  },
                  {
                    label: 'Visible columns',
                    value: visibleColumns.length.toLocaleString(),
                  },
                ]}
              />
            </Panel>
          )
        }
      />
    </PageContainer>
  )
}

const headCellStyle = {
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
  position: 'sticky',
  top: 0,
  zIndex: 1,
} as const

const checkboxHeadCellStyle = {
  ...headCellStyle,
  width: 44,
} as const

const bodyCellStyle = {
  padding: spacing['12'],
  borderBottom: `1px solid ${colors.border}`,
  color: colors.textPrimary,
  fontSize: typography.sm,
  verticalAlign: 'top',
} as const

const checkboxCellStyle = {
  ...bodyCellStyle,
  width: 44,
  paddingInline: spacing['12'],
} as const
