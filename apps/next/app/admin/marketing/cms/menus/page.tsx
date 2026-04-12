'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Save, Trash2 } from 'lucide-react'
import type {
  AdminMenuRecord,
  MegaMenuCategoryConfig,
  MenuItemRecord,
} from '@real/app/lib/types'
import { apiClient } from '../../../../apiClient'
import { colors, fontWeights, radius, spacing, status, typography } from '@real/tokens'
import {
  Button,
  EmptyState,
  Field,
  PageContainer,
  PageHeader,
  Panel,
  SelectInput,
  TextInput,
} from '../../../_components/AdminPagePrimitives'
import { AdminLoadingSkeleton, AdminErrorState } from '../../../_components/AdminLoadingFeedback'
import { MenuItemsBuilder } from './_components/MenuItemsBuilder'

type MenuDraft = {
  id: string
  name: string
  slug: string
  location: 'header_primary' | 'header_mega_categories'
  displayStyle: 'default' | 'mega_category'
  enabled: boolean
  impressionKey: string
  clickKey: string
  itemsJson: string
  megaConfigJson: string
}

function createEmptyDraft(): MenuDraft {
  return {
    id: '',
    name: '',
    slug: '',
    location: 'header_primary',
    displayStyle: 'default',
    enabled: true,
    impressionKey: '',
    clickKey: '',
    itemsJson: JSON.stringify([], null, 2),
    megaConfigJson: JSON.stringify([], null, 2),
  }
}

function toDraft(menu: AdminMenuRecord): MenuDraft {
  return {
    id: menu.id,
    name: menu.name,
    slug: menu.slug,
    location: menu.location,
    displayStyle: menu.displayStyle,
    enabled: menu.enabled,
    impressionKey: menu.analytics?.impressionKey ?? '',
    clickKey: menu.analytics?.clickKey ?? '',
    itemsJson: JSON.stringify(menu.items ?? [], null, 2),
    megaConfigJson: JSON.stringify(menu.megaMenuConfig ?? [], null, 2),
  }
}

function safeParseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export default function AdminMenusPage() {
  const { t } = useTranslation('admin')
  const [rows, setRows] = useState<AdminMenuRecord[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<MenuDraft | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const loadMenus = async () => {
    try {
      const menus = await apiClient.admin.listMenus()
      setRows(menus)
      return menus
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('menus.itemsJsonInvalid'))
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    void loadMenus().then((menus) => {
      if (cancelled || !menus || menus.length === 0) return
      setSelectedId(menus[0].id)
      setDraft(toDraft(menus[0]))
      setIsCreating(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const selected = useMemo(
    () => rows.find((item) => item.id === selectedId) ?? null,
    [rows, selectedId]
  )

  const selectMenu = (menu: AdminMenuRecord) => {
    setSelectedId(menu.id)
    setDraft(toDraft(menu))
    setIsCreating(false)
    setError(null)
    setMessage(null)
  }

  const startCreate = () => {
    setSelectedId(null)
    setDraft(createEmptyDraft())
    setIsCreating(true)
    setError(null)
    setMessage(null)
  }

  const updateDraft = <K extends keyof MenuDraft>(key: K, value: MenuDraft[K]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current))
  }

  const handleSave = async () => {
    if (!draft) return

    let items: MenuItemRecord[] = []
    let megaMenuConfig: MegaMenuCategoryConfig[] = []
    try {
      items = safeParseJson<MenuItemRecord[]>(draft.itemsJson, [])
      megaMenuConfig = safeParseJson<MegaMenuCategoryConfig[]>(draft.megaConfigJson, [])
      JSON.parse(draft.itemsJson)
      JSON.parse(draft.megaConfigJson)
    } catch {
      setError(t('menus.itemsJsonInvalid'))
      return
    }

    setSaving(true)
    setError(null)
    setMessage(null)

    const payload = {
      id: draft.id.trim(),
      name: draft.name.trim(),
      slug: draft.slug.trim(),
      location: draft.location,
      displayStyle: draft.displayStyle,
      enabled: draft.enabled,
      analytics: {
        impressionKey: draft.impressionKey.trim() || undefined,
        clickKey: draft.clickKey.trim() || undefined,
      },
      items,
      megaMenuConfig,
    }

    try {
      const saved = isCreating
        ? await apiClient.admin.createMenu(payload)
        : await apiClient.admin.updateMenu(draft.id, payload)
      setMessage(isCreating ? t('menus.menuCreated') : t('menus.menuSaved'))
      const menus = await loadMenus()
      if (menus) {
        setSelectedId(saved.id)
        const next = menus.find((item) => item.id === saved.id) ?? saved
        setDraft(toDraft(next))
        setIsCreating(false)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save menu.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!draft || isCreating) return
    if (!window.confirm(t('menus.deleteConfirm', { name: draft.name || draft.id }))) {
      return
    }

    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      await apiClient.admin.deleteMenu(draft.id)
      setMessage('Menu deleted.')
      const menus = await loadMenus()
      if (menus && menus.length > 0) {
        setSelectedId(menus[0].id)
        setDraft(toDraft(menus[0]))
        setIsCreating(false)
      } else {
        setSelectedId(null)
        setDraft(null)
        setIsCreating(false)
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to delete menu.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer dense>
      <PageHeader
        title={t('menus.title')}
        subtitle={t('menus.subtitle')}
        actions={
          <div style={{ display: 'inline-flex', gap: spacing['8'] }}>
            <Button tone='secondary' onClick={startCreate}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                <Plus size={14} />
                {t('menus.createMenu')}
              </span>
            </Button>
            <Button tone='primary' disabled={!draft || saving} onClick={handleSave}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                <Save size={14} color={colors.textInverted} />
                {saving ? t('menus.saving') : t('menus.saveMenu')}
              </span>
            </Button>
          </div>
        }
      />

      {error ? (
        <div style={noticeStyle(status.error.subtle, colors.danger)}>{error}</div>
      ) : null}
      {message ? (
        <div style={noticeStyle(status.success.subtle, colors.success)}>{message}</div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px minmax(0, 1fr)',
          gap: spacing['24'],
          alignItems: 'start',
        }}
      >
        <Panel density='dense'>
          <div style={panelTitleStyle}>{t('menus.listTitle')}</div>
          {error ? (
            <AdminErrorState message={error} onRetry={() => void loadMenus()} />
          ) : loading ? (
            <AdminLoadingSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState title={t('menus.emptyTitle')} description={t('menus.emptyDescription')} />
          ) : (
            <div style={{ display: 'grid', gap: spacing['8'] }}>
              {rows.map((menu) => {
                const selectedRow = menu.id === selectedId && !isCreating
                return (
                  <button
                    key={menu.id}
                    type='button'
                    onClick={() => selectMenu(menu)}
                    className='admin-focus-ring'
                    style={{
                      width: '100%',
                      textAlign: 'start',
                      border: `1px solid ${selectedRow ? colors.brandPrimary : colors.border}`,
                      borderRadius: radius.xl,
                      backgroundColor: selectedRow ? colors.surfaceMuted : colors.surface,
                      padding: spacing['12'],
                      cursor: 'pointer',
                      display: 'grid',
                      gap: spacing['4'],
                    }}
                  >
                    <div style={{ color: colors.textPrimary, fontWeight: Number(fontWeights.semibold) }}>
                      {menu.name}
                    </div>
                    <div style={secondaryTextStyle}>
                      {menu.location} · {menu.displayStyle}
                    </div>
                    <div style={secondaryTextStyle}>{menu.slug}</div>
                  </button>
                )
              })}
            </div>
          )}
        </Panel>

        {!draft ? (
          <Panel density='dense'>
            <EmptyState
              title={t('menus.noSelectionTitle')}
              description={t('menus.noSelectionDescription')}
            />
          </Panel>
        ) : (
          <div style={{ display: 'grid', gap: spacing['20'] }}>
            <Panel density='dense'>
              <div style={panelTitleStyle}>{t('menus.menuDetails')}</div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: spacing['12'],
                }}
              >
                <Field label={t('menus.menuId')}>
                  <TextInput
                    value={draft.id}
                    onChange={(e) => updateDraft('id', e.target.value)}
                    placeholder={t('menus.placeholders.menuId')}
                  />
                </Field>
                <Field label={t('menus.name')}>
                  <TextInput
                    value={draft.name}
                    onChange={(e) => updateDraft('name', e.target.value)}
                    placeholder={t('menus.placeholders.name')}
                  />
                </Field>
                <Field label={t('menus.slug')}>
                  <TextInput
                    value={draft.slug}
                    onChange={(e) => updateDraft('slug', e.target.value)}
                    placeholder={t('menus.placeholders.slug')}
                  />
                </Field>
                <Field label={t('menus.location')}>
                  <SelectInput
                    value={draft.location}
                    onChange={(e) =>
                      updateDraft(
                        'location',
                        e.target.value as MenuDraft['location']
                      )
                    }
                  >
                    <option value='header_primary'>{t('menus.locationOptions.headerPrimary')}</option>
                    <option value='header_mega_categories'>{t('menus.locationOptions.headerMegaCategories')}</option>
                  </SelectInput>
                </Field>
                <Field label={t('menus.displayStyle')}>
                  <SelectInput
                    value={draft.displayStyle}
                    onChange={(e) =>
                      updateDraft(
                        'displayStyle',
                        e.target.value as MenuDraft['displayStyle']
                      )
                    }
                  >
                    <option value='default'>{t('menus.displayStyleOptions.default')}</option>
                    <option value='mega_category'>{t('menus.displayStyleOptions.megaCategory')}</option>
                  </SelectInput>
                </Field>
                <Field label={t('menus.impressionAnalyticsKey')}>
                  <TextInput
                    value={draft.impressionKey}
                    onChange={(e) => updateDraft('impressionKey', e.target.value)}
                    placeholder={t('menus.placeholders.impressionKey')}
                  />
                </Field>
                <Field label={t('menus.clickAnalyticsKey')}>
                  <TextInput
                    value={draft.clickKey}
                    onChange={(e) => updateDraft('clickKey', e.target.value)}
                    placeholder={t('menus.placeholders.clickKey')}
                  />
                </Field>
              </div>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: spacing['8'],
                  marginTop: spacing['12'],
                  cursor: 'pointer',
                }}
              >
                <input
                  type='checkbox'
                  checked={draft.enabled}
                  onChange={(e) => updateDraft('enabled', e.target.checked)}
                />
                <span style={{ color: colors.textPrimary, fontSize: typography.sm }}>
                  {t('menus.enabled')}
                </span>
              </label>

              {!isCreating ? (
                <div style={{ marginTop: spacing['16'], display: 'flex', justifyContent: 'flex-end' }}>
                  <Button tone='danger' disabled={saving} onClick={handleDelete}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: spacing['4'] }}>
                      <Trash2 size={14} color={colors.textInverted} />
                      {t('menus.deleteMenu')}
                    </span>
                  </Button>
                </div>
              ) : null}
            </Panel>

            <Panel density='dense'>
              <div style={panelTitleStyle}>{t('menus.menuStructure')}</div>
              <div style={secondaryTextStyle}>{t('menus.validationHint')}</div>
              <MenuItemsBuilder
                itemsJson={draft.itemsJson}
                onChange={(json) => updateDraft('itemsJson', json)}
              />
            </Panel>

            <Panel density='dense'>
              <div style={panelTitleStyle}>{t('menus.megaConfig')}</div>
              <Field label={t('menus.megaMenuConfigJson')}>
                <textarea
                  value={draft.megaConfigJson}
                  onChange={(e) => updateDraft('megaConfigJson', e.target.value)}
                  className='admin-focus-ring'
                  style={textareaStyle}
                />
              </Field>
            </Panel>
          </div>
        )}
      </div>
    </PageContainer>
  )
}

function noticeStyle(backgroundColor: string, color: string) {
  return {
    marginBottom: spacing['16'],
    borderRadius: radius.xl,
    padding: spacing['12'],
    backgroundColor,
    color,
    fontSize: typography.sm,
  }
}

const panelTitleStyle = {
  marginBottom: spacing['12'],
  color: colors.textPrimary,
  fontSize: typography.md,
  fontWeight: Number(fontWeights.semibold),
} as const

const secondaryTextStyle = {
  color: colors.textSecondary,
  fontSize: typography.xs,
} as const

const textareaStyle = {
  width: '100%',
  minHeight: 280,
  border: `1px solid ${colors.border}`,
  borderRadius: radius.xl,
  backgroundColor: colors.surface,
  color: colors.textPrimary,
  padding: spacing['12'],
  fontSize: typography.xs,
  fontFamily: 'monospace',
  outline: 'none',
  resize: 'vertical' as const,
} as const
