export type TenantContext = {
  tenantId: string
}

const DEFAULT_TENANT_ID = 'default'

export function normalizeTenantId(value?: string | null) {
  const normalized = value?.trim()
  return normalized ? normalized : DEFAULT_TENANT_ID
}

export function resolveTenantContext(): TenantContext {
  return {
    tenantId: normalizeTenantId(process.env.TENANT_ID),
  }
}

export function createProviderContext(input?: {
  tenantId?: string | null
  storeId?: string
}) {
  return {
    tenantId: normalizeTenantId(input?.tenantId ?? process.env.TENANT_ID),
    storeId: input?.storeId,
  }
}
