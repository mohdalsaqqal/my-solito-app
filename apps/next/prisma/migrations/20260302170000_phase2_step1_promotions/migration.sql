-- Phase 2 Step 1: promotions and pricing quotes
CREATE TABLE "Promotion" (
  "id" TEXT NOT NULL,
  "code" TEXT,
  "nameEn" TEXT NOT NULL,
  "nameAr" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "conditionsJson" JSONB NOT NULL,
  "rewardsJson" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PricingQuote" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "cartHash" TEXT NOT NULL,
  "quoteJson" JSONB NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PricingQuote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Promotion_code_key" ON "Promotion"("code");
CREATE INDEX "Promotion_isActive_startAt_endAt_idx" ON "Promotion"("isActive", "startAt", "endAt");
CREATE INDEX "Promotion_priority_idx" ON "Promotion"("priority");
CREATE INDEX "Promotion_code_idx" ON "Promotion"("code");

CREATE INDEX "PricingQuote_cartHash_idx" ON "PricingQuote"("cartHash");
CREATE INDEX "PricingQuote_userId_idx" ON "PricingQuote"("userId");
CREATE INDEX "PricingQuote_expiresAt_idx" ON "PricingQuote"("expiresAt");
