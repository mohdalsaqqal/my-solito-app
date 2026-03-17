'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, AlignLeft, CheckCircle2, GripVertical, Image as ImageIcon, LayoutList, Plus, Save, Star, Trash2, Type } from 'lucide-react'
import { parseHomeBlock } from '@real/app/lib/cms/blocks'
import { AdminReleaseBlockRecord, AdminReleaseRecord, ProductQuery } from '@real/app/lib/types'
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

const BLOCK_TYPE_LABELS: Record<string, string> = {
  hero: 'Hero Banner',
  product_slider: 'Product Slider',
  brand_promo: 'Brand Promo',
  promo_strip: 'Promo Strip',
}

function getPayloadError(value: string, expectedType?: BlockType) {
  try {
    const parsed = parseHomeBlock(JSON.parse(value))
    if (!parsed) return 'Payload JSON does not match block schema.'
    if (expectedType && parsed.type !== expectedType) return 'Payload type does not match selected block type.'
    return null
  } catch {
    return 'Payload JSON is invalid.'
  }
}

function blockIcon(type: BlockType) {
  if (type === 'hero') return ImageIcon
  if (type === 'product_slider') return LayoutList
  if (type === 'brand_promo') return Star
  if (type === 'promo_strip') return AlignLeft
  return Type
}

// ---------------------------------------------------------------------------
// Default form fields per block type
// ---------------------------------------------------------------------------

interface HeroFields {
  titleEn: string; titleAr: string
  subtitleEn: string; subtitleAr: string
  imageUrl: string
  ctaLabelEn: string; ctaLabelAr: string
  href: string
}

interface SliderFields {
  titleEn: string; titleAr: string
  subtitleEn: string; subtitleAr: string
  querySlug: string
}

interface BrandPromoFields {
  titleEn: string; titleAr: string
  subtitleEn: string; subtitleAr: string
  imageUrl: string
  ctaLabelEn: string; ctaLabelAr: string
  href: string
  querySlug: string
}

interface PromoStripFields {
  textEn: string; textAr: string
  ctaLabelEn: string; ctaLabelAr: string
  href: string
}

const defaultHero: HeroFields = { titleEn: '', titleAr: '', subtitleEn: '', subtitleAr: '', imageUrl: '', ctaLabelEn: '', ctaLabelAr: '', href: '' }
const defaultSlider: SliderFields = { titleEn: '', titleAr: '', subtitleEn: '', subtitleAr: '', querySlug: '' }
const defaultBrandPromo: BrandPromoFields = { titleEn: '', titleAr: '', subtitleEn: '', subtitleAr: '', imageUrl: '', ctaLabelEn: '', ctaLabelAr: '', href: '', querySlug: '' }
const defaultPromoStrip: PromoStripFields = { textEn: '', textAr: '', ctaLabelEn: '', ctaLabelAr: '', href: '' }

function populateFromPayload(
  blockType: BlockType,
  payload: Record<string, unknown> | null
): { hero: HeroFields; slider: SliderFields; brandPromo: BrandPromoFields; promoStrip: PromoStripFields } {
  const p = payload ?? {}
  const loc = (key: string) => {
    const val = p[key] as { en?: string; ar?: string } | undefined
    return { en: val?.en ?? '', ar: val?.ar ?? '' }
  }

  const hero = { ...defaultHero }
  const slider = { ...defaultSlider }
  const brandPromo = { ...defaultBrandPromo }
  const promoStrip = { ...defaultPromoStrip }

  if (blockType === 'hero') {
    const t = loc('title'); hero.titleEn = t.en; hero.titleAr = t.ar
    const s = loc('subtitle'); hero.subtitleEn = s.en; hero.subtitleAr = s.ar
    hero.imageUrl = (p.imageUrl as string) ?? ''
    const c = loc('ctaLabel'); hero.ctaLabelEn = c.en; hero.ctaLabelAr = c.ar
    hero.href = (p.href as string) ?? ''
  } else if (blockType === 'product_slider') {
    const t = loc('title'); slider.titleEn = t.en; slider.titleAr = t.ar
    const s = loc('subtitle'); slider.subtitleEn = s.en; slider.subtitleAr = s.ar
    slider.querySlug = (p.querySlug as string) ?? ''
  } else if (blockType === 'brand_promo') {
    const t = loc('title'); brandPromo.titleEn = t.en; brandPromo.titleAr = t.ar
    const s = loc('subtitle'); brandPromo.subtitleEn = s.en; brandPromo.subtitleAr = s.ar
    brandPromo.imageUrl = (p.imageUrl as string) ?? ''
    const c = loc('ctaLabel'); brandPromo.ctaLabelEn = c.en; brandPromo.ctaLabelAr = c.ar
    brandPromo.href = (p.href as string) ?? ''
    brandPromo.querySlug = (p.querySlug as string) ?? ''
  } else if (blockType === 'promo_strip') {
    const t = loc('text'); promoStrip.textEn = t.en; promoStrip.textAr = t.ar
    const c = loc('ctaLabel'); promoStrip.ctaLabelEn = c.en; promoStrip.ctaLabelAr = c.ar
    promoStrip.href = (p.href as string) ?? ''
  }

  return { hero, slider, brandPromo, promoStrip }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>
      {children}
      {required ? <span style={{ color: colors.danger, marginLeft: 2 }}>*</span> : null}
    </span>
  )
}

