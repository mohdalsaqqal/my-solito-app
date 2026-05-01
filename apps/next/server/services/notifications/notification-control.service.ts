import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import { notificationProvider } from '@real/providers'
import type {
  NotificationDelivery,
  NotificationMessage,
} from '@real/providers/contracts'
import { ServiceError } from '../_lib/service-error'
import {
  listNotificationDeadLetters,
  recordNotificationDeadLetter,
} from './notification-dead-letter.service'
import { getNotificationStatus } from './notification.service'

const STORAGE_DIR = path.join(process.cwd(), '.data')
const STORAGE_FILE = path.join(STORAGE_DIR, 'admin-notification-control-store.json')

export type AdminNotificationEvent =
  | 'order_placed'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'payment_failed'
  | 'pharmacist_result_ready'
  | 'loyalty_points_added'
  | 'referral_reward_earned'
  | 'marketing_campaign'

export type AdminNotificationChannels = {
  push: boolean
  email: boolean
}

export type AdminNotificationTemplate = {
  id: string
  event: AdminNotificationEvent
  name: string
  enabled: boolean
  channels: AdminNotificationChannels
  subject: {
    en: string
    ar: string
  }
  body: {
    en: string
    ar: string
  }
  updatedAt: string
  updatedBy?: {
    userId: string
    email: string
  }
}

export type AdminNotificationCampaign = {
  id: string
  name: string
  audience: 'test_user' | 'segment'
  userId?: string
  recipientEmail?: string
  segment?: 'all_customers' | 'loyalty_members' | 'inactive_customers'
  channels: AdminNotificationChannels
  title: string
  body: string
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  scheduledAt?: string
  createdAt: string
  createdBy: {
    userId: string
    email: string
  }
  deliveries: NotificationDelivery[]
}

export type AdminNotificationControlState = {
  templates: AdminNotificationTemplate[]
  campaigns: AdminNotificationCampaign[]
}

export type AdminNotificationActor = {
  userId: string
  email: string
}

type CampaignInput = {
  name?: string
  audience?: AdminNotificationCampaign['audience']
  userId?: string
  recipientEmail?: string
  segment?: AdminNotificationCampaign['segment']
  channels?: Partial<AdminNotificationChannels>
  title?: string
  body?: string
  scheduledAt?: string
}

const defaultTemplates: AdminNotificationTemplate[] = [
  template('order_placed', 'Order placed', true, true, 'Order received', 'We received your order {{orderId}}.'),
  template('order_shipped', 'Order shipped', true, true, 'Order shipped', 'Your order {{orderId}} is now shipped.'),
  template('order_delivered', 'Order delivered', true, true, 'Order delivered', 'Your order {{orderId}} was delivered.'),
  template('order_cancelled', 'Order cancelled', true, true, 'Order cancelled', 'Your order {{orderId}} was cancelled.'),
  template('payment_failed', 'Payment failed', true, true, 'Payment failed', 'Your payment for {{orderId}} did not complete.'),
  template(
    'pharmacist_result_ready',
    'Test result ready',
    true,
    true,
    'Your recommendation is ready',
    'Your pharmacist recommendation is ready in your account.',
  ),
  template(
    'loyalty_points_added',
    'Loyalty points added',
    true,
    true,
    'Points added',
    'Your loyalty wallet has new points.',
  ),
  template(
    'referral_reward_earned',
    'Referral reward earned',
    true,
    true,
    'Referral reward earned',
    'Your referral reward is ready.',
  ),
  template(
    'marketing_campaign',
    'Marketing campaign',
    true,
    true,
    'New offer',
    'A new offer is available now.',
  ),
]

function template(
  event: AdminNotificationEvent,
  name: string,
  push: boolean,
  email: boolean,
  subjectEn: string,
  bodyEn: string,
): AdminNotificationTemplate {
  const now = new Date().toISOString()
  return {
    id: event,
    event,
    name,
    enabled: true,
    channels: { push, email },
    subject: { en: subjectEn, ar: subjectEn },
    body: { en: bodyEn, ar: bodyEn },
    updatedAt: now,
  }
}

async function readState(): Promise<AdminNotificationControlState> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<AdminNotificationControlState>
    return {
      templates: Array.isArray(parsed.templates) ? mergeTemplates(parsed.templates) : defaultTemplates,
      campaigns: Array.isArray(parsed.campaigns) ? parsed.campaigns : [],
    }
  } catch {
    return { templates: defaultTemplates, campaigns: [] }
  }
}

async function writeState(state: AdminNotificationControlState) {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(STORAGE_FILE, JSON.stringify(state), 'utf8')
}

function mergeTemplates(templates: AdminNotificationTemplate[]) {
  const byId = new Map(defaultTemplates.map((item) => [item.id, item]))
  for (const item of templates) {
    byId.set(item.id, { ...(byId.get(item.id) ?? item), ...item })
  }
  return Array.from(byId.values())
}

