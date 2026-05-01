-- RLS Tenant Isolation Policies
-- Enables Row-Level Security on all commerce/CMS tables.
-- Uses COALESCE(current_setting('app.current_tenant_id', true), 'default')
-- so existing code works without changes (defaults to 'default').

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
