# Design System Integration - Nice One Patterns (non-color)

**Date**: 2026-04-05  
**Status**: Partially implemented  
**Scope**: `packages/tokens/`, `packages/ui/global.css`, `apps/next/app/layout.tsx`, `apps/next/app/globals.css`, `apps/expo/app/_hooks/useAppBootstrap.ts`, `packages/ui/responsive/`  
**Excluded**: Colors - the existing color system stays unchanged.

---

## 1. Goal

Adopt Nice One's non-color design patterns in the shared token layer and platform font wiring:

- DM Sans for LTR / English
- Tajawal for RTL / Arabic
- Expanded 10-20px type scale
- Rounded 2-16px radius scale
- Simplified shadow scale with semantic card shadow

Strategy: direct replacement in the active token system. No parallel token system.

---

## 2. Current Repo State

The token migration is already implemented in the repo:

- [packages/tokens/typography.ts](C:\Users\hamoo\Downloads\solito v5 docs\my-solito-app\packages\tokens\typography.ts)
- [packages/tokens/radius.ts](C:\Users\hamoo\Downloads\solito v5 docs\my-solito-app\packages\tokens\radius.ts)
- [packages/tokens/shadows.ts](C:\Users\hamoo\Downloads\solito v5 docs\my-solito-app\packages\tokens\shadows.ts)
- [packages/tokens/elevation.ts](C:\Users\hamoo\Downloads\solito v5 docs\my-solito-app\packages\tokens\elevation.ts)
- [packages/ui/global.css](C:\Users\hamoo\Downloads\solito v5 docs\my-solito-app\packages\ui\global.css)
- [packages/tokens/designSystemTokens.test.ts](C:\Users\hamoo\Downloads\solito v5 docs\my-solito-app\packages\tokens\designSystemTokens.test.ts)

The remaining work is platform integration:

- Web root font loading still referenced `Manrope`, `Cairo`, and `Almarai`
- Web global CSS still used old Arabic font variables
- Expo bootstrap still loaded `Poppins` and `Cairo`
- Native shared responsive utilities did not expose a font-family helper

---

## 3. Remaining Implementation Scope

### 3.1 Web font loading

Update [apps/next/app/layout.tsx](C:\Users\hamoo\Downloads\solito v5 docs\my-solito-app\apps\next\app\layout.tsx):

- replace `Manrope` with `DM_Sans`
- remove `Cairo` and `Almarai`
- keep `Tajawal`
- expose `--font-dm-sans` and `--font-tajawal`

Update [apps/next/app/globals.css](C:\Users\hamoo\Downloads\solito v5 docs\my-solito-app\apps\next\app\globals.css):

- keep body default on `--font-dm-sans`
- switch Arabic body and skip-link font usage to `--font-arabic`
- remove dependence on `--font-cairo` and `--font-almarai`

### 3.2 Expo font loading

The real Expo integration point is [apps/expo/app/_hooks/useAppBootstrap.ts](C:\Users\hamoo\Downloads\solito v5 docs\my-solito-app\apps\expo\app\_hooks\useAppBootstrap.ts), not `App.tsx`.

Update:

- [apps/expo/package.json](C:\Users\hamoo\Downloads\solito v5 docs\my-solito-app\apps\expo\package.json)
- [apps/expo/app/_hooks/useAppBootstrap.ts](C:\Users\hamoo\Downloads\solito v5 docs\my-solito-app\apps\expo\app\_hooks\useAppBootstrap.ts)

Replace:

- `@expo-google-fonts/poppins`
- `@expo-google-fonts/cairo`

With:

- `@expo-google-fonts/dm-sans`
- `@expo-google-fonts/tajawal`

### 3.3 Native font-family helper

Add a shared helper in:

- [packages/ui/responsive/useFontFamily.ts](C:\Users\hamoo\Downloads\solito v5 docs\my-solito-app\packages\ui\responsive\useFontFamily.ts)
- export it from [packages/ui/responsive/index.ts](C:\Users\hamoo\Downloads\solito v5 docs\my-solito-app\packages\ui\responsive\index.ts)

Behavior:

- return `DMSans_*` families for LTR
- return `Tajawal_*` families for RTL

---

## 4. Verification

Use repo-appropriate commands:

```bash
rg -n "Manrope|font-manrope|--font-manrope|font-cairo|font-almarai" packages apps
rg -n "shadows\.e[0-9]|elevation\.e[0-9]|shadow-e[0-9]" packages apps
rg -n "radius\.xs|radius\.sm" packages apps
```

Primary checks:

```bash
yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false
yarn tsc -p apps/expo/tsconfig.json --noEmit --incremental false
yarn guard:checks
```

Notes:

- `packages/tokens/designSystemTokens.test.ts` exists, but `node --test` is not reliable in this workspace as written; treat TypeScript and guard checks as the main verification path unless test runner setup is adjusted.
- `yarn guard:checks` depends on the shell script having LF line endings on Windows.

---

## 5. Out of Scope

- Colors
- Spacing
- Motion tokens
- Component-by-component visual restyling

