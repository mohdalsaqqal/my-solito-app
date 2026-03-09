import { accountProvider } from '@real/providers'
import { fail, ok } from '../../../_lib/response'
import { requireAuthSession } from '../../../_lib/request-auth'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }

    const { id } = await params
    const body = (await request.json().catch(() => ({}))) as {
      label?: string
      city?: string
      area?: string
      building?: string
      floor?: string
      apartment?: string
    }

    const result = await accountProvider.updateAddress(session.userId, id, body)
    if (!result.ok) {
      return fail(result.error.code, result.error.message, 400)
    }
    return ok(result.data)
  } catch (cause) {
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
    const session = requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }

    const { id } = await params
    const result = await accountProvider.deleteAddress(session.userId, id)
    if (!result.ok) {
      return fail(result.error.code, result.error.message, 400)
    }
    return ok(result.data)
  } catch (cause) {
    return fail('ACCOUNT_ADDRESS_DELETE_UNEXPECTED', 'Unexpected error while deleting address.', 500, {
      scope: 'DELETE /api/account/addresses/[id]',
      cause,
    })
  }
}

