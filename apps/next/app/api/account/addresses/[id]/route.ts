import { fail, ok } from '../../../_lib/response'
import { requireAuthSession } from '../../../_lib/request-auth'
import { ServiceError } from '../../../../../server/services/_lib/service-error'
import { deleteAccountAddress, updateAccountAddress } from '../../../../../server/services/account/account-addresses.service'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }

    const { id } = await params
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    return ok(await updateAccountAddress(session.userId, id, body))
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'PATCH /api/account/addresses/[id]',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ACCOUNT_ADDRESS_UPDATE_UNEXPECTED', 'Unexpected error while updating address.', 500, {
      scope: 'PATCH /api/account/addresses/[id]',
      cause,
    })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }

    const { id } = await params
    return ok(await deleteAccountAddress(session.userId, id))
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'DELETE /api/account/addresses/[id]',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ACCOUNT_ADDRESS_DELETE_UNEXPECTED', 'Unexpected error while deleting address.', 500, {
      scope: 'DELETE /api/account/addresses/[id]',
      cause,
    })
  }
}
