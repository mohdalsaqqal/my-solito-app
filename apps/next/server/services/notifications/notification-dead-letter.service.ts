import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import type { NotificationDelivery, NotificationMessage } from '@real/providers/contracts'

const STORAGE_DIR = path.join(process.cwd(), '.data')
const STORAGE_FILE = path.join(STORAGE_DIR, 'notification-dead-letter-store.json')

export type NotificationDeadLetterRecord = {
  id: string
  tenantId?: string
  userId?: string
  orderId?: string
  channel?: string
  status: NotificationDelivery['status']
  provider: NotificationDelivery['provider']
  error?: string
  retryCount: number
  nextRetryAt?: string
  createdAt: string
  message?: NotificationMessage
}

type NotificationDeadLetterState = {
  records: NotificationDeadLetterRecord[]
}

async function readState(): Promise<NotificationDeadLetterState> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<NotificationDeadLetterState>
    return { records: Array.isArray(parsed.records) ? parsed.records : [] }
  } catch {
    return { records: [] }
  }
}

async function writeState(state: NotificationDeadLetterState) {
  await fs.mkdir(STORAGE_DIR, { recursive: true })
  await fs.writeFile(STORAGE_FILE, JSON.stringify(state), 'utf8')
}

export async function listNotificationDeadLetters() {
  return (await readState()).records
}

export async function clearNotificationDeadLetters() {
  await writeState({ records: [] })
}

export async function recordNotificationDeadLetter(input: {
  tenantId?: string
  userId?: string
  orderId?: string
  channel?: string
  delivery: NotificationDelivery
  message?: NotificationMessage
}) {
  const state = await readState()
  const now = new Date()
  const record: NotificationDeadLetterRecord = {
    id: `notif-dlq-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    tenantId: input.tenantId,
    userId: input.userId,
    orderId: input.orderId,
    channel: input.channel,
    status: input.delivery.status,
    provider: input.delivery.provider,
    error: input.delivery.error,
    retryCount: 0,
    nextRetryAt: new Date(now.getTime() + 5 * 60 * 1000).toISOString(),
    createdAt: now.toISOString(),
    message: input.message,
  }
  state.records.push(record)
  await writeState(state)
  return record
}
