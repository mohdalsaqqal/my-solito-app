import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'
import {
  mergeSiteConfigState,
  readSiteConfig,
  writeSiteConfig,
} from '../../../_lib/admin-site-config-store'
import type { SiteConfigState } from '../../../_lib/admin-site-config-store'

export async function GET(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'marketing', 'read')
    if (session instanceof Response) return session

    const config = await readSiteConfig()
    return ok(config)
  } catch (cause) {
    return fail(
      'ADMIN_SITE_CONFIG_GET_UNEXPECTED',
      'Unexpected error while loading site config.',
      500,
      { scope: 'GET /api/admin/cms/site-config', cause }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => null)) ?? null) as Partial<SiteConfigState> | null
    if (!body || typeof body !== 'object') {
      return fail('ADMIN_SITE_CONFIG_INVALID', 'Request body must be a valid site-config object.', 400)
    }

    const current = await readSiteConfig()
    const merged = mergeSiteConfigState(current, body)
    await writeSiteConfig(merged)
    const saved = await readSiteConfig()
    return ok(saved)
  } catch (cause) {
    return fail(
      'ADMIN_SITE_CONFIG_PUT_UNEXPECTED',
      'Unexpected error while saving site config.',
      500,
      { scope: 'PUT /api/admin/cms/site-config', cause }
    )
  }
}
