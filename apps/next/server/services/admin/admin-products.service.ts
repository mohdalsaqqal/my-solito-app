import { adminProductProvider } from '@real/providers'
import type { ProductUpsertInput } from '@real/providers/contracts'
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

export async function listAdminProducts(request: Request) {
  const baseInput = parseAdminListQuery(request)
  const state = await readAdminSavedViewsState()
  const savedView = baseInput.viewId
    ? state.views.find((view) => view.id === baseInput.viewId && view.entity === 'products')
    : undefined
  const merged = mergeWithSavedView(baseInput, savedView)

  const fieldsResult = await adminProductProvider.productFields()
  if (!fieldsResult.ok) {
    throw new ServiceError(fieldsResult.error.code, fieldsResult.error.message, 400)
  }

  const filtersValidation = validateFilters(merged.filters, [
    'status',
    'vendor',
    'brand',
    'category',
    'lowStock',
    'priceMin',
    'priceMax',
    'updatedFrom',
    'updatedTo',
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

  const result = await adminProductProvider.listProducts({
    ...merged,
    fields: validation.fields,
  })
  if (!result.ok) {
    throw new ServiceError(result.error.code, result.error.message, 400)
  }

  return result.data
}

export async function getAdminProductDetail(id: string) {
  const result = await adminProductProvider.getProduct(id)
  if (!result.ok) {
    throw new ServiceError(result.error.code, result.error.message, 404)
  }

  return result.data
}

export async function updateAdminProduct(id: string, input: Partial<ProductUpsertInput>) {
  const result = await adminProductProvider.updateProduct(id, input)
  if (!result.ok) {
    throw new ServiceError(result.error.code, result.error.message, 404)
  }

  return result.data
}

