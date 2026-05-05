-- RLS Tenant Isolation Policies
-- Enables Row-Level Security on all commerce/CMS tables.
-- Uses COALESCE(current_setting('app.current_tenant_id', true), 'default')
-- so existing code works without changes (defaults to 'default').

-- Tenant columns added after earlier migrations created these tables.
ALTER TABLE "Release" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS "Release_tenantId_idx" ON "Release"("tenantId");

ALTER TABLE "ReleaseBlock" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS "ReleaseBlock_tenantId_idx" ON "ReleaseBlock"("tenantId");

ALTER TABLE "Promotion" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'default';
DROP INDEX IF EXISTS "Promotion_code_key";
DROP INDEX IF EXISTS "Promotion_code_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "Promotion_tenantId_code_key" ON "Promotion"("tenantId", "code");
CREATE INDEX IF NOT EXISTS "Promotion_tenantId_idx" ON "Promotion"("tenantId");

ALTER TABLE "PricingQuote" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS "PricingQuote_tenantId_idx" ON "PricingQuote"("tenantId");

ALTER TABLE "RateLimitBucket" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS "RateLimitBucket_tenantId_idx" ON "RateLimitBucket"("tenantId");

ALTER TABLE "CmsSiteConfig" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS "CmsSiteConfig_tenantId_idx" ON "CmsSiteConfig"("tenantId");

ALTER TABLE "CmsTickerSettings" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS "CmsTickerSettings_tenantId_idx" ON "CmsTickerSettings"("tenantId");

ALTER TABLE "CmsTickerItem" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS "CmsTickerItem_tenantId_idx" ON "CmsTickerItem"("tenantId");

ALTER TABLE "CmsEducationBanner" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS "CmsEducationBanner_tenantId_idx" ON "CmsEducationBanner"("tenantId");

ALTER TABLE "CmsUgcItem" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS "CmsUgcItem_tenantId_idx" ON "CmsUgcItem"("tenantId");

ALTER TABLE "CmsToggleOverride" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS "CmsToggleOverride_tenantId_idx" ON "CmsToggleOverride"("tenantId");

ALTER TABLE "CmsBrandSpotlight" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS "CmsBrandSpotlight_tenantId_idx" ON "CmsBrandSpotlight"("tenantId");

ALTER TABLE "CmsOfferBanner" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS "CmsOfferBanner_tenantId_idx" ON "CmsOfferBanner"("tenantId");

ALTER TABLE "CmsAuditLog" ADD COLUMN IF NOT EXISTS "tenantId" TEXT NOT NULL DEFAULT 'default';
CREATE INDEX IF NOT EXISTS "CmsAuditLog_tenantId_idx" ON "CmsAuditLog"("tenantId");

-- Tables added to the Prisma schema after the CMS JSON-store replacement migration.
CREATE TABLE IF NOT EXISTS "CmsPageBlock" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL DEFAULT 'default',
  "releaseId" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "blockType" TEXT NOT NULL,
  "payloadJson" JSONB NOT NULL,
  "locale" TEXT NOT NULL DEFAULT 'en',
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CmsPageBlock_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CmsPageBlock_tenantId_idx" ON "CmsPageBlock"("tenantId");
CREATE INDEX IF NOT EXISTS "CmsPageBlock_releaseId_position_idx" ON "CmsPageBlock"("releaseId", "position");
CREATE INDEX IF NOT EXISTS "CmsPageBlock_blockType_idx" ON "CmsPageBlock"("blockType");

CREATE TABLE IF NOT EXISTS "CmsMarketingRail" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL DEFAULT 'default',
  "railId" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "titleEn" TEXT NOT NULL,
  "titleAr" TEXT NOT NULL,
  "querySource" TEXT NOT NULL,
  "queryLimit" INTEGER NOT NULL DEFAULT 12,
  "querySortBy" TEXT NOT NULL DEFAULT 'price_desc',
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CmsMarketingRail_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CmsMarketingRail_tenantId_railId_key" ON "CmsMarketingRail"("tenantId", "railId");
CREATE INDEX IF NOT EXISTS "CmsMarketingRail_tenantId_idx" ON "CmsMarketingRail"("tenantId");
CREATE INDEX IF NOT EXISTS "CmsMarketingRail_position_idx" ON "CmsMarketingRail"("position");

