# 09 Notifications

Status: `[x]`

## Goal

Deliver push/email notifications for order lifecycle and account events through provider-backed services.

## Current State

- [x] `NotificationProvider` exists.
- [x] Mock notification adapter exists.
- [x] Expo push adapter exists.
- [x] Push token registration API exists.
- [x] Expo push registration exists and skips safely until EAS project id exists.
- [x] Admin order status updates trigger non-blocking notifications.
- [x] Email adapter exists behind `NotificationProvider`.
- [x] Failed delivery dead-letter records and retry metadata exist.
- [x] Notification health/status service surface exists.
- [x] Web admin notification control center exists under `/admin/marketing/notifications`.
- [x] Admin APIs manage notification templates and test campaigns.
- [ ] Physical-device push smoke remains.
- [~] Live email vendor sandbox remains external.

## Tasks

- [ ] Run physical-device push smoke.
- [x] Add email notification adapter.
- [x] Add retry/dead-letter policy for failed delivery.
- [x] Add notification health/status surface.
- [x] Add web admin controls for templates, channel toggles, test sends, and delivery status.

## Verification

```bash
yarn verify:expo-functional
yarn verify:notifications
node scripts/verify-delivery.mjs --profile notifications
```

## Blockers

- EAS project id and APNs/FCM credentials are required for real push smoke.
- Client email vendor endpoint/key/from address are required for live email smoke.
