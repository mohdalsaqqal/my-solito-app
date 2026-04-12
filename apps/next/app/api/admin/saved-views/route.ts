import { SavedView } from '@real/providers/contracts'
import {
  deleteSavedView,
  readAdminSavedViewsState,
  upsertSavedView,
  writeAdminSavedViewsState,
} from '../../_lib/admin-saved-views-store'
import { fail, ok } from '../../_lib/response'
import { requireAdminAnyDomainSession } from '../../_lib/request-auth'

type SavedViewPayload = {
  view?: SavedView
}

export async function GET(request: Request) {
  try {
    const session = requireAdminAnyDomainSession(request, ['catalog', 'sales', 'inventory', 'marketplace', 'operations'])
    if (session instanceof Response) return session

    const entity = new URL(request.url).searchParams.get('entity')
    const state = await readAdminSavedViewsState()
    const data =
      entity === 'products' || entity === 'orders' || entity === 'inventory' || entity === 'vendors'
        ? state.views.filter((view) => view.entity === entity)
        : state.views
    return ok(data)
  } catch (cause) {
    return fail('ADMIN_SAVED_VIEWS_LIST_UNEXPECTED', 'Unexpected error while loading saved views.', 500, {
      scope: 'GET /api/admin/saved-views',
      cause,
    })
  }
}

export async function POST(request: Request) {
  try {
    const session = requireAdminAnyDomainSession(request, ['catalog', 'sales', 'inventory', 'marketplace'], 'full')
    if (session instanceof Response) return session

    const body = ((await request.json().catch(() => ({}))) ?? {}) as SavedViewPayload
    if (!body.view?.id || !body.view?.entity || !body.view?.name || !Array.isArray(body.view.visibleColumns)) {
      return fail('ADMIN_SAVED_VIEW_INVALID', 'Saved view payload is invalid.', 400)
    }

    const state = await readAdminSavedViewsState()
    upsertSavedView(state, body.view)
    await writeAdminSavedViewsState(state)
    return ok(body.view, 201)
  } catch (cause) {
    return fail('ADMIN_SAVED_VIEW_UPSERT_UNEXPECTED', 'Unexpected error while saving view.', 500, {
      scope: 'POST /api/admin/saved-views',
      cause,
    })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = requireAdminAnyDomainSession(request, ['catalog', 'sales', 'inventory', 'marketplace'], 'full')
    if (session instanceof Response) return session

    const id = new URL(request.url).searchParams.get('id')?.trim()
    if (!id) return fail('ADMIN_SAVED_VIEW_ID_REQUIRED', 'Saved view id is required.', 400)

    const state = await readAdminSavedViewsState()
    const removed = deleteSavedView(state, id)
    if (!removed) return fail('ADMIN_SAVED_VIEW_NOT_FOUND', 'Saved view not found.', 404)
    await writeAdminSavedViewsState(state)
    return ok({ id, deleted: true })
  } catch (cause) {
    return fail('ADMIN_SAVED_VIEW_DELETE_UNEXPECTED', 'Unexpected error while deleting view.', 500, {
      scope: 'DELETE /api/admin/saved-views',
      cause,
    })
  }
}
