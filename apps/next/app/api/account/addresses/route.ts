import { fail, ok } from '../../_lib/response'
import { requireAuthSession } from '../../_lib/request-auth'
import { ServiceError } from '../../../../server/services/_lib/service-error'
import { createAccountAddress, listAccountAddresses } from '../../../../server/services/account/account-addresses.service'

export async function GET(request: Request) {
  try {
    const session = await requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }

    return ok(await listAccountAddresses(session.userId))
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'GET /api/account/addresses',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ACCOUNT_ADDRESSES_UNEXPECTED', 'Unexpected error while fetching account addresses.', 500, {
      scope: 'GET /api/account/addresses',
      cause,
    })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    return ok(await createAccountAddress(session.userId, body), 201)
  } catch (cause) {
    if (cause instanceof ServiceError) {
      return fail(cause.code, cause.message, cause.status, {
        scope: 'POST /api/account/addresses',
        cause: cause.cause ?? cause,
      })
    }
    return fail('ACCOUNT_ADDRESS_CREATE_UNEXPECTED', 'Unexpected error while creating address.', 500, {
      scope: 'POST /api/account/addresses',
      cause,
    })
  }
}
