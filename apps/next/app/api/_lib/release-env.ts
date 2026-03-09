import { ReleaseEnvironment } from '@real/providers/contracts'

export function resolveReleaseEnvironment(request: Request): ReleaseEnvironment {
  const url = new URL(request.url)
  const envParam = url.searchParams.get('env')
  if (envParam === 'staging' || envParam === 'production') {
    return envParam
  }

  const header = request.headers.get('x-release-env')
  if (header === 'staging' || header === 'production') {
    return header
  }

  return process.env.NODE_ENV === 'production' ? 'production' : 'staging'
}