function normalizeChannels(input?: Partial<AdminNotificationChannels>): AdminNotificationChannels {
  return {
    push: input?.push !== false,
    email: input?.email !== false,
  }
}

function requireText(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ServiceError('ADMIN_NOTIFICATION_INVALID', `${field} is required.`, 400)
  }
  return value.trim()
}

async function saveFailedDelivery(message: NotificationMessage, delivery: NotificationDelivery) {
  if (delivery.status !== 'failed') return
  await recordNotificationDeadLetter({
    tenantId: message.tenantId,
    userId: message.userId,
    orderId: message.orderId,
    channel: message.channel,
    delivery,
    message,
  })
}

export async function getAdminNotificationControlCenter() {
  const [state, status, deadLetters] = await Promise.all([
    readState(),
    getNotificationStatus(),
    listNotificationDeadLetters(),
  ])
  return {
    ...state,
    status,
    deadLetters: deadLetters.slice(-25).reverse(),
  }
}

export async function updateAdminNotificationTemplate(
  id: string,
  input: Partial<AdminNotificationTemplate>,
  actor: AdminNotificationActor,
) {
  const state = await readState()
  const index = state.templates.findIndex((item) => item.id === id)
  if (index < 0) {
    throw new ServiceError('ADMIN_NOTIFICATION_TEMPLATE_NOT_FOUND', 'Notification template was not found.', 404)
  }
  const current = state.templates[index]
  const next: AdminNotificationTemplate = {
    ...current,
    name: typeof input.name === 'string' && input.name.trim() ? input.name.trim() : current.name,
    enabled: typeof input.enabled === 'boolean' ? input.enabled : current.enabled,
    channels: normalizeChannels(input.channels ?? current.channels),
    subject: {
      en: input.subject?.en?.trim() || current.subject.en,
      ar: input.subject?.ar?.trim() || current.subject.ar,
    },
    body: {
      en: input.body?.en?.trim() || current.body.en,
      ar: input.body?.ar?.trim() || current.body.ar,
    },
    updatedAt: new Date().toISOString(),
    updatedBy: actor,
  }
  state.templates[index] = next
  await writeState(state)
  return next
}

export async function createAdminNotificationCampaign(input: CampaignInput, actor: AdminNotificationActor) {
  const state = await readState()
  const channels = normalizeChannels(input.channels)
  const title = requireText(input.title, 'title')
  const body = requireText(input.body, 'body')
  const name = input.name?.trim() || title
  const audience = input.audience ?? 'test_user'
  const scheduledAt = input.scheduledAt?.trim() || undefined

  if (audience === 'test_user' && !input.userId && !input.recipientEmail) {
    throw new ServiceError(
      'ADMIN_NOTIFICATION_RECIPIENT_REQUIRED',
      'Test notification requires userId or recipientEmail.',
      400,
    )
  }

  const campaign: AdminNotificationCampaign = {
    id: `notif-campaign-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    audience,
    userId: input.userId?.trim() || undefined,
    recipientEmail: input.recipientEmail?.trim() || undefined,
    segment: input.segment,
    channels,
    title,
    body,
    status: scheduledAt ? 'scheduled' : 'draft',
    scheduledAt,
    createdAt: new Date().toISOString(),
    createdBy: actor,
    deliveries: [],
  }

  if (!scheduledAt && audience === 'test_user') {
    campaign.deliveries = await sendCampaignNow(campaign)
    campaign.status = campaign.deliveries.some((delivery) => delivery.status === 'failed') ? 'failed' : 'sent'
  }

  state.campaigns.unshift(campaign)
  await writeState(state)
  return campaign
}

async function sendCampaignNow(campaign: AdminNotificationCampaign) {
  const deliveries: NotificationDelivery[] = []
  if (campaign.channels.push && campaign.userId) {
    const message: NotificationMessage = {
      userId: campaign.userId,
      channel: 'push',
      title: campaign.title,
      body: campaign.body,
      data: {
        type: 'admin_campaign',
        campaignId: campaign.id,
      },
    }
    const result = await notificationProvider.sendToUser(message)
    if (result.ok) {
      deliveries.push(result.data)
      await saveFailedDelivery(message, result.data)
    }
  }

  if (campaign.channels.email && campaign.recipientEmail) {
    const message: NotificationMessage = {
      userId: campaign.userId,
      recipientEmail: campaign.recipientEmail,
      channel: 'email',
      title: campaign.title,
      body: campaign.body,
      data: {
        type: 'admin_campaign',
        campaignId: campaign.id,
        email: campaign.recipientEmail,
      },
    }
    const result = await notificationProvider.sendToUser(message)
    if (result.ok) {
      deliveries.push(result.data)
      await saveFailedDelivery(message, result.data)
    }
  }

  return deliveries
}

export async function clearAdminNotificationControlStateForTest() {
  await writeState({ templates: defaultTemplates, campaigns: [] })
}
