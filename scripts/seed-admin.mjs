import { PrismaClient } from '@prisma/client'
import { scryptSync, randomBytes } from 'node:crypto'

function hashBetterAuthPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const key = scryptSync(password.normalize('NFKC'), salt, 64, {
    N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2,
  })
  return salt + ':' + key.toString('hex')
}

async function seed() {
  const prisma = new PrismaClient()

  const userId = 'seed-admin-001'
  const email = 'admin@realcosmetics.local'
  const password = 'admin'

  await prisma.account.deleteMany({ where: { userId } }).catch(() => {})
  await prisma.session.deleteMany({ where: { userId } }).catch(() => {})
  await prisma.appAuthRoleMapping.deleteMany({ where: { userId } }).catch(() => {})
  await prisma.user.deleteMany({ where: { id: userId } }).catch(() => {})

  const user = await prisma.user.create({
    data: {
      id: userId,
      name: 'Admin User',
      email,
      emailVerified: true,
    }
  })
  console.log('User created:', user.id)

  const hash = hashBetterAuthPassword(password)
  await prisma.account.create({
    data: {
      id: 'seed-admin-acct-001',
      accountId: email,
      providerId: 'credential',
      userId,
      password: hash,
    }
  })
  console.log('Account created with password hash')

  await prisma.appAuthRoleMapping.create({
    data: {
      id: 'seed-admin-role-001',
      userId,
      role: 'admin',
    }
  })
  console.log('Role mapping created (admin)')

  console.log('')
  console.log('Admin credentials:')
  console.log('  Email:    ' + email)
  console.log('  Password: ' + password)

  // Pharmacist
  const pharmaId = 'seed-pharma-001'
  const pharmaEmail = 'pharma@realcosmetics.local'
  const pharmaPass = 'pharma'

  await prisma.account.deleteMany({ where: { userId: pharmaId } }).catch(() => {})
  await prisma.session.deleteMany({ where: { userId: pharmaId } }).catch(() => {})
  await prisma.appAuthRoleMapping.deleteMany({ where: { userId: pharmaId } }).catch(() => {})
  await prisma.user.deleteMany({ where: { id: pharmaId } }).catch(() => {})

  await prisma.user.create({ data: { id: pharmaId, name: 'Pharmacist User', email: pharmaEmail, emailVerified: true } })
  const phHash = hashBetterAuthPassword(pharmaPass)
  await prisma.account.create({ data: { id: 'seed-pharma-acct-001', accountId: pharmaEmail, providerId: 'credential', userId: pharmaId, password: phHash } })
  await prisma.appAuthRoleMapping.create({ data: { id: 'seed-pharma-role-001', userId: pharmaId, role: 'pharmacist' } })
  console.log('')
  console.log('Pharmacist credentials:')
  console.log('  Email:    ' + pharmaEmail)
  console.log('  Password: ' + pharmaPass)

  await prisma.$disconnect()
}

seed().catch((e) => {
  console.error(e.message)
  process.exit(1)
})
