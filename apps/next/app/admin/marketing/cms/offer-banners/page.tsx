'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Image as ImageIcon, Plus, Save, Trash2, Upload, X } from 'lucide-react'
import { AdminOfferBannerRecord } from '@real/app/lib/types'
import { apiClient } from '../../../../apiClient'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import { Button, EmptyState, PageContainer, PageHeader, Panel } from '../../../_components/AdminPagePrimitives'

// Exact banner dimensions from tokens: (1320 - 24*2 - rowGap:20) / 2 = 626 wide, 214 tall
const BANNER_W = 626
const BANNER_H = 214
const ASPECT = BANNER_W / BANNER_H // ~2.925

const MAX_BANNERS = 4

/** Crop + resize the image to exactly BANNER_W×BANNER_H using Canvas (center-crop). */
function cropToCanvas(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const srcW = img.naturalWidth
      const srcH = img.naturalHeight
      const srcAspect = srcW / srcH

      let sx = 0, sy = 0, sw = srcW, sh = srcH
      if (srcAspect > ASPECT) {
        // Image is wider than target — crop sides
        sw = Math.round(srcH * ASPECT)
        sx = Math.round((srcW - sw) / 2)
      } else {
        // Image is taller than target — crop top/bottom
        sh = Math.round(srcW / ASPECT)
        sy = Math.round((srcH - sh) / 2)
      }

      const canvas = document.createElement('canvas')
      canvas.width = BANNER_W
      canvas.height = BANNER_H
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, BANNER_W, BANNER_H)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas toBlob failed'))
        },
        'image/jpeg',
        0.92
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Image failed to load'))
    }
    img.src = objectUrl
  })
}

function BannerCard({
  banner,
  index,
  selected,
  onSelect,
}: {
  banner: AdminOfferBannerRecord
  index: number
  selected: boolean
  onSelect: () => void
}) {
  const isEnabled = banner.enabled !== false
  return (
    <button
      type='button'
      onClick={onSelect}
      style={{
        border: `1px solid ${selected ? colors.brandPrimary : colors.border}`,
        borderLeft: selected ? `3px solid ${colors.brandPrimary}` : '3px solid transparent',
        backgroundColor: selected ? colors.surfaceMuted : colors.surface,
        borderRadius: radius.xl,
        padding: spacing['12'],
        display: 'flex',
        alignItems: 'center',
        gap: spacing['12'],
        cursor: 'pointer',
        textAlign: 'start',
        width: '100%',
        transition: 'border-color 180ms ease, background-color 180ms ease',
      }}
    >
      {banner.imageUrl ? (
        <img
          src={banner.imageUrl}
          alt=''
          style={{
            width: 72,
            height: Math.round(72 / ASPECT),
            borderRadius: radius.md,
            objectFit: 'cover',
            flexShrink: 0,
            backgroundColor: colors.surfaceMuted,
          }}
        />
      ) : (
        <div
          style={{
            width: 72,
            height: Math.round(72 / ASPECT),
            borderRadius: radius.md,
            backgroundColor: colors.surfaceMuted,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <ImageIcon size={18} color={colors.textSecondary} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0, display: 'grid', gap: spacing['2'] }}>
        <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {banner.ctaLabel?.en || 'Banner ' + (index + 1)}
        </span>
        <span style={{ color: colors.textSecondary, fontSize: typography.xs, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {banner.href ?? '/shop'}
        </span>
      </div>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: typography.xs,
        fontWeight: Number(fontWeights.medium),
        color: isEnabled ? colors.success : colors.textSecondary,
        backgroundColor: isEnabled ? 'rgba(34,197,94,0.10)' : colors.surfaceMuted,
        borderRadius: radius.full,
        padding: '2px 8px',
        flexShrink: 0,
      }}>
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: isEnabled ? colors.success : colors.textSecondary,
          display: 'inline-block',
        }} />
        {isEnabled ? 'Enabled' : 'Disabled'}
      </span>
    </button>
  )
}

