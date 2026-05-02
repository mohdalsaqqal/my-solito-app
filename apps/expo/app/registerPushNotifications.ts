import Constants from 'expo-constants'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { apiClient } from './apiClient'

type RegisterPushNotificationsResult =
  | { status: 'registered'; token: string }
  | { status: 'skipped'; reason: string }

let registrationPromise: Promise<RegisterPushNotificationsResult> | null = null

function getProjectId() {
  return (
    Constants.easConfig?.projectId ||
    Constants.expoConfig?.extra?.eas?.projectId ||
    null
  )
}

function getPlatform() {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return Platform.OS
  }

  return 'unknown'
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return
  }

  await Notifications.setNotificationChannelAsync('orders', {
    name: 'Order updates',
    importance: Notifications.AndroidImportance.DEFAULT,
  })
}

async function registerPushNotificationsInner(): Promise<RegisterPushNotificationsResult> {
  const projectId = getProjectId()
  if (!projectId) {
    return {
      status: 'skipped',
      reason: 'Expo project id is not configured. Run EAS init before physical-device push smoke.',
    }
  }

  const existingPermission = await Notifications.getPermissionsAsync()
  const finalPermission =
    existingPermission.status === 'granted'
      ? existingPermission
      : await Notifications.requestPermissionsAsync()

  if (finalPermission.status !== 'granted') {
    return { status: 'skipped', reason: 'Push notification permission was not granted.' }
  }

  await ensureAndroidChannel()
  const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId })
  const token = tokenResult.data

  await apiClient.notifications.registerDevice({
    token,
    platform: getPlatform(),
    deviceId: Constants.sessionId,
    locale: Constants.expoConfig?.extra?.locale,
  })

  return { status: 'registered', token }
}

export function registerPushNotifications(): Promise<RegisterPushNotificationsResult> {
  registrationPromise ??= registerPushNotificationsInner().catch((cause) => {
    console.warn('[push] registration skipped', cause)
    return { status: 'skipped', reason: 'Push registration failed.' }
  })

  return registrationPromise
}
