# UI Component Inventory

## Purpose
This document is the practical registry for `packages/ui`. Check here before creating new shared components.

## How to Use This Inventory
- Extend an existing component before creating a new primitive.
- Create a new primitive only when the behavior is clearly reusable and no existing contract fits.
- Keep business logic out of shared UI.

## Primitives
Core primitives under `packages/ui/primitives`:
- `Box`
- `Container`
- `Divider`
- `Input`
- `Scroll`
- `Text`
- `Touchable`

Layout primitives under `packages/ui/layout`:
- `Container`
- `PageScaffold`
- `Section`

Use these as the first layer for shared composition.

## Core Shared Components
General reusable components:
- `Alert`
- `Badge`
- `Button`
- `Card`
- `Checkbox`
- `Drawer`
- `FormField`
- `Grid`
- `Icon`
- `IconButton`
- `MetricCard`
- `SearchField`
- `SectionHeading`
- `Select`
- `Sheet`
- `Skeleton`
- `Spinner`
- `Switch`
- `Tabs`
- `Textarea`
- `Toast`

Commerce-oriented components:
- `PriceTag`
- `ProductCard`
- `QuantityInput`
- `QuickViewModal`
- `StockBadge`
- `StarRating`
- `PaymentBadges`
- `MarketplacePromoStrip`
- `MarketplaceSectionHeader`
- `HorizontalRailState`

## Shell and Navigation Components
Under `packages/ui/components/chrome`:
- `TopPromoBar`
- `HeaderMainRow`
- `CategoryRow`
- `MiniSearchBar`
- `SearchOverlay`
- `SearchPanel`
- `CartDrawer`
- `FooterAccordion`
- `FooterColumns`
- `FooterNewsletter`
- `FooterSocialLinks`
- `FooterLegalRow`
- `BrandArc`

These are shared shell pieces. Keep them presentational and token-driven.

## Home and Discovery Blocks
Under `packages/ui/components/home`:
- `HomeBrandRail`
- `HomeCampaignBannerRow`
- `HomeCategoryStrip`
- `HomeHeroRail`
- `HomeProductRail`
- `HomeRecentlyViewedRail`

Under `packages/ui/components/home-v2`:
- `AnnouncementTicker`
- `BestItemsMonthRail`
- `BrandSpotlightSection`
- `BrandStoryBanner`
- `BundlePromotionsRail`
- `CampaignHeroBlock`
- `CompleteSetBlock`
- `CountdownTimer`
- `FeaturedCampaignSlot`
- `FlashSaleBand`
- `HeroCampaignSlider`
- `NewsletterLoyaltyCta`
- `TopBrandsGrid`
- `UgcGallery`

Reference-only implementation artifacts currently present:
- `SephoraReferenceHome`
- `figmaHomeData`

Treat reference-only artifacts as inspiration or migration inputs, not as default production primitives.

## Shop-Specific Shared Components
Under `packages/ui/components/shop`:
- `ShopCatalogView`

This is the current catalog composition anchor. Prefer extending it or extracting reusable subcontracts from it rather than creating parallel PLP systems.

## Extension Guidance
Prefer these moves in order:
1. Reconfigure tokens or density presets.
2. Extend an existing shared component contract.
3. Compose existing components in `packages/app`.
4. Add a new shared primitive only if the first three options fail cleanly.

## Gaps To Watch
These areas should stay deliberate:
- price and stock presentation should not fork into multiple competing patterns
- cart line-item and summary primitives should remain shared across drawer and page
- filter chips, toolbar controls, and state blocks should consolidate rather than proliferate
- reference/demo surfaces should not quietly become production dependencies without review
