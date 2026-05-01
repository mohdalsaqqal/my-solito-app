'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { AdminCreateUserInput, AuthRole } from '@real/app/lib/types'
import { apiClient } from '../../../apiClient'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'
import {
  Button,
  Field,
  SelectInput,
  StatusPill,
  TextInput,
} from '../../_components/AdminPagePrimitives'

const ADMIN_DOMAINS = [
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

const AVAILABLE_ROLES = [
  { value: 'admin', label: 'Admin Panel User' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'customer', label: 'Customer' },
] as const

export function AddUserSlideOver({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<AuthRole>('admin' as AuthRole)
  const [domainPermissions, setDomainPermissions] = useState<Record<string, 'none' | 'read' | 'full'>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setName('')
    setEmail('')
    setPassword('')
    setRole('admin')
    setDomainPermissions({})
    setError(null)
  }

  const handleSave = async () => {
    setError(null)
    if (!name.trim()) { setError('Name is required.'); return }
    if (!email.trim() || !email.includes('@')) { setError('A valid email is required.'); return }
    if (!password || password.length < 8) { setError('Password must be at least 8 characters.'); return }

    setSaving(true)
    try {
      const input: AdminCreateUserInput = { name: name.trim(), email: email.trim(), password, role }
      if (role === 'admin' && Object.keys(domainPermissions).length > 0) {
        input.domainPermissions = domainPermissions as AdminCreateUserInput['domainPermissions']
      }
      await apiClient.admin.createUser(input)
      resetForm()
      onCreated()
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Failed to create user.')
    } finally {
      setSaving(false)
    }
  }

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

  if (!open) return null

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
          <h2 style={{ margin: 0, fontSize: typography.lg, fontWeight: Number(fontWeights.semibold), color: colors.textPrimary }}>
            Create User
          </h2>
          <button type="button" aria-label="Close panel" onClick={onClose}
            className="admin-focus-ring"
            style={{ border: 0, background: 'transparent', cursor: 'pointer', color: colors.textSecondary, padding: spacing['4'] }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: spacing['24'] }}>
          <div style={{ display: 'grid', gap: spacing['16'] }}>
            <Field label="Full Name">
              <TextInput value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Email Address">
              <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Password" hint="Minimum 8 characters">
              <TextInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="········" />
            </Field>
            <Field label="Role">
              <SelectInput value={role} onChange={(e) => setRole(e.target.value as AuthRole)}>
                {AVAILABLE_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </SelectInput>
            </Field>

            {role === 'admin' && (
              <div style={{ display: 'grid', gap: spacing['8'] }}>
                <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.xs, fontWeight: Number(fontWeights.semibold), textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Section Access
                </p>
                <p style={{ margin: 0, color: colors.textSecondary, fontSize: typography.xs }}>
                  Select which sections this user can access. Click to cycle: Off → Full → Read → Off.
                </p>
                <div style={{ display: 'grid', gap: spacing['4'] }}>
                  {ADMIN_DOMAINS.map((d) => {
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
              </div>
            )}

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
          <Button tone="ghost" onClick={() => { resetForm(); onClose() }}>Cancel</Button>
          <Button tone="primary" onClick={() => { void handleSave() }} disabled={saving}>
            {saving ? 'Creating...' : 'Create User'}
          </Button>
        </div>
      </div>
    </>
  )
}