CREATE TABLE IF NOT EXISTS "CmsCampaign" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL DEFAULT 'default',
  "campaignId" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "zone" TEXT NOT NULL,
  "titleEn" TEXT NOT NULL,
  "titleAr" TEXT NOT NULL,
  "subtitleEn" TEXT NOT NULL DEFAULT '',
  "subtitleAr" TEXT NOT NULL DEFAULT '',
  "ctaLabelEn" TEXT NOT NULL DEFAULT '',
  "ctaLabelAr" TEXT NOT NULL DEFAULT '',
  "href" TEXT NOT NULL DEFAULT '',
  "imageUrl" TEXT NOT NULL DEFAULT '',
  "timerEndsAt" TEXT NOT NULL DEFAULT '',
  "urgencyBadgeEn" TEXT NOT NULL DEFAULT '',
  "urgencyBadgeAr" TEXT NOT NULL DEFAULT '',
  "showTimer" BOOLEAN NOT NULL DEFAULT false,
  "showUrgency" BOOLEAN NOT NULL DEFAULT false,
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CmsCampaign_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CmsCampaign_tenantId_campaignId_key" ON "CmsCampaign"("tenantId", "campaignId");
CREATE INDEX IF NOT EXISTS "CmsCampaign_tenantId_idx" ON "CmsCampaign"("tenantId");
CREATE INDEX IF NOT EXISTS "CmsCampaign_zone_idx" ON "CmsCampaign"("zone");
CREATE INDEX IF NOT EXISTS "CmsCampaign_position_idx" ON "CmsCampaign"("position");

CREATE TABLE IF NOT EXISTS "CmsHeroCard" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL DEFAULT 'default',
  "cardId" TEXT NOT NULL,
  "titleEn" TEXT NOT NULL,
  "titleAr" TEXT NOT NULL,
  "subtitleEn" TEXT NOT NULL DEFAULT '',
  "subtitleAr" TEXT NOT NULL DEFAULT '',
  "ctaLabelEn" TEXT NOT NULL DEFAULT '',
  "ctaLabelAr" TEXT NOT NULL DEFAULT '',
  "href" TEXT NOT NULL DEFAULT '',
  "imageUrl" TEXT NOT NULL DEFAULT '',
  "badgeLabelEn" TEXT NOT NULL DEFAULT '',
  "badgeLabelAr" TEXT NOT NULL DEFAULT '',
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CmsHeroCard_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CmsHeroCard_tenantId_cardId_key" ON "CmsHeroCard"("tenantId", "cardId");
CREATE INDEX IF NOT EXISTS "CmsHeroCard_tenantId_idx" ON "CmsHeroCard"("tenantId");
CREATE INDEX IF NOT EXISTS "CmsHeroCard_position_idx" ON "CmsHeroCard"("position");

CREATE TABLE IF NOT EXISTS "CmsEditorialHotspot" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL DEFAULT 'default',
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "titleEn" TEXT NOT NULL,
  "titleAr" TEXT NOT NULL,
  "subtitleEn" TEXT NOT NULL DEFAULT '',
  "subtitleAr" TEXT NOT NULL DEFAULT '',
  "ctaLabelEn" TEXT NOT NULL DEFAULT '',
  "ctaLabelAr" TEXT NOT NULL DEFAULT '',
  "href" TEXT NOT NULL DEFAULT '',
  "imageUrl" TEXT NOT NULL,
  "productIdsJson" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CmsEditorialHotspot_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CmsEditorialHotspot_tenantId_idx" ON "CmsEditorialHotspot"("tenantId");

CREATE TABLE IF NOT EXISTS "CmsNewsletterCta" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL DEFAULT 'default',
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "titleEn" TEXT NOT NULL,
  "titleAr" TEXT NOT NULL,
  "subtitleEn" TEXT NOT NULL DEFAULT '',
  "subtitleAr" TEXT NOT NULL DEFAULT '',
  "ctaLabelEn" TEXT NOT NULL DEFAULT '',
  "ctaLabelAr" TEXT NOT NULL DEFAULT '',
  "href" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CmsNewsletterCta_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CmsNewsletterCta_tenantId_idx" ON "CmsNewsletterCta"("tenantId");

CREATE TABLE IF NOT EXISTS "CmsPersonalization" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL DEFAULT 'default',
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "mode" TEXT NOT NULL DEFAULT 'rule-based',
  "recommendedTitleEn" TEXT NOT NULL DEFAULT 'Recommended for You',
  "recommendedTitleAr" TEXT NOT NULL DEFAULT 'موصى بها لك',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CmsPersonalization_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CmsPersonalization_tenantId_idx" ON "CmsPersonalization"("tenantId");

CREATE TABLE IF NOT EXISTS "CmsRailAutoplay" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL DEFAULT 'default',
  "railKey" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "autoplayMs" INTEGER NOT NULL DEFAULT 4000,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CmsRailAutoplay_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CmsRailAutoplay_tenantId_railKey_key" ON "CmsRailAutoplay"("tenantId", "railKey");
CREATE INDEX IF NOT EXISTS "CmsRailAutoplay_tenantId_idx" ON "CmsRailAutoplay"("tenantId");

