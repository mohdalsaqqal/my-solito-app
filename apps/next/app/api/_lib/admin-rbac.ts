import { AuthRole } from '@real/app/lib/types'

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

export type AdminPanelRole = 'admin' | 'marketing' | 'catalog' | 'support' | 'ops'
type PermissionValue = 'full' | 'read' | 'none'

type DomainMatrix = Record<AdminDomain, PermissionValue>

const permissionMatrix: Record<AdminPanelRole, DomainMatrix> = {
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

export function isAdminPanelRole(role: AuthRole): role is AdminPanelRole {
  return (
    role === 'admin' ||
    role === 'marketing' ||
    role === 'catalog' ||
    role === 'support' ||
    role === 'ops'
  )
}

export function hasAdminDomainPermission(
  role: AuthRole,
  domain: AdminDomain,
  required: 'read' | 'full'
) {
  if (!isAdminPanelRole(role)) {
    return false
  }
  const value = permissionMatrix[role][domain]
  if (required === 'full') {
    return value === 'full'
  }
  return value !== 'none'
}
