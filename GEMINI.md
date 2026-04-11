# GEMINI.md — Gemini CLI Support Shim

> **AGENTS.md is the source of truth** for all architecture rules, data-flow principles, and UI contracts. This file contains only Gemini CLI–specific operational notes. Do not duplicate architecture rules here — reference AGENTS.md instead.

## Design Context

- **Users**: Women aged 18-40 shopping a cosmetics marketplace (~15,000 products).
- **Brand**: Mass-market commercial beauty (reference: niceonesa.com), NOT luxury-editorial.
- **Typography**: Manrope (sans-serif) for Latin, Tajawal for Arabic. No serif fonts.
- **Primary CTA**: `#222222` (dark neutral) with white text.
- **Purchase intent**: `#a8000d` (deep blood red — reserved for buy/add-to-cart).

## Commands

- `yarn web` — start Next.js dev server
- `yarn guard:checks` — run all guard scripts
- `yarn tsc -p apps/next/tsconfig.json --noEmit` — type check

## Notes

- All design tokens flow through `@real/tokens` — never use hex literals in shared UI.
- RTL support via `rtl-manager.ts` / `rtl-manager.native.ts`.
- Always check AGENTS.md for architecture rules before making structural changes.
