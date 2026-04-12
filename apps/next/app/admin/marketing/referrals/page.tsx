'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BadgePercent,
  Clock3,
  Link2,
  RefreshCw,
  ShieldCheck,
  UserRoundCheck,
  Users,
} from 'lucide-react'
import type {
  ReferralLedgerEntry,
  ReferralProfile,
  ReferralProgramSettings,
} from '@real/app/lib/referral/referral-types'
import type { AdminUserControlRecord } from '@real/app/lib/types'
import { colors, fontWeights, radius, spacing, typography } from '@real/tokens'
import { apiClient } from '../../../apiClient'
import {
  ActivityFeed,
  AdminCommandBar,
  AdminKpiCard,
  AdminKpiGrid,
  AdminPanelHeader,
  AdminTrendPill,
  Button,
  EmptyState,
  Field,
  InlineLoading,
  MetricList,
  PageContainer,
  Panel,
  SelectInput,
  StatusPill,
  TextInput,
  WorkspaceLayout,
} from '../../_components/AdminPagePrimitives'

const copy = {
  eyebrow: 'Marketing Operations',
  title: 'Referral Program',
  subtitle:
    'Control creator access, tune reward policy, and monitor attribution flow without losing operational context.',
  loading: 'Loading referral controls...',
  savingSettings: 'Saving settings...',
  savingProfile: 'Updating profile...',
  refresh: 'Refresh',
  sections: {
    create: 'Create referral',
    createSubtitle:
      'Search for a user, create the referral for them, and let the system expose the share link in their account automatically.',
    settings: 'Program controls',
    settingsSubtitle:
      'Define who can share referral links and how both sides of the reward policy work.',
    profiles: 'Creator review lane',
    profilesSubtitle:
      'Approve, reclassify, and monitor the operators behind active referral codes.',
    activity: 'Attribution activity',
    activitySubtitle:
      'Latest clicked, pending, and approved referral records from the live ledger.',
    railSummary: 'Policy summary',
    railSummarySubtitle:
      'Current program guardrails and reward decisions visible at a glance.',
    railAlerts: 'Operational notes',
    railAlertsSubtitle:
      'Warnings and next actions derived from current referral state.',
    accessEyebrow: 'Access & Exposure',
    accessTitle: 'Who can participate',
    rewardsEyebrow: 'Reward Architecture',
    rewardsTitle: 'Follower & creator economics',
    safeguardsEyebrow: 'Safeguards',
    safeguardsTitle: 'Eligibility, stacking, and windowing',
  },
  emptyProfiles: 'No referral profiles found.',
  emptyLedger: 'No referral activity recorded yet.',
  emptyUsers: 'No matching users found.',
  emptySelection: 'Find a user to start',
  labels: {
    searchUser: 'Search user',
    selectedUser: 'Selected user',
    displayName: 'Referral display name',
    mode: 'Program mode',
    accessMode: 'Access mode',
    followerType: 'Follower reward',
    followerValue: 'Follower reward value',
    influencerType: 'Influencer reward',
    influencerValue: 'Influencer reward value',
    attributionWindowDays: 'Attribution window (days)',
    minimumOrderAmount: 'Minimum order amount',
    allowStacking: 'Promotion stacking',
    firstOrderOnly: 'First order only',
    approved: 'Approved',
    actorType: 'Actor type',
    audienceCount: 'Audience size',
  },
  actions: {
    createReferral: 'Create referral',
    saveSettings: 'Save settings',
    copyLink: 'Copy link',
    regenerateCode: 'Regenerate code',
    disable: 'Disable',
    approve: 'Approve',
    openUserContext: 'Open user context',
  },
  helper: {
    searchPlaceholder: 'Search by user name or email',
    selectUserPlaceholder: 'Select user',
    displayNamePlaceholder: 'Name shown in referral records',
    accountVisibility:
      'After creation, this user will see their referral link under the Referral tab in their account.',
  },
  options: {
    yes: 'Yes',
    no: 'No',
    modeOff: 'Off',
    modeInfluencersOnly: 'Influencers only',
    modeAllUsers: 'All users',
    accessLinkOnly: 'Link only',
    accessCodeOnly: 'Code only',
    accessLinkAndCode: 'Link and code',
    followerPercentageDiscount: 'Percentage discount',
    followerFixedDiscount: 'Fixed discount',
    followerLoyaltyPoints: 'Loyalty points',
    rewardNone: 'None',
    influencerCommission: 'Commission percentage',
    influencerFixedAmount: 'Fixed amount per order',
    disabled: 'Disabled',
    enabled: 'Enabled',
    customer: 'Customer',
    influencer: 'Influencer',
    approved: 'Approved',
    pending: 'Pending',
  },
}

