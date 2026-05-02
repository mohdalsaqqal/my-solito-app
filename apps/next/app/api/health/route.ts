import { getOperationsHealth } from '../../../server/services/operations/health.service'

export async function GET() {
  const health = await getOperationsHealth()
  return Response.json(
    {
      success: true,
      data: health,
    },
    {
      status: health.status === 'unhealthy' ? 503 : 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
}
