import { resolveNormalizedSessionFromRequest } from '../../../../server/services/auth'

export async function resolveAuthSessionFromRequest(request: Request) {
  return resolveNormalizedSessionFromRequest(request)
}
