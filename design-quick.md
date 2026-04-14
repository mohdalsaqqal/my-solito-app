# Design System — Quick Reference

> **Direction:** Monochrome Canvas | **Logo:** Black text + white bg + one red underline
> **Full spec:** `docs/plans/2026-04-13-monochrome-commerce-redesign-design.md`

---

## Colors

**Surfaces:** `#FFFFFF` (white), `#FAFAFA` (background), `#F5F5F5` (hover)

**Black Scale (text):** `#0A0A0A` → `#171717` → `#262626` → `#404040` → `#525252` → `#737373` → `#A3A3A3` → `#D4D4D4` → `#E5E5E5`
- `ink.900–700` = headlines | `ink.600` = body | `ink.500–400` = secondary | `ink.300`+ = inactive

**Red (max 3 per page):** `#D31018` (brand) | `#B80D14` (hover) | `#FDECEC` (subtle)
→ Sale badges, brand underline, CTA hover only. Nowhere else.

**Semantic:** success `#16A34A` | warning `#CA8A04` | error `#DC2626` | info/focusRing `#2563EB`

**Borders:** `#E5E5E5` (default) | `#D4D4D4` (hover/active)

---

## Type — Manrope (Arabic: Tajawal)

| `display` 36px/800 | `h1` 24px/700 | `h2` 18px/700 | `h3` 16px/600 | `body` 14px/400 | `small` 12px/400 | `tiny` 11px/500 |

---

## Spacing — 4px base

`0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`

**Grid:** Mobile 2-col | Tablet 3-col | Desktop 4-col | Gutter 16px | Margin 16–32px

---

## Components — radius 0 everywhere, 44px min touch target

**Button** (44px h, 24px px):
- Primary: white bg + ink.900 border/text → hover: ink.900 bg + white text
- Secondary: ink.200 border + ink.700 text → hover: ink.900 border/text
- Ghost: ink.600 text → hover: ink.900 text

**Input** (44px h, 12px px): default ink.200 border → focus ink.900 → error brand border

**Card**: white bg + 1px ink.100 border → hover ink.300 border (no shadow lift)

**Badge** (20px h, 6px px, tiny/500):
- Sale: brand bg + white | New: ink.900 bg + white | OOS: ink.100 bg + ink.400 | Default: ink.50 bg + ink.600

---

## Motion — transform + opacity only, no bounce

`instant` 0ms | `fast` 150ms (hover) | `normal` 250ms (dropdowns) | `slow` 400ms (page reveal) | `stagger` 40ms

easeOut enters | easeIn exits | 300ms max for interactions

---

## Hard Rules

1. No hex literals in shared UI — use tokens only
2. No className in `packages/app` — inline token styles
3. No warm tones (rose, coral, amber, beige) — removed
4. No rounded corners — radius 0 always
5. No card shadow hover — border color change only
6. Red used max 3 times per page
7. 7 typography tokens — no random sizes between
8. 4px grid — no arbitrary spacing values

---

## Verification

```bash
yarn guard:checks
yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false
```
