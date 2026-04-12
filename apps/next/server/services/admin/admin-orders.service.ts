import { adminOrderProvider, orderProvider } from '@real/providers'
import {
  type OrderActionInput,
  type OrderStatus,
  type OrderUpdateInput,
} from '@real/providers/contracts'
import {
  defaultCoreFieldKeys,
  mergeWithSavedView,
  parseAdminListQuery,
  validateFilters,
  validateRequestedFields,
  validateSortKey,
} from '../../../app/api/admin/_lib/admin-list-query'
import { readAdminSavedViewsState } from '../../../app/api/_lib/admin-saved-views-store'
import { ServiceError } from '../_lib/service-error'

const allowedStatuses: OrderStatus[] = ['placed', 'shipped', 'delivered', 'cancelled']

export async function listAdminOrders(request: Request) {
  const baseInput = parseAdminListQuery(request)
  const state = await readAdminSavedViewsState()
  const savedView = baseInput.viewId
    ? state.views.find((view) => view.id === baseInput.viewId && view.entity === 'orders')
    : undefined
  const merged = mergeWithSavedView(baseInput, savedView)

  const fieldsResult = await adminOrderProvider.orderFields()
  if (!fieldsResult.ok) {
    throw new ServiceError(fieldsResult.error.code, fieldsResult.error.message, 400)
  }

  const filtersValidation = validateFilters(merged.filters, [
    'paymentStatus',
    'fulfillmentStatus',
    'orderStatus',
    'vendor',
    'dateFrom',
    'dateTo',
    'minTotal',
    'maxTotal',
  ])
  if (!filtersValidation.ok) {
    throw new ServiceError(filtersValidation.code, filtersValidation.message, 400)
  }

  const sortValidation = validateSortKey(merged.sort, fieldsResult.data)
  if (!sortValidation.ok) {
    throw new ServiceError(sortValidation.code, sortValidation.message, 400)
  }

  const validation = validateRequestedFields(
    merged.fields,
    fieldsResult.data,
    defaultCoreFieldKeys(fieldsResult.data),
  )
  if (!validation.ok) {
    throw new ServiceError(validation.code, validation.message, 400)
  }

  const result = await adminOrderProvider.listOrders({
    ...merged,
    fields: validation.fields,
  })
  if (!result.ok) {
    throw new ServiceError(result.error.code, result.error.message, 400)
  }

  return result.data
}

export async function getAdminOrderDetail(id: string) {
  const result = await adminOrderProvider.getOrder(id)
  if (!result.ok) {
    throw new ServiceError(result.error.code, result.error.message, 404)
  }

  return result.data
}

export async function updateAdminOrder(id: string, input: Partial<OrderUpdateInput>) {
  const result = await adminOrderProvider.updateOrder(id, input)
  if (!result.ok) {
    throw new ServiceError(result.error.code, result.error.message, 404)
  }

  return result.data
}

export async function runAdminOrderAction(id: string, input: OrderActionInput) {
  if (!input.action) {
    throw new ServiceError('ADMIN_ORDER_ACTION_REQUIRED', 'Order action is required.', 400)
  }

  const result = await adminOrderProvider.runOrderAction(id, input)
  if (!result.ok) {
    throw new ServiceError(result.error.code, result.error.message, 404)
  }

  return result.data
}

export async function updateAdminOrderStatus(id: string, status?: OrderStatus) {
  if (!status || !allowedStatuses.includes(status)) {
    throw new ServiceError('ORDER_STATUS_INVALID', 'A valid order status is required.', 400)
  }

  const result = await orderProvider.updateStatus(id, status)
  if (!result.ok) {
    throw new ServiceError(
      result.error.code,
      result.error.message,
      result.error.code === 'ORDER_NOT_FOUND'
        ? 404
        : result.error.code === 'ORDER_STATUS_INVALID_TRANSITION'
          ? 409
          : 400,
    )
  }

  return result.data
}
