import React, { useMemo, useState } from 'react'
import { useWindowDimensions } from 'react-native'
import { useTranslation } from '@real/app/lib/i18n/use-translation'
import { spacing } from '@real/tokens'
import { breakpoints } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Badge, Button, Card, MetricCard } from '@real/ui/components'
import { Box, Input, Text } from '@real/ui/primitives'
import {
  AdminBrandSpotlightRecord,
  AdminCacheAction,
  AdminCacheAuditEntry,
  AdminOpsAuditEntry,
  AuthRole,
  OrderStatus,
  OrderSummary,
} from '@real/app/lib/types'

type AdminMetric = {
  id: string
  label: string
  value: string
  delta?: string
}

type AdminControlToggle = {
  id: string
  label: string
  description?: string
  enabled: boolean
  surface: 'all' | 'web' | 'mobile'
}

type AdminRoleCard = {
  id: string
  name: string
  email: string
  role: AuthRole
  status: 'active' | 'invited' | 'disabled'
  lastActiveLabel?: string
  permissions?: {
    canManageCmsToggles: boolean
    canManageUsers: boolean
    canRunCacheOps: boolean
  }
}

type AdminScreenProps = {
  title?: string
  notice?: string
  metrics?: AdminMetric[]
  controlToggles?: AdminControlToggle[]
  roleCards?: AdminRoleCard[]
  orders?: OrderSummary[]
  loadingOrders?: boolean
  ordersError?: string | null
  updatingOrderId?: string | null
  onReloadOrders?: () => void
  onUpdateOrderStatus?: (orderId: string, status: OrderStatus) => void
  cacheAuditEntries?: AdminCacheAuditEntry[]
  loadingCacheAudit?: boolean
  cacheAuditError?: string | null
  runningCacheAction?: boolean
  cacheActionError?: string | null
  cacheActionSuccess?: string | null
  onReloadCacheAudit?: () => void
  onRunCacheAction?: (input: { action: AdminCacheAction; confirmation: string }) => void
  opsAuditEntries?: AdminOpsAuditEntry[]
  opsAuditLoading?: boolean
  opsAuditError?: string | null
  updatingToggleId?: string | null
  updatingUserId?: string | null
  onReloadOpsAudit?: () => void
  onToggleControl?: (id: string, enabled: boolean) => void
  onUpdateUserRole?: (id: string, role: AuthRole) => void
  onUpdateUserStatus?: (id: string, status: 'active' | 'invited' | 'disabled') => void
  onUpdateUserPermissions?: (
    id: string,
    permissions: Partial<NonNullable<AdminRoleCard['permissions']>>
  ) => void
  onOpenCmsControls?: () => void
  homeMarketingPreview?: {
    rails: Array<{ id: string; enabled: boolean; title: string }>
    brandSpotlights: Array<{ id: string; enabled: boolean; bannerTitle: string; railTitle: string }>
  }
  brandSpotlights?: AdminBrandSpotlightRecord[]
  loadingBrandSpotlights?: boolean
  brandSpotlightsError?: string | null
  updatingBrandSpotlightId?: string | null
  onReloadBrandSpotlights?: () => void
  onCreateBrandSpotlight?: (input: {
    id?: string
    enabled?: boolean
    bannerTitle: { en: string; ar: string }
    bannerSubtitle?: { en: string; ar: string }
    bannerCtaLabel?: { en: string; ar: string }
    bannerHref?: string
    bannerImageUrl?: string
    railTitle: { en: string; ar: string }
    query?: {
      source?: 'best_sellers' | 'new_arrivals' | 'bundle_only' | 'manual_ids'
      limit?: number
      sortBy?: 'price_desc' | 'price_asc' | 'name_asc' | 'name_desc'
      productIds?: string[]
      brandNames?: string[]
    }
  }) => void
  onUpdateBrandSpotlight?: (
    id: string,
    input: {
      enabled?: boolean
      bannerTitle?: { en: string; ar: string }
      bannerSubtitle?: { en: string; ar: string }
      bannerCtaLabel?: { en: string; ar: string }
      bannerHref?: string
      bannerImageUrl?: string
      railTitle?: { en: string; ar: string }
      query?: {
        source?: 'best_sellers' | 'new_arrivals' | 'bundle_only' | 'manual_ids'
        limit?: number
        sortBy?: 'price_desc' | 'price_asc' | 'name_asc' | 'name_desc'
        productIds?: string[]
        brandNames?: string[]
      }
      position?: number
    }
  ) => void
  onDeleteBrandSpotlight?: (id: string) => void
}

type AdminTabKey = 'overview' | 'orders' | 'cms' | 'users' | 'cache'
type UserFilterKey = 'all' | 'admin' | 'pharmacist' | 'customer'

const defaultMetrics: AdminMetric[] = [
  { id: 'sales-day', label: 'Sales Today', value: '12,480', delta: '+6.2%' },
  { id: 'sales-month', label: 'Sales This Month', value: '148,900', delta: '+11.4%' },
  { id: 'sales-year', label: 'Sales This Year', value: '1,843,200', delta: '+19.1%' },
]

