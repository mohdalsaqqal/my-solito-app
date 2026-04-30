import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '../server/lib/prisma'
import {
  getBetterAuthBaseUrl,
  isBetterAuthPasswordResetDeliveryEnabled,
  getBetterAuthSecret,
  getBetterAuthTrustedOrigins,
} from '../app/api/_lib/security-policy'

const betterAuthSecret = getBetterAuthSecret()

if (!betterAuthSecret) {
  throw new Error(
    'A valid BETTER_AUTH_SECRET is required to initialize Better Auth in this environment.'
  )
}

export const auth = betterAuth({
  baseURL: getBetterAuthBaseUrl(),
  secret: betterAuthSecret,
  trustedOrigins: getBetterAuthTrustedOrigins(),
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      if (!isBetterAuthPasswordResetDeliveryEnabled()) {
        throw new Error('Better Auth password reset delivery is not configured in this environment.')
      }

      if (process.env.NODE_ENV !== 'test') {
        console.info('[auth] password-reset-link-created', {
          email: user.email,
          url,
        })
      }
    },
  },
})
