'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, GripVertical, Plus, Trash2 } from 'lucide-react'
import { colors, radius, spacing, typography, fontWeights, status } from '@real/tokens'
import { FieldLabel, ErrorHint } from '../../blocks/_components/BlockEditorChrome'

type MenuItemReference =
  | { type: 'url'; href: string }
  | { type: 'category'; sourceId: string }
  | { type: 'brand'; sourceId: string }
  | { type: 'query'; sourceId: string }

type MenuItemDraft = {
  id: string
  labelEn: string
  labelAr: string
  descriptionEn: string
  descriptionAr: string
  refType: 'url' | 'category' | 'brand' | 'query'
  refSourceId: string
  href: string
  enabled: boolean
  children: MenuItemDraft[]
}

type MenuRecordItem = {
  id: string
  label: { en: string; ar: string }
  description?: { en: string; ar: string }
  ref: MenuItemReference
  order: number
  enabled: boolean
  children: MenuRecordItem[]
}

function createEmptyItem(parentId?: string): MenuItemDraft {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    labelEn: '',
    labelAr: '',
    descriptionEn: '',
    descriptionAr: '',
    refType: 'url',
    refSourceId: '',
    href: '',
    enabled: true,
    children: [],
  }
}

function itemToRecord(item: MenuItemDraft, order: number): MenuRecordItem {
  const ref: MenuItemReference =
    item.refType === 'url'
      ? { type: 'url', href: item.href }
      : { type: item.refType, sourceId: item.refSourceId }

  return {
    id: item.id,
    label: { en: item.labelEn || 'Untitled', ar: item.labelAr || 'غير معنون' },
    description: item.descriptionEn || item.descriptionAr
      ? { en: item.descriptionEn, ar: item.descriptionAr }
      : undefined,
    ref,
    order,
    enabled: item.enabled,
    children: item.children.map((child, i) => itemToRecord(child, i)),
  }
}

function recordToDraft(item: Record<string, unknown>): MenuItemDraft {
  const ref = item.ref as Record<string, unknown> | undefined
  return {
    id: (item.id as string) || `item-${Date.now()}`,
    labelEn: ((item.label as Record<string, unknown>)?.en as string) || '',
    labelAr: ((item.label as Record<string, unknown>)?.ar as string) || '',
    descriptionEn: ((item.description as Record<string, unknown>)?.en as string) || '',
    descriptionAr: ((item.description as Record<string, unknown>)?.ar as string) || '',
    refType: (ref?.type as 'url' | 'category' | 'brand' | 'query') || 'url',
    refSourceId: (ref?.sourceId as string) || '',
    href: (ref?.href as string) || '',
    enabled: item.enabled !== false,
    children: Array.isArray(item.children) ? item.children.map(recordToDraft) : [],
  }
}