CREATE TABLE IF NOT EXISTS "CmsFeaturedSlot" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL DEFAULT 'default',
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "titleEn" TEXT NOT NULL,
  "titleAr" TEXT NOT NULL,
  "subtitleEn" TEXT NOT NULL DEFAULT '',
  "subtitleAr" TEXT NOT NULL DEFAULT '',
  "ctaLabelEn" TEXT NOT NULL DEFAULT '',
  "ctaLabelAr" TEXT NOT NULL DEFAULT '',
  "href" TEXT NOT NULL DEFAULT '',
  "imageUrl" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CmsFeaturedSlot_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CmsFeaturedSlot_tenantId_idx" ON "CmsFeaturedSlot"("tenantId");

CREATE TABLE IF NOT EXISTS "CmsCompleteSet" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL DEFAULT 'default',
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "titleEn" TEXT NOT NULL,
  "titleAr" TEXT NOT NULL,
  "subtitleEn" TEXT NOT NULL DEFAULT '',
  "subtitleAr" TEXT NOT NULL DEFAULT '',
  "ctaLabelEn" TEXT NOT NULL DEFAULT '',
  "ctaLabelAr" TEXT NOT NULL DEFAULT '',
  "ctaHref" TEXT NOT NULL DEFAULT '',
  "querySource" TEXT NOT NULL DEFAULT 'bundle_only',
  "queryLimit" INTEGER NOT NULL DEFAULT 8,
  "querySortBy" TEXT NOT NULL DEFAULT 'price_desc',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CmsCompleteSet_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "CmsCompleteSet_tenantId_idx" ON "CmsCompleteSet"("tenantId");

CREATE TABLE IF NOT EXISTS "PharmacistConsultation" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL DEFAULT 'default',
  "customerId" TEXT NOT NULL,
  "pharmacistId" TEXT NOT NULL,
  "pharmacistName" TEXT NOT NULL,
  "branchName" TEXT NOT NULL DEFAULT 'Main Branch',
  "templateType" TEXT NOT NULL DEFAULT 'skin',
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "notes" TEXT NOT NULL DEFAULT '',
  "metricsJson" JSONB NOT NULL DEFAULT '[]',
  "questionnaireJson" JSONB,
  "recommendedProductIds" JSONB NOT NULL DEFAULT '[]',
  "status" TEXT NOT NULL DEFAULT 'submitted',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PharmacistConsultation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "PharmacistConsultation_tenantId_idx" ON "PharmacistConsultation"("tenantId");
CREATE INDEX IF NOT EXISTS "PharmacistConsultation_customerId_idx" ON "PharmacistConsultation"("customerId");
CREATE INDEX IF NOT EXISTS "PharmacistConsultation_pharmacistId_idx" ON "PharmacistConsultation"("pharmacistId");
CREATE INDEX IF NOT EXISTS "PharmacistConsultation_status_idx" ON "PharmacistConsultation"("status");
CREATE INDEX IF NOT EXISTS "PharmacistConsultation_createdAt_idx" ON "PharmacistConsultation"("createdAt" DESC);

CREATE TABLE IF NOT EXISTS "ReferralProgram" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "tenantId" TEXT NOT NULL DEFAULT 'default',
  "storeId" TEXT NOT NULL DEFAULT 'default',
  "mode" TEXT NOT NULL DEFAULT 'two_way',
  "accessMode" TEXT NOT NULL DEFAULT 'open',
  "followerRewardType" TEXT NOT NULL DEFAULT 'fixed_discount',
  "followerRewardValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "followerRewardCurrency" TEXT NOT NULL DEFAULT 'SAR',
  "influencerRewardType" TEXT NOT NULL DEFAULT 'fixed_discount',
  "influencerRewardValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "influencerRewardCurrency" TEXT NOT NULL DEFAULT 'SAR',
  "attributionWindowDays" INTEGER NOT NULL DEFAULT 30,
  "firstOrderOnly" BOOLEAN NOT NULL DEFAULT true,
  "allowStackingWithPromotions" BOOLEAN NOT NULL DEFAULT false,
  "minimumOrderAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "minimumOrderCurrency" TEXT NOT NULL DEFAULT 'SAR',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReferralProgram_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ReferralProgram_tenantId_storeId_key" ON "ReferralProgram"("tenantId", "storeId");
CREATE INDEX IF NOT EXISTS "ReferralProgram_tenantId_idx" ON "ReferralProgram"("tenantId");

