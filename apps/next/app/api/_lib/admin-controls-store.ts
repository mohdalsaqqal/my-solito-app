/**
 * DEPRECATED: Re-exports from the canonical CMS service.
 * Use `apps/next/server/services/cms/cms-admin-controls.service.ts` directly.
 */
export {
  readAdminControlsState,
  writeAdminControlsState,
  applyAdminControlsToCms,
  resolveAdminPermissionsForSession,
  pushAudit,
  type AdminControlsState,
} from '../../../server/services/cms/cms-admin-controls.service'