function ErrorHint({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <span style={{ color: colors.danger, fontSize: typography.xs, marginTop: 2 }}>{message}</span>
  )
}

function LocalizedPair({
  labelEn,
  labelAr,
  valueEn,
  valueAr,
  onChangeEn,
  onChangeAr,
  required,
  errorEn,
  errorAr,
}: {
  labelEn: string
  labelAr: string
  valueEn: string
  valueAr: string
  onChangeEn: (v: string) => void
  onChangeAr: (v: string) => void
  required?: boolean
  errorEn?: string | null
  errorAr?: string | null
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing['12'] }}>
      <label style={{ display: 'grid', gap: spacing['4'] }}>
        <FieldLabel required={required}>{labelEn}</FieldLabel>
        <input value={valueEn} onChange={(e) => onChangeEn(e.target.value)} style={inputStyle} />
        <ErrorHint message={errorEn ?? null} />
      </label>
      <label style={{ display: 'grid', gap: spacing['4'] }}>
        <FieldLabel>{labelAr}</FieldLabel>
        <input value={valueAr} onChange={(e) => onChangeAr(e.target.value)} dir="rtl" style={inputStyle} />
        <ErrorHint message={errorAr ?? null} />
      </label>
    </div>
  )
}

function FullWidthField({
  label,
  value,
  onChange,
  placeholder,
  required,
  errorMsg,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  errorMsg?: string | null
}) {
  return (
    <label style={{ display: 'grid', gap: spacing['4'] }}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
      <ErrorHint message={errorMsg ?? null} />
    </label>
  )
}