function formatMoney(value?: number, currency = 'USD') {
  return typeof value === 'number' ? `${currency} ${value.toFixed(2)}` : 'n/a'
}

function formatRewardLabel(
  reward: ReferralProgramSettings['policy']['followerReward'] | ReferralProgramSettings['policy']['influencerReward'],
) {
  return `${reward.type.replace(/_/g, ' ')} · ${reward.value}`
}

export default function AdminMarketingReferralsPage() {
  const [settings, setSettings] = useState<ReferralProgramSettings | null>(null)
  const [profiles, setProfiles] = useState<ReferralProfile[]>([])
  const [ledger, setLedger] = useState<ReferralLedgerEntry[]>([])
  const [users, setUsers] = useState<AdminUserControlRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [savingProfileId, setSavingProfileId] = useState<string | null>(null)
  const [creatingProfile, setCreatingProfile] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [userSearch, setUserSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [createActorType, setCreateActorType] = useState<ReferralProfile['actorType']>('influencer')
  const [createApproved, setCreateApproved] = useState(true)
  const [createAudienceCount, setCreateAudienceCount] = useState('1000')
  const [createDisplayName, setCreateDisplayName] = useState('')
  const router = useRouter()

  const load = async () => {
    setLoading(true)
    setError(null)
    setNotice(null)
    try {
      const [nextSettings, nextProfiles, nextLedger, nextUsers] = await Promise.all([
        apiClient.admin.referralSettings(),
        apiClient.admin.referralProfiles(),
        apiClient.admin.referralLedger(),
        apiClient.admin.listUsers(),
      ])
      setSettings(nextSettings)
      setProfiles(nextProfiles)
      setLedger(nextLedger)
      setUsers(nextUsers)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load referral controls.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const sortedLedger = useMemo(
    () => [...ledger].sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, 8),
    [ledger],
  )

  const approvedProfiles = profiles.filter((profile) => profile.approved)
  const pendingProfiles = profiles.filter((profile) => !profile.approved)
  const activePendingLedger = ledger.filter((entry) => entry.status === 'pending')
  const approvedLedger = ledger.filter((entry) => entry.status === 'approved')
  const existingUserIds = useMemo(() => new Set(profiles.map((profile) => profile.userId)), [profiles])
  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase()
    return users
      .filter((user) => !existingUserIds.has(user.id))
      .filter((user) => {
        if (!query) return true
        return user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
      })
      .slice(0, 8)
  }, [existingUserIds, userSearch, users])
  const selectedUser = useMemo(
    () => filteredUsers.find((user) => user.id === selectedUserId) ?? users.find((user) => user.id === selectedUserId) ?? null,
    [filteredUsers, selectedUserId, users],
  )

  const saveSettings = async (input: Partial<ReferralProgramSettings>) => {
    if (!settings) return
    setSavingSettings(true)
    setError(null)
    try {
      const next = await apiClient.admin.updateReferralSettings(input)
      setSettings(next)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save referral settings.')
    } finally {
      setSavingSettings(false)
    }
  }

  const saveProfile = async (
    profileId: string,
    input: Partial<Pick<ReferralProfile, 'approved' | 'actorType' | 'audienceCount'>>,
  ) => {
    setSavingProfileId(profileId)
    setError(null)
    try {
      const next = await apiClient.admin.updateReferralProfile(profileId, input)
      setProfiles((current) => current.map((profile) => (profile.id === profileId ? next : profile)))
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update referral profile.')
    } finally {
      setSavingProfileId(null)
    }
  }

  useEffect(() => {
    if (!selectedUser) return
    setCreateDisplayName((current) => (current ? current : selectedUser.name))
  }, [selectedUser])

  const createReferral = async () => {
    if (!selectedUser) {
      setError('Select a user before creating a referral.')
      return
    }
    setCreatingProfile(true)
    setError(null)
    setNotice(null)
    try {
      const created = await apiClient.admin.createReferralProfile({
        userId: selectedUser.id,
        displayName: createDisplayName.trim() || selectedUser.name,
        actorType: createActorType,
        approved: createApproved,
        audienceCount: Number(createAudienceCount || 0),
      })
      setProfiles((current) => [created, ...current])
      setSelectedUserId('')
      setUserSearch('')
      setCreateDisplayName('')
      setCreateAudienceCount('1000')
      setCreateActorType('influencer')
      setCreateApproved(true)
      setNotice(`Referral created for ${created.displayName}. Their account now has a share link.`)
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create referral.')
    } finally {
      setCreatingProfile(false)
    }
  }

  const copyReferralLink = async (profile: ReferralProfile) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profile.shareLink)
        setNotice(`Copied referral link for ${profile.displayName}.`)
        return
      }
      setError('Clipboard is not available in this browser.')
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : 'Unable to copy referral link.')
    }
  }

  const regenerateReferral = async (profile: ReferralProfile) => {
    setSavingProfileId(profile.id)
    setError(null)
    setNotice(null)
    try {
      const next = await apiClient.admin.regenerateReferralProfile(profile.id)
      setProfiles((current) => current.map((entry) => (entry.id === profile.id ? next : entry)))
      setNotice(`New referral code generated for ${next.displayName}.`)
    } catch (regenerateError) {
      setError(regenerateError instanceof Error ? regenerateError.message : 'Unable to regenerate referral code.')
    } finally {
      setSavingProfileId(null)
    }
  }

  const openUserContext = (profile: ReferralProfile) => {
    const query = encodeURIComponent(profile.userEmail || profile.displayName)
    router.push(`/admin/customers?screen=customers&q=${query}`)
  }

  const activityItems = sortedLedger.map((entry) => ({
    id: entry.id,
    title: entry.code,
    detail: `${entry.orderId ?? 'No order'} · ${formatMoney(entry.subtotal, entry.currency)}`,
    meta: entry.status,
    tone:
      entry.status === 'approved'
        ? ('success' as const)
        : entry.status === 'pending'
          ? ('warning' as const)
          : ('neutral' as const),
  }))

  const alerts = useMemo(() => {
    const rows: Array<{ label: string; value: string; tone: 'warning' | 'success' | 'brand' }> = []
    if (pendingProfiles.length > 0) {
      rows.push({
        label: 'Approvals waiting',
        value: `${pendingProfiles.length} creators need a decision`,
        tone: 'warning',
      })
    }
    if (activePendingLedger.length > 0) {
      rows.push({
        label: 'Pending attributions',
        value: `${activePendingLedger.length} conversions are still awaiting closure`,
        tone: 'brand',
      })
    }
    if (rows.length === 0) {
      rows.push({
        label: 'Program state',
        value: 'No immediate intervention required.',
        tone: 'success',
      })
    }
    return rows
  }, [activePendingLedger.length, pendingProfiles.length])

  return (
    <PageContainer>
      <AdminCommandBar
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        status={
          settings ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'], flexWrap: 'wrap' }}>
              <AdminTrendPill
                value={settings.mode === 'off' ? 'Program offline' : settings.mode.replace(/_/g, ' ')}
                tone={settings.mode === 'off' ? 'warning' : 'success'}
              />
              <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>
                Access mode: {settings.accessMode.replace(/_/g, ' ')}
              </span>
            </div>
          ) : null
        }
        actions={
          <Button onClick={() => void load()} disabled={loading}>
            {loading ? copy.loading : copy.refresh}
          </Button>
        }
      />

      {error ? (
        <Panel tone='danger'>
          <div style={{ color: colors.danger, fontSize: typography.sm }}>{error}</div>
        </Panel>
      ) : null}

      {notice ? (
        <Panel tone='success'>
          <div style={{ color: colors.textPrimary, fontSize: typography.sm }}>{notice}</div>
        </Panel>
      ) : null}

      {loading || !settings ? (
        <Panel>
          <InlineLoading label={copy.loading} />
        </Panel>
      ) : (
        <>
          <AdminKpiGrid>
            <AdminKpiCard
              label='Program mode'
              value={settings.mode === 'off' ? 'Offline' : settings.mode === 'all_users' ? 'Open' : 'Curated'}
              meta='How access is currently exposed to the market'
              icon={ShieldCheck}
              tone={settings.mode === 'off' ? 'warning' : 'brand'}
            />
            <AdminKpiCard
              label='Approved creators'
              value={approvedProfiles.length.toLocaleString()}
              meta='Profiles currently allowed to generate active referral traffic'
              icon={UserRoundCheck}
              trend={<AdminTrendPill value={`${pendingProfiles.length} waiting`} tone={pendingProfiles.length ? 'warning' : 'neutral'} />}
            />
            <AdminKpiCard
              label='Pending attribution'
              value={activePendingLedger.length.toLocaleString()}
              meta='Ledger entries still waiting for final approval'
              icon={Clock3}
              tone={activePendingLedger.length ? 'warning' : 'default'}
              trend={<AdminTrendPill value={activePendingLedger.length ? 'Needs review' : 'Clear'} tone={activePendingLedger.length ? 'warning' : 'success'} />}
            />
            <AdminKpiCard
              label='Approved conversions'
              value={approvedLedger.length.toLocaleString()}
              meta='Approved referral events visible in the ledger'
              icon={BadgePercent}
              tone='success'
            />
          </AdminKpiGrid>

          <WorkspaceLayout
            main={
              <>
                <Panel>
                  <AdminPanelHeader
                    title={copy.sections.create}
                    subtitle={copy.sections.createSubtitle}
                    actions={
                      <Button tone='primary' onClick={() => void createReferral()} disabled={creatingProfile || !selectedUser}>
                        {creatingProfile ? 'Creating...' : copy.actions.createReferral}
                      </Button>
                    }
                  />
                  <div style={{ display: 'grid', gap: spacing['16'] }}>
                    <div
                      style={{
                        display: 'grid',
                        gap: spacing['16'],
                        gridTemplateColumns: 'minmax(0, 1.3fr) repeat(3, minmax(180px, 0.75fr))',
                      }}
                    >
                      <Field label={copy.labels.searchUser}>
                        <TextInput
                          value={userSearch}
                          onChange={(event) => setUserSearch(event.target.value)}
                          placeholder={copy.helper.searchPlaceholder}
                        />
                      </Field>
                      <Field label={copy.labels.selectedUser}>
                        <SelectInput
                          value={selectedUserId}
                          onChange={(event) => setSelectedUserId(event.target.value)}
                        >
                          <option value=''>{copy.helper.selectUserPlaceholder}</option>
                          {filteredUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} | {user.email}
                            </option>
                          ))}
                        </SelectInput>
                      </Field>
                      <Field label={copy.labels.actorType}>
                        <SelectInput
                          value={createActorType}
                          onChange={(event) => setCreateActorType(event.target.value as ReferralProfile['actorType'])}
                        >
                          <option value='influencer'>{copy.options.influencer}</option>
                          <option value='customer'>{copy.options.customer}</option>
                        </SelectInput>
                      </Field>
                      <Field label={copy.labels.approved}>
                        <SelectInput
                          value={createApproved ? 'yes' : 'no'}
                          onChange={(event) => setCreateApproved(event.target.value === 'yes')}
                        >
                          <option value='yes'>{copy.options.yes}</option>
                          <option value='no'>{copy.options.no}</option>
                        </SelectInput>
                      </Field>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gap: spacing['16'],
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      }}
                    >
                      <Field label={copy.labels.displayName}>
                        <TextInput
                          value={createDisplayName}
                          onChange={(event) => setCreateDisplayName(event.target.value)}
                          placeholder={copy.helper.displayNamePlaceholder}
                        />
                      </Field>
                      <Field label={copy.labels.audienceCount}>
                        <TextInput
                          type='number'
                          value={createAudienceCount}
                          onChange={(event) => setCreateAudienceCount(event.target.value)}
                        />
                      </Field>
                    </div>

                    {selectedUser ? (
                      <div
                        style={{
                          border: `1px solid ${colors.border}`,
                          borderRadius: radius.xl,
                          backgroundColor: colors.surfaceMuted,
                          padding: spacing['16'],
                          display: 'grid',
                          gap: spacing['8'],
                        }}
                      >
                        <div style={{ color: colors.textPrimary, fontSize: typography.sm, fontWeight: Number(fontWeights.semibold) }}>
                          {selectedUser.name}
                        </div>
                        <div style={{ color: colors.textSecondary, fontSize: typography.sm }}>
                          {selectedUser.email}
                        </div>
                        <div style={{ color: colors.textSecondary, fontSize: typography.xs }}>
                          {copy.helper.accountVisibility}
                        </div>
                      </div>
                    ) : (
                      <EmptyState title={copy.emptySelection} description={copy.emptyUsers} />
                    )}
                  </div>
                </Panel>

                <Panel tone='brand'>
                  <AdminPanelHeader
                    title={copy.sections.settings}
                    subtitle={copy.sections.settingsSubtitle}
                    actions={
                      <Button
                        tone='primary'
                        onClick={() => {
                          void saveSettings(settings)
                        }}
                        disabled={savingSettings}
                      >
                        {savingSettings ? copy.savingSettings : copy.actions.saveSettings}
                      </Button>
                    }
                  />
                  <div style={{ display: 'grid', gap: spacing['16'] }}>
                    <div
                      style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: radius.xl,
                        backgroundColor: colors.surface,
                        padding: spacing['16'],
                        display: 'grid',
                        gap: spacing['12'],
                      }}
                    >
                      <div>
                        <div style={sectionEyebrowStyle}>{copy.sections.accessEyebrow}</div>
                        <div style={sectionTitleStyle}>{copy.sections.accessTitle}</div>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gap: spacing['16'],
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        }}
                      >
                        <Field label={copy.labels.mode}>
                          <SelectInput
                            value={settings.mode}
                            onChange={(event) => {
                              setSettings((current) =>
                                current ? { ...current, mode: event.target.value as ReferralProgramSettings['mode'] } : current,
                              )
                            }}
                          >
                            <option value='off'>{copy.options.modeOff}</option>
                            <option value='influencers_only'>{copy.options.modeInfluencersOnly}</option>
                            <option value='all_users'>{copy.options.modeAllUsers}</option>
                          </SelectInput>
                        </Field>
                        <Field label={copy.labels.accessMode}>
                          <SelectInput
                            value={settings.accessMode}
                            onChange={(event) => {
                              setSettings((current) =>
                                current
                                  ? {
                                      ...current,
                                      accessMode: event.target.value as ReferralProgramSettings['accessMode'],
                                    }
                                  : current,
                              )
                            }}
                          >
                            <option value='link_only'>{copy.options.accessLinkOnly}</option>
                            <option value='code_only'>{copy.options.accessCodeOnly}</option>
                            <option value='link_and_code'>{copy.options.accessLinkAndCode}</option>
                          </SelectInput>
                        </Field>
                      </div>
                    </div>

                    <div
                      style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: radius.xl,
                        backgroundColor: colors.surface,
                        padding: spacing['16'],
                        display: 'grid',
                        gap: spacing['12'],
                      }}
                    >
                      <div>
                        <div style={sectionEyebrowStyle}>{copy.sections.rewardsEyebrow}</div>
                        <div style={sectionTitleStyle}>{copy.sections.rewardsTitle}</div>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gap: spacing['16'],
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        }}
                      >
                        <Field label={copy.labels.followerType}>
                          <SelectInput
                            value={settings.policy.followerReward.type}
                            onChange={(event) => {
                              setSettings((current) =>
                                current
                                  ? {
                                      ...current,
                                      policy: {
                                        ...current.policy,
                                        followerReward: {
                                          ...current.policy.followerReward,
                                          type: event.target.value as ReferralProgramSettings['policy']['followerReward']['type'],
                                        },
                                      },
                                    }
                                  : current,
                              )
                            }}
                          >
                            <option value='percentage_discount'>{copy.options.followerPercentageDiscount}</option>
                            <option value='fixed_discount'>{copy.options.followerFixedDiscount}</option>
                            <option value='loyalty_points'>{copy.options.followerLoyaltyPoints}</option>
                            <option value='none'>{copy.options.rewardNone}</option>
                          </SelectInput>
                        </Field>
                        <Field label={copy.labels.followerValue}>
                          <TextInput
                            type='number'
                            value={String(settings.policy.followerReward.value)}
                            onChange={(event) => {
                              setSettings((current) =>
                                current
                                  ? {
                                      ...current,
                                      policy: {
                                        ...current.policy,
                                        followerReward: {
                                          ...current.policy.followerReward,
                                          value: Number(event.target.value || 0),
                                        },
                                      },
                                    }
                                  : current,
                              )
                            }}
                          />
                        </Field>
                        <Field label={copy.labels.influencerType}>
                          <SelectInput
                            value={settings.policy.influencerReward.type}
                            onChange={(event) => {
                              setSettings((current) =>
                                current
                                  ? {
                                      ...current,
                                      policy: {
                                        ...current.policy,
                                        influencerReward: {
                                          ...current.policy.influencerReward,
                                          type:
                                            event.target.value as ReferralProgramSettings['policy']['influencerReward']['type'],
                                        },
                                      },
                                    }
                                  : current,
                              )
                            }}
                          >
                            <option value='commission_percentage'>{copy.options.influencerCommission}</option>
                            <option value='fixed_amount_per_order'>{copy.options.influencerFixedAmount}</option>
                            <option value='none'>{copy.options.rewardNone}</option>
                          </SelectInput>
                        </Field>
                        <Field label={copy.labels.influencerValue}>
                          <TextInput
                            type='number'
                            value={String(settings.policy.influencerReward.value)}
                            onChange={(event) => {
                              setSettings((current) =>
                                current
                                  ? {
                                      ...current,
                                      policy: {
                                        ...current.policy,
                                        influencerReward: {
                                          ...current.policy.influencerReward,
                                          value: Number(event.target.value || 0),
                                        },
                                      },
                                    }
                                  : current,
                              )
                            }}
                          />
                        </Field>
                      </div>
                    </div>

                    <div
                      style={{
                        border: `1px solid ${colors.border}`,
                        borderRadius: radius.xl,
                        backgroundColor: colors.surface,
                        padding: spacing['16'],
                        display: 'grid',
                        gap: spacing['12'],
                      }}
                    >
                      <div>
                        <div style={sectionEyebrowStyle}>{copy.sections.safeguardsEyebrow}</div>
                        <div style={sectionTitleStyle}>{copy.sections.safeguardsTitle}</div>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gap: spacing['16'],
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        }}
                      >
                        <Field label={copy.labels.attributionWindowDays}>
                          <TextInput
                            type='number'
                            value={String(settings.policy.attributionWindowDays)}
                            onChange={(event) => {
                              setSettings((current) =>
                                current
                                  ? {
                                      ...current,
                                      policy: {
                                        ...current.policy,
                                        attributionWindowDays: Number(event.target.value || 1),
                                      },
                                    }
                                  : current,
                              )
                            }}
                          />
                        </Field>
                        <Field label={copy.labels.minimumOrderAmount}>
                          <TextInput
                            type='number'
                            value={String(settings.policy.minimumOrderAmount ?? 0)}
                            onChange={(event) => {
                              setSettings((current) =>
                                current
                                  ? {
                                      ...current,
                                      policy: {
                                        ...current.policy,
                                        minimumOrderAmount: Number(event.target.value || 0),
                                      },
                                    }
                                  : current,
                              )
                            }}
                          />
                        </Field>
                        <Field label={copy.labels.allowStacking}>
                          <SelectInput
                            value={settings.policy.allowStackingWithPromotions ? 'on' : 'off'}
                            onChange={(event) => {
                              setSettings((current) =>
                                current
                                  ? {
                                      ...current,
                                      policy: {
                                        ...current.policy,
                                        allowStackingWithPromotions: event.target.value === 'on',
                                      },
                                    }
                                  : current,
                              )
                            }}
                          >
                            <option value='off'>{copy.options.disabled}</option>
                            <option value='on'>{copy.options.enabled}</option>
                          </SelectInput>
                        </Field>
                        <Field label={copy.labels.firstOrderOnly}>
                          <SelectInput
                            value={settings.policy.firstOrderOnly ? 'on' : 'off'}
                            onChange={(event) => {
                              setSettings((current) =>
                                current
                                  ? {
                                      ...current,
                                      policy: {
                                        ...current.policy,
                                        firstOrderOnly: event.target.value === 'on',
                                      },
                                    }
                                  : current,
                              )
                            }}
                          >
                            <option value='on'>{copy.options.yes}</option>
                            <option value='off'>{copy.options.no}</option>
                          </SelectInput>
                        </Field>
                      </div>
                    </div>
                  </div>
                </Panel>

                <Panel>
                  <AdminPanelHeader
                    title={copy.sections.profiles}
                    subtitle={copy.sections.profilesSubtitle}
                  />
                  {profiles.length === 0 ? (
                    <EmptyState
                      title='No creators available'
                      description={copy.emptyProfiles}
                    />
                  ) : (
                    <div style={{ display: 'grid', gap: spacing['12'] }}>
                      {profiles.map((profile) => (
                        <div
                          key={profile.id}
                          style={{
                            border: `1px solid ${colors.border}`,
                            borderRadius: radius.xl,
                            backgroundColor: colors.surfaceMuted,
                            padding: spacing['16'],
                            display: 'grid',
                            gap: spacing['12'],
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: spacing['12'],
                              flexWrap: 'wrap',
                            }}
                          >
                            <div style={{ display: 'grid', gap: spacing['4'] }}>
                              <div
                                style={{
                                  color: colors.textPrimary,
                                  fontSize: typography.base,
                                  fontWeight: Number(fontWeights.semibold),
                                }}
                              >
                                {profile.displayName}
                              </div>
                              <div
                                style={{
                                  color: colors.textSecondary,
                                  fontSize: typography.sm,
                                  lineHeight: 1.5,
                                }}
                              >
                                {profile.code} · {profile.shareLink}
                              </div>
                            </div>
                            <StatusPill tone={profile.approved ? 'success' : 'warning'}>
                              {profile.approved ? copy.options.approved : copy.options.pending}
                            </StatusPill>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: spacing['8'],
                              flexWrap: 'wrap',
                            }}
                          >
                            <AdminTrendPill
                              value={profile.actorType === 'influencer' ? 'Influencer lane' : 'Customer advocate'}
                              tone='neutral'
                            />
                            <AdminTrendPill
                              value={`${(profile.audienceCount ?? 0).toLocaleString()} audience`}
                              tone='neutral'
                            />
                          </div>

                          <div
                            style={{
                              display: 'grid',
                              gap: spacing['12'],
                              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            }}
                          >
                            <Field label={copy.labels.approved}>
                              <SelectInput
                                value={profile.approved ? 'yes' : 'no'}
                                onChange={(event) => {
                                  void saveProfile(profile.id, {
                                    approved: event.target.value === 'yes',
                                  })
                                }}
                              >
                                <option value='yes'>{copy.options.yes}</option>
                                <option value='no'>{copy.options.no}</option>
                              </SelectInput>
                            </Field>
                            <Field label={copy.labels.actorType}>
                              <SelectInput
                                value={profile.actorType}
                                onChange={(event) => {
                                  void saveProfile(profile.id, {
                                    actorType: event.target.value as ReferralProfile['actorType'],
                                  })
                                }}
                              >
                                <option value='customer'>{copy.options.customer}</option>
                                <option value='influencer'>{copy.options.influencer}</option>
                              </SelectInput>
                            </Field>
                            <Field label={copy.labels.audienceCount}>
                              <TextInput
                                type='number'
                                value={String(profile.audienceCount ?? 0)}
                                onChange={(event) => {
                                  void saveProfile(profile.id, {
                                    audienceCount: Number(event.target.value || 0),
                                  })
                                }}
                              />
                              </Field>
                            </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: spacing['8'],
                              flexWrap: 'wrap',
                            }}
                          >
                            <Button tone='secondary' onClick={() => void copyReferralLink(profile)}>
                              {copy.actions.copyLink}
                            </Button>
                            <Button tone='secondary' onClick={() => void regenerateReferral(profile)} disabled={savingProfileId === profile.id}>
                              {copy.actions.regenerateCode}
                            </Button>
                            <Button tone='secondary' onClick={() => void saveProfile(profile.id, { approved: !profile.approved })} disabled={savingProfileId === profile.id}>
                              {profile.approved ? copy.actions.disable : copy.actions.approve}
                            </Button>
                            <Button tone='ghost' onClick={() => openUserContext(profile)}>
                              {copy.actions.openUserContext}
                            </Button>
                          </div>

                          {savingProfileId === profile.id ? (
                            <InlineLoading label={copy.savingProfile} />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>
              </>
            }
            rail={
              <>
                <Panel>
                  <AdminPanelHeader
                    title={copy.sections.railSummary}
                    subtitle={copy.sections.railSummarySubtitle}
                  />
                  <MetricList
                    rows={[
                      {
                        label: 'Access pattern',
                        value: settings.accessMode.replace(/_/g, ' '),
                        tone: 'brand',
                      },
                      {
                        label: 'Follower reward',
                        value: formatRewardLabel(settings.policy.followerReward),
                      },
                      {
                        label: 'Influencer reward',
                        value: formatRewardLabel(settings.policy.influencerReward),
                      },
                      {
                        label: 'Attribution window',
                        value: `${settings.policy.attributionWindowDays} days`,
                      },
                      {
                        label: 'Minimum order',
                        value: formatMoney(settings.policy.minimumOrderAmount, 'USD'),
                      },
                      {
                        label: 'Promo stacking',
                        value: settings.policy.allowStackingWithPromotions ? copy.options.enabled : copy.options.disabled,
                      },
                    ]}
                  />
                </Panel>

                <Panel>
                  <AdminPanelHeader
                    title={copy.sections.railAlerts}
                    subtitle={copy.sections.railAlertsSubtitle}
                  />
                  <MetricList rows={alerts} />
                </Panel>

                <Panel>
                  <AdminPanelHeader
                    title={copy.sections.activity}
                    subtitle={copy.sections.activitySubtitle}
                  />
                  {activityItems.length === 0 ? (
                    <EmptyState
                      title='No attribution events yet'
                      description={copy.emptyLedger}
                    />
                  ) : (
                    <ActivityFeed items={activityItems} empty={copy.emptyLedger} />
                  )}
                </Panel>

                <Panel tone='brand'>
                  <div style={{ display: 'grid', gap: spacing['10'] }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing['8'] }}>
                      <Link2 size={16} color={colors.brandPrimary} />
                      <span
                        style={{
                          color: colors.textPrimary,
                          fontSize: typography.sm,
                          fontWeight: Number(fontWeights.semibold),
                        }}
                      >
                        Referral operating note
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        color: colors.textSecondary,
                        fontSize: typography.sm,
                        lineHeight: 1.6,
                      }}
                    >
                      Keep this page tuned for fast decision-making: approve creators quickly,
                      monitor pending conversions, and adjust reward tension before campaign spikes.
                    </p>
                  </div>
                </Panel>
              </>
            }
          />
        </>
      )}
    </PageContainer>
  )
}

const sectionEyebrowStyle = {
  color: colors.brandPrimary,
  fontSize: typography.xs,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: Number(fontWeights.semibold),
} as const

const sectionTitleStyle = {
  color: colors.textPrimary,
  fontSize: typography.base,
  fontWeight: Number(fontWeights.semibold),
  marginTop: spacing['4'],
} as const
