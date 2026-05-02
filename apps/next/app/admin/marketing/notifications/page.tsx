'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bell, Mail, RefreshCw, Send } from 'lucide-react'
import type {
  AdminNotificationCampaign,
  AdminNotificationControlCenter,
  AdminNotificationTemplate,
} from '@real/app/lib/types'
import { colors, spacing, typography } from '@real/tokens'
import { apiClient } from '../../../apiClient'
import {
  AdminKpiCard,
  AdminKpiGrid,
  AdminPanelHeader,
  Button,
  EmptyState,
  Field,
  PageContainer,
  PageHeader,
  Panel,
  Section,
  StatusPill,
  TextInput,
} from '../../_components/AdminPagePrimitives'

type CampaignForm = {
  name: string
  userId: string
  recipientEmail: string
  title: string
  body: string
  push: boolean
  email: boolean
}

const initialForm: CampaignForm = {
  name: 'Test notification',
  userId: 'demo-user',
  recipientEmail: 'customer@example.com',
  title: 'Order update',
  body: 'Your order is ready.',
  push: true,
  email: true,
}

export default function AdminNotificationsPage() {
  const [center, setCenter] = useState<AdminNotificationControlCenter | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<CampaignForm>(initialForm)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setCenter(await apiClient.admin.getNotifications())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load notification controls.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const summary = useMemo(() => {
    const templates = center?.templates ?? []
    const campaigns = center?.campaigns ?? []
    return {
      enabled: templates.filter((item) => item.enabled).length,
      push: templates.filter((item) => item.channels.push).length,
      email: templates.filter((item) => item.channels.email).length,
      sent: campaigns.filter((item) => item.status === 'sent').length,
    }
  }, [center])

  const updateTemplate = async (
    template: AdminNotificationTemplate,
    input: Partial<AdminNotificationTemplate>,
  ) => {
    setSavingId(template.id)
    setError(null)
    try {
      const updated = await apiClient.admin.updateNotificationTemplate(template.id, input)
      setCenter((current) =>
        current
          ? {
              ...current,
              templates: current.templates.map((item) => (item.id === updated.id ? updated : item)),
            }
          : current,
      )
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to save notification template.')
    } finally {
      setSavingId(null)
    }
  }

  const sendTest = async () => {
    setSending(true)
    setError(null)
    try {
      const campaign = await apiClient.admin.createNotificationCampaign({
        name: form.name,
        audience: 'test_user',
        userId: form.push ? form.userId : undefined,
        recipientEmail: form.email ? form.recipientEmail : undefined,
        channels: {
          push: form.push,
          email: form.email,
        },
        title: form.title,
        body: form.body,
      })
      setCenter((current) =>
        current
          ? {
              ...current,
              campaigns: [campaign, ...current.campaigns],
            }
          : current,
      )
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to send test notification.')
    } finally {
      setSending(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title='Notifications'
        subtitle='Control customer push and email messages from admin only.'
        actions={
          <Button tone='secondary' onClick={() => void load()} disabled={loading}>
            <RefreshCw size={14} /> Refresh
          </Button>
        }
      />

      {error ? <p style={{ marginTop: 0, color: colors.danger }}>{error}</p> : null}

      <Section>
        <AdminKpiGrid>
          <AdminKpiCard label='Enabled templates' value={String(summary.enabled)} meta='Transactional events active' />
          <AdminKpiCard label='Push enabled' value={String(summary.push)} meta='Templates with push channel' />
          <AdminKpiCard label='Email enabled' value={String(summary.email)} meta='Templates with email channel' />
          <AdminKpiCard label='Failed backlog' value={String(center?.status.deadLetterCount ?? 0)} meta='Needs retry review' />
        </AdminKpiGrid>
      </Section>

      <Section>
        <Panel>
          <AdminPanelHeader
            title='Provider status'
            subtitle='Platform operator view of configured notification provider and retry backlog.'
          />
          {loading && !center ? (
            <EmptyState title='Loading notifications...' description='Fetching provider status and templates.' />
          ) : center ? (
            <div style={gridStyle}>
              <Info label='Provider' value={center.status.provider} />
              <Info label='Ready' value={center.status.ready ? 'Yes' : 'No'} />
              <Info label='Pending retry' value={String(center.status.pendingRetryCount)} />
              <Info label='Recent failures' value={String(center.deadLetters.length)} />
            </div>
          ) : null}
        </Panel>
      </Section>

      <Section>
        <Panel>
          <AdminPanelHeader
            title='Event templates'
            subtitle='Store managers choose channels and copy for automatic customer events.'
          />
          <div style={{ display: 'grid', gap: spacing['12'] }}>
            {(center?.templates ?? []).map((template) => (
              <div key={template.id} style={templateRowStyle}>
                <div style={{ display: 'grid', gap: spacing['4'], minWidth: 220 }}>
                  <strong style={{ color: colors.textPrimary, fontSize: typography.sm }}>{template.name}</strong>
                  <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>{template.event}</span>
                </div>
                <label style={toggleStyle}>
                  <input
                    type='checkbox'
                    checked={template.enabled}
                    onChange={(event) => updateTemplate(template, { enabled: event.target.checked })}
                    disabled={savingId === template.id}
                  />
                  Enabled
                </label>
                <label style={toggleStyle}>
                  <input
                    type='checkbox'
                    checked={template.channels.push}
                    onChange={(event) =>
                      updateTemplate(template, {
                        channels: { ...template.channels, push: event.target.checked },
                      })
                    }
                    disabled={savingId === template.id}
                  />
                  <Bell size={14} /> Push
                </label>
                <label style={toggleStyle}>
                  <input
                    type='checkbox'
                    checked={template.channels.email}
                    onChange={(event) =>
                      updateTemplate(template, {
                        channels: { ...template.channels, email: event.target.checked },
                      })
                    }
                    disabled={savingId === template.id}
                  />
                  <Mail size={14} /> Email
                </label>
                <div style={{ color: colors.textSecondary, fontSize: typography.xs, flex: '1 1 240px' }}>
                  {template.subject.en}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </Section>

      <Section>
        <Panel>
          <AdminPanelHeader
            title='Send test notification'
            subtitle='Send a controlled test to one customer identity before enabling live campaigns.'
            actions={
              <Button tone='primary' onClick={() => void sendTest()} disabled={sending}>
                <Send size={14} /> {sending ? 'Sending...' : 'Send test'}
              </Button>
            }
          />
          <div style={formGridStyle}>
            <Field label='Campaign name'>
              <TextInput value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </Field>
            <Field label='Push user ID'>
              <TextInput value={form.userId} onChange={(event) => setForm({ ...form, userId: event.target.value })} />
            </Field>
            <Field label='Email recipient'>
              <TextInput
                value={form.recipientEmail}
                onChange={(event) => setForm({ ...form, recipientEmail: event.target.value })}
              />
            </Field>
            <Field label='Title'>
              <TextInput value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            </Field>
            <Field label='Body'>
              <TextInput value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} />
            </Field>
            <div style={{ display: 'flex', gap: spacing['16'], alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={toggleStyle}>
                <input type='checkbox' checked={form.push} onChange={(event) => setForm({ ...form, push: event.target.checked })} />
                Push
              </label>
              <label style={toggleStyle}>
                <input type='checkbox' checked={form.email} onChange={(event) => setForm({ ...form, email: event.target.checked })} />
                Email
              </label>
            </div>
          </div>
        </Panel>
      </Section>

      <Section>
        <Panel>
          <AdminPanelHeader title='Recent campaigns' subtitle='Latest admin-created notifications and delivery states.' />
          {(center?.campaigns ?? []).length === 0 ? (
            <EmptyState title='No campaigns yet' description='Test notifications and scheduled sends will appear here.' />
          ) : (
            <div style={{ display: 'grid', gap: spacing['10'] }}>
              {(center?.campaigns ?? []).slice(0, 8).map((campaign) => (
                <CampaignRow key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </Panel>
      </Section>
    </PageContainer>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gap: spacing['4'] }}>
      <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>{label}</span>
      <strong style={{ color: colors.textPrimary, fontSize: typography.sm }}>{value}</strong>
    </div>
  )
}

function CampaignRow({ campaign }: { campaign: AdminNotificationCampaign }) {
  return (
    <div style={campaignRowStyle}>
      <div style={{ display: 'grid', gap: spacing['4'] }}>
        <strong style={{ color: colors.textPrimary, fontSize: typography.sm }}>{campaign.name}</strong>
        <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>
          {campaign.channels.push ? 'Push' : ''}{campaign.channels.push && campaign.channels.email ? ' + ' : ''}{campaign.channels.email ? 'Email' : ''}
        </span>
      </div>
      <StatusPill tone={campaign.status === 'failed' ? 'danger' : campaign.status === 'sent' ? 'success' : 'warning'}>
        {campaign.status}
      </StatusPill>
      <span style={{ color: colors.textSecondary, fontSize: typography.xs }}>
        {new Date(campaign.createdAt).toLocaleString()}
      </span>
    </div>
  )
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
  gap: spacing['16'],
} as const

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
  gap: spacing['16'],
  alignItems: 'end',
} as const

const templateRowStyle = {
  display: 'flex',
  gap: spacing['16'],
  alignItems: 'center',
  flexWrap: 'wrap',
  border: `1px solid ${colors.border}`,
  borderRadius: 12,
  padding: spacing['12'],
} as const

const campaignRowStyle = {
  display: 'flex',
  gap: spacing['16'],
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  borderBottom: `1px solid ${colors.border}`,
  paddingBlock: spacing['10'],
} as const

const toggleStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: spacing['6'],
  color: colors.textPrimary,
  fontSize: typography.sm,
} as const