const defaultRoleCards: AdminRoleCard[] = [
  {
    id: 'role-admin-default',
    name: 'Master Admin',
    email: 'admin@realcosmetics.local',
    role: 'admin',
    status: 'active',
  },
  {
    id: 'role-pharmacist-default',
    name: 'Pharmacist User',
    email: 'pharma@realcosmetics.local',
    role: 'pharmacist',
    status: 'active',
  },
  {
    id: 'role-customer-default',
    name: 'Customer User',
    email: 'user@realcosmetics.local',
    role: 'customer',
    status: 'active',
  },
]

export const AdminScreen = React.memo(function AdminScreen({
  title = 'Admin Command Center',
  notice = 'Campaign and loyalty updates publish to customer surfaces after approval.',
  metrics = defaultMetrics,
  controlToggles = [],
  roleCards = defaultRoleCards,
  orders = [],
  loadingOrders = false,
  ordersError = null,
  updatingOrderId = null,
  onReloadOrders,
  onUpdateOrderStatus,
  cacheAuditEntries = [],
  loadingCacheAudit = false,
  cacheAuditError = null,
  runningCacheAction = false,
  cacheActionError = null,
  cacheActionSuccess = null,
  onReloadCacheAudit,
  onRunCacheAction,
  opsAuditEntries = [],
  opsAuditLoading = false,
  opsAuditError = null,
  updatingToggleId = null,
  updatingUserId = null,
  onReloadOpsAudit,
  onToggleControl,
  onUpdateUserRole,
  onUpdateUserStatus,
  onUpdateUserPermissions,
  onOpenCmsControls,
  homeMarketingPreview,
  brandSpotlights = [],
  loadingBrandSpotlights = false,
  brandSpotlightsError = null,
  updatingBrandSpotlightId = null,
  onReloadBrandSpotlights,
  onCreateBrandSpotlight,
  onUpdateBrandSpotlight,
  onDeleteBrandSpotlight,
}: AdminScreenProps) {
  const { width } = useWindowDimensions()
  const isCompact = width > 0 && width < breakpoints.tabletMin
  const { t } = useTranslation('admin')
  const [activeTab, setActiveTab] = useState<AdminTabKey>('overview')
  const [userFilter, setUserFilter] = useState<UserFilterKey>('all')
  const [selectedCacheAction, setSelectedCacheAction] = useState<AdminCacheAction>('revalidate_home_shop')
  const [flushConfirmation, setFlushConfirmation] = useState('')
  const [newSpotlightId, setNewSpotlightId] = useState('')
  const [newSpotlightBannerTitleEn, setNewSpotlightBannerTitleEn] = useState('')
  const [newSpotlightBannerTitleAr, setNewSpotlightBannerTitleAr] = useState('')
  const [newSpotlightRailTitleEn, setNewSpotlightRailTitleEn] = useState('')
  const [newSpotlightRailTitleAr, setNewSpotlightRailTitleAr] = useState('')
  const [newSpotlightBrandNames, setNewSpotlightBrandNames] = useState('')
  const [newSpotlightImageUrl, setNewSpotlightImageUrl] = useState('')
  const [newSpotlightHref, setNewSpotlightHref] = useState('/shop')
  const [spotlightDrafts, setSpotlightDrafts] = useState<
    Record<
      string,
      {
        bannerTitleEn: string
        bannerTitleAr: string
        railTitleEn: string
        railTitleAr: string
        brandNamesCsv: string
        imageUrl: string
        href: string
      }
    >
  >({})

  const nextStatusesByCurrent: Record<OrderStatus, OrderStatus[]> = {
    placed: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
  }

  const tabs: Array<{ key: AdminTabKey; label: string }> = [
    { key: 'overview', label: 'Overview' },
    { key: 'orders', label: 'Orders' },
    { key: 'users', label: 'Users & roles' },
    { key: 'cache', label: 'Cache & revalidation' },
  ]

  const cacheActions: Array<{ key: AdminCacheAction; label: string; description: string }> = [
    {
      key: 'revalidate_home_shop',
      label: 'Home + Shop',
      description: 'Revalidates storefront entry surfaces only.',
    },
    {
      key: 'revalidate_all_public',
      label: 'All public pages',
      description: 'Revalidates all customer-facing routes.',
    },
    {
      key: 'revalidate_account_surfaces',
      label: 'Account surfaces',
      description: 'Revalidates account/orders/user pages.',
    },
    {
      key: 'revalidate_admin_surfaces',
      label: 'Admin + Pharmacist',
      description: 'Revalidates role-restricted operations routes.',
    },
    {
      key: 'full_stack_flush',
      label: 'Full stack flush',
      description: 'Revalidates all routes and triggers optional CDN purge.',
    },
  ]

  const filteredRoleCards = useMemo(() => {
    if (userFilter === 'all') {
      return roleCards
    }
    return roleCards.filter((user) => user.role === userFilter)
  }, [roleCards, userFilter])

  const permissionCounts = useMemo(
    () => ({
      cms: filteredRoleCards.filter((user) => user.permissions?.canManageCmsToggles).length,
      users: filteredRoleCards.filter((user) => user.permissions?.canManageUsers).length,
      cache: filteredRoleCards.filter((user) => user.permissions?.canRunCacheOps).length,
    }),
    [filteredRoleCards]
  )

  const sourceOptions: Array<{
    key: 'best_sellers' | 'new_arrivals' | 'bundle_only' | 'manual_ids'
    label: string
  }> = [
    { key: 'best_sellers', label: t('sourceOptions.bestSellers') },
    { key: 'new_arrivals', label: t('sourceOptions.newArrivals') },
    { key: 'bundle_only', label: t('sourceOptions.bundleOnly') },
    { key: 'manual_ids', label: t('sourceOptions.manualIds') },
  ]

  return (
    <PageScaffold variant='dashboard' density='standard' scroll='auto'>
      <PageScaffold.Body>
        <Section>
          <Box gap='24'>
      <Card variant='raised' style={{ gap: spacing['8'] }}>
        <Text variant='h1'>{title}</Text>
        <Text tone='muted'>{notice}</Text>
      </Card>

      <Card variant='raised' style={{ gap: spacing['12'] }}>
        <Text variant='label'>{t('navigation.title')}</Text>
        <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'solid' : 'outline'}
              size='sm'
              onPress={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </Box>
      </Card>

      {activeTab === 'overview' ? (
        <Box gap='16'>
          <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['16'] }}>
            {metrics.map((metric) => (
              <Box key={metric.id} style={{ flexBasis: isCompact ? '100%' : '48%', flexGrow: 1 }}>
                <MetricCard label={metric.label} value={metric.value} delta={metric.delta} />
              </Box>
            ))}
          </Box>

          <Card variant='raised' style={{ gap: spacing['12'] }}>
            <Text variant='title'>{t('navigation.quickActions')}</Text>
            <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
              <Button size='sm' variant='outline' onPress={() => setActiveTab('orders')}>
                {t('navigation.goToOrders')}
              </Button>
              <Button size='sm' variant='outline' onPress={() => onOpenCmsControls?.()}>
                {t('navigation.goToCms')}
              </Button>
              <Button size='sm' variant='outline' onPress={() => setActiveTab('users')}>
                {t('navigation.goToUsers')}
              </Button>
              <Button size='sm' variant='outline' onPress={() => setActiveTab('cache')}>
                {t('navigation.goToCache')}
              </Button>
            </Box>
          </Card>
        </Box>
      ) : null}

      {activeTab === 'orders' ? (
        <Card variant='raised' style={{ gap: spacing['16'] }}>
          <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant='title'>{t('orders.title')}</Text>
            <Button variant='outline' size='sm' onPress={onReloadOrders}>
              {t('cms.spotlights.refresh')}
            </Button>
          </Box>

          {loadingOrders ? (
            <Card tone='subtle' style={{ minHeight: spacing['96'] }} />
          ) : ordersError ? (
            <Card tone='subtle' style={{ gap: spacing['8'] }}>
              <Text tone='danger'>{t('orders.loadError')}</Text>
              <Text tone='muted' variant='bodySm'>{ordersError}</Text>
            </Card>
          ) : orders.length === 0 ? (
            <Card tone='subtle'>
              <Text tone='muted'>{t('orders.empty')}</Text>
            </Card>
          ) : (
            <Box style={{ gap: spacing['8'] }}>
              {orders.map((order) => {
                const nextStatuses = nextStatusesByCurrent[order.status]
                return (
                  <Card key={order.id} tone='subtle' style={{ gap: spacing['8'] }}>
                    <Box style={{ gap: spacing['4'] }}>
                      <Text variant='label'>Order {order.id}</Text>
                      <Text variant='caption' tone='muted'>
                        {new Date(order.createdAt).toLocaleString()} • {order.currency} {order.total.toFixed(2)}
                      </Text>
                      <Text variant='bodySm'>Status: {order.status}</Text>
                    </Box>

                    {nextStatuses.length === 0 ? (
                      <Text variant='caption' tone='muted'>
                        Terminal status. No further transitions.
                      </Text>
                    ) : (
                      <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
                        {nextStatuses.map((status) => (
                          <Button
                            key={`${order.id}-${status}`}
                            size='sm'
                            variant='outline'
                            disabled={updatingOrderId === order.id}
                            onPress={() => onUpdateOrderStatus?.(order.id, status)}
                          >
                            Mark as {status}
                          </Button>
                        ))}
                      </Box>
                    )}
                  </Card>
                )
              })}
            </Box>
          )}
        </Card>
      ) : null}

      {activeTab === 'cms' ? (
        <Box gap='16'>
          <Card variant='raised' style={{ gap: spacing['12'] }}>
            <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text variant='title'>{t('cms.toggles.title')}</Text>
              <Badge tone='outline'>
                {controlToggles.filter((item) => item.enabled).length}/{controlToggles.length || 0} active
              </Badge>
            </Box>
            {controlToggles.length === 0 ? (
              <Text tone='muted'>{t('cms.toggles.empty')}</Text>
            ) : (
              <Box style={{ gap: spacing['8'] }}>
                {controlToggles.map((toggle) => (
                  <Card key={toggle.id} tone='subtle' style={{ gap: spacing['6'] }}>
                    <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing['8'] }}>
                      <Text variant='label'>{toggle.label}</Text>
                      <Badge tone={toggle.enabled ? 'accent' : 'outline'}>
                        {toggle.enabled ? t('cms.toggles.enabled') : t('cms.toggles.disabled')}
                      </Badge>
                    </Box>
                    {toggle.description ? (
                      <Text variant='bodySm' tone='muted'>
                        {toggle.description}
                      </Text>
                    ) : null}
                    <Text variant='caption' tone='muted'>
                      {t('cms.toggles.surface', { surface: toggle.surface })}
                    </Text>
                    <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
                      <Button
                        size='sm'
                        variant='outline'
                        disabled={updatingToggleId === toggle.id || toggle.enabled}
                        onPress={() => onToggleControl?.(toggle.id, true)}
                      >
                        {t('cms.toggles.enable')}
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        disabled={updatingToggleId === toggle.id || !toggle.enabled}
                        onPress={() => onToggleControl?.(toggle.id, false)}
                      >
                        {t('cms.toggles.disable')}
                      </Button>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </Card>

          <Card variant='raised' style={{ gap: spacing['12'] }}>
            <Text variant='title'>{t('cms.marketingBlocks.title')}</Text>
            <Box style={{ gap: spacing['8'] }}>
              <Text variant='label'>Rails ({homeMarketingPreview?.rails.length ?? 0})</Text>
              {(homeMarketingPreview?.rails.length ?? 0) === 0 ? (
                <Text tone='muted'>{t('cms.marketingBlocks.noRails')}</Text>
              ) : (
                <Box style={{ gap: spacing['8'] }}>
                  {homeMarketingPreview?.rails.map((rail) => (
                    <Card key={`rail-${rail.id}`} tone='subtle' style={{ gap: spacing['4'] }}>
                      <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing['8'] }}>
                        <Text variant='label'>{rail.title}</Text>
                        <Badge tone={rail.enabled ? 'accent' : 'outline'}>
                          {rail.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </Box>
                      <Text variant='caption' tone='muted'>
                        ID: {rail.id}
                      </Text>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>

            <Box style={{ gap: spacing['8'] }}>
              <Text variant='label'>Brand spotlights ({homeMarketingPreview?.brandSpotlights.length ?? 0})</Text>
              {(homeMarketingPreview?.brandSpotlights.length ?? 0) === 0 ? (
                <Text tone='muted'>{t('cms.marketingBlocks.noSpotlights')}</Text>
              ) : (
                <Box style={{ gap: spacing['8'] }}>
                  {homeMarketingPreview?.brandSpotlights.map((spotlight) => (
                    <Card key={`spotlight-${spotlight.id}`} tone='subtle' style={{ gap: spacing['4'] }}>
                      <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing['8'] }}>
                        <Text variant='label'>{spotlight.bannerTitle}</Text>
                        <Badge tone={spotlight.enabled ? 'accent' : 'outline'}>
                          {spotlight.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </Box>
                      <Text variant='bodySm' tone='muted'>
                        Rail: {spotlight.railTitle}
                      </Text>
                      <Text variant='caption' tone='muted'>
                        ID: {spotlight.id}
                      </Text>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>

            <Box style={{ gap: spacing['8'] }}>
              <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing['8'] }}>
                <Text variant='label'>{t('cms.spotlights.title')}</Text>
                <Button size='sm' variant='outline' onPress={onReloadBrandSpotlights}>
                  {t('cms.spotlights.refresh')}
                </Button>
              </Box>
              <Card tone='subtle' style={{ gap: spacing['8'] }}>
                <Text variant='label'>{t('cms.spotlights.add')}</Text>
                <Input value={newSpotlightId} onChangeText={setNewSpotlightId} placeholder={t('cms.placeholders.spotlightId')} />
                <Input value={newSpotlightBannerTitleEn} onChangeText={setNewSpotlightBannerTitleEn} placeholder={t('cms.placeholders.bannerTitleEn')} />
                <Input value={newSpotlightBannerTitleAr} onChangeText={setNewSpotlightBannerTitleAr} placeholder={t('cms.placeholders.bannerTitleAr')} />
                <Input value={newSpotlightRailTitleEn} onChangeText={setNewSpotlightRailTitleEn} placeholder={t('cms.placeholders.railTitleEn')} />
                <Input value={newSpotlightRailTitleAr} onChangeText={setNewSpotlightRailTitleAr} placeholder={t('cms.placeholders.railTitleAr')} />
                <Input value={newSpotlightBrandNames} onChangeText={setNewSpotlightBrandNames} placeholder={t('cms.placeholders.brandNamesCsv')} />
                <Input value={newSpotlightImageUrl} onChangeText={setNewSpotlightImageUrl} placeholder={t('cms.placeholders.bannerImageUrl')} />
                <Input value={newSpotlightHref} onChangeText={setNewSpotlightHref} placeholder={t('cms.placeholders.bannerHref')} />
                <Box style={{ flexDirection: 'row', gap: spacing['8'] }}>
                  <Button
                    size='sm'
                    disabled={
                      updatingBrandSpotlightId === 'new' ||
                      !newSpotlightBannerTitleEn.trim() ||
                      !newSpotlightBannerTitleAr.trim() ||
                      !newSpotlightRailTitleEn.trim() ||
                      !newSpotlightRailTitleAr.trim()
                    }
                    onPress={() => {
                      const brandNames = newSpotlightBrandNames
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean)
                      onCreateBrandSpotlight?.({
                        id: newSpotlightId.trim() || undefined,
                        enabled: true,
                        bannerTitle: {
                          en: newSpotlightBannerTitleEn.trim(),
                          ar: newSpotlightBannerTitleAr.trim(),
                        },
                        railTitle: {
                          en: newSpotlightRailTitleEn.trim(),
                          ar: newSpotlightRailTitleAr.trim(),
                        },
                        bannerHref: newSpotlightHref.trim() || '/shop',
                        bannerImageUrl: newSpotlightImageUrl.trim() || undefined,
                        query: {
                          source: 'best_sellers',
                          limit: 8,
                          sortBy: 'price_desc',
                          brandNames,
                        },
                      })
                    }}
                  >
                    {updatingBrandSpotlightId === 'new' ? t('cms.spotlights.adding') : t('cms.spotlights.add')}
                  </Button>
                </Box>
              </Card>

              {loadingBrandSpotlights ? (
                <Card tone='subtle' style={{ minHeight: spacing['80'] }} />
              ) : brandSpotlights.length === 0 ? (
                <Text tone='muted'>{t('cms.spotlights.noRecords')}</Text>
              ) : (
                <Box style={{ gap: spacing['8'] }}>
                  {brandSpotlights.map((spotlight, index) => {
                    const draft = spotlightDrafts[spotlight.id] ?? {
                      bannerTitleEn: spotlight.bannerTitle.en,
                      bannerTitleAr: spotlight.bannerTitle.ar,
                      railTitleEn: spotlight.railTitle.en,
                      railTitleAr: spotlight.railTitle.ar,
                      brandNamesCsv: (spotlight.query?.brandNames ?? []).join(', '),
                      imageUrl: spotlight.bannerImageUrl ?? '',
                      href: spotlight.bannerHref ?? '/shop',
                    }
                    const setDraft = (next: Partial<typeof draft>) => {
                      setSpotlightDrafts((current) => ({
                        ...current,
                        [spotlight.id]: {
                          ...draft,
                          ...next,
                        },
                      }))
                    }
                    return (
                      <Card key={`spotlight-editor-${spotlight.id}`} tone='subtle' style={{ gap: spacing['8'] }}>
                        <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing['8'] }}>
                          <Text variant='label'>{spotlight.id}</Text>
                          <Badge tone={spotlight.enabled ? 'accent' : 'outline'}>
                            {spotlight.enabled ? t('cms.toggles.enabled') : t('cms.toggles.disabled')}
                          </Badge>
                        </Box>
                        <Input value={draft.bannerTitleEn} onChangeText={(value) => setDraft({ bannerTitleEn: value })} placeholder={t('cms.placeholders.bannerTitleEn')} />
                        <Input value={draft.bannerTitleAr} onChangeText={(value) => setDraft({ bannerTitleAr: value })} placeholder={t('cms.placeholders.bannerTitleAr')} />
                        <Input value={draft.railTitleEn} onChangeText={(value) => setDraft({ railTitleEn: value })} placeholder={t('cms.placeholders.railTitleEn')} />
                        <Input value={draft.railTitleAr} onChangeText={(value) => setDraft({ railTitleAr: value })} placeholder={t('cms.placeholders.railTitleAr')} />
                        <Input value={draft.brandNamesCsv} onChangeText={(value) => setDraft({ brandNamesCsv: value })} placeholder={t('cms.placeholders.brandNamesCsvShort')} />
                        <Input value={draft.imageUrl} onChangeText={(value) => setDraft({ imageUrl: value })} placeholder={t('cms.placeholders.bannerImageUrl')} />
                        <Input value={draft.href} onChangeText={(value) => setDraft({ href: value })} placeholder={t('cms.placeholders.bannerHrefShort')} />
                        {spotlight.updatedAt ? (
                          <Text variant='caption' tone='muted'>
                            Updated: {new Date(spotlight.updatedAt).toLocaleString()}
                          </Text>
                        ) : null}
                        <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
                          <Button
                            size='sm'
                            variant='outline'
                            disabled={updatingBrandSpotlightId === spotlight.id || spotlight.enabled}
                            onPress={() => onUpdateBrandSpotlight?.(spotlight.id, { enabled: true })}
                          >
                            {t('cms.toggles.enable')}
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            disabled={updatingBrandSpotlightId === spotlight.id || !spotlight.enabled}
                            onPress={() => onUpdateBrandSpotlight?.(spotlight.id, { enabled: false })}
                          >
                            {t('cms.toggles.disable')}
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            disabled={updatingBrandSpotlightId === spotlight.id || index === 0}
                            onPress={() => onUpdateBrandSpotlight?.(spotlight.id, { position: index - 1 })}
                          >
                            {t('cms.spotlights.moveUp')}
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            disabled={updatingBrandSpotlightId === spotlight.id || index === brandSpotlights.length - 1}
                            onPress={() => onUpdateBrandSpotlight?.(spotlight.id, { position: index + 1 })}
                          >
                            {t('cms.spotlights.moveDown')}
                          </Button>
                          <Button
                            size='sm'
                            disabled={updatingBrandSpotlightId === spotlight.id}
                            onPress={() => {
                              const brandNames = draft.brandNamesCsv
                                .split(',')
                                .map((item) => item.trim())
                                .filter(Boolean)
                              onUpdateBrandSpotlight?.(spotlight.id, {
                                bannerTitle: {
                                  en: draft.bannerTitleEn.trim(),
                                  ar: draft.bannerTitleAr.trim(),
                                },
                                railTitle: {
                                  en: draft.railTitleEn.trim(),
                                  ar: draft.railTitleAr.trim(),
                                },
                                bannerImageUrl: draft.imageUrl.trim() || undefined,
                                bannerHref: draft.href.trim() || '/shop',
                                query: {
                                  ...(spotlight.query ?? {
                                    source: 'best_sellers',
                                    limit: 8,
                                    sortBy: 'price_desc',
                                  }),
                                  brandNames,
                                },
                              })
                            }}
                          >
                            {updatingBrandSpotlightId === spotlight.id ? t('cms.spotlights.saving') : t('actions.save')}
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            disabled={updatingBrandSpotlightId === spotlight.id}
                            onPress={() => onDeleteBrandSpotlight?.(spotlight.id)}
                          >
                            {t('cms.spotlights.delete')}
                          </Button>
                        </Box>
                        <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
                          {sourceOptions.map((option) => (
                            <Button
                              key={`${spotlight.id}-${option.key}`}
                              size='sm'
                              variant={spotlight.query?.source === option.key ? 'solid' : 'outline'}
                              disabled={updatingBrandSpotlightId === spotlight.id}
                              onPress={() =>
                                onUpdateBrandSpotlight?.(spotlight.id, {
                                  query: {
                                    ...(spotlight.query ?? {}),
                                    source: option.key,
                                  },
                                })
                              }
                            >
                              {option.label}
                            </Button>
                          ))}
                        </Box>
                      </Card>
                    )
                  })}
                </Box>
              )}
              {brandSpotlightsError ? (
                <Text tone='danger' variant='bodySm'>
                  {brandSpotlightsError}
                </Text>
              ) : null}
            </Box>
          </Card>
        </Box>
      ) : null}

      {activeTab === 'users' ? (
        <Box gap='16'>
          <Card variant='raised' style={{ gap: spacing['12'] }}>
            <Text variant='title'>{t('users.permissionsMatrix')}</Text>
            <Text variant='bodySm' tone='muted'>
              {t('users.permissionsHint')}
            </Text>
            <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
              <Badge tone='outline'>CMS: {permissionCounts.cms}</Badge>
              <Badge tone='outline'>Users: {permissionCounts.users}</Badge>
              <Badge tone='outline'>Cache: {permissionCounts.cache}</Badge>
            </Box>
            <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
              <Button size='sm' variant={userFilter === 'all' ? 'solid' : 'outline'} onPress={() => setUserFilter('all')}>
                All
              </Button>
              <Button size='sm' variant={userFilter === 'admin' ? 'solid' : 'outline'} onPress={() => setUserFilter('admin')}>
                Admins
              </Button>
              <Button
                size='sm'
                variant={userFilter === 'pharmacist' ? 'solid' : 'outline'}
                onPress={() => setUserFilter('pharmacist')}
              >
                Pharmacists
              </Button>
              <Button
                size='sm'
                variant={userFilter === 'customer' ? 'solid' : 'outline'}
                onPress={() => setUserFilter('customer')}
              >
                Customers
              </Button>
            </Box>
            {filteredRoleCards.length === 0 ? (
              <Card tone='subtle'>
                <Text tone='muted'>{t('users.noUsersMatchFilter')}</Text>
              </Card>
            ) : (
              <Box style={{ gap: spacing['8'] }}>
                {filteredRoleCards.map((user) => (
                  <Card key={`matrix-${user.id}`} tone='subtle' style={{ gap: spacing['8'] }}>
                    <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing['8'] }}>
                      <Text variant='label'>{user.name}</Text>
                      <Badge tone='outline'>{user.role}</Badge>
                    </Box>
                    <Text variant='caption' tone='muted'>{user.email}</Text>
                    <Box style={{ gap: spacing['6'] }}>
                      <Text variant='caption' tone='muted'>{t('users.cmsToggles')}</Text>
                      <Box style={{ flexDirection: 'row', gap: spacing['8'] }}>
                        <Button
                          size='sm'
                          variant='outline'
                          disabled={updatingUserId === user.id || !!user.permissions?.canManageCmsToggles}
                          onPress={() => onUpdateUserPermissions?.(user.id, { canManageCmsToggles: true })}
                        >
                          {t('users.allow')}
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          disabled={updatingUserId === user.id || !user.permissions?.canManageCmsToggles}
                          onPress={() => onUpdateUserPermissions?.(user.id, { canManageCmsToggles: false })}
                        >
                          {t('users.deny')}
                        </Button>
                      </Box>
                    </Box>
                    <Box style={{ gap: spacing['6'] }}>
                      <Text variant='caption' tone='muted'>{t('users.usersLabel')}</Text>
                      <Box style={{ flexDirection: 'row', gap: spacing['8'] }}>
                        <Button
                          size='sm'
                          variant='outline'
                          disabled={updatingUserId === user.id || !!user.permissions?.canManageUsers}
                          onPress={() => onUpdateUserPermissions?.(user.id, { canManageUsers: true })}
                        >
                          {t('users.allow')}
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          disabled={updatingUserId === user.id || !user.permissions?.canManageUsers}
                          onPress={() => onUpdateUserPermissions?.(user.id, { canManageUsers: false })}
                        >
                          {t('users.deny')}
                        </Button>
                      </Box>
                    </Box>
                    <Box style={{ gap: spacing['6'] }}>
                      <Text variant='caption' tone='muted'>{t('users.cacheOps')}</Text>
                      <Box style={{ flexDirection: 'row', gap: spacing['8'] }}>
                        <Button
                          size='sm'
                          variant='outline'
                          disabled={updatingUserId === user.id || !!user.permissions?.canRunCacheOps}
                          onPress={() => onUpdateUserPermissions?.(user.id, { canRunCacheOps: true })}
                        >
                          {t('users.allow')}
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          disabled={updatingUserId === user.id || !user.permissions?.canRunCacheOps}
                          onPress={() => onUpdateUserPermissions?.(user.id, { canRunCacheOps: false })}
                        >
                          {t('users.deny')}
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </Card>

          <Card variant='raised' style={{ gap: spacing['12'] }}>
            <Text variant='title'>{t('users.usersRolePreview')}</Text>
            {filteredRoleCards.length === 0 ? (
              <Text tone='muted'>{t('users.noUsersMatchFilter')}</Text>
            ) : (
              <Box style={{ gap: spacing['8'] }}>
                {filteredRoleCards.map((user) => (
                  <Card key={user.id} tone='subtle' style={{ gap: spacing['6'] }}>
                    <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing['8'] }}>
                      <Text variant='label'>{user.name}</Text>
                      <Badge tone='outline'>{user.status}</Badge>
                    </Box>
                    <Text variant='bodySm' tone='muted'>
                      {user.email}
                    </Text>
                    <Text variant='caption' tone='muted'>
                      Role: {user.role}
                    </Text>
                    <Text variant='caption' tone='muted'>
                      Permissions: CMS {user.permissions?.canManageCmsToggles ? 'yes' : 'no'} • Users{' '}
                      {user.permissions?.canManageUsers ? 'yes' : 'no'} • Cache{' '}
                      {user.permissions?.canRunCacheOps ? 'yes' : 'no'}
                    </Text>
                    {user.lastActiveLabel ? (
                      <Text variant='caption' tone='muted'>
                        Last active: {user.lastActiveLabel}
                      </Text>
                    ) : null}
                    <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
                      <Button
                        size='sm'
                        variant='outline'
                        disabled={updatingUserId === user.id || user.role === 'customer'}
                        onPress={() => onUpdateUserRole?.(user.id, 'customer')}
                      >
                        {t('users.role.customer')}
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        disabled={updatingUserId === user.id || user.role === 'pharmacist'}
                        onPress={() => onUpdateUserRole?.(user.id, 'pharmacist')}
                      >
                        {t('users.role.pharmacist')}
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        disabled={updatingUserId === user.id || user.role === 'admin'}
                        onPress={() => onUpdateUserRole?.(user.id, 'admin')}
                      >
                        {t('users.role.admin')}
                      </Button>
                    </Box>
                    <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
                      <Button
                        size='sm'
                        variant='outline'
                        disabled={updatingUserId === user.id || user.status === 'active'}
                        onPress={() => onUpdateUserStatus?.(user.id, 'active')}
                      >
                        {t('users.setActive')}
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        disabled={updatingUserId === user.id || user.status === 'invited'}
                        onPress={() => onUpdateUserStatus?.(user.id, 'invited')}
                      >
                        {t('users.setInvited')}
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        disabled={updatingUserId === user.id || user.status === 'disabled'}
                        onPress={() => onUpdateUserStatus?.(user.id, 'disabled')}
                      >
                        {t('users.setDisabled')}
                      </Button>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </Card>
        </Box>
      ) : null}

      {activeTab === 'cache' ? (
        <Box gap='16'>
          <Card variant='raised' style={{ gap: spacing['12'] }}>
            <Box style={{ gap: spacing['4'] }}>
              <Text variant='title'>{t('cache.title')}</Text>
              <Text tone='muted' variant='bodySm'>
                {t('cache.flushHint')}
              </Text>
            </Box>
            <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
              {cacheActions.map((item) => (
                <Button
                  key={item.key}
                  size='sm'
                  variant={selectedCacheAction === item.key ? 'solid' : 'outline'}
                  onPress={() => setSelectedCacheAction(item.key)}
                  disabled={runningCacheAction}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
            <Card tone='subtle' style={{ gap: spacing['8'] }}>
              <Text variant='label'>
                {cacheActions.find((item) => item.key === selectedCacheAction)?.label}
              </Text>
              <Text variant='bodySm' tone='muted'>
                {cacheActions.find((item) => item.key === selectedCacheAction)?.description}
              </Text>
            </Card>
            <Input
              value={flushConfirmation}
              onChangeText={setFlushConfirmation}
              placeholder={t('cache.flushConfirmationPlaceholder')}
            />
            {cacheActionError ? (
              <Text tone='danger' variant='bodySm'>
                {cacheActionError}
              </Text>
            ) : null}
            {cacheActionSuccess ? (
              <Text tone='success' variant='bodySm'>
                {cacheActionSuccess}
              </Text>
            ) : null}
            <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
              <Button
                onPress={() =>
                  onRunCacheAction?.({
                    action: selectedCacheAction,
                    confirmation: flushConfirmation,
                  })
                }
                disabled={runningCacheAction || flushConfirmation.trim().toUpperCase() !== 'FLUSH'}
              >
                {runningCacheAction ? t('cache.running') : t('cache.runOperation')}
              </Button>
              <Button variant='outline' onPress={onReloadCacheAudit} disabled={runningCacheAction}>
                {t('cache.refreshAudit')}
              </Button>
            </Box>
          </Card>

          <Card variant='raised' style={{ gap: spacing['12'] }}>
            <Text variant='title'>{t('audit.title')}</Text>
            {loadingCacheAudit ? (
              <Card tone='subtle' style={{ minHeight: spacing['80'] }} />
            ) : cacheAuditError ? (
              <Card tone='subtle' style={{ gap: spacing['8'] }}>
                <Text tone='danger'>{t('audit.loadError')}</Text>
                <Text tone='muted' variant='bodySm'>{cacheAuditError}</Text>
              </Card>
            ) : cacheAuditEntries.length === 0 ? (
              <Card tone='subtle'>
                <Text tone='muted'>{t('audit.empty')}</Text>
              </Card>
            ) : (
              <Box style={{ gap: spacing['8'] }}>
                {cacheAuditEntries.map((entry) => (
                  <Card key={entry.id} tone='subtle' style={{ gap: spacing['6'] }}>
                    <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing['8'] }}>
                      <Text variant='label'>{entry.action}</Text>
                      <Badge tone={entry.cdn.success ? 'accent' : 'outline'}>
                        CDN {entry.cdn.enabled ? (entry.cdn.success ? 'ok' : 'failed') : 'off'}
                      </Badge>
                    </Box>
                    <Text variant='caption' tone='muted'>
                      {new Date(entry.executedAt).toLocaleString()} • {entry.executedBy.email}
                    </Text>
                    <Text variant='caption' tone='muted'>
                      Paths: {entry.revalidatedPaths.length} • Tags: {entry.revalidatedTags.length}
                    </Text>
                    {entry.cdn.message ? (
                      <Text variant='caption' tone='muted'>
                        {entry.cdn.message}
                      </Text>
                    ) : null}
                  </Card>
                ))}
              </Box>
            )}
          </Card>

          <Card variant='raised' style={{ gap: spacing['12'] }}>
            <Box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant='title'>{t('opsAudit.title')}</Text>
              <Button size='sm' variant='outline' onPress={onReloadOpsAudit}>
                {t('cms.spotlights.refresh')}
              </Button>
            </Box>
            {opsAuditLoading ? (
              <Card tone='subtle' style={{ minHeight: spacing['80'] }} />
            ) : opsAuditError ? (
              <Card tone='subtle' style={{ gap: spacing['8'] }}>
                <Text tone='danger'>{t('opsAudit.loadError')}</Text>
                <Text tone='muted' variant='bodySm'>{opsAuditError}</Text>
              </Card>
            ) : opsAuditEntries.length === 0 ? (
              <Card tone='subtle'>
                <Text tone='muted'>{t('opsAudit.empty')}</Text>
              </Card>
            ) : (
              <Box style={{ gap: spacing['8'] }}>
                {opsAuditEntries.map((entry) => (
                  <Card key={entry.id} tone='subtle' style={{ gap: spacing['6'] }}>
                    <Text variant='label'>
                      {entry.type} • {entry.targetId}
                    </Text>
                    <Text variant='caption' tone='muted'>
                      {new Date(entry.at).toLocaleString()} • {entry.actor.email}
                    </Text>
                    <Text variant='caption' tone='muted'>
                      {Object.entries(entry.changes)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(' | ')}
                    </Text>
                  </Card>
                ))}
              </Box>
            )}
          </Card>
        </Box>
      ) : null}
          </Box>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
})
