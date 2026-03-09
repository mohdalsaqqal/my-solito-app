We’re building a premium cosmetics e-commerce system that:

Looks luxury.

Works like a modern shopping app.

Connects to ERP.

Supports loyalty.

Has a pharmacist tool.

Can grow into something bigger later.

That’s it. Everything else supports that.

1️⃣ The Website & App Must Feel Premium

Not Temu.
Not noisy.
Not discount-chaotic.

It should feel:

Clean

Confident

Structured

Calm

Intentional

White/black base.
Red only when something is interactive or urgent.

Spacing matters.
Shadows > borders.
No visual mess.

And it must work in:

English (LTR)

Arabic (RTL)

From day one.

Styling baseline:

We use UniWind across web and mobile.

Tokens define the look.
UniWind applies the look.

No random custom styling systems.
No visual drift between platforms.

2️⃣ The UI Must Be Stable — Data Is Dynamic

This is critical.

The UI layout must:

Never break if data is empty.

Never shift because of slow API.

Always render structure first.

Then fill data in.

If products are loading:
→ show skeleton.

If there are no products:
→ show empty state.

If API fails:
→ show clean error state.

UI must NEVER depend on backend to “exist” visually.

3️⃣ Core Commerce Features

At minimum:

Product listing

Product page

Cart

Checkout

Account

Order history

And all of this must connect to ERP.

ERP is source of truth.

We only receive APIs.
We never own inventory logic.

4️⃣ Header Must Be Global & Smart

On web:

Logo (from CMS)

Search

Account

Cart (live count)

Categories (from CMS)

Luxury brands (from CMS)

Flash deals (from CMS)

On mobile:

Clean header

Bottom navigation:

Home

Categories

Cart

Account

Cart should always be reachable instantly.

5️⃣ Shop Page Must Be Efficient

Desktop:

4-column grid.

Sticky filter sidebar.

Clean layout.

Hover shows actions.

Mobile:

2-column grid.

Filters in bottom sheet.

No hover nonsense.

Must filter by:

Category

Brand

Price

Sale

Bundle

6️⃣ Product Page Must Convert

Desktop:

Big media.

Info panel.

Sticky Add to Cart.

Mobile:

Image slider.

Sticky bottom Add to Cart bar.

Must support:

Variants

Shade selection

Bundles

Cross-sell

Reviews

Stock visibility

7️⃣ Cart & Checkout Must Be Clean

Cart:

Drawer preview.

Full cart page.

Quantity editing.

Remove item.

Checkout:

Simple.

No distractions.

Minimal header.

Real validation.

Promo code not screaming.

8️⃣ Loyalty System

We must support:

Points earning.

Points redeeming.

Tiers (Silver, Gold, Loyal).

Expiration rules.

Campaign multipliers.

Real-time balance.

Loyalty history.

Expiring soon indicator.

Barcode for in-store redemption.

No manual adjustment by pharmacists.

All rules controlled by CMS/admin.

9️⃣ Pharmacist Tool

Separate login role.

Must:

Scan QR.

See customer profile.

Enter diagnostics.

Recommend products.

See which recommended items were purchased.

Check availability.

But no manual loyalty edits.
No business rule overrides.

🔟 CMS Must Control Content, Not Code

CMS should control:

Header menus.

Hero slides.

Newsletter.

Promo banners.

Loyalty campaigns.

Conversion rules (if allowed).

If marketing changes a banner,
we do NOT deploy new code.

1️⃣1️⃣ Architecture Rules

We must keep:

UI → API Client → BFF → Provider → Adapter → ERP

Why?

So later we can:

Change ERP.

Change payment gateway.

Add second brand.

Add multi-country.

Turn into SaaS.

Without rewriting UI.

1️⃣2️⃣ Mobile Is Not an Afterthought

Mobile must:

Feel native.

Use bottom navigation.

Use bottom sheets.

Have proper touch zones.

No tiny buttons.

No hover-based logic.

1️⃣3️⃣ Performance Matters

Lazy load images.

No layout shift.

No heavy blur.

Grid must not break from bad image ratios.

Mobile must be fast.

1️⃣4️⃣ Security

No secrets in frontend.

Roles enforced.

Admin protected.

Pharmacist protected.

API normalized.

1️⃣5️⃣ Future Proofing

Even if we build for one brand now,
architecture must allow:

Multiple ERP adapters.

Multiple payment adapters.

Feature modules.

Multi-tenant future.

Theming via tokens.

We are building a system.
Not just a website.

The Real Goal

We are building:

A premium commerce engine that looks elegant,
works like a top-tier shopping app,
integrates deeply with ERP,
and can evolve into a scalable SaaS platform.

That’s the real requirement.
