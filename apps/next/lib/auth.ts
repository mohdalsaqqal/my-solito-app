import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '../server/lib/prisma'
import {
  getBetterAuthBaseUrl,
  isBetterAuthPasswordResetDeliveryEnabled,
  getBetterAuthSecret,
  getBetterAuthTrustedOrigins,
} from '../app/api/_lib/security-policy'

let _auth: any = null

function createAuth() {
  const betterAuthSecret = getBetterAuthSecret()

  if (!betterAuthSecret) {
    throw new Error(
      'A valid BETTER_AUTH_SECRET is required to initialize Better Auth in this environment.'
    )
  }

  return betterAuth({
    baseURL: getBetterAuthBaseUrl(),
    secret: betterAuthSecret,
    trustedOrigins: getBetterAuthTrustedOrigins(),
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    emailAndPassword: {
      enabled: true,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }: { user: any; url: string }) => {
        if (!isBetterAuthPasswordResetDeliveryEnabled()) {
          throw new Error('Better Auth password reset delivery is not configured in this environment.')
        }

        if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production') {
          console.info('[auth] password-reset-link-created', {
            email: user.email,
          })
        }
      },
    },
  })
}

export const auth = new Proxy({} as any, {
  get(_target: any, prop: string | symbol) {
    if (!_auth) {
      _auth = createAuth()
    }
    const value = _auth[prop]
    if (typeof value === 'function') {
      return value.bind(_auth)
    }
    return value
  },
}) as ReturnType<typeof betterAuth>
