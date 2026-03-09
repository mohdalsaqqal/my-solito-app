import {
  AuthProvider,
  AuthRequestAck,
  AuthSession,
} from '@real/providers/contracts'

type MockUser = {
  id: string
  name: string
  email: string
  password: string
  role: 'customer' | 'pharmacist' | 'admin' | 'marketing' | 'catalog' | 'support' | 'ops'
}

const users = new Map<string, MockUser>()
const resetTokens = new Map<string, string>()

let sessionUserId: string | null = null

function normalizeEmail(input: string) {
  return input.trim().toLowerCase()
}

function normalizeIdentifier(input: string) {
  return input.trim().toLowerCase()
}

function resolveLoginEmail(input: string) {
  const identifier = normalizeIdentifier(input)
  if (identifier.includes('@')) {
    return identifier
  }

  if (identifier === 'user') return 'user@realcosmetics.local'
  if (identifier === 'admin') return 'admin@realcosmetics.local'
  if (identifier === 'pharma') return 'pharma@realcosmetics.local'
  if (identifier === 'marketing') return 'marketing@realcosmetics.local'
  if (identifier === 'catalog') return 'catalog@realcosmetics.local'
  if (identifier === 'support') return 'support@realcosmetics.local'
  if (identifier === 'ops') return 'ops@realcosmetics.local'
  return identifier
}

function toSession(user: MockUser): AuthSession {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }
}

function okAck(): AuthRequestAck {
  return { accepted: true }
}

function seedUsers() {
  if (users.size > 0) {
    return
  }

  const seededUsers: MockUser[] = [
    {
      id: 'u-1',
      name: 'Customer User',
      email: 'user@realcosmetics.local',
      password: 'user',
      role: 'customer',
    },
    {
      id: 'u-2',
      name: 'Admin User',
      email: 'admin@realcosmetics.local',
      password: 'admin',
      role: 'admin',
    },
    {
      id: 'u-3',
      name: 'Pharmacist User',
      email: 'pharma@realcosmetics.local',
      password: 'pharma',
      role: 'pharmacist',
    },
    {
      id: 'u-4',
      name: 'Marketing Manager',
      email: 'marketing@realcosmetics.local',
      password: 'marketing',
      role: 'marketing',
    },
    {
      id: 'u-5',
      name: 'Catalog Manager',
      email: 'catalog@realcosmetics.local',
      password: 'catalog',
      role: 'catalog',
    },
    {
      id: 'u-6',
      name: 'Support Agent',
      email: 'support@realcosmetics.local',
      password: 'support',
      role: 'support',
    },
    {
      id: 'u-7',
      name: 'Operations Manager',
      email: 'ops@realcosmetics.local',
      password: 'ops',
      role: 'ops',
    },
  ]

  for (const user of seededUsers) {
    users.set(user.id, user)
  }

  sessionUserId = null
}

seedUsers()

export const mockAuthAdapter: AuthProvider = {
  async getSession() {
    if (!sessionUserId) {
      return { ok: true, data: null }
    }

    const user = users.get(sessionUserId)
    if (!user) {
      return { ok: true, data: null }
    }

    return {
      ok: true,
      data: toSession(user),
    }
  },

  async login(input) {
    const email = resolveLoginEmail(input.email)
    const user = Array.from(users.values()).find((candidate) => candidate.email === email)
    if (!user || user.password !== input.password) {
      return {
        ok: false,
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      }
    }

    sessionUserId = user.id
    return { ok: true, data: toSession(user) }
  },

  async register(input) {
    const email = normalizeEmail(input.email)
    const duplicate = Array.from(users.values()).some((candidate) => candidate.email === email)
    if (duplicate) {
      return {
        ok: false,
        error: {
          code: 'AUTH_EMAIL_EXISTS',
          message: 'An account with this email already exists.',
        },
      }
    }

    const nextId = `u-${users.size + 1}`
    const user: MockUser = {
      id: nextId,
      name: input.name.trim() || 'Customer',
      email,
      password: input.password,
      role: 'customer',
    }

    users.set(nextId, user)
    sessionUserId = nextId
    return { ok: true, data: toSession(user) }
  },

  async logout() {
    sessionUserId = null
    return { ok: true, data: okAck() }
  },

  async requestPasswordReset(input) {
    const email = normalizeEmail(input.email)
    const user = Array.from(users.values()).find((candidate) => candidate.email === email)
    if (!user) {
      return { ok: true, data: okAck() }
    }

    const token = `reset-${user.id}`
    resetTokens.set(token, user.id)
    return { ok: true, data: okAck() }
  },

  async resetPassword(input) {
    const userId = resetTokens.get(input.token)
    if (!userId) {
      return {
        ok: false,
        error: {
          code: 'AUTH_INVALID_RESET_TOKEN',
          message: 'Reset token is invalid or expired.',
        },
      }
    }

    const user = users.get(userId)
    if (!user) {
      return {
        ok: false,
        error: {
          code: 'AUTH_USER_NOT_FOUND',
          message: 'Unable to reset password for this user.',
        },
      }
    }

    users.set(user.id, {
      ...user,
      password: input.newPassword,
    })
    resetTokens.delete(input.token)

    return { ok: true, data: okAck() }
  },
}
