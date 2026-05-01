'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { AdminUserControlRecord } from '@real/app/lib/types'
import { apiClient } from '../../../apiClient'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import { Button, StatusPill } from '../../_components/AdminPagePrimitives'

const DOMAINS = [
  { key: 'catalog', label: 'Catalog' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'sales', label: 'Sales' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'marketplace', label: 'Marketplace' },
  { key: 'customers', label: 'Customers' },
  { key: 'operations', label: 'Operations' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'settings', label: 'Settings' },
] as const

export function EditPermissionsSlideOver({
  user,
  open,
  onClose,
  onUpdated,
}: {
  user: AdminUserControlRecord | null
  open: boolean
  onClose: () => void
  onUpdated: () => void
}) {
  const [domainPermissions, setDomainPermissions] = useState<Record<string, 'none' | 'read' | 'full'>>(
    () => ((user?.domainPermissions as Record<string, 'none' | 'read' | 'full'>) ?? {}) as Record<string, 'none' | 'read' | 'full'>,
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open || !user) return null

  const toggleDomain = (key: string) => {
    setDomainPermissions((prev) => {
      const next = { ...prev }
      const current = next[key]
      if (!current || current === 'none') next[key] = 'full'
      else if (current === 'full') next[key] = 'read'
      else delete next[key]
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await apiClient.admin.updateUser(user.id, {
        domainPermissions: Object.keys(domainPermissions).length > 0 ? domainPermissions : undefined,
      } as never)
      onUpdated()
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to update permissions.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 40 }}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, width: 480, maxWidth: '100vw',
        height: '100vh', backgroundColor: colors.surface,
        borderLeft: `1px solid ${colors.border}`, zIndex: 50,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${spacing['16']}px ${spacing['24']}px`,
          borderBottom: `1px solid ${colors.border}`,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: typography.lg, fontWeight: Number(fontWeights.semibold), color: colors.textPrimary }}>
              Edit Permissions
            </h2>
            <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.xs }}>
              {user.name} · {user.email} · <StatusPill tone="neutral">{user.role}</StatusPill>
            </p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose}
            className="admin-focus-ring"
            style={{ border: 0, background: 'transparent', cursor: 'pointer', color: colors.textSecondary, padding: spacing['4'] }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: spacing['24'] }}>
          <div style={{ display: 'grid', gap: spacing['8'] }}>
            <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.semibold), textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Domain Permissions
            </p>
            <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.xs }}>
              Click to cycle: Off → Full → Read → Off. Empty = role-based fallback.
            </p>
            <div style={{ display: 'grid', gap: spacing['4'] }}>
              {DOMAINS.map((d) => {
                const value = domainPermissions[d.key]
                const tone = value === 'full' ? 'success' : value === 'read' ? 'warning' : undefined
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => toggleDomain(d.key)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: `${spacing['8']}px ${spacing['12']}px`,
                      border: `1px solid ${colors.border}`,
                      borderRadius: radius.md,
                      backgroundColor: value ? colors.surfaceMuted : colors.surface,
                      cursor: 'pointer',
                      textAlign: 'start',
                    }}
                  >
                    <span style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.medium) }}>
                      {d.label}
                    </span>
                    <StatusPill tone={tone ?? 'neutral'}>
                      {value === 'full' ? 'Full' : value === 'read' ? 'Read' : 'None'}
                    </StatusPill>
                  </button>
                )
              })}
            </div>
            {error && (
              <p style={{ margin: 0, color: colors.danger, fontSize: typography.sm }}>{error}</p>
            )}
          </div>
        </div>

        <div style={{
          padding: `${spacing['16']}px ${spacing['24']}px`,
          borderTop: `1px solid ${colors.border}`,
          display: 'flex', gap: spacing['8'], justifyContent: 'flex-end',
        }}>
          <Button tone="ghost" onClick={onClose}>Cancel</Button>
          <Button tone="primary" onClick={() => { void handleSave() }} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </>
  )
}
