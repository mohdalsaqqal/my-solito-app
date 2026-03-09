import { accountProvider } from '@real/providers'
import { fail, ok } from '../../../../_lib/response'
import { requireAuthSession } from '../../../../_lib/request-auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }

    const { id } = await params
    const result = await accountProvider.setDefaultAddress(session.userId, id)
    if (!result.ok) {
      return fail(result.error.code, result.error.message, 400)
    }
    return ok(result.data)
  } catch (cause) {
    return fail('ACCOUNT_ADDRESS_SET_DEFAULT_UNEXPECTED', 'Unexpected error while setting default address.', 500, {
      scope: 'POST /api/account/addresses/[id]/set-default',
      cause,
    })
  }
}

