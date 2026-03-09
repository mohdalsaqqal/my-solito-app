export type AdminDomain = 'dashboard' | 'catalog' | 'marketing' | 'orders' | 'customers' | 'operations'
export type AdminRole = 'admin' | 'marketing' | 'catalog' | 'support' | 'ops'

type PermissionValue = 'full' | 'read' | 'none'

type DomainMatrix = Record<AdminDomain, PermissionValue>

const permissionMatrix: Record<AdminRole, DomainMatrix> = {
  admin: {
    dashboard: 'full',
    catalog: 'full',
    marketing: 'full',
    orders: 'full',
    customers: 'full',
    operations: 'full',
  },
  marketing: {
    dashboard: 'read',
    catalog: 'read',
    marketing: 'full',
    orders: 'read',
    customers: 'read',
    operations: 'none',
  },
  catalog: {
    dashboard: 'read',
    catalog: 'full',
    marketing: 'read',
    orders: 'read',
    customers: 'read',
    operations: 'none',
  },
  support: {
    dashboard: 'read',
    catalog: 'read',
    marketing: 'read',
    orders: 'full',
    customers: 'full',
    operations: 'none',
  },
  ops: {
    dashboard: 'read',
    catalog: 'read',
    marketing: 'read',
    orders: 'read',
    customers: 'read',
    operations: 'full',
  },
}

export function resolveAdminRole(input: unknown): AdminRole {
  if (input === 'marketing' || input === 'catalog' || input === 'support' || input === 'ops') {
    return input
  }
  return 'admin'
}

export function canAccessDomain(role: AdminRole, domain: AdminDomain) {
  return permissionMatrix[role][domain] !== 'none'
}

