import test from 'node:test'
import assert from 'node:assert/strict'
import {
  hasAdminDomainPermission,
  isAdminPanelRole,
  type AdminDomain,
} from './admin-rbac'

// ── isAdminPanelRole ──────────────────────────────────────────────────────────

test('isAdminPanelRole returns true for all admin panel roles', () => {
  for (const role of ['admin', 'marketing', 'catalog', 'support', 'ops'] as const) {
    assert.equal(isAdminPanelRole(role), true, `expected ${role} to be admin panel role`)
  }
})

test('isAdminPanelRole returns false for non-admin roles', () => {
  for (const role of ['customer', 'pharmacist'] as const) {
    assert.equal(isAdminPanelRole(role), false, `expected ${role} not to be admin panel role`)
  }
})

// ── admin: full access everywhere ─────────────────────────────────────────────

test('admin has full access to all domains', () => {
  const domains: AdminDomain[] = [
    'dashboard', 'catalog', 'sales', 'inventory', 'marketplace',
    'marketing', 'customers', 'operations', 'settings',
  ]
  for (const domain of domains) {
    assert.equal(
      hasAdminDomainPermission('admin', domain, 'full'),
      true,
      `admin should have full on ${domain}`,
    )
    assert.equal(
      hasAdminDomainPermission('admin', domain, 'read'),
      true,
      `admin should have read on ${domain}`,
    )
  }
})

// ── marketing ─────────────────────────────────────────────────────────────────

test('marketing has full access only to marketing domain', () => {
  assert.equal(hasAdminDomainPermission('marketing', 'marketing', 'full'), true)
  assert.equal(hasAdminDomainPermission('marketing', 'marketing', 'read'), true)
})

test('marketing has read-only access to catalog, sales, inventory, marketplace, customers, settings', () => {
  const readDomains: AdminDomain[] = ['catalog', 'sales', 'inventory', 'marketplace', 'customers', 'settings', 'dashboard']
  for (const domain of readDomains) {
    assert.equal(
      hasAdminDomainPermission('marketing', domain, 'read'),
      true,
      `marketing should have read on ${domain}`,
    )
    assert.equal(
      hasAdminDomainPermission('marketing', domain, 'full'),
      false,
      `marketing should NOT have full on ${domain}`,
    )
  }
})

test('marketing has no access to operations', () => {
  assert.equal(hasAdminDomainPermission('marketing', 'operations', 'read'), false)
  assert.equal(hasAdminDomainPermission('marketing', 'operations', 'full'), false)
})

// ── catalog ───────────────────────────────────────────────────────────────────

test('catalog has full access to catalog and inventory domains', () => {
  assert.equal(hasAdminDomainPermission('catalog', 'catalog', 'full'), true)
  assert.equal(hasAdminDomainPermission('catalog', 'inventory', 'full'), true)
})

test('catalog has read-only access to sales, marketplace, marketing, customers, settings, dashboard', () => {
  const readDomains: AdminDomain[] = ['sales', 'marketplace', 'marketing', 'customers', 'settings', 'dashboard']
  for (const domain of readDomains) {
    assert.equal(
      hasAdminDomainPermission('catalog', domain, 'read'),
      true,
      `catalog should have read on ${domain}`,
    )
    assert.equal(
      hasAdminDomainPermission('catalog', domain, 'full'),
      false,
      `catalog should NOT have full on ${domain}`,
    )
  }
})

test('catalog has no access to operations', () => {
  assert.equal(hasAdminDomainPermission('catalog', 'operations', 'read'), false)
  assert.equal(hasAdminDomainPermission('catalog', 'operations', 'full'), false)
})

// ── support ───────────────────────────────────────────────────────────────────

test('support has full access to sales and customers domains', () => {
  assert.equal(hasAdminDomainPermission('support', 'sales', 'full'), true)
  assert.equal(hasAdminDomainPermission('support', 'customers', 'full'), true)
})

test('support has read-only access to catalog, inventory, marketplace, marketing, settings, dashboard', () => {
  const readDomains: AdminDomain[] = ['catalog', 'inventory', 'marketplace', 'marketing', 'settings', 'dashboard']
  for (const domain of readDomains) {
    assert.equal(
      hasAdminDomainPermission('support', domain, 'read'),
      true,
      `support should have read on ${domain}`,
    )
    assert.equal(
      hasAdminDomainPermission('support', domain, 'full'),
      false,
      `support should NOT have full on ${domain}`,
    )
  }
})

test('support has no access to operations', () => {
  assert.equal(hasAdminDomainPermission('support', 'operations', 'read'), false)
  assert.equal(hasAdminDomainPermission('support', 'operations', 'full'), false)
})

// ── ops ───────────────────────────────────────────────────────────────────────

test('ops has full access only to operations domain', () => {
  assert.equal(hasAdminDomainPermission('ops', 'operations', 'full'), true)
  assert.equal(hasAdminDomainPermission('ops', 'operations', 'read'), true)
})

test('ops has read-only access to all other domains', () => {
  const readDomains: AdminDomain[] = [
    'dashboard', 'catalog', 'sales', 'inventory', 'marketplace',
    'marketing', 'customers', 'settings',
  ]
  for (const domain of readDomains) {
    assert.equal(
      hasAdminDomainPermission('ops', domain, 'read'),
      true,
      `ops should have read on ${domain}`,
    )
    assert.equal(
      hasAdminDomainPermission('ops', domain, 'full'),
      false,
      `ops should NOT have full on ${domain}`,
    )
  }
})

// ── non-admin roles are always denied ─────────────────────────────────────────

test('customer role is denied all domain access', () => {
  const domains: AdminDomain[] = [
    'dashboard', 'catalog', 'sales', 'inventory', 'marketplace',
    'marketing', 'customers', 'operations', 'settings',
  ]
  for (const domain of domains) {
    assert.equal(
      hasAdminDomainPermission('customer', domain, 'read'),
      false,
      `customer should be denied read on ${domain}`,
    )
    assert.equal(
      hasAdminDomainPermission('customer', domain, 'full'),
      false,
      `customer should be denied full on ${domain}`,
    )
  }
})

test('pharmacist role is denied all domain access', () => {
  assert.equal(hasAdminDomainPermission('pharmacist', 'catalog', 'read'), false)
  assert.equal(hasAdminDomainPermission('pharmacist', 'operations', 'full'), false)
})
