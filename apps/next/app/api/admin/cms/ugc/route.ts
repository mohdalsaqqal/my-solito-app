import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'
import { readUGCState, writeUGCState } from '../../../_lib/admin-ugc-store'
import { readAdminControlsState, pushAudit, writeAdminControlsState } from '../../../_lib/admin-controls-store'
import type { UGCState } from '../../../_lib/admin-ugc-store'
import { z } from 'zod'

const ugcItemSchema = z.object({
  id: z.string().min(1),
  imageUrl: z.string().url().or(z.string().startsWith('/')),
  caption: z.string(),
  sourceHandle: z.string(),
  active: z.boolean(),
  order: z.number().int().nonnegative(),
})

const ugcStateSchema = z.object({
  items: z.array(ugcItemSchema),
})

export async function GET(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'marketing', 'read')
    if (session instanceof Response) return session

    const state = await readUGCState()
    return ok(state)
  } catch (cause) {
    return fail(
      'ADMIN_UGC_GET_UNEXPECTED',
      'Unexpected error while loading UGC state.',
      500,
      { scope: 'GET /api/admin/cms/ugc', cause }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAdminDomainSession(request, 'marketing', 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => null)) ?? null) as UGCState | null
    if (!body || typeof body !== 'object') {
      return fail('ADMIN_UGC_INVALID', 'Request body must be a valid UGCState object.', 400)
    }

    const validation = ugcStateSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return fail(
        'ADMIN_UGC_VALIDATION',
        `Invalid UGC data: ${firstError.message} at ${firstError.path.join('.')}`,
        400,
      )
    }

    const actor = { userId: session.userId, email: session.email }

    // Read current UGC state for audit comparison
    const currentUGC = await readUGCState()
    const prevCount = currentUGC.items.length

    await writeUGCState(body)

    // Push audit entry
    const controlsState = await readAdminControlsState()
    pushAudit(controlsState, {
      type: 'marketing',
      targetId: 'ugc-gallery',
      actor,
      changes: { previousItemCount: String(prevCount), nextItemCount: String(body.items?.length ?? 0) },
    })
    await writeAdminControlsState(controlsState)

    const saved = await readUGCState()
    return ok(saved)
  } catch (cause) {
    return fail(
      'ADMIN_UGC_PUT_UNEXPECTED',
      'Unexpected error while saving UGC state.',
      500,
      { scope: 'PUT /api/admin/cms/ugc', cause }
    )
  }
}
