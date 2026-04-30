import React, { useState } from 'react'
import { useWindowDimensions } from 'react-native'
import { useTranslation } from '@real/app/lib/i18n/use-translation'
import { spacing } from '@real/tokens'
import { breakpoints } from '@real/tokens'
import { PageScaffold, Section } from '@real/ui'
import { Badge, Button, Card } from '@real/ui/components'
import { Box, Input, Text } from '@real/ui/primitives'
import { AdminBrandSpotlightRecord } from '@real/app/lib/types'

type CmsToggle = {
  id: string
  label: string
  description?: string
  enabled: boolean
  surface: 'all' | 'web' | 'mobile'
}

type AdminCmsScreenProps = {
  title?: string
  notice?: string
  controlToggles?: CmsToggle[]
  updatingToggleId?: string | null
  onToggleControl?: (id: string, enabled: boolean) => void
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
  homeMarketingPreview?: {
    rails: Array<{ id: string; enabled: boolean; title: string }>
    brandSpotlights: Array<{ id: string; enabled: boolean; bannerTitle: string; railTitle: string }>
  }
}

type CmsTabKey = 'toggles' | 'spotlights' | 'preview'

export const AdminCmsScreen = React.memo(function AdminCmsScreen({
  title = 'CMS Controls',
  notice = 'Manage storefront content controls and spotlight blocks.',
  controlToggles = [],
  updatingToggleId = null,
  onToggleControl,
  brandSpotlights = [],
  loadingBrandSpotlights = false,
  brandSpotlightsError = null,
  updatingBrandSpotlightId = null,
  onReloadBrandSpotlights,
  onCreateBrandSpotlight,
  onUpdateBrandSpotlight,
  onDeleteBrandSpotlight,
  homeMarketingPreview,
}: AdminCmsScreenProps) {
  const { width } = useWindowDimensions()
  const isCompact = width > 0 && width < breakpoints.tabletMin
  const { t } = useTranslation('admin')
  const [activeTab, setActiveTab] = useState<CmsTabKey>('toggles')
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
        <Text variant='label'>{t('cms.tabs')}</Text>
        <Box style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['8'] }}>
          <Button variant={activeTab === 'toggles' ? 'solid' : 'outline'} size='sm' onPress={() => setActiveTab('toggles')}>
            {t('cms.toggles.title')}
          </Button>
          <Button variant={activeTab === 'spotlights' ? 'solid' : 'outline'} size='sm' onPress={() => setActiveTab('spotlights')}>
            {t('cms.spotlights.title')}
          </Button>
          <Button variant={activeTab === 'preview' ? 'solid' : 'outline'} size='sm' onPress={() => setActiveTab('preview')}>
            Preview
          </Button>
        </Box>
      </Card>

      {activeTab === 'toggles' ? (
        <Card variant='raised' style={{ gap: spacing['12'] }}>
          <Box
            style={{
              flexDirection: isCompact ? 'column' : 'row',
              alignItems: isCompact ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              gap: spacing['8'],
            }}
          >
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
      ) : null}

      {activeTab === 'spotlights' ? (
        <Card variant='raised' style={{ gap: spacing['12'] }}>
          <Box
            style={{
              flexDirection: isCompact ? 'column' : 'row',
              alignItems: isCompact ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              gap: spacing['8'],
            }}
          >
            <Text variant='title'>{t('cms.spotlights.title')}</Text>
            <Box style={isCompact ? { width: '100%' as const } : undefined}>
              <Button size='sm' variant='outline' onPress={onReloadBrandSpotlights}>
                {t('cms.spotlights.refresh')}
              </Button>
            </Box>
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
            <Box style={isCompact ? { width: '100%' as const } : { flexDirection: 'row', gap: spacing['8'] }}>
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
        </Card>
      ) : null}

      {activeTab === 'preview' ? (
        <Card variant='raised' style={{ gap: spacing['12'] }}>
          <Text variant='title'>{t('cms.preview.title')}</Text>
          <Box style={{ gap: spacing['8'] }}>
            <Text variant='label'>Rails ({homeMarketingPreview?.rails.length ?? 0})</Text>
            {(homeMarketingPreview?.rails.length ?? 0) === 0 ? (
              <Text tone='muted'>{t('cms.preview.noRails')}</Text>
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
                    <Text variant='caption' tone='muted'>ID: {rail.id}</Text>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
          <Box style={{ gap: spacing['8'] }}>
            <Text variant='label'>Brand spotlights ({homeMarketingPreview?.brandSpotlights.length ?? 0})</Text>
            {(homeMarketingPreview?.brandSpotlights.length ?? 0) === 0 ? (
              <Text tone='muted'>{t('cms.preview.noSpotlights')}</Text>
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
                    <Text variant='bodySm' tone='muted'>Rail: {spotlight.railTitle}</Text>
                    <Text variant='caption' tone='muted'>ID: {spotlight.id}</Text>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        </Card>
      ) : null}
          </Box>
        </Section>
      </PageScaffold.Body>
    </PageScaffold>
  )
})
