'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, GripVertical, Image as ImageIcon, Plus, Save, Trash2, Type } from 'lucide-react'
import { AdminReleaseBlockRecord, AdminReleaseRecord } from '@real/app/lib/types'
import { apiClient } from '../../../../apiClient'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import { Button, EmptyState, PageContainer, PageHeader, Panel } from '../../../_components/AdminPagePrimitives'

type BlockType = 'hero' | 'product_slider' | 'brand_promo' | 'promo_strip'

const blockTypeOptions: Array<{ value: BlockType; label: string }> = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'product_slider', label: 'Product Slider' },
  { value: 'brand_promo', label: 'Brand Promo' },
  { value: 'promo_strip', label: 'Promo Strip' },
]

function isPayloadValid(value: string) {
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}

function blockIcon(type: BlockType) {
  if (type === 'hero') return ImageIcon
  if (type === 'promo_strip') return Type
  return Type
}

export default function AdminCmsBlocksPage() {
  const [releases, setReleases] = useState<AdminReleaseRecord[]>([])
  const [releaseId, setReleaseId] = useState('')
  const [blocks, setBlocks] = useState<AdminReleaseBlockRecord[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [payloadText, setPayloadText] = useState('')
  const [position, setPosition] = useState('1')
  const [type, setType] = useState<BlockType>('hero')
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const orderedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.position - b.position),
    [blocks]
  )

  const selected = useMemo(() => blocks.find((item) => item.id === selectedBlockId) ?? null, [blocks, selectedBlockId])

  const loadReleases = async () => {
    try {
      const releaseRows = await apiClient.admin.listReleases()
      setReleases(releaseRows)
      if (!releaseId && releaseRows.length > 0) {
        setReleaseId(releaseRows[0].id)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load releases.')
    }
  }

  const loadBlocks = async (targetReleaseId: string) => {
    if (!targetReleaseId) return
    try {
      const rows = await apiClient.admin.listReleaseBlocks(targetReleaseId)
      setBlocks(rows)
      if (!selectedBlockId && rows.length > 0) {
        setSelectedBlockId(rows[0].id)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load blocks.')
    }
  }

  useEffect(() => {
    void loadReleases()
  }, [])

  useEffect(() => {
    if (!releaseId) return
    void loadBlocks(releaseId)
  }, [releaseId])

  useEffect(() => {
    if (!selected) return
    setType(selected.type)
    setPosition(String(selected.position))
    setPayloadText(JSON.stringify(selected.payloadJson, null, 2))
  }, [selected])

  const persistOrderedBlocks = async (reordered: AdminReleaseBlockRecord[]) => {
    setBlocks(reordered)
    try {
      await Promise.all(
        reordered.map((item, index) =>
          apiClient.admin.updateReleaseBlock(item.id, {
            position: index + 1,
          })
        )
      )
      await loadBlocks(releaseId)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to reorder blocks.')
      await loadBlocks(releaseId)
    }
  }

  const handleDrop = async (targetBlockId: string) => {
    if (!draggingBlockId || draggingBlockId === targetBlockId) return
    const fromIndex = orderedBlocks.findIndex((item) => item.id === draggingBlockId)
    const toIndex = orderedBlocks.findIndex((item) => item.id === targetBlockId)
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return
    const next = [...orderedBlocks]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    const normalized = next.map((item, index) => ({ ...item, position: index + 1 }))
    await persistOrderedBlocks(normalized)
  }

  return (
    <PageContainer dense>
      <PageHeader
        title='CMS Blocks'
        actions={
          <div style={{ display: 'flex', gap: spacing['8'] }}>
            <Button tone='secondary'>Preview</Button>
            <Button tone='primary'>Publish Changes</Button>
          </div>
        }
      />
      {error ? <p style={{ marginTop: 0, color: colors.danger }}>{error}</p> : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: spacing['24'],
          minHeight: 620,
        }}
      >
        <Panel density='dense'>
          <div
            style={{
              borderBottom: `1px solid ${colors.border}`,
              marginBottom: spacing['12'],
              paddingBottom: spacing['12'],
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: spacing['8'],
            }}
          >
            <div style={{ display: 'grid', gap: spacing['4'], flex: 1 }}>
              <label style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>
                Release
              </label>
              <select
                value={releaseId}
                onChange={(e) => {
                  setReleaseId(e.target.value)
                  setSelectedBlockId(null)
                }}
                style={inputStyle}
              >
                {releases.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.id}
                  </option>
                ))}
              </select>
            </div>
            <Button
              tone='secondary'
              onClick={async () => {
                if (!releaseId) return
                try {
                  await apiClient.admin.createReleaseBlock({
                    releaseId,
                    position: blocks.length + 1,
                    type: 'hero',
                    payloadJson: { id: `hero-${Date.now()}`, type: 'hero', title: { en: 'Title', ar: 'عنوان' } },
                  })
                  await loadBlocks(releaseId)
                } catch (cause) {
                  setError(cause instanceof Error ? cause.message : 'Unable to add block.')
                }
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                <Plus size={14} />
                Add
              </span>
            </Button>
          </div>

          {blocks.length === 0 ? (
            <EmptyState title='No blocks yet' description='Add a block to begin composing this release.' />
          ) : (
            <div style={{ display: 'grid', gap: spacing['8'], maxHeight: 540, overflowY: 'auto' }}>
              {orderedBlocks.map((block) => {
                const Icon = blockIcon(block.type as BlockType)
                const valid = isPayloadValid(JSON.stringify(block.payloadJson))
                const active = selectedBlockId === block.id
                return (
                  <button
                    key={block.id}
                    type='button'
                    draggable
                    onDragStart={() => setDraggingBlockId(block.id)}
                    onDragEnd={() => setDraggingBlockId(null)}
                    onDragOver={(event) => {
                      event.preventDefault()
                    }}
                    onDrop={async (event) => {
                      event.preventDefault()
                      await handleDrop(block.id)
                      setDraggingBlockId(null)
                    }}
                    onClick={() => setSelectedBlockId(block.id)}
                    style={{
                      border: `1px solid ${active ? colors.brandPrimary : colors.border}`,
                      backgroundColor:
                        draggingBlockId === block.id
                          ? colors.surfaceMuted
                          : active
                          ? colors.surfaceMuted
                          : colors.surface,
                      borderRadius: radius.xl,
                      padding: spacing['12'],
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing['8'],
                      cursor: draggingBlockId === block.id ? 'grabbing' : 'grab',
                      textAlign: 'start',
                      transition: 'background-color 180ms ease, border-color 180ms ease',
                    }}
                  >
                    <GripVertical size={14} color={colors.textSecondary} />
                    <span
                      style={{
                        width: spacing['32'],
                        height: spacing['32'],
                        borderRadius: radius.md,
                        backgroundColor: colors.surfaceMuted,
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <Icon size={14} color={colors.textSecondary} />
                    </span>
                    <span style={{ display: 'grid', gap: spacing['2'], flex: 1, minWidth: 0 }}>
                      <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {block.type}
                      </span>
                      <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>
                        Position {block.position}
                      </span>
                    </span>
                    {valid ? (
                      <CheckCircle2 size={14} color={colors.success} />
                    ) : (
                      <AlertCircle size={14} color={colors.danger} />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </Panel>

        <Panel density='dense'>
          {!selected ? (
            <EmptyState title='Select a block to edit' description='Choose a block from the left panel to edit content.' />
          ) : (
            <>
              <div
                style={{
                  borderBottom: `1px solid ${colors.border}`,
                  marginBottom: spacing['16'],
                  paddingBottom: spacing['12'],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: spacing['12'],
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'grid', gap: spacing['2'] }}>
                  <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>Editing block</span>
                  <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold) }}>
                    {selected.id}
                  </span>
                </div>
                <div style={{ display: 'inline-flex', gap: spacing['8'] }}>
                  <Button
                    tone='danger'
                    onClick={async () => {
                      try {
                        await apiClient.admin.deleteReleaseBlock(selected.id)
                        setSelectedBlockId(null)
                        await loadBlocks(releaseId)
                      } catch (cause) {
                        setError(cause instanceof Error ? cause.message : 'Unable to delete block.')
                      }
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                      <Trash2 size={14} color={colors.textInverted} />
                      Delete
                    </span>
                  </Button>
                  <Button
                    tone='primary'
                    disabled={!isPayloadValid(payloadText)}
                    onClick={async () => {
                      try {
                        await apiClient.admin.updateReleaseBlock(selected.id, {
                          type,
                          position: Number(position) || 1,
                          payloadJson: JSON.parse(payloadText),
                        })
                        await loadBlocks(releaseId)
                      } catch (cause) {
                        setError(cause instanceof Error ? cause.message : 'Unable to update block.')
                      }
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                      <Save size={14} color={colors.textInverted} />
                      Save Block
                    </span>
                  </Button>
                </div>
              </div>

              <div style={{ display: 'grid', gap: spacing['12'] }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                    gap: spacing['12'],
                  }}
                >
                  <label style={{ display: 'grid', gap: spacing['4'] }}>
                    <span style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>
                      Block Type
                    </span>
                    <select value={type} onChange={(e) => setType(e.target.value as BlockType)} style={inputStyle}>
                      {blockTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label style={{ display: 'grid', gap: spacing['4'] }}>
                    <span style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>
                      Position
                    </span>
                    <input value={position} onChange={(e) => setPosition(e.target.value)} style={inputStyle} />
                  </label>
                </div>

                <label style={{ display: 'grid', gap: spacing['4'] }}>
                  <span style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>
                    Payload JSON
                  </span>
                  <textarea
                    value={payloadText}
                    onChange={(e) => setPayloadText(e.target.value)}
                    rows={16}
                    style={{
                      ...inputStyle,
                      minHeight: 360,
                      fontFamily: 'monospace',
                      fontSize: typography.xs,
                      paddingBlock: spacing['8'],
                    }}
                  />
                </label>

                {!isPayloadValid(payloadText) ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing['8'],
                      border: `1px solid ${colors.danger}`,
                      borderRadius: radius.xl,
                      backgroundColor: colors.surface,
                      color: colors.danger,
                      padding: spacing['12'],
                      fontSize: typography.xs,
                    }}
                  >
                    <AlertCircle size={14} />
                    Payload JSON is invalid. Fix it before saving.
                  </div>
                ) : null}
              </div>
            </>
          )}
        </Panel>
      </div>
    </PageContainer>
  )
}

const inputStyle = {
  width: '100%',
  minHeight: spacing['40'],
  borderRadius: radius.xl,
  border: `1px solid ${colors.border}`,
  backgroundColor: colors.surface,
  color: colors.textPrimary,
  fontSize: typography.sm,
  paddingInline: spacing['12'],
  outline: 'none',
} as const
