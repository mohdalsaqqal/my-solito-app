# EAS Mobile Delivery Runbook

This runbook covers the Expo app in `apps/expo`. The web/server layer remains in `apps/next`.

## First-Time Setup

1. Log in to Expo:

```bash
npx eas-cli@latest login
```

2. Initialize/link the Expo project:

```bash
cd apps/expo
npx eas-cli@latest init
```

This writes the real EAS project id into Expo config. Push registration will skip on devices until that project id exists.

3. Configure client app identifiers before production:

- iOS bundle id: `expo.ios.bundleIdentifier`
- Android package: `expo.android.package`
- App name, slug, icon, splash, privacy strings, and store metadata

4. Configure credentials:

```bash
npx eas-cli@latest credentials -p ios
npx eas-cli@latest credentials -p android
```

For push, connect APNs for iOS and FCM for Android through Expo credentials.

## Build Profiles

Root `eas.json` defines:

- `development`: internal dev-client build for native debugging.
- `preview`: internal client QA build.
- `production`: store-ready build with auto-incremented versions.

## Build Commands

From the repository root:

```bash
npx eas-cli@latest build --profile development --platform all
npx eas-cli@latest build --profile preview --platform all
npx eas-cli@latest build --profile production --platform all
```

For a single platform:

```bash
npx eas-cli@latest build --profile preview --platform ios
npx eas-cli@latest build --profile preview --platform android
```

## Submit Commands

After store credentials are configured:

```bash
npx eas-cli@latest submit --profile production --platform ios
npx eas-cli@latest submit --profile production --platform android
```

## OTA Updates

Use EAS Update for JavaScript-only fixes. Native dependency, app config, permission, bundle id, package id, icon, splash, or notification credential changes require a new build.

```bash
npx eas-cli@latest update --channel preview --message "QA fix"
npx eas-cli@latest update --channel production --message "Production hotfix"
```

## Push Smoke Test

Prerequisites:

- Real EAS project id exists in Expo config.
- Physical iOS/Android device is used.
- Device can reach `EXPO_PUBLIC_API_BASE_URL`.
- User is authenticated in the app.
- Next server is running with `USE_EXPO_PUSH=false` for mock delivery or `USE_EXPO_PUSH=true` for real Expo push sends.

Steps:

1. Start the Next server.
2. Start Expo:

```bash
yarn --cwd apps/expo start
```

3. Open the app on a physical device.
4. Accept notification permission.
5. Confirm `/api/notifications/devices` returns success.
6. Change an order status from admin.
7. With mock notifications, confirm `.tmp/mock-notifications.json` records the delivery.
8. With `USE_EXPO_PUSH=true`, confirm the device receives the push notification.

## Required Production Environment

```bash
EXPO_PUBLIC_API_BASE_URL=https://client-store.example.com
USE_EXPO_PUSH=true
EXPO_PUSH_ACCESS_TOKEN=optional_expo_access_token
```

Keep `USE_EXPO_PUSH=false` for local test runs unless physical push delivery is being verified.

## Rollback

For OTA issues:

```bash
npx eas-cli@latest update:republish --channel production
```

For native-build issues, promote the previous known-good build from App Store Connect or Google Play Console and disable the bad update channel if needed.
