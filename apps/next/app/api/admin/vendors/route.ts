import { adminVendorProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'
import { requireAdminDomainSession } from '../../_lib/request-auth'
import {
  defaultCoreFieldKeys,
  mergeWithSavedView,
  parseAdminListQuery,
  validateFilters,
  validateRequestedFields,
  validateSortKey,
} from '../_lib/admin-list-query'
import { readAdminSavedViewsState } from '../../_lib/admin-saved-views-store'

export async function GET(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'marketplace')
    if (session instanceof Response) return session

    const baseInput = parseAdminListQuery(request)
    const state = await readAdminSavedViewsState()
    const savedView = baseInput.viewId
      ? state.views.find((view) => view.id === baseInput.viewId && view.entity === 'vendors')
      : undefined
    const merged = mergeWithSavedView(baseInput, savedView)

    const fieldsResult = await adminVendorProvider.vendorFields()
    if (!fieldsResult.ok) return fail(fieldsResult.error.code, fieldsResult.error.message, 400)

    const filtersValidation = validateFilters(merged.filters, [
      'status',
      'payoutStatus',
      'approvalStatus',
      'minCommissionRate',
      'maxCommissionRate',
      'createdFrom',
      'createdTo',
    ])
    if (!filtersValidation.ok) return fail(filtersValidation.code, filtersValidation.message, 400)

    const sortValidation = validateSortKey(merged.sort, fieldsResult.data)
    if (!sortValidation.ok) return fail(sortValidation.code, sortValidation.message, 400)

    const validation = validateRequestedFields(
      merged.fields,
      fieldsResult.data,
      defaultCoreFieldKeys(fieldsResult.data)
    )
    if (!validation.ok) return fail(validation.code, validation.message, 400)

    const result = await adminVendorProvider.listVendors({
      ...merged,
      fields: validation.fields,
    })
    if (!result.ok) return fail(result.error.code, result.error.message, 400)
    return ok(result.data)
  } catch (cause) {
    return fail('ADMIN_VENDORS_LIST_UNEXPECTED', 'Unexpected error while loading admin vendors.', 500, {
      scope: 'GET /api/admin/vendors',
      cause,
    })
  }
}
