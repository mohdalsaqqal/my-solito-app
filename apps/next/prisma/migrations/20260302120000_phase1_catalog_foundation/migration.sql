-- Phase 1 catalog foundation

CREATE TABLE "Category" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "nameEn" TEXT NOT NULL,
  "nameAr" TEXT NOT NULL,
  "parentId" TEXT,
  "image" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE "Category"
  ADD CONSTRAINT "Category_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");
CREATE INDEX "Category_sortOrder_idx" ON "Category"("sortOrder");

CREATE TABLE "Brand" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "nameEn" TEXT NOT NULL,
  "nameAr" TEXT NOT NULL,
  "logo" TEXT,
  "descriptionEn" TEXT,
  "descriptionAr" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "ProductQuery" (
  "slug" TEXT PRIMARY KEY,
  "filtersJson" JSONB NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "titleEn" TEXT NOT NULL,
  "titleAr" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE "ReleaseEnvironment" AS ENUM ('staging', 'production');
CREATE TYPE "ReleaseStatus" AS ENUM ('draft', 'published');
CREATE TYPE "ReleaseBlockType" AS ENUM ('hero', 'product_slider', 'brand_promo', 'promo_strip');

CREATE TABLE "Release" (
  "id" TEXT PRIMARY KEY,
  "environment" "ReleaseEnvironment" NOT NULL,
  "status" "ReleaseStatus" NOT NULL DEFAULT 'draft',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "Release_environment_status_idx" ON "Release"("environment", "status");

CREATE TABLE "ReleaseBlock" (
  "id" TEXT PRIMARY KEY,
  "releaseId" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "type" "ReleaseBlockType" NOT NULL,
  "payloadJson" JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "ReleaseBlock_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ReleaseBlock_releaseId_position_idx" ON "ReleaseBlock"("releaseId", "position");
