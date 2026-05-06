CREATE TABLE IF NOT EXISTS "CmsPageConfig" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL DEFAULT 'default',
  "releaseId" TEXT NOT NULL,
  "storeId" TEXT NOT NULL DEFAULT 'default',
  "slug" TEXT NOT NULL DEFAULT '/',
  "pageType" TEXT NOT NULL DEFAULT 'home',
  "blocksJson" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CmsPageConfig_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CmsPageConfig_tenantId_releaseId_key" ON "CmsPageConfig"("tenantId", "releaseId");
CREATE INDEX IF NOT EXISTS "CmsPageConfig_tenantId_idx" ON "CmsPageConfig"("tenantId");
CREATE INDEX IF NOT EXISTS "CmsPageConfig_tenantId_storeId_slug_pageType_idx" ON "CmsPageConfig"("tenantId", "storeId", "slug", "pageType");

CREATE TABLE IF NOT EXISTS "CmsPageVersion" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL DEFAULT 'default',
  "versionId" TEXT NOT NULL,
  "releaseId" TEXT NOT NULL,
  "storeId" TEXT NOT NULL DEFAULT 'default',
  "slug" TEXT NOT NULL DEFAULT '/',
  "pageType" TEXT NOT NULL DEFAULT 'home',
  "source" TEXT NOT NULL DEFAULT 'publish',
  "blocksJson" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CmsPageVersion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CmsPageVersion_tenantId_versionId_key" ON "CmsPageVersion"("tenantId", "versionId");
CREATE INDEX IF NOT EXISTS "CmsPageVersion_tenantId_idx" ON "CmsPageVersion"("tenantId");
CREATE INDEX IF NOT EXISTS "CmsPageVersion_tenantId_releaseId_storeId_slug_idx" ON "CmsPageVersion"("tenantId", "releaseId", "storeId", "slug");
CREATE INDEX IF NOT EXISTS "CmsPageVersion_createdAt_idx" ON "CmsPageVersion"("createdAt" DESC);

ALTER TABLE "CmsPageConfig" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_page_config ON "CmsPageConfig";
CREATE POLICY tenant_page_config ON "CmsPageConfig" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "CmsPageVersion" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_page_version ON "CmsPageVersion";
CREATE POLICY tenant_page_version ON "CmsPageVersion" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));
