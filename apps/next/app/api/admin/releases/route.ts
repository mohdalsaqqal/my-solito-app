import { releaseProvider } from '@real/providers'
import { fail, ok } from '../../_lib/response'
import { requireAdminDomainSession } from '../../_lib/request-auth'
import { pushAudit, readAdminControlsState, writeAdminControlsState } from '../../_lib/admin-controls-store'
import { buildPageConfigId, upsertPageConfig } from '../../_lib/page-config-store'
import { resolveStoreId } from '../../_lib/release-env'

export async function GET(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'marketing')
    if (session instanceof Response) return session

    const result = await releaseProvider.list()
    if (!result.ok) return fail(result.error.code, result.error.message, 500)
    return ok(result.data)
  } catch (cause) {
    return fail('ADMIN_RELEASES_LIST_UNEXPECTED', 'Unexpected error while loading releases.', 500, {
      scope: 'GET /api/admin/releases',
      cause,
    })
  }
}

type CreatePayload = {
  environment?: 'staging' | 'production'
  status?: 'draft' | 'published'
  name?: string
  scheduledAt?: string
}

export async function POST(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as CreatePayload
    if (body.environment !== 'staging' && body.environment !== 'production') {
      return fail('ADMIN_RELEASE_ENV_INVALID', 'Release environment is required.', 400)
    }

    const created = await releaseProvider.create({
      environment: body.environment,
      status: body.status === 'published' ? 'published' : 'draft',
      name: typeof body.name === 'string' ? body.name.trim() || undefined : undefined,
      scheduledAt: typeof body.scheduledAt === 'string' ? body.scheduledAt : undefined,
    })
    if (!created.ok) return fail(created.error.code, created.error.message, 400)

    const storeId = resolveStoreId(request)
    await upsertPageConfig({
      pageConfigId: buildPageConfigId({ storeId, slug: '/', pageType: 'home', releaseId: created.data.id }),
      releaseId: created.data.id,
      storeId,
      slug: '/',
      pageType: 'home',
      updatedAt: new Date().toISOString(),
      blocks: [],
    })

    const state = await readAdminControlsState()
    pushAudit(state, {
      type: 'marketing',
      targetId: created.data.id,
      actor: { userId: session.userId, email: session.email },
      changes: {
        action: 'release.create',
        environment: created.data.environment,
        status: created.data.status,
      },
    })
    await writeAdminControlsState(state)

    return ok(created.data, 201)
  } catch (cause) {
    return fail('ADMIN_RELEASE_CREATE_UNEXPECTED', 'Unexpected error while creating release.', 500, {
      scope: 'POST /api/admin/releases',
      cause,
    })
  }
}