CREATE TABLE IF NOT EXISTS "ReferralProfile" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL DEFAULT 'default',
  "storeId" TEXT NOT NULL DEFAULT 'default',
  "userId" TEXT NOT NULL,
  "userEmail" TEXT NOT NULL,
  "actorType" TEXT NOT NULL DEFAULT 'customer',
  "code" TEXT NOT NULL,
  "shareLink" TEXT NOT NULL DEFAULT '',
  "approved" BOOLEAN NOT NULL DEFAULT false,
  "displayName" TEXT NOT NULL DEFAULT '',
  "audienceCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReferralProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ReferralProfile_tenantId_userId_key" ON "ReferralProfile"("tenantId", "userId");
CREATE UNIQUE INDEX IF NOT EXISTS "ReferralProfile_code_key" ON "ReferralProfile"("code");
CREATE INDEX IF NOT EXISTS "ReferralProfile_tenantId_idx" ON "ReferralProfile"("tenantId");
CREATE INDEX IF NOT EXISTS "ReferralProfile_storeId_idx" ON "ReferralProfile"("storeId");

CREATE TABLE IF NOT EXISTS "ReferralLedgerEntry" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL DEFAULT 'default',
  "storeId" TEXT NOT NULL DEFAULT 'default',
  "profileId" TEXT NOT NULL,
  "referredUserId" TEXT,
  "orderId" TEXT,
  "code" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "currency" TEXT NOT NULL DEFAULT 'SAR',
  "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "followerRewardValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "influencerRewardValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReferralLedgerEntry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ReferralLedgerEntry_tenantId_idx" ON "ReferralLedgerEntry"("tenantId");
CREATE INDEX IF NOT EXISTS "ReferralLedgerEntry_profileId_idx" ON "ReferralLedgerEntry"("profileId");
CREATE INDEX IF NOT EXISTS "ReferralLedgerEntry_storeId_idx" ON "ReferralLedgerEntry"("storeId");
CREATE INDEX IF NOT EXISTS "ReferralLedgerEntry_status_idx" ON "ReferralLedgerEntry"("status");

CREATE TABLE IF NOT EXISTS "AdminUserOverride" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL DEFAULT 'default',
  "role" TEXT,
  "status" TEXT,
  "permissionsJson" JSONB,
  "domainPermissions" JSONB,
  "updatedByEmail" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminUserOverride_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AdminUserOverride_tenantId_idx" ON "AdminUserOverride"("tenantId");

-- Commerce tables
ALTER TABLE "Release" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_release ON "Release" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "ReleaseBlock" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_release_block ON "ReleaseBlock" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "Promotion" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_promotion ON "Promotion" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "PricingQuote" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_pricing_quote ON "PricingQuote" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "RateLimitBucket" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_rate_limit ON "RateLimitBucket" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

-- CMS tables
ALTER TABLE "CmsSiteConfig" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_site_config ON "CmsSiteConfig" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "CmsTickerSettings" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_ticker_settings ON "CmsTickerSettings" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "CmsTickerItem" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_ticker_item ON "CmsTickerItem" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "CmsEducationBanner" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_education_banner ON "CmsEducationBanner" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "CmsUgcItem" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_ugc_item ON "CmsUgcItem" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "CmsToggleOverride" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_toggle_override ON "CmsToggleOverride" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "CmsBrandSpotlight" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_brand_spotlight ON "CmsBrandSpotlight" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "CmsOfferBanner" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_offer_banner ON "CmsOfferBanner" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "CmsAuditLog" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_audit_log ON "CmsAuditLog" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "CmsPageBlock" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_page_block ON "CmsPageBlock" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "CmsMarketingRail" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_marketing_rail ON "CmsMarketingRail" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "CmsCampaign" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_campaign ON "CmsCampaign" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "CmsHeroCard" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_hero_card ON "CmsHeroCard" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "CmsEditorialHotspot" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_editorial_hotspot ON "CmsEditorialHotspot" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "CmsNewsletterCta" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_newsletter_cta ON "CmsNewsletterCta" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "CmsPersonalization" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_personalization ON "CmsPersonalization" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "CmsRailAutoplay" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_rail_autoplay ON "CmsRailAutoplay" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "CmsFeaturedSlot" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_featured_slot ON "CmsFeaturedSlot" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "CmsCompleteSet" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_complete_set ON "CmsCompleteSet" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "PharmacistConsultation" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_pharmacist_consultation ON "PharmacistConsultation" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "ReferralProgram" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_referral_program ON "ReferralProgram" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "ReferralProfile" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_referral_profile ON "ReferralProfile" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "ReferralLedgerEntry" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_referral_ledger ON "ReferralLedgerEntry" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));

ALTER TABLE "AdminUserOverride" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_admin_user_override ON "AdminUserOverride" USING ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default')) WITH CHECK ("tenantId" = COALESCE(current_setting('app.current_tenant_id', true), 'default'));
