'use client'

import { useEffect, useMemo, useState } from 'react'

export type DynamicColumnMode = 'custom' | 'source'

export type DynamicColumn = {
  id: string
  label: string
  path: string
  mode: DynamicColumnMode
}

export type DynamicColumnCandidate = {
  label: string
  path: string
}

export type DynamicColumnRow = {
  attributes?: Record<string, unknown>
  sourceMeta?: Record<string, unknown>
} & Record<string, unknown>

type UseDynamicColumnsOptions = {
  persistToLocalStorage?: boolean
  excludeCandidatePaths?: string[]
}

type PersistedColumns = {
  v: 1
  columns: DynamicColumn[]
}

function createColumnId() {
  return `col_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function humanizeKey(value: string) {
  const normalized = value.replace(/[_\-.]+/g, ' ').trim()
  if (!normalized) return 'Column'
  return normalized
    .split(' ')
    .map((word) => (word ? `${word[0].toUpperCase()}${word.slice(1)}` : ''))
    .join(' ')
}

function parsePersistedColumns(raw: string | null): DynamicColumn[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as PersistedColumns
    if (!parsed || parsed.v !== 1 || !Array.isArray(parsed.columns)) return []
    return parsed.columns.filter(
      (column): column is DynamicColumn =>
        typeof column.id === 'string' &&
        typeof column.label === 'string' &&
        typeof column.path === 'string' &&
        (column.mode === 'custom' || column.mode === 'source')
    )
  } catch {
    return []
  }
}

export function getPathValue(row: Record<string, unknown>, path: string): unknown {
  const parts = path
    .split('.')
    .map((part) => part.trim())
    .filter(Boolean)

  let current: unknown = row
  for (const part of parts) {
    if (!current || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }

  return current
}

export function formatDynamicCellValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return '-'
  if (Array.isArray(value)) return value.map((entry) => String(entry)).join(', ')
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function buildSourceCandidates(
  rows: DynamicColumnRow[],
  excludeCandidatePaths: Set<string>
): DynamicColumnCandidate[] {
  const attributeKeys = new Set<string>()
  const sourceMetaKeys = new Set<string>()
  const topLevelKeys = new Set<string>()

  for (const row of rows) {
    for (const key of Object.keys(row.attributes ?? {})) {
      attributeKeys.add(key)
    }

    for (const key of Object.keys(row.sourceMeta ?? {})) {
      sourceMetaKeys.add(key)
    }

    for (const key of Object.keys(row)) {
      if (key === 'attributes' || key === 'sourceMeta') continue
      if (excludeCandidatePaths.has(key.toLowerCase())) continue
      topLevelKeys.add(key)
    }
  }

  const attributeCandidates = Array.from(attributeKeys)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => ({
      label: `Source · ${humanizeKey(key)}`,
      path: `attributes.${key}`,
    }))

  const metaCandidates = Array.from(sourceMetaKeys)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => ({
      label: `Source Meta · ${humanizeKey(key)}`,
      path: `sourceMeta.${key}`,
    }))

  const topLevelCandidates = Array.from(topLevelKeys)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => ({
      label: `Source Field · ${humanizeKey(key)}`,
      path: key,
    }))

  const deduped = new Map<string, DynamicColumnCandidate>()
  for (const candidate of [...topLevelCandidates, ...attributeCandidates, ...metaCandidates]) {
    deduped.set(candidate.path.toLowerCase(), candidate)
  }

  return Array.from(deduped.values())
}

export function useDynamicColumns<T extends DynamicColumnRow>(
  storageKey: string,
  rows: T[],
  options?: UseDynamicColumnsOptions
) {
  const persistToLocalStorage = options?.persistToLocalStorage !== false
  const excludeCandidatePaths = useMemo(
    () => new Set((options?.excludeCandidatePaths ?? []).map((entry) => entry.toLowerCase())),
    [options?.excludeCandidatePaths]
  )
  const [columns, setColumns] = useState<DynamicColumn[]>([])
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [mode, setMode] = useState<DynamicColumnMode>('custom')
  const [selectedSourcePath, setSelectedSourcePath] = useState('')
  const [customLabel, setCustomLabel] = useState('')
  const [customPath, setCustomPath] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const sourceCandidates = useMemo(
    () => buildSourceCandidates(rows as DynamicColumnRow[], excludeCandidatePaths),
    [rows, excludeCandidatePaths]
  )
  const sourcePathSet = useMemo(
    () => new Set(sourceCandidates.map((candidate) => candidate.path.toLowerCase())),
    [sourceCandidates]
  )

  useEffect(() => {
    if (!persistToLocalStorage) return
    if (typeof window === 'undefined') return
    const persisted = parsePersistedColumns(window.localStorage.getItem(storageKey))
    setColumns(persisted)
  }, [persistToLocalStorage, storageKey])

  useEffect(() => {
    if (!persistToLocalStorage) return
    if (typeof window === 'undefined') return
    const payload: PersistedColumns = { v: 1, columns }
    window.localStorage.setItem(storageKey, JSON.stringify(payload))
  }, [columns, persistToLocalStorage, storageKey])

  useEffect(() => {
    if (mode !== 'source') return
    const stillValid = sourceCandidates.some((candidate) => candidate.path === selectedSourcePath)
    if (stillValid) return
    setSelectedSourcePath(sourceCandidates[0]?.path ?? '')
  }, [mode, selectedSourcePath, sourceCandidates])

  // Keep source-backed dynamic columns in sync with current source keys.
  // If an upstream source column disappears, remove its rendered column.
  useEffect(() => {
    setColumns((prev) => {
      const next = prev.filter(
        (column) => column.mode !== 'source' || sourcePathSet.has(column.path.toLowerCase())
      )
      return next.length === prev.length ? prev : next
    })
  }, [sourcePathSet])

  const hasPath = (path: string) =>
    columns.some((column) => column.path.toLowerCase() === path.toLowerCase())

  const addSourceColumn = () => {
    setFormError(null)
    if (!selectedSourcePath) {
      setFormError('Choose a source column before adding.')
      return
    }
    if (hasPath(selectedSourcePath)) {
      setFormError('This column is already added.')
      return
    }
    const candidate = sourceCandidates.find((entry) => entry.path === selectedSourcePath)
    if (!candidate) {
      setFormError('Selected source column is no longer available.')
      return
    }
    setColumns((prev) => [
      ...prev,
      {
        id: createColumnId(),
        label: candidate.label,
        path: candidate.path,
        mode: 'source',
      },
    ])
    setIsBuilderOpen(false)
    setSelectedSourcePath('')
  }

  const addCustomColumn = () => {
    setFormError(null)
    const nextLabel = customLabel.trim()
    const nextPath = customPath.trim()
    if (!nextLabel || !nextPath) {
      setFormError('Custom column needs both a label and a path.')
      return
    }
    if (hasPath(nextPath)) {
      setFormError('This path is already added as a column.')
      return
    }
    setColumns((prev) => [
      ...prev,
      { id: createColumnId(), label: nextLabel, path: nextPath, mode: 'custom' },
    ])
    setCustomLabel('')
    setCustomPath('')
    setIsBuilderOpen(false)
  }

  const removeColumn = (id: string) => {
    setColumns((prev) => prev.filter((column) => column.id !== id))
  }

  const openBuilder = () => {
    setFormError(null)
    setIsBuilderOpen(true)
  }

  const closeBuilder = () => {
    setFormError(null)
    setIsBuilderOpen(false)
  }

  return {
    columns,
    setColumns,
    sourceCandidates,
    isBuilderOpen,
    mode,
    selectedSourcePath,
    customLabel,
    customPath,
    formError,
    setMode,
    setSelectedSourcePath,
    setCustomLabel,
    setCustomPath,
    openBuilder,
    closeBuilder,
    addSourceColumn,
    addCustomColumn,
    removeColumn,
  }
}
