-- CreateTable: CMS Site Config (singleton)
CREATE TABLE "CmsSiteConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "brandingEnLogoUrl" TEXT NOT NULL DEFAULT '',
    "brandingEnLogoAlt" TEXT NOT NULL DEFAULT 'Real Cosmetics',
    "brandingEnLogoSize" TEXT NOT NULL DEFAULT 'md',
    "brandingArLogoUrl" TEXT NOT NULL DEFAULT '',
    "brandingArLogoAlt" TEXT NOT NULL DEFAULT 'ريال كوزمتكس',
    "brandingArLogoSize" TEXT NOT NULL DEFAULT 'md',
    "topBarMessageEn" TEXT NOT NULL DEFAULT '',
    "topBarMessageAr" TEXT NOT NULL DEFAULT '',
    "topBarCtaLabelEn" TEXT NOT NULL DEFAULT '',
    "topBarCtaLabelAr" TEXT NOT NULL DEFAULT '',
    "topBarCtaHref" TEXT NOT NULL DEFAULT '',
    "footerNewsletterTitleEn" TEXT NOT NULL DEFAULT '',
    "footerNewsletterTitleAr" TEXT NOT NULL DEFAULT '',
    "footerLegalEn" TEXT NOT NULL DEFAULT '',
    "footerLegalAr" TEXT NOT NULL DEFAULT '',
    "searchPanelTitleEn" TEXT NOT NULL DEFAULT '',
    "searchPanelTitleAr" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsSiteConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CMS Ticker Settings (singleton)
CREATE TABLE "CmsTickerSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "speedMs" INTEGER NOT NULL DEFAULT 4000,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsTickerSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CMS Ticker Items
CREATE TABLE "CmsTickerItem" (
    "id" TEXT NOT NULL,
    "messageEn" TEXT NOT NULL,
    "messageAr" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsTickerItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CmsTickerItem_order_idx" ON "CmsTickerItem"("order");

-- CreateTable: CMS Education Banners
CREATE TABLE "CmsEducationBanner" (
    "id" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL DEFAULT '',
    "titleAr" TEXT NOT NULL DEFAULT '',
    "bodyEn" TEXT NOT NULL DEFAULT '',
    "bodyAr" TEXT NOT NULL DEFAULT '',
    "targetPage" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsEducationBanner_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CmsEducationBanner_order_idx" ON "CmsEducationBanner"("order");

-- CreateTable: CMS UGC Items
CREATE TABLE "CmsUgcItem" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "sourceHandle" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsUgcItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CmsUgcItem_order_idx" ON "CmsUgcItem"("order");

-- CreateTable: CMS Toggle Overrides
CREATE TABLE "CmsToggleOverride" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedByUserId" TEXT NOT NULL DEFAULT '',
    "updatedByEmail" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "CmsToggleOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CMS Brand Spotlights
CREATE TABLE "CmsBrandSpotlight" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "spotlightJson" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedByUserId" TEXT NOT NULL DEFAULT '',
    "updatedByEmail" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "CmsBrandSpotlight_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CmsBrandSpotlight_position_idx" ON "CmsBrandSpotlight"("position");

-- CreateTable: CMS Offer Banners
CREATE TABLE "CmsOfferBanner" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "bannerJson" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedByUserId" TEXT NOT NULL DEFAULT '',
    "updatedByEmail" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "CmsOfferBanner_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CmsOfferBanner_position_idx" ON "CmsOfferBanner"("position");

-- CreateTable: CMS Audit Log
CREATE TABLE "CmsAuditLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL DEFAULT '',
    "actorEmail" TEXT NOT NULL DEFAULT '',
    "changes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CmsAuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CmsAuditLog_createdAt_idx" ON "CmsAuditLog"("createdAt" DESC);
CREATE INDEX "CmsAuditLog_type_idx" ON "CmsAuditLog"("type");

-- Seed: Insert default singleton rows (required for app to function)
INSERT INTO "CmsSiteConfig" ("id", "updatedAt") VALUES ('default', NOW());
INSERT INTO "CmsTickerSettings" ("id", "updatedAt") VALUES ('default', NOW());
