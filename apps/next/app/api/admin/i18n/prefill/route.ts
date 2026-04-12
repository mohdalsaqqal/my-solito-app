import { translationProvider } from '@real/providers'
import { fail, ok } from '../../../_lib/response'
import { requireAdminDomainSession } from '../../../_lib/request-auth'
import { pushAudit, readAdminControlsState, writeAdminControlsState } from '../../../_lib/admin-controls-store'

type PrefillPayload = {
  dryRun?: boolean
}

export async function POST(request: Request) {
  try {
    const session = requireAdminDomainSession(request, 'operations', 'full')
    if (session instanceof Response) return session

    const payload = ((await request.json().catch(() => ({}))) ?? {}) as PrefillPayload

    const result = await translationProvider.prefillMissingKeys({
      dryRun: payload.dryRun === true,
    })

    if (!result.ok) {
      return fail(result.error.code, result.error.message, 500)
    }

    try {
      const state = await readAdminControlsState()
      pushAudit(state, {
        type: 'i18n',
        targetId: 'translations.prefill',
        actor: {
          userId: session.userId,
          email: session.email,
        },
        changes: {
          action: 'translation.prefill',
          dryRun: String(result.data.dryRun),
          filledKeys: String(result.data.filledKeys),
          missingBefore: String(result.data.missingBefore),
          missingAfter: String(result.data.missingAfter),
        },
      })
      await writeAdminControlsState(state)
    } catch (auditCause) {
      console.warn('[admin-i18n/prefill] Failed to persist audit entry', auditCause)
    }

    return ok(result.data)
  } catch (cause) {
    return fail('ADMIN_I18N_PREFILL_UNEXPECTED', 'Unexpected error while pre-filling translations.', 500, {
      scope: 'POST /api/admin/i18n/prefill',
      cause,
    })
  }
}