function UploadZone({
  imageUrl,
  uploading,
  onPick,
  onClear,
  onDropFile,
}: {
  imageUrl: string
  uploading: boolean
  onPick: () => void
  onClear: () => void
  onDropFile?: (file: File) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const active = hovered || dragOver

  return (
    <div
      role='button'
      tabIndex={0}
      aria-label='Upload banner image'
      onClick={uploading ? undefined : onPick}
      onKeyDown={(e) => { if (!uploading && (e.key === 'Enter' || e.key === ' ')) onPick() }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) onDropFile?.(f) }}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: `${BANNER_W} / ${BANNER_H}`,
        borderRadius: radius.xl,
        overflow: 'hidden',
        cursor: uploading ? 'not-allowed' : 'pointer',
        border: `2px dashed ${dragOver ? colors.brandPrimary : active ? colors.textSecondary : colors.border}`,
        transition: 'border-color 160ms ease',
        backgroundColor: dragOver ? colors.brandPrimarySubtle : colors.surfaceMuted,
      }}
    >
      {/* Image or placeholder */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=''
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: spacing['8'],
        }}>
          <div style={{
            width: 44, height: 44,
            borderRadius: radius.full,
            backgroundColor: active ? colors.brandPrimarySubtle : colors.surface,
            border: `1px solid ${active ? colors.brandPrimary : colors.border}`,
            display: 'grid', placeItems: 'center',
            transition: 'background-color 160ms, border-color 160ms',
          }}>
            <Upload size={18} color={active ? colors.brandPrimary : colors.textSecondary} />
          </div>
          <span style={{
            fontSize: typography.xs,
            color: active ? colors.brandPrimary : colors.textSecondary,
            fontWeight: Number(fontWeights.medium),
            transition: 'color 160ms',
          }}>
            {dragOver ? 'Drop to upload' : 'Click or drag image here'}
          </span>
        </div>
      )}

      {/* Hover overlay with upload CTA (only when image is already set) */}
      {imageUrl && active && !uploading ? (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 60%, transparent 100%)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          paddingBottom: spacing['16'],
          gap: spacing['8'],
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: spacing['6'],
            backgroundColor: colors.textPrimary,
            color: colors.textInverted,
            borderRadius: radius.full,
            paddingInline: spacing['16'],
            paddingBlock: spacing['8'],
            fontSize: typography.xs,
            fontWeight: Number(fontWeights.semibold),
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            boxShadow: '0 2px 12px rgba(0,0,0,0.35)',
            pointerEvents: 'none',
          }}>
            <Upload size={12} />
            Replace image
          </div>
        </div>
      ) : null}

      {/* Uploading spinner overlay */}
      {uploading ? (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(255,255,255,0.75)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: spacing['8'],
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            width: 28, height: 28,
            borderRadius: radius.full,
            border: `3px solid ${colors.border}`,
            borderTopColor: colors.brandPrimary,
            animation: 'spin 0.7s linear infinite',
          }} />
          <span style={{ fontSize: typography.xs, color: colors.textSecondary, fontWeight: Number(fontWeights.medium) }}>
            Processing…
          </span>
        </div>
      ) : null}

      {/* Clear button (top-right, only when image is set) */}
      {imageUrl && !uploading ? (
        <button
          type='button'
          aria-label='Remove image'
          onClick={(e) => { e.stopPropagation(); onClear() }}
          style={{
            position: 'absolute', top: spacing['8'], right: spacing['8'],
            width: 24, height: 24,
            borderRadius: radius.full,
            border: 'none',
            backgroundColor: 'rgba(0,0,0,0.55)',
            color: '#fff',
            display: 'grid', placeItems: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
            transition: 'background-color 150ms',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(0,0,0,0.82)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(0,0,0,0.55)' }}
        >
          <X size={12} />
        </button>
      ) : null}
    </div>
  )
}

/* Inject keyframe for spinner */
if (typeof document !== 'undefined') {
  const styleId = 'offer-banner-spin'
  if (!document.getElementById(styleId)) {
    const s = document.createElement('style')
    s.id = styleId
    s.textContent = '@keyframes spin { to { transform: rotate(360deg) } }'
    document.head.appendChild(s)
  }
}

