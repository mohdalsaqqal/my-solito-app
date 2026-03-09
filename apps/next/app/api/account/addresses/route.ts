import { accountProvider } from '@real/providers'
import { matchProviderResult } from '@real/providers/contracts'
import { fail, ok } from '../../_lib/response'
import { requireAuthSession } from '../../_lib/request-auth'

export async function GET(request: Request) {
  try {
    const session = requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }

    const result = await accountProvider.listAddresses(session.userId)
    return matchProviderResult(result, {
      ok: (data) => ok(data),
      fail: (error) => fail(error.code, error.message, 500),
    })
  } catch (cause) {
    return fail('ACCOUNT_ADDRESSES_UNEXPECTED', 'Unexpected error while fetching account addresses.', 500, {
      scope: 'GET /api/account/addresses',
      cause,
    })
  }
}

export async function POST(request: Request) {
  try {
    const session = requireAuthSession(request)
    if (session instanceof Response) {
      return session
    }

    const body = (await request.json().catch(() => ({}))) as {
      label?: string
      city?: string
      area?: string
      building?: string
      floor?: string
      apartment?: string
    }

    const label = body.label?.trim() ?? ''
    const city = body.city?.trim() ?? ''
    const area = body.area?.trim() ?? ''
    const building = body.building?.trim() ?? ''

    if (!label || !city || !area || !building) {
      return fail(
        'ACCOUNT_ADDRESS_CREATE_INVALID_PAYLOAD',
        'label, city, area, and building are required.',
        400
      )
    }

    const result = await accountProvider.createAddress(session.userId, {
      label,
      city,
      area,
      building,
      floor: body.floor,
      apartment: body.apartment,
    })

    return matchProviderResult(result, {
      ok: (data) => ok(data, 201),
      fail: (error) => fail(error.code, error.message, 400),
    })
  } catch (cause) {
    return fail('ACCOUNT_ADDRESS_CREATE_UNEXPECTED', 'Unexpected error while creating address.', 500, {
      scope: 'POST /api/account/addresses',
      cause,
    })
  }
}
