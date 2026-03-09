# ProductCard Cozy Hierarchy Redesign

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the inverted type hierarchy, remove dead whitespace, and tighten spacing so the ProductCard reads cleanly at rail widths of 160–240px.

**Architecture:** Single-file change — `packages/ui/components/ProductCard.tsx`. All values come from `@real/tokens` (no hardcoded numbers, no hex colors). The skeleton sub-component is updated in the same pass to stay in sync with the new padding.

**Tech Stack:** React Native / Solito v5 / `@real/tokens` token system

**Context:**
- Grid context: horizontal rails, variable width (160–240px)
- Hierarchy: name-led — product name is the hero, brand is a subordinate label
- Density: cozy — 10–12px content padding, compact gaps

---

## Decisions

### Typography

| Element | Old | New | Reason |
|---|---|---|---|
| Brand `weight` | `'700'` | `'500'` | Bold weight on a 12px subordinate label fights with name; medium is more refined |
| Name `tone` | `'muted'` | `'default'` | **Critical fix** — name is the hero; muted tone made it invisible |
| Price `size` prop | `'3xl'` (30px) | removed (falls back to `price` variant = 20px) | 30px price on a 160–240px rail card dominates; 20px is confident and proportional |
| Stars `size` | `{12}` | `{11}` | Slight reduction tightens vertical rhythm |

### Spacing

| Zone | Old | New | Reason |
|---|---|---|---|
| Card `gap` (image ↔ content) | `spacing.md` = 16px | `spacing.sm` = 8px | Cozy: image and text feel connected, not detached |
| Content `paddingHorizontal` | `spacing.sm` = 8px | `spacing['12']` = 12px | 8px was too tight for readable text at narrow widths |
| Content `paddingTop` | `spacing.xs` = 4px | `spacing.sm` = 8px | Balances visual weight above the brand label |
| Content `paddingBottom` | `spacing.sm` = 8px | `spacing['12']` = 12px | Mirrors horizontal, closes the card bottom neatly |
| Price area `gap` | `spacing.sm` = 8px | `spacing.xs` = 4px | Price + urgency label are tightly related; tight gap is correct |
| Swatch dot size | `spacing['12']` = 12px | 14px | 12px felt toy-like; 14px is solid and feels tappable |
| CTA button `marginHorizontal` | 0 (flush) | `spacing.sm` = 8px | Skeleton already had this margin — fixing inconsistency |
| CTA button `marginBottom` | 0 | `spacing.sm` = 8px | Same |

### Removed constraints

All three `minHeight` constraints are removed — they were creating dead whitespace:
- `minHeight: spacing['96']` on outer content box
- `minHeight: spacing['64']` on brand/name box
- `minHeight: spacing['32']` on price box

Natural content height is correct at all supported widths.

### Skeleton sync

The `ProductCardSkeleton` content box padding is updated from `spacing.sm`/`spacing.md` to `spacing['12']`/`spacing.sm` to match the new real content layout.

---

## Verification

After implementation:
1. Run `yarn guard:checks` — all 13 checks must pass
2. Visual check on web: prices should no longer dominate, name readable, brand subordinate
3. Visual check at ~160px width: no text overflow, comfortable rhythm
