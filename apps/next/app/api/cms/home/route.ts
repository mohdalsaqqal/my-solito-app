import { fail, ok } from '../../_lib/response'
import { getHomeCmsResponseData } from '../../../../server/services/home/home-cms.service'

export async function GET(request: Request) {
  try {
    const { payload, preview } = await getHomeCmsResponseData(request)
    const response = ok(payload)
    if (preview.valid) {
      response.headers.set('Cache-Control', 'private, no-store, max-age=0')
    }
    return response
  } catch (cause) {
    return fail(
      'CMS_HOME_UNEXPECTED',
      'Unexpected error while fetching home CMS data.',
      500,
      { scope: 'GET /api/cms/home', cause }
    )
  }
}
