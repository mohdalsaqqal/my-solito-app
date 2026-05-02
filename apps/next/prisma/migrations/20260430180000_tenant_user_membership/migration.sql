-- Tenant-aware membership foundation.
-- Current delivery remains isolated per client, but user/account data is modeled
-- so it can move to shared infrastructure without changing auth surfaces.

CREATE TABLE "tenant" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tenant_user" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "AppAuthRole" NOT NULL DEFAULT 'customer',
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "tenant_user_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tenant_slug_key" ON "tenant"("slug");
CREATE UNIQUE INDEX "tenant_user_tenantId_userId_key" ON "tenant_user"("tenantId", "userId");
CREATE INDEX "tenant_user_userId_idx" ON "tenant_user"("userId");
CREATE INDEX "tenant_user_tenantId_role_idx" ON "tenant_user"("tenantId", "role");

ALTER TABLE "tenant_user"
  ADD CONSTRAINT "tenant_user_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tenant_user"
  ADD CONSTRAINT "tenant_user_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "tenant" ("id", "name", "slug", "status", "updatedAt")
VALUES ('default', 'Default Tenant', 'default', 'active', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
