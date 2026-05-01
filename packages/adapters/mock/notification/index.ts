import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import {
  NotificationDelivery,
  NotificationMessage,
  NotificationProvider,
  NotificationRegistration,
  NotificationRegistrationInput,
} from '@real/providers/contracts'

const STORAGE_DIR = path.join(process.cwd(), '.tmp')
const STORAGE_FILE = path.join(STORAGE_DIR, 'mock-notifications.json')

type NotificationState = {
  registrations: NotificationRegistration[]
  deliveries: NotificationDelivery[]
}

const EMPTY_STATE: NotificationState = {
  registrations: [],
  deliveries: [],
}

async function readState(): Promise<NotificationState> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<NotificationState>
    return {
      registrations: Array.isArray(parsed.registrations) ? parsed.registrations : [],
      deliveries: Array.isArray(parsed.deliveries) ? parsed.deliveries : [],
    }
  } catch {
    return { ...EMPTY_STATE }
  }
}

async function writeState(state: NotificationState) {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(STORAGE_FILE, JSON.stringify(state), 'utf8')
}

function createDelivery(message: NotificationMessage, tokenCount: number): NotificationDelivery {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    provider: 'mock',
    status: tokenCount > 0 ? 'sent' : 'skipped',
    tokenCount,
    error: tokenCount > 0 ? undefined : `No registered ${message.channel} tokens for user.`,
  }
}

export const mockNotificationAdapter: NotificationProvider = {
  async registerDevice(input: NotificationRegistrationInput) {
    if (!input.userId || !input.token) {
      return {
        ok: false,
        error: {
          code: 'NOTIFICATION_REGISTRATION_INVALID',
          message: 'Notification registration requires a user and token.',
        },
      }
    }

    const state = await readState()
    const now = new Date().toISOString()
    const existingIndex = state.registrations.findIndex(
      (item) => item.userId === input.userId && item.token === input.token
    )
    const registration: NotificationRegistration = {
      ...input,
      id:
        existingIndex >= 0
          ? state.registrations[existingIndex]?.id ?? `push-${Date.now()}`
          : `push-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      registeredAt:
        existingIndex >= 0
          ? state.registrations[existingIndex]?.registeredAt ?? now
          : now,
      updatedAt: now,
    }

    if (existingIndex >= 0) {
      state.registrations[existingIndex] = registration
    } else {
      state.registrations.push(registration)
    }
    await writeState(state)

    return { ok: true, data: registration }
  },

  async unregisterDevice(input) {
    const state = await readState()
    const next = state.registrations.filter(
      (item) => !(item.userId === input.userId && item.token === input.token)
    )
    const removed = next.length !== state.registrations.length
    await writeState({ ...state, registrations: next })

    return { ok: true, data: { removed } }
  },

  async sendToUser(message) {
    if (!message.userId) {
      return {
        ok: false,
        error: {
          code: 'NOTIFICATION_USER_REQUIRED',
          message: 'User notification requires a user id.',
        },
      }
    }

    const state = await readState()
    const tokenCount = state.registrations.filter(
      (item) =>
        item.userId === message.userId &&
        (!message.tenantId || !item.tenantId || item.tenantId === message.tenantId)
    ).length
    const delivery = createDelivery(message, tokenCount)
    state.deliveries.push(delivery)
    await writeState(state)

    return { ok: true, data: delivery }
  },

  async sendOrderStatusUpdate(input) {
    if (!input.userId) {
      return {
        ok: true,
        data: {
          id: `notif-${Date.now()}`,
          provider: 'mock',
          status: 'skipped',
          tokenCount: 0,
          error: 'Order does not have an owner user id.',
        },
      }
    }

    return this.sendToUser({
      tenantId: input.tenantId,
      userId: input.userId,
      orderId: input.orderId,
      channel: 'push',
      title: 'Order update',
      body: `Your order ${input.orderId} is now ${input.status}.`,
      data: {
        type: 'order_status',
        orderId: input.orderId,
        status: input.status,
      },
    })
  },

  async health() {
    return { ok: true, data: { provider: 'mock', ready: true } }
  },
}
