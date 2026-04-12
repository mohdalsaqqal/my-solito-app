'use client'

import { useEffect, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { colors, radius, spacing, typography, fontWeights } from '@real/tokens'

export const blockEditorChromeTokens = {
  uploadOverlay:
    'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 60%, transparent 100%)',
  uploadProcessingOverlay: 'rgba(255,255,255,0.75)',
  clearButtonBackground: 'rgba(0,0,0,0.55)',
  clearButtonHoverBackground: 'rgba(0,0,0,0.82)',
  clearButtonMutedBackground: 'rgba(0,0,0,0.5)',
  metadataBadgeBackground: 'rgba(0,0,0,0.66)',
} as const

export function UploadZone({
  imageUrl,
  uploading,
  onPick,
  onClear,
  onDropFile,
  aspectW = 16,
  aspectH = 9,
  frameWidth,
  frameHeight,
  previewFit = 'contain',
}: {
  imageUrl: string
  uploading: boolean
  onPick: () => void
  onClear: () => void
  onDropFile?: (file: File) => void
  aspectW?: number
  aspectH?: number
  frameWidth?: number
  frameHeight?: number
  previewFit?: 'contain' | 'cover'
}) {
  const [hovered, setHovered] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null)
  const active = hovered || dragOver

  useEffect(() => {
    if (!imageUrl) {
      setNaturalSize(null)
      return
    }

    let cancelled = false
    const image = new window.Image()
    image.onload = () => {
      if (!cancelled) {
        setNaturalSize({ width: image.naturalWidth, height: image.naturalHeight })
      }
    }
    image.onerror = () => {
      if (!cancelled) {
        setNaturalSize(null)
      }
    }
    image.src = imageUrl

    return () => {
      cancelled = true
    }
  }, [imageUrl])

  return (
    <div
      className='admin-focus-ring'
      role='button'
      tabIndex={0}
      aria-label='Upload image'
      onClick={uploading ? undefined : onPick}
      onKeyDown={(e) => {
        if (!uploading && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onPick()
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f && f.type.startsWith('image/')) onDropFile?.(f) }}
      style={{
        position: 'relative',
        width: frameWidth ?? '100%',
        height: frameHeight,
        maxWidth: frameWidth ? undefined : '100%',
        marginInline: frameWidth ? 'auto' : undefined,
        aspectRatio: frameHeight ? undefined : `${aspectW} / ${aspectH}`,
        minHeight: frameHeight ?? 220,
        borderRadius: radius.xl,
        overflow: 'hidden',
        cursor: uploading ? 'not-allowed' : 'pointer',
        border: `2px dashed ${dragOver ? colors.brandPrimary : active ? colors.textSecondary : colors.border}`,
        transition: 'border-color 160ms ease',
        backgroundColor: dragOver ? colors.brandPrimarySubtle : colors.surfaceMuted,
        boxSizing: 'border-box',
        flex: frameWidth ? `0 0 ${frameWidth}px` : undefined,
      }}
    >
      {imageUrl ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            minHeight: frameHeight ?? 220,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: previewFit === 'cover' ? 0 : spacing['12'],
            boxSizing: 'border-box',
            backgroundColor: colors.surfaceMuted,
          }}
        >
          <img
            src={imageUrl}
            alt=''
            style={{
              width: previewFit === 'cover' ? '100%' : 'auto',
              height: previewFit === 'cover' ? '100%' : 'auto',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: previewFit,
              display: 'block',
              borderRadius: previewFit === 'cover' ? 0 : radius.lg,
            }}
          />
        </div>
      ) : (
        <div style={{ width: '100%', height: '100%', minHeight: frameHeight ?? 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing['8'] }}>
          <div style={{
            width: 44, height: 44, borderRadius: radius.md,
            backgroundColor: active ? colors.brandPrimarySubtle : colors.surface,
            border: `1px solid ${active ? colors.brandPrimary : colors.border}`,
            display: 'grid', placeItems: 'center',
            transition: 'background-color 160ms, border-color 160ms',
          }}>
            <Upload size={18} color={active ? colors.brandPrimary : colors.textSecondary} />
          </div>
          <span style={{ fontSize: typography.xs, color: active ? colors.brandPrimary : colors.textSecondary, fontWeight: Number(fontWeights.medium), transition: 'color 160ms', textAlign: 'center', paddingInline: spacing['12'] }}>
            {dragOver ? 'Drop to upload' : 'Click or drag image here'}
          </span>
        </div>
      )}

      {imageUrl && active && !uploading ? (
        <div style={{
          position: 'absolute', inset: 0,
          background: blockEditorChromeTokens.uploadOverlay,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: spacing['12'],
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: spacing['6'],
            backgroundColor: colors.textPrimary, color: colors.textInverted,
            borderRadius: radius.md, paddingInline: spacing['16'], paddingBlock: spacing['8'],
            fontSize: typography.xs, fontWeight: Number(fontWeights.semibold),
            letterSpacing: '0.04em', textTransform: 'uppercase',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)', pointerEvents: 'none',
          }}>
            <Upload size={12} /> Replace image
          </div>
        </div>
      ) : null}

      {uploading ? (
        <div style={{
          position: 'absolute', inset: 0, backgroundColor: blockEditorChromeTokens.uploadProcessingOverlay,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing['8'],
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: radius.full,
            border: `3px solid ${colors.border}`, borderTopColor: colors.brandPrimary,
            animation: 'spin 0.7s linear infinite',
          }} />
          <span style={{ fontSize: typography.xs, color: colors.textSecondary, fontWeight: Number(fontWeights.medium) }}>Uploading…</span>
        </div>
      ) : null}

      {imageUrl ? (
        <div style={{ position: 'absolute', top: spacing['8'], right: spacing['8'], display: 'grid', gap: spacing['4'], pointerEvents: 'none', justifyItems: 'end' }}>
          {naturalSize ? (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: spacing['4'],
              backgroundColor: blockEditorChromeTokens.metadataBadgeBackground,
              color: colors.textInverted, borderRadius: radius.full,
              padding: `${spacing['4']}px ${spacing['8']}px`,
              fontSize: typography.xs, fontWeight: Number(fontWeights.medium),
            }}>
              {naturalSize.width} x {naturalSize.height}
            </span>
          ) : null}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: spacing['4'],
            backgroundColor: blockEditorChromeTokens.clearButtonMutedBackground,
            color: colors.textInverted, borderRadius: radius.full,
            padding: `${spacing['4']}px ${spacing['8']}px`,
            fontSize: typography.xs,
          }}>
            Recommended frame {aspectW}:{aspectH}
          </span>
        </div>
      ) : null}

      {imageUrl && !uploading ? (
        <button
          type='button'
          aria-label='Remove image'
          onClick={(e) => { e.stopPropagation(); onClear() }}
          style={{
            position: 'absolute', top: spacing['8'], left: spacing['8'], right: 'auto',
            width: 24, height: 24, borderRadius: radius.full, border: 'none',
            backgroundColor: blockEditorChromeTokens.clearButtonBackground, color: colors.textInverted,
            display: 'grid', placeItems: 'center', cursor: 'pointer',
            backdropFilter: 'blur(4px)', transition: 'background-color 150ms',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = blockEditorChromeTokens.clearButtonHoverBackground }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = blockEditorChromeTokens.clearButtonBackground }}
        >
          <X size={12} />
        </button>
      ) : null}
    </div>
  )
}