function MenuItemEditor({
  item,
  index,
  onUpdate,
  onRemove,
  onAddChild,
  onRemoveChild,
  onUpdateChild,
  depth = 0,
}: {
  item: MenuItemDraft
  index: number
  onUpdate: (patch: Partial<MenuItemDraft>) => void
  onRemove: () => void
  onAddChild: () => void
  onRemoveChild: (childIndex: number) => void
  onUpdateChild: (childIndex: number, patch: Partial<MenuItemDraft>) => void
  depth?: number
}) {
  const [expanded, setExpanded] = useState(depth === 0)
  const indent = depth * 16

  const inputStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 32,
    borderRadius: radius.lg,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontSize: typography.sm,
    paddingInline: spacing['10'],
    paddingBlock: spacing['6'],
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ marginLeft: indent, border: `1px solid ${colors.border}`, borderRadius: radius.xl, marginBottom: spacing['8'], overflow: 'hidden', backgroundColor: colors.surface }}>
      <button
        type='button'
        onClick={() => setExpanded(!expanded)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: spacing['8'], padding: `${spacing['10']}px ${spacing['12']}px`, border: 0, backgroundColor: depth === 0 ? colors.surfaceMuted : 'transparent', cursor: 'pointer', textAlign: 'left' }}
      >
        {item.children.length > 0 ? (
          expanded ? <ChevronDown size={14} color={colors.textSecondary} /> : <ChevronRight size={14} color={colors.textSecondary} />
        ) : (
          <GripVertical size={14} color={colors.textSecondary} />
        )}
        <span style={{ fontSize: typography.sm, fontWeight: Number(fontWeights.medium), color: colors.textPrimary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.labelEn || item.labelAr || `Item ${index + 1}`}
        </span>
        <span style={{ fontSize: typography.xs, color: item.enabled ? status.success.base : colors.textSecondary, paddingInline: spacing['8'], borderRadius: radius.full, backgroundColor: item.enabled ? status.success.subtle : colors.surfaceMuted }}>
          {item.enabled ? 'Active' : 'Disabled'}
        </span>
        <button type='button' onClick={(e) => { e.stopPropagation(); onRemove() }} style={{ border: 0, backgroundColor: 'transparent', cursor: 'pointer', padding: spacing['4'], borderRadius: radius.md }} aria-label='Remove item'>
          <Trash2 size={14} color={colors.danger} />
        </button>
      </button>

      {expanded && (
        <div style={{ padding: spacing['12'], display: 'grid', gap: spacing['12'], borderTop: `1px solid ${colors.border}` }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing['12'] }}>
            <label>
              <FieldLabel required>Label (EN)</FieldLabel>
              <input className='admin-focus-ring' value={item.labelEn} onChange={(e) => onUpdate({ labelEn: e.target.value })} style={inputStyle} />
            </label>
            <label>
              <FieldLabel>Label (AR)</FieldLabel>
              <input className='admin-focus-ring' value={item.labelAr} onChange={(e) => onUpdate({ labelAr: e.target.value })} dir='rtl' lang='ar' style={inputStyle} />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: spacing['12'] }}>
            <label>
              <FieldLabel required>Reference Type</FieldLabel>
              <select className='admin-focus-ring' value={item.refType} onChange={(e) => onUpdate({ refType: e.target.value as MenuItemDraft['refType'] })} style={inputStyle}>
                <option value='url'>URL</option>
                <option value='category'>Category</option>
                <option value='brand'>Brand</option>
                <option value='query'>Query</option>
              </select>
            </label>
            {item.refType === 'url' ? (
              <label>
                <FieldLabel required>URL</FieldLabel>
                <input className='admin-focus-ring' value={item.href} onChange={(e) => onUpdate({ href: e.target.value })} placeholder='/shop' style={inputStyle} />
              </label>
            ) : (
              <label>
                <FieldLabel required>Source ID / Slug</FieldLabel>
                <input className='admin-focus-ring' value={item.refSourceId} onChange={(e) => onUpdate({ refSourceId: e.target.value })} placeholder='skincare' style={inputStyle} />
              </label>
            )}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: spacing['8'] }}>
            <input type='checkbox' checked={item.enabled} onChange={(e) => onUpdate({ enabled: e.target.checked })} />
            <span style={{ fontSize: typography.sm, color: colors.textPrimary }}>Enabled</span>
          </label>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: typography.xs, color: colors.textSecondary, fontWeight: Number(fontWeights.semibold) }}>
              {item.children.length} sub-item{item.children.length !== 1 ? 's' : ''}
            </span>
            <button type='button' onClick={onAddChild} style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'], border: `1px solid ${colors.border}`, borderRadius: radius.full, backgroundColor: colors.surface, color: colors.textSecondary, padding: `4px ${spacing['10']}px`, fontSize: typography.xs, cursor: 'pointer' }}>
              <Plus size={12} /> Add sub-item
            </button>
          </div>

          {item.children.map((child, childIndex) => (
            <MenuItemEditor
              key={child.id}
              item={child}
              index={childIndex}
              depth={depth + 1}
              onUpdate={(patch) => onUpdateChild(childIndex, patch)}
              onRemove={() => onRemoveChild(childIndex)}
              onAddChild={() => {
                const newChild = createEmptyItem(child.id)
                onUpdateChild(childIndex, { children: [...child.children, newChild] })
              }}
              onRemoveChild={(grandchildIndex) => {
                const newChildren = child.children.filter((_, i) => i !== grandchildIndex)
                onUpdateChild(childIndex, { children: newChildren })
              }}
              onUpdateChild={(grandchildIndex, patch) => {
                const newChildren = child.children.map((gc, i) => i === grandchildIndex ? { ...gc, ...patch } : gc)
                onUpdateChild(childIndex, { children: newChildren })
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function MenuItemsBuilder({
  itemsJson,
  onChange,
  errorMsg,
}: {
  itemsJson: string
  onChange: (json: string) => void
  errorMsg?: string | null
}) {
  const [items, setItems] = useState<MenuItemDraft[]>(() => {
    try {
      const parsed = JSON.parse(itemsJson)
      if (Array.isArray(parsed)) return parsed.map(recordToDraft)
    } catch { /* ignore */ }
    return []
  })

  const isValidHref = (href: string) => {
    if (!href) return false
    const lower = href.trim().toLowerCase()
    return !(lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:'))
  }

  const handleSave = () => {
    const records = items.map((item, i) => {
      if (item.refType === 'url' && !isValidHref(item.href)) {
        return null // Skip invalid items
      }
      return itemToRecord(item, i)
    }).filter(Boolean)
    onChange(JSON.stringify(records, null, 2))
  }

  const addItem = () => setItems([...items, createEmptyItem()])
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))
  const updateItem = (index: number, patch: Partial<MenuItemDraft>) => setItems(items.map((item, i) => i === index ? { ...item, ...patch } : item))

  return (
    <div style={{ display: 'grid', gap: spacing['12'] }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FieldLabel>Menu Items</FieldLabel>
        <div style={{ display: 'flex', gap: spacing['8'] }}>
          <button type='button' onClick={addItem} style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'], border: `1px solid ${colors.border}`, borderRadius: radius.full, backgroundColor: colors.surface, color: colors.textSecondary, padding: `4px ${spacing['10']}px`, fontSize: typography.xs, cursor: 'pointer' }}>
            <Plus size={12} /> Add item
          </button>
          <button type='button' onClick={handleSave} style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'], border: 0, borderRadius: radius.full, backgroundColor: colors.brandPrimary, color: colors.textInverted, padding: `4px ${spacing['10']}px`, fontSize: typography.xs, fontWeight: Number(fontWeights.semibold), cursor: 'pointer' }}>
            Apply
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: spacing['24'], color: colors.textSecondary, fontSize: typography.sm, border: `1px dashed ${colors.border}`, borderRadius: radius.xl }}>
          No menu items yet. Click &quot;Add item&quot; to create one.
        </div>
      ) : (
        items.map((item, index) => (
          <MenuItemEditor
            key={item.id}
            item={item}
            index={index}
            onUpdate={(patch) => updateItem(index, patch)}
            onRemove={() => removeItem(index)}
            onAddChild={() => {
              const newChild = createEmptyItem(item.id)
              updateItem(index, { children: [...item.children, newChild] })
            }}
            onRemoveChild={(childIndex) => {
              const newChildren = item.children.filter((_, i) => i !== childIndex)
              updateItem(index, { children: newChildren })
            }}
            onUpdateChild={(childIndex, patch) => {
              const newChildren = item.children.map((c, i) => i === childIndex ? { ...c, ...patch } : c)
              updateItem(index, { children: newChildren })
            }}
          />
        ))
      )}

      <ErrorHint message={errorMsg ?? null} />
    </div>
  )
}
