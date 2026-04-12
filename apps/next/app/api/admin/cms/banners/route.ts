import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'
import { readBannersState, writeBannersState } from '../../../_lib/admin-banners-store'
import type { BannersState } from '../../../_lib/admin-banners-store'

export async function GET(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'marketing', 'read')
    if (session instanceof Response) return session

    const state = await readBannersState()
    return ok(state)
  } catch (cause) {
    return fail(
      'ADMIN_BANNERS_GET_UNEXPECTED',
      'Unexpected error while loading banners state.',
      500,
      { scope: 'GET /api/admin/cms/banners', cause }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => null)) ?? null) as BannersState | null
    if (!body || typeof body !== 'object') {
      return fail('ADMIN_BANNERS_INVALID', 'Request body must be a valid BannersState object.', 400)
    }

    await writeBannersState(body)
    const saved = await readBannersState()
    return ok(saved)
  } catch (cause) {
    return fail(
      'ADMIN_BANNERS_PUT_UNEXPECTED',
      'Unexpected error while saving banners state.',
      500,
      { scope: 'PUT /api/admin/cms/banners', cause }
    )
  }
}
