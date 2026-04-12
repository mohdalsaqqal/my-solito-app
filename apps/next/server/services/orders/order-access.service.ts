import { orderProvider } from '@real/providers'
import type { AuthRole } from '@real/providers/contracts'
import { hasAdminDomainPermission } from '../../../app/api/_lib/admin-rbac'
import { ServiceError } from '../_lib/service-error'

type SessionLike = {
  userId: string
  role: AuthRole
}

function isOwnOrder(session: SessionLike, orderId: string, ownerUserId?: string | null) {
  if (ownerUserId) {
    return ownerUserId === session.userId
  }

  return orderId.startsWith(`ord-${session.userId}-`)
}

export async function listAccessibleOrders(session: SessionLike) {
  const result = await orderProvider.list()
  if (!result.ok) {
    throw new ServiceError(result.error.code, result.error.message, 500)
  }

  if (hasAdminDomainPermission(session.role, 'sales', 'read')) {
    return result.data
  }

  return result.data.filter((order) => isOwnOrder(session, order.id, order.ownerUserId))
}

export async function getAccessibleOrder(session: SessionLike, id: string) {
  const result = await orderProvider.get(id)
  if (!result.ok) {
    throw new ServiceError(result.error.code, result.error.message, 404)
  }

  if (!hasAdminDomainPermission(session.role, 'sales', 'read') && !isOwnOrder(session, id, result.data.ownerUserId)) {
    throw new ServiceError('ORDER_NOT_FOUND', 'Order not found.', 404)
  }

  return result.data
}
