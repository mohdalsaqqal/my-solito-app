#!/usr/bin/env node
import { PrismaClient } from '@prisma/client'
import { scryptSync, randomBytes } from 'node:crypto'

const prisma = new PrismaClient()

function requiredEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`${name} is required`)
  }
  return value
}

function optionalEnv(name) {
  const value = process.env[name]?.trim()
  return value || null
}

function hashBetterAuthPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const key = scryptSync(password.normalize('NFKC'), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  })
  return `${salt}:${key.toString('hex')}`
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function userIdFromEmail(role, email) {
  return `seed-${role}-${Buffer.from(email).toString('base64url').slice(0, 24)}`
}

async function seedCredentialUser({ email, password, name, role }) {
  const normalizedEmail = normalizeEmail(email)
  const userId = userIdFromEmail(role, normalizedEmail)
  const accountId = `seed-${role}-acct-${Buffer.from(normalizedEmail).toString('base64url').slice(0, 24)}`
  const roleId = `seed-${role}-role-${Buffer.from(normalizedEmail).toString('base64url').slice(0, 24)}`
  const passwordHash = hashBetterAuthPassword(password)

  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {
      name,
      emailVerified: true,
    },
    create: {
      id: userId,
      name,
      email: normalizedEmail,
      emailVerified: true,
    },
  })

  await prisma.account.upsert({
    where: { id: accountId },
    update: {
      accountId: normalizedEmail,
      providerId: 'credential',
      userId: user.id,
      password: passwordHash,
    },
    create: {
      id: accountId,
      accountId: normalizedEmail,
      providerId: 'credential',
      userId: user.id,
      password: passwordHash,
    },
  })

  await prisma.appAuthRoleMapping.upsert({
    where: { userId: user.id },
    update: {
      role,
      updatedByEmail: 'seed-admin',
    },
    create: {
      id: roleId,
      userId: user.id,
      role,
      updatedByEmail: 'seed-admin',
    },
  })

  console.log(`[seed-admin] ${role} ready: ${normalizedEmail}`)
}

async function main() {
  const adminEmail = requiredEnv('ADMIN_EMAIL')
  const adminPassword = requiredEnv('ADMIN_PASSWORD')
  const adminName = optionalEnv('ADMIN_NAME') ?? 'Admin User'

  await seedCredentialUser({
    email: adminEmail,
    password: adminPassword,
    name: adminName,
    role: 'admin',
  })

  const pharmacistEmail = optionalEnv('PHARMACIST_EMAIL')
  const pharmacistPassword = optionalEnv('PHARMACIST_PASSWORD')
  if (pharmacistEmail || pharmacistPassword) {
    if (!pharmacistEmail || !pharmacistPassword) {
      throw new Error('PHARMACIST_EMAIL and PHARMACIST_PASSWORD must be set together')
    }
    await seedCredentialUser({
      email: pharmacistEmail,
      password: pharmacistPassword,
      name: optionalEnv('PHARMACIST_NAME') ?? 'Pharmacist User',
      role: 'pharmacist',
    })
  }
}

main()
  .catch((error) => {
    console.error(`[seed-admin] FAIL ${error.message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
