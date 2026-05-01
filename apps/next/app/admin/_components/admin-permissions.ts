export type AdminDomain =
  | 'dashboard'
  | 'catalog'
  | 'sales'
  | 'inventory'
  | 'marketplace'
  | 'marketing'
  | 'customers'
  | 'operations'
  | 'settings'
export type AdminRole = 'admin' | 'marketing' | 'catalog' | 'support' | 'ops'

type PermissionValue = 'full' | 'read' | 'none'

type DomainMatrix = Record<AdminDomain, PermissionValue>

const permissionMatrix: Record<AdminRole, DomainMatrix> = {
  admin: {
    dashboard: 'full',
    catalog: 'full',
    sales: 'full',
    inventory: 'full',
    marketplace: 'full',
    marketing: 'full',
    customers: 'full',
    operations: 'full',
    settings: 'full',
  },
  marketing: {
    dashboard: 'read',
    catalog: 'read',
    sales: 'read',
    inventory: 'read',
    marketplace: 'read',
    marketing: 'full',
    customers: 'read',
    operations: 'none',
    settings: 'read',
  },
  catalog: {
    dashboard: 'read',
    catalog: 'full',
    sales: 'read',
    inventory: 'full',
    marketplace: 'read',
    marketing: 'read',
    customers: 'read',
    operations: 'none',
    settings: 'read',
  },
  support: {
    dashboard: 'read',
    catalog: 'read',
    sales: 'full',
    inventory: 'read',
    marketplace: 'read',
    marketing: 'read',
    customers: 'full',
    operations: 'none',
    settings: 'read',
  },
  ops: {
    dashboard: 'read',
    catalog: 'read',
    sales: 'read',
    inventory: 'read',
    marketplace: 'read',
    marketing: 'read',
    customers: 'read',
    operations: 'full',
    settings: 'read',
  },
}

export function resolveAdminRole(input: unknown): AdminRole {
  if (input === 'marketing' || input === 'catalog' || input === 'support' || input === 'ops') {
    return input
  }
  return 'admin'
}

export function canAccessDomain(
  role: AdminRole,
  domain: AdminDomain,
  customPermissions?: Partial<Record<string, 'none' | 'read' | 'full'>>
) {
  if (customPermissions && Object.keys(customPermissions).length > 0) {
    return (customPermissions[domain] ?? 'none') !== 'none'
  }
  return permissionMatrix[role][domain] !== 'none'
}
