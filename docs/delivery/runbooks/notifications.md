# Notifications Runbook

## Architecture

```
Order/account event
-> Next.js notification service
-> NotificationProvider
-> multi-channel provider
-> Expo push adapter and/or email adapter
```

The UI never calls Expo, APNs, FCM, or email vendors directly.

## Push

Push registration is owned by the Expo app and registration API. The provider stores device tokens through `NotificationProvider.registerDevice`.

Live push smoke requires:

- EAS project id configured in the Expo app.
- APNs/FCM credentials configured in EAS.
- `USE_EXPO_PUSH=true`.
- `EXPO_PUSH_ACCESS_TOKEN` if the target Expo project requires it.

## Email

Email delivery is optional and configured through a generic REST email adapter.

| Variable | Description |
|---|---|
| `USE_EMAIL_NOTIFICATIONS` | Set to `true` to enable email channel |
| `EMAIL_NOTIFICATION_ENDPOINT` | Vendor/proxy endpoint that accepts email JSON |
| `EMAIL_NOTIFICATION_API_KEY` | Optional bearer token |
| `EMAIL_NOTIFICATION_FROM` | Sender address |

Request sent by the adapter:

```json
{
  "from": "no-reply@example.com",
  "to": "customer@example.com",
  "subject": "Order update",
  "text": "Your order ord-1 is now shipped.",
  "data": {
    "type": "order_status",
    "orderId": "ord-1",
    "status": "shipped"
  }
}
```

## Retry And Dead Letter

Failed provider deliveries are recorded in `.data/notification-dead-letter-store.json` locally.

Each record includes:

- tenant/user/order/channel identifiers when available
- provider and delivery status
- error message
- `retryCount`
- `nextRetryAt`

Production should move this store to tenant-scoped PostgreSQL with an operator retry view and scheduled retry worker.

## Status Surface

`getNotificationStatus()` exposes:

- provider name
- readiness
- dead-letter count
- pending retry count

## Admin Control Center

Web admin controls live at:

```text
/admin/marketing/notifications
```

Admin API routes:

| Route | Method | Purpose |
|---|---|---|
| `/api/admin/notifications` | `GET` | Load templates, campaigns, provider status, and recent dead letters |
| `/api/admin/notifications/templates/:id` | `PATCH` | Update event template enabled state, channel toggles, subject, and body |
| `/api/admin/notifications/campaigns` | `GET` | List campaigns |
| `/api/admin/notifications/campaigns` | `POST` | Create a test/scheduled campaign |

Access model:

- Store managers with marketing access manage templates and campaigns.
- Operations can read provider status through admin notification overview.
- Customers only receive notifications and manage preferences from account surfaces.
- Mobile app has no notification-send controls.

Control center features:

- enable/disable transactional templates
- choose push/email channels per event
- send a test push/email to one user/email
- view recent campaigns
- view provider readiness and dead-letter backlog

## Verification

```bash
yarn verify:notifications
node scripts/verify-delivery.mjs --profile notifications
```

External manual verification:

- Send a push to a physical iOS and Android device.
- Send an email through the client-selected vendor sandbox.
