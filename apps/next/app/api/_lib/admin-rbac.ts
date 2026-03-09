import { AuthRole } from '@real/app/lib/types'

export type AdminDomain =
  | 'dashboard'
  | 'catalog'
  | 'marketing'
  | 'orders'
  | 'customers'
  | 'operations'

export type AdminPanelRole = 'admin' | 'marketing' | 'catalog' | 'support' | 'ops'
type PermissionValue = 'full' | 'read' | 'none'

type DomainMatrix = Record<AdminDomain, PermissionValue>

const permissionMatrix: Record<AdminPanelRole, DomainMatrix> = {
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

export function isAdminPanelRole(role: AuthRole): role is AdminPanelRole {
  return (
    role === 'admin' ||
    role === 'marketing' ||
    role === 'catalog' ||
    role === 'support' ||
    role === 'ops'
  )
}

export function hasAdminDomainAccess(role: AuthRole, domain: AdminDomain) {
  return hasAdminDomainPermission(role, domain, 'read')
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
