/**
 * DEPRECATED: Re-exports from the canonical CMS service.
 * Use `apps/next/server/services/cms/cms-site-config.service.ts` directly.
 */
export {
  readSiteConfig,
  writeSiteConfig,
  mergeSiteConfigState,
  type SiteConfigState,
} from '../../../server/services/cms/cms-site-config.service'

export type { SiteLocaleBranding, LogoSizeKey } from '../../../server/services/cms/_lib/normalizers'

export { ADMIN_DATA_DIR, ensureAdminDataDir } from '../../../server/services/cms/_lib/legacy-compat'