function QueryDropdown({
  value,
  onChange,
  queries,
  required,
  errorMsg,
}: {
  value: string
  onChange: (v: string) => void
  queries: ProductQuery[]
  required?: boolean
  errorMsg?: string | null
}) {
  return (
    <label style={{ display: 'grid', gap: spacing['4'] }}>
      <FieldLabel required={required}>Query</FieldLabel>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
        <option value="">{required ? '— select query —' : '— none —'}</option>
        {queries.map((q) => (
          <option key={q.slug} value={q.slug} style={{ color: q.active ? undefined : colors.textSecondary }}>
            {q.title?.en ? `${q.title.en} (${q.slug})` : q.slug}
            {q.active ? '' : ' [inactive]'}
          </option>
        ))}
      </select>
      <ErrorHint message={errorMsg ?? null} />
    </label>
  )
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function AdminCmsBlocksPage() {
  const searchParams = useSearchParams()
  const requestedReleaseId = searchParams.get('releaseId')?.trim() ?? ''
  const [releases, setReleases] = useState<AdminReleaseRecord[]>([])
  const [releaseId, setReleaseId] = useState('')
  const [blocks, setBlocks] = useState<AdminReleaseBlockRecord[]>([])
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [position, setPosition] = useState('1')
  const [type, setType] = useState<BlockType>('hero')
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [queries, setQueries] = useState<ProductQuery[]>([])
  const [saveAttempted, setSaveAttempted] = useState(false)

  // Per-type form state
  const [heroFields, setHeroFields] = useState<HeroFields>({ ...defaultHero })
  const [sliderFields, setSliderFields] = useState<SliderFields>({ ...defaultSlider })
  const [brandPromoFields, setBrandPromoFields] = useState<BrandPromoFields>({ ...defaultBrandPromo })
  const [promoStripFields, setPromoStripFields] = useState<PromoStripFields>({ ...defaultPromoStrip })

  const orderedBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.position - b.position),
    [blocks]
  )

  const selected = useMemo(() => blocks.find((item) => item.id === selectedBlockId) ?? null, [blocks, selectedBlockId])

  // Build payload from current form state for the active type
  const builtPayload = useMemo(() => {
    if (!selected) return null
    const blockId = (selected.payloadJson as Record<string, unknown> | null)?.id as string | undefined ?? `${type}-${Date.now()}`
    if (type === 'hero') {
      const f = heroFields
      return {
        id: blockId,
        type: 'hero' as const,
        title: { en: f.titleEn, ar: f.titleAr },
        ...(f.subtitleEn || f.subtitleAr ? { subtitle: { en: f.subtitleEn, ar: f.subtitleAr } } : {}),
        ...(f.imageUrl ? { imageUrl: f.imageUrl } : {}),
        ...(f.ctaLabelEn || f.ctaLabelAr ? { ctaLabel: { en: f.ctaLabelEn, ar: f.ctaLabelAr } } : {}),
        ...(f.href ? { href: f.href } : {}),
      }
    }
    if (type === 'product_slider') {
      const f = sliderFields
      return {
        id: blockId,
        type: 'product_slider' as const,
        title: { en: f.titleEn, ar: f.titleAr },
        ...(f.subtitleEn || f.subtitleAr ? { subtitle: { en: f.subtitleEn, ar: f.subtitleAr } } : {}),
        querySlug: f.querySlug,
      }
    }
    if (type === 'brand_promo') {
      const f = brandPromoFields
      return {
        id: blockId,
        type: 'brand_promo' as const,
        title: { en: f.titleEn, ar: f.titleAr },
        ...(f.subtitleEn || f.subtitleAr ? { subtitle: { en: f.subtitleEn, ar: f.subtitleAr } } : {}),
        ...(f.imageUrl ? { imageUrl: f.imageUrl } : {}),
        ...(f.ctaLabelEn || f.ctaLabelAr ? { ctaLabel: { en: f.ctaLabelEn, ar: f.ctaLabelAr } } : {}),
        ...(f.href ? { href: f.href } : {}),
        ...(f.querySlug ? { querySlug: f.querySlug } : {}),
      }
    }
    // promo_strip
    const f = promoStripFields
    return {
      id: blockId,
      type: 'promo_strip' as const,
      text: { en: f.textEn, ar: f.textAr },
      ...(f.ctaLabelEn || f.ctaLabelAr ? { ctaLabel: { en: f.ctaLabelEn, ar: f.ctaLabelAr } } : {}),
      ...(f.href ? { href: f.href } : {}),
    }
  }, [type, heroFields, sliderFields, brandPromoFields, promoStripFields, selected])

  // Derive payload error from the built payload
  const payloadError = useMemo(() => {
    if (!builtPayload) return null
    return getPayloadError(JSON.stringify(builtPayload), type)
  }, [builtPayload, type])

  // Per-field validation errors (only shown after save attempt)
  const fieldErrors = useMemo(() => {
    if (!saveAttempted) return {}
    const errs: Record<string, string> = {}
    if (type === 'hero' && !heroFields.titleEn) errs.heroTitleEn = 'Required'
    if (type === 'product_slider') {
      if (!sliderFields.titleEn) errs.sliderTitleEn = 'Required'
      if (!sliderFields.querySlug) errs.sliderQuerySlug = 'Required'
    }
    if (type === 'brand_promo' && !brandPromoFields.titleEn) errs.brandPromoTitleEn = 'Required'
    if (type === 'promo_strip' && !promoStripFields.textEn) errs.promoStripTextEn = 'Required'
    return errs
  }, [saveAttempted, type, heroFields, sliderFields, brandPromoFields, promoStripFields])

  const canSave = !payloadError && Object.keys(fieldErrors).length === 0

  const loadReleases = async () => {
    try {
      const releaseRows = await apiClient.admin.listReleases()
      setReleases(releaseRows)
      if (!releaseId && releaseRows.length > 0) {
        const preferred = releaseRows.find((row) => row.id === requestedReleaseId)
        setReleaseId(preferred?.id ?? releaseRows[0].id)
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

  const loadQueries = async () => {
    try {
      const rows = await apiClient.admin.listProductQueries()
      setQueries(rows)
    } catch {
      // queries are not critical — silently ignore
    }
  }

  useEffect(() => {
    void loadReleases()
    void loadQueries()
  }, [requestedReleaseId])

  useEffect(() => {
    if (!releaseId) return
    void loadBlocks(releaseId)
  }, [releaseId])

  // Populate form when a block is selected
  useEffect(() => {
    if (!selected) return
    const blockType = selected.type as BlockType
    setType(blockType)
    setPosition(String(selected.position))
    setSaveAttempted(false)
    const payload = selected.payloadJson as Record<string, unknown> | null
    const populated = populateFromPayload(blockType, payload)
    setHeroFields(populated.hero)
    setSliderFields(populated.slider)
    setBrandPromoFields(populated.brandPromo)
    setPromoStripFields(populated.promoStrip)
  }, [selected])

  // Reset fields on type change (only if user manually changes type, not when block selection changes)
  const handleTypeChange = (newType: BlockType) => {
    setType(newType)
    setSaveAttempted(false)
    if (newType === 'hero') setHeroFields({ ...defaultHero })
    else if (newType === 'product_slider') setSliderFields({ ...defaultSlider })
    else if (newType === 'brand_promo') setBrandPromoFields({ ...defaultBrandPromo })
    else if (newType === 'promo_strip') setPromoStripFields({ ...defaultPromoStrip })
  }

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
            <Button
              tone='secondary'
              onClick={() => {
                window.open('/', '_blank', 'noopener,noreferrer')
              }}
            >
              Preview
            </Button>
            <Button
              tone='primary'
              disabled={!releaseId || publishing}
              onClick={async () => {
                if (!releaseId || publishing) return
                setPublishing(true)
                setError(null)
                setMessage(null)
                try {
                  await apiClient.admin.publishRelease(releaseId)
                  setMessage(`Release ${releaseId} published successfully.`)
                } catch (cause) {
                  setError(cause instanceof Error ? cause.message : 'Unable to publish release.')
                } finally {
                  setPublishing(false)
                }
              }}
            >
              {publishing ? 'Publishing...' : 'Publish Changes'}
            </Button>
          </div>
        }
      />
      {error ? <p style={{ marginTop: 0, color: colors.danger }}>{error}</p> : null}
      {message ? <p style={{ marginTop: 0, color: colors.success }}>{message}</p> : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: spacing['24'],
          minHeight: 620,
        }}
      >
        {/* ----------------------------------------------------------------- */}
        {/* LEFT PANEL — Block list + drag-drop */}
        {/* ----------------------------------------------------------------- */}
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

          <div style={{ marginBottom: spacing['12'] }}>
            <span style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.semibold) }}>
              Blocks ({blocks.length})
            </span>
          </div>

          {blocks.length === 0 ? (
            <div style={{ padding: spacing['48'], textAlign: 'center', color: colors.textSecondary }}>
              <LayoutList size={32} style={{ marginBottom: spacing['12'] }} />
              <p style={{ margin: '0 0 4px', fontSize: typography.base, fontWeight: Number(fontWeights.semibold), color: colors.textPrimary }}>No blocks yet</p>
              <p style={{ margin: 0, fontSize: typography.sm }}>Add your first block to start composing the home page.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: spacing['8'], maxHeight: 540, overflowY: 'auto' }}>
              {orderedBlocks.map((block) => {
                const Icon = blockIcon(block.type as BlockType)
                const valid = !getPayloadError(JSON.stringify(block.payloadJson), block.type as BlockType)
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
                      <span style={{ display: 'flex', alignItems: 'center', gap: spacing['8'] }}>
                        <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>
                          {BLOCK_TYPE_LABELS[block.type] ?? block.type}
                        </span>
                        <span style={{ fontSize: typography.xs, fontWeight: Number(fontWeights.semibold), color: colors.textSecondary, backgroundColor: colors.surfaceMuted, borderRadius: radius.full, padding: '2px 8px', minWidth: 24, textAlign: 'center', flexShrink: 0 }}>
                          {block.position}
                        </span>
                      </span>
                      {(() => {
                        try {
                          const payload = block.payloadJson as Record<string, unknown> | null
                          const preview = (
                            (payload?.title as Record<string, string> | undefined)?.en ??
                            (payload?.text as Record<string, string> | undefined)?.en ??
                            ''
                          )
                          const trimmed = preview.length > 40 ? preview.slice(0, 40) + '…' : preview
                          return trimmed ? (
                            <span style={{ color: colors.textSecondary, fontSize: typography.xs, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {trimmed}
                            </span>
                          ) : null
                        } catch {
                          return null
                        }
                      })()}
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

        {/* ----------------------------------------------------------------- */}
        {/* RIGHT PANEL — Structured block editor */}
        {/* ----------------------------------------------------------------- */}
        <Panel density='dense'>
          {!selected ? (
            <EmptyState title='Select a block to edit' description='Choose a block from the left panel to edit content.' />
          ) : (
            <>
              {/* Header row */}
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
                    disabled={saveAttempted && !canSave}
                    onClick={async () => {
                      setSaveAttempted(true)
                      if (!builtPayload) return
                      const payloadStr = JSON.stringify(builtPayload)
                      const err = getPayloadError(payloadStr, type)
                      if (err) return
                      try {
                        await apiClient.admin.updateReleaseBlock(selected.id, {
                          type,
                          position: Number(position) || 1,
                          payloadJson: builtPayload,
                        })
                        await loadBlocks(releaseId)
                        setMessage('Block saved.')
                        setTimeout(() => setMessage(null), 3000)
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

              {/* Form fields */}
              <div style={{ display: 'grid', gap: spacing['16'] }}>
                {/* Block type + position row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                    gap: spacing['12'],
                  }}
                >
                  <label style={{ display: 'grid', gap: spacing['4'] }}>
                    <FieldLabel>Block Type</FieldLabel>
                    <select value={type} onChange={(e) => handleTypeChange(e.target.value as BlockType)} style={inputStyle}>
                      {blockTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label style={{ display: 'grid', gap: spacing['4'] }}>
                    <FieldLabel>Position</FieldLabel>
                    <input value={position} onChange={(e) => setPosition(e.target.value)} style={inputStyle} />
                  </label>
                </div>

                {/* Divider */}
                <div style={{ borderTop: `1px solid ${colors.border}` }} />

                {/* ---- HERO fields ---- */}
                {type === 'hero' && (
                  <>
                    <LocalizedPair
                      labelEn="Title EN"
                      labelAr="Title AR"
                      valueEn={heroFields.titleEn}
                      valueAr={heroFields.titleAr}
                      onChangeEn={(v) => setHeroFields((f) => ({ ...f, titleEn: v }))}
                      onChangeAr={(v) => setHeroFields((f) => ({ ...f, titleAr: v }))}
                      required
                      errorEn={fieldErrors.heroTitleEn}
                    />
                    <LocalizedPair
                      labelEn="Subtitle EN"
                      labelAr="Subtitle AR"
                      valueEn={heroFields.subtitleEn}
                      valueAr={heroFields.subtitleAr}
                      onChangeEn={(v) => setHeroFields((f) => ({ ...f, subtitleEn: v }))}
                      onChangeAr={(v) => setHeroFields((f) => ({ ...f, subtitleAr: v }))}
                    />
                    <FullWidthField
                      label="Image URL"
                      value={heroFields.imageUrl}
                      onChange={(v) => setHeroFields((f) => ({ ...f, imageUrl: v }))}
                      placeholder="https://..."
                    />
                    <LocalizedPair
                      labelEn="CTA Label EN"
                      labelAr="CTA Label AR"
                      valueEn={heroFields.ctaLabelEn}
                      valueAr={heroFields.ctaLabelAr}
                      onChangeEn={(v) => setHeroFields((f) => ({ ...f, ctaLabelEn: v }))}
                      onChangeAr={(v) => setHeroFields((f) => ({ ...f, ctaLabelAr: v }))}
                    />
                    <FullWidthField
                      label="CTA Link (href)"
                      value={heroFields.href}
                      onChange={(v) => setHeroFields((f) => ({ ...f, href: v }))}
                      placeholder="/shop"
                    />
                  </>
                )}

                {/* ---- PRODUCT SLIDER fields ---- */}
                {type === 'product_slider' && (
                  <>
                    <LocalizedPair
                      labelEn="Title EN"
                      labelAr="Title AR"
                      valueEn={sliderFields.titleEn}
                      valueAr={sliderFields.titleAr}
                      onChangeEn={(v) => setSliderFields((f) => ({ ...f, titleEn: v }))}
                      onChangeAr={(v) => setSliderFields((f) => ({ ...f, titleAr: v }))}
                      required
                      errorEn={fieldErrors.sliderTitleEn}
                    />
                    <LocalizedPair
                      labelEn="Subtitle EN"
                      labelAr="Subtitle AR"
                      valueEn={sliderFields.subtitleEn}
                      valueAr={sliderFields.subtitleAr}
                      onChangeEn={(v) => setSliderFields((f) => ({ ...f, subtitleEn: v }))}
                      onChangeAr={(v) => setSliderFields((f) => ({ ...f, subtitleAr: v }))}
                    />
                    <QueryDropdown
                      value={sliderFields.querySlug}
                      onChange={(v) => setSliderFields((f) => ({ ...f, querySlug: v }))}
                      queries={queries}
                      required
                      errorMsg={fieldErrors.sliderQuerySlug}
                    />
                  </>
                )}

                {/* ---- BRAND PROMO fields ---- */}
                {type === 'brand_promo' && (
                  <>
                    <LocalizedPair
                      labelEn="Title EN"
                      labelAr="Title AR"
                      valueEn={brandPromoFields.titleEn}
                      valueAr={brandPromoFields.titleAr}
                      onChangeEn={(v) => setBrandPromoFields((f) => ({ ...f, titleEn: v }))}
                      onChangeAr={(v) => setBrandPromoFields((f) => ({ ...f, titleAr: v }))}
                      required
                      errorEn={fieldErrors.brandPromoTitleEn}
                    />
                    <LocalizedPair
                      labelEn="Subtitle EN"
                      labelAr="Subtitle AR"
                      valueEn={brandPromoFields.subtitleEn}
                      valueAr={brandPromoFields.subtitleAr}
                      onChangeEn={(v) => setBrandPromoFields((f) => ({ ...f, subtitleEn: v }))}
                      onChangeAr={(v) => setBrandPromoFields((f) => ({ ...f, subtitleAr: v }))}
                    />
                    <FullWidthField
                      label="Image URL"
                      value={brandPromoFields.imageUrl}
                      onChange={(v) => setBrandPromoFields((f) => ({ ...f, imageUrl: v }))}
                      placeholder="https://..."
                    />
                    <LocalizedPair
                      labelEn="CTA Label EN"
                      labelAr="CTA Label AR"
                      valueEn={brandPromoFields.ctaLabelEn}
                      valueAr={brandPromoFields.ctaLabelAr}
                      onChangeEn={(v) => setBrandPromoFields((f) => ({ ...f, ctaLabelEn: v }))}
                      onChangeAr={(v) => setBrandPromoFields((f) => ({ ...f, ctaLabelAr: v }))}
                    />
                    <FullWidthField
                      label="CTA Link (href)"
                      value={brandPromoFields.href}
                      onChange={(v) => setBrandPromoFields((f) => ({ ...f, href: v }))}
                      placeholder="/shop"
                    />
                    <QueryDropdown
                      value={brandPromoFields.querySlug}
                      onChange={(v) => setBrandPromoFields((f) => ({ ...f, querySlug: v }))}
                      queries={queries}
                    />
                  </>
                )}

                {/* ---- PROMO STRIP fields ---- */}
                {type === 'promo_strip' && (
                  <>
                    <LocalizedPair
                      labelEn="Text EN"
                      labelAr="Text AR"
                      valueEn={promoStripFields.textEn}
                      valueAr={promoStripFields.textAr}
                      onChangeEn={(v) => setPromoStripFields((f) => ({ ...f, textEn: v }))}
                      onChangeAr={(v) => setPromoStripFields((f) => ({ ...f, textAr: v }))}
                      required
                      errorEn={fieldErrors.promoStripTextEn}
                    />
                    <LocalizedPair
                      labelEn="CTA Label EN"
                      labelAr="CTA Label AR"
                      valueEn={promoStripFields.ctaLabelEn}
                      valueAr={promoStripFields.ctaLabelAr}
                      onChangeEn={(v) => setPromoStripFields((f) => ({ ...f, ctaLabelEn: v }))}
                      onChangeAr={(v) => setPromoStripFields((f) => ({ ...f, ctaLabelAr: v }))}
                    />
                    <FullWidthField
                      label="CTA Link (href)"
                      value={promoStripFields.href}
                      onChange={(v) => setPromoStripFields((f) => ({ ...f, href: v }))}
                      placeholder="/shop"
                    />
                  </>
                )}

                {/* Payload validation error (schema-level) */}
                {saveAttempted && payloadError ? (
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
                    {payloadError}
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