export default function AdminOfferBannersPage() {
  const [banners, setBanners] = useState<AdminOfferBannerRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [imageUrl, setImageUrl] = useState('')
  const [href, setHref] = useState('')
  const [ctaEn, setCtaEn] = useState('')
  const [ctaAr, setCtaAr] = useState('')
  const [enabled, setEnabled] = useState(true)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const selected = banners.find((b) => b.id === selectedId) ?? null

  const loadBanners = async () => {
    try {
      const rows = await apiClient.admin.listOfferBanners()
      setBanners(rows)
      if (!selectedId && rows.length > 0) {
        setSelectedId(rows[0].id)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load offer banners.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadBanners()
  }, [])

  useEffect(() => {
    if (!selected) return
    setImageUrl(selected.imageUrl ?? '')
    setHref(selected.href ?? '')
    setCtaEn(selected.ctaLabel?.en ?? '')
    setCtaAr(selected.ctaLabel?.ar ?? '')
    setEnabled(selected.enabled !== false)
  }, [selected?.id])

  const clearMessages = () => {
    setMessage(null)
    setError(null)
  }

  const uploadFile = async (file: File) => {
    clearMessages()
    setUploading(true)
    try {
      const cropped = await cropToCanvas(file)
      const form = new FormData()
      form.append('file', new File([cropped], 'banner.jpg', { type: 'image/jpeg' }))
      const res = await fetch('/api/admin/cms/offer-banners/upload', {
        method: 'POST',
        body: form,
        credentials: 'include',
      })
      const json = await res.json() as { ok: boolean; data?: { url: string }; message?: string }
      if (!json.ok || !json.data?.url) throw new Error(json.message ?? 'Upload failed')
      setImageUrl(json.data.url)
      setMessage(`Uploaded & cropped to ${BANNER_W}×${BANNER_H}px`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    await uploadFile(file)
  }

  const handleSave = async () => {
    if (!selectedId || saving) return
    clearMessages()
    setSaving(true)
    try {
      await apiClient.admin.updateOfferBanner(selectedId, {
        imageUrl: imageUrl.trim() || undefined,
        href: href.trim() || '/shop',
        ctaLabel: { en: ctaEn.trim(), ar: ctaAr.trim() },
        enabled,
      })
      setMessage('Banner saved.')
      await loadBanners()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save banner.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id: string, nextEnabled: boolean) => {
    clearMessages()
    try {
      await apiClient.admin.updateOfferBanner(id, { enabled: nextEnabled })
      await loadBanners()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update banner.')
    }
  }

  const handleDelete = async () => {
    if (!selectedId || saving) return
    clearMessages()
    setSaving(true)
    try {
      await apiClient.admin.deleteOfferBanner(selectedId)
      setSelectedId(null)
      setMessage('Banner deleted.')
      await loadBanners()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to delete banner.')
    } finally {
      setSaving(false)
    }
  }

  const handleCreate = async () => {
    clearMessages()
    try {
      const created = await apiClient.admin.createOfferBanner({
        imageUrl: '',
        href: '/shop',
        ctaLabel: { en: 'Shop Now', ar: 'تسوق الآن' },
        enabled: true,
      })
      await loadBanners()
      setSelectedId(created.id)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create banner.')
    }
  }

  return (
    <PageContainer dense>
      <PageHeader
        title='Offer Banners'
        subtitle='Up to 4 promotional banners for the homepage — connects to CMS.'
        actions={
          <div style={{ display: 'flex', gap: spacing['8'], alignItems: 'center' }}>
            <span style={{ fontSize: typography.xs, fontWeight: Number(fontWeights.medium), backgroundColor: colors.surfaceMuted, borderRadius: radius.full, padding: '2px 10px', color: colors.textSecondary }}>
              {banners.length} / 4
            </span>
            <Button
              tone='secondary'
              disabled={banners.length >= MAX_BANNERS}
              onClick={handleCreate}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                <Plus size={14} />
                Add Banner
              </span>
            </Button>
            <Button
              tone='secondary'
              onClick={() => window.open('/', '_blank', 'noopener,noreferrer')}
            >
              Preview
            </Button>
          </div>
        }
      />

      {error ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], color: colors.danger, marginBottom: spacing['8'], fontSize: typography.sm }}>
          <AlertCircle size={14} />
          {error}
        </div>
      ) : null}
      {message ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], color: colors.success, marginBottom: spacing['8'], fontSize: typography.sm }}>
          <CheckCircle2 size={14} />
          {message}
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: spacing['24'],
          minHeight: 560,
        }}
      >
        {/* Banner list */}
        <Panel density='dense'>
          <div style={{ marginBottom: spacing['12'], paddingBottom: spacing['12'], borderBottom: `1px solid ${colors.border}` }}>
            <span style={{ color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.medium) }}>
              All 4 home-page offer banners (image + CTA only)
            </span>
          </div>
          {loading ? (
            <div style={{ color: colors.textSecondary, fontSize: typography.sm }}>Loading…</div>
          ) : banners.length === 0 ? (
            <EmptyState title='No banners yet' description='Add up to 4 offer banners shown on the home page.' />
          ) : (
            <div style={{ display: 'grid', gap: spacing['8'] }}>
              {banners.map((banner, index) => (
                <BannerCard
                  key={banner.id}
                  banner={banner}
                  index={index}
                  selected={selectedId === banner.id}
                  onSelect={() => setSelectedId(banner.id)}
                />
              ))}
            </div>
          )}
        </Panel>

        {/* Edit panel */}
        <Panel density='dense'>
          {!selected ? (
            <EmptyState title='Select a banner to edit' description='Choose a banner from the list to edit its image, link, and CTA.' />
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
                  <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>Editing</span>
                  <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold) }}>
                    {selected.id}
                  </span>
                </div>
                <div style={{ display: 'inline-flex', gap: spacing['8'] }}>
                  <Button
                    tone='secondary'
                    onClick={() => handleToggle(selected.id, selected.enabled === false)}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                      {selected.enabled !== false ? <EyeOff size={14} /> : <Eye size={14} />}
                      {selected.enabled !== false ? 'Disable' : 'Enable'}
                    </span>
                  </Button>
                  <Button tone='danger' disabled={saving} onClick={handleDelete}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                      <Trash2 size={14} color={colors.textInverted} />
                      Delete
                    </span>
                  </Button>
                  <Button tone='primary' disabled={saving || uploading} onClick={handleSave}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                      <Save size={14} color={colors.textInverted} />
                      {saving ? 'Saving…' : 'Save'}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Image section */}
              <div style={{ marginBottom: spacing['16'] }}>
                <span style={{ ...labelStyle, display: 'block', marginBottom: spacing['8'] }}>
                  Banner Image
                </span>

                {/* Preview + drop zone — exact banner ratio */}
                <UploadZone
                  imageUrl={imageUrl}
                  uploading={uploading}
                  onPick={() => fileInputRef.current?.click()}
                  onClear={() => setImageUrl('')}
                  onDropFile={uploadFile}
                />

                {/* Dimension hint */}
                <p style={{ margin: `${spacing['8']}px 0 0`, color: colors.textSecondary, fontSize: typography.xs, lineHeight: 1.5 }}>
                  Auto-cropped to <strong style={{ color: colors.textPrimary }}>{BANNER_W}×{BANNER_H}px</strong> — matches the live banner exactly. JPEG, PNG or WebP · max 4 MB.
                </p>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/jpeg,image/png,image/webp'
                  aria-label='Upload banner image'
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>

              <div style={{ display: 'grid', gap: spacing['12'] }}>
                <label style={{ display: 'grid', gap: spacing['4'] }}>
                  <span style={labelStyle}>Image URL</span>
                  <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder='https://… or /uploads/offer-banners/…'
                    style={inputStyle}
                  />
                </label>

                <label style={{ display: 'grid', gap: spacing['4'] }}>
                  <span style={labelStyle}>Banner Link (href)</span>
                  <input
                    value={href}
                    onChange={(e) => setHref(e.target.value)}
                    placeholder='/shop/categories/skincare'
                    style={inputStyle}
                  />
                </label>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                    gap: spacing['12'],
                  }}
                >
                  <label style={{ display: 'grid', gap: spacing['4'] }}>
                    <span style={labelStyle}>CTA Label (EN)</span>
                    <input
                      value={ctaEn}
                      onChange={(e) => setCtaEn(e.target.value)}
                      placeholder='Shop Skincare'
                      style={inputStyle}
                    />
                  </label>
                  <label style={{ display: 'grid', gap: spacing['4'] }}>
                    <span style={labelStyle}>CTA Label (AR)</span>
                    <input
                      value={ctaAr}
                      onChange={(e) => setCtaAr(e.target.value)}
                      placeholder='تسوق العناية بالبشرة'
                      style={{ ...inputStyle, direction: 'rtl' }}
                    />
                  </label>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], cursor: 'pointer' }}>
                  <input
                    type='checkbox'
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: typography.sm, color: colors.textPrimary }}>Enabled (visible on home page)</span>
                </label>

                {selected.updatedAt ? (
                  <p style={{ margin: 0, fontSize: typography.xs, color: colors.textSecondary, fontFamily: 'monospace' }}>
                    Last saved {new Date(selected.updatedAt).toLocaleString()} by {selected.updatedBy?.email}
                  </p>
                ) : null}
              </div>
            </>
          )}
        </Panel>
      </div>
    </PageContainer>
  )
}

const labelStyle = {
  color: colors.textSecondary,
  fontSize: typography.xs,
  fontWeight: Number(fontWeights.medium),
} as const

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
  boxSizing: 'border-box' as const,
} as const
