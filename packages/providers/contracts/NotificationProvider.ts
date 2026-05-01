import { ProviderResult } from './types'

export type NotificationChannel = 'push' | 'email'

export type PushPlatform = 'ios' | 'android' | 'web' | 'unknown'

export type NotificationRegistrationInput = {
  tenantId?: string
  userId: string
  token: string
  platform: PushPlatform
  deviceId?: string
  locale?: string
}

export type NotificationRegistration = NotificationRegistrationInput & {
  id: string
  registeredAt: string
  updatedAt: string
}

export type NotificationMessage = {
  tenantId?: string
  userId?: string
  recipientEmail?: string
  orderId?: string
  channel: NotificationChannel
  title: string
  body: string
  data?: Record<string, string>
}

export type NotificationDelivery = {
  id: string
  provider: 'mock' | 'expo-push' | 'email' | 'multi-channel'
  status: 'queued' | 'sent' | 'skipped' | 'failed'
  tokenCount?: number
  error?: string
}

export interface NotificationProvider {
  registerDevice(input: NotificationRegistrationInput): Promise<ProviderResult<NotificationRegistration>>
  unregisterDevice(input: {
    tenantId?: string
    userId: string
    token: string
  }): Promise<ProviderResult<{ removed: boolean }>>
  sendToUser(message: NotificationMessage): Promise<ProviderResult<NotificationDelivery>>
  sendOrderStatusUpdate(input: {
    tenantId?: string
    userId?: string
    recipientEmail?: string
    orderId: string
    status: string
  }): Promise<ProviderResult<NotificationDelivery>>
  health?(): Promise<ProviderResult<{ provider: string; ready: boolean }>>
}
