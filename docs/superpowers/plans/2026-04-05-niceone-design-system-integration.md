# NiceOne Design System Integration - Remaining Work Plan

**Goal:** finish the parts of the NiceOne integration that are still missing in the actual repo.

**Important:** the token migration itself is already done. This plan covers only the remaining platform wiring and cleanup.

---

## File Map

| File | Action | Reason |
|---|---|---|
| `apps/next/app/layout.tsx` | Modify | Replace old web font loading with `DM_Sans` + `Tajawal` |
| `apps/next/app/globals.css` | Modify | Remove `Cairo` / `Almarai` usage and align Arabic body font |
| `apps/expo/app/_hooks/useAppBootstrap.ts` | Modify | Replace Expo font bootstrap from `Poppins` / `Cairo` to `DM Sans` / `Tajawal` |
| `apps/expo/package.json` | Modify | Replace Expo Google font package dependencies |
| `packages/ui/responsive/useFontFamily.ts` | Create | Expose native font-family helper for RTL/LTR-aware components |
| `packages/ui/responsive/index.ts` | Modify | Export the new helper |

---

## Task 1: Web font wiring

- [x] Replace `Manrope` with `DM_Sans` in `apps/next/app/layout.tsx`
- [x] Remove `Cairo` and `Almarai` from `apps/next/app/layout.tsx`
- [x] Keep `Tajawal` as the Arabic web font
- [x] Ensure root HTML exposes only `--font-dm-sans` and `--font-tajawal`
- [x] Update `apps/next/app/globals.css` so Arabic body/skip-link text uses `--font-arabic`

Verification:

```bash
rg -n "Manrope|font-manrope|font-cairo|font-almarai|Almarai|Cairo" apps/next/app
```

---

## Task 2: Expo bootstrap fonts

- [x] Replace `@expo-google-fonts/poppins` and `@expo-google-fonts/cairo`
- [x] Add `@expo-google-fonts/dm-sans` and `@expo-google-fonts/tajawal`
- [x] Move Expo font loading through the real bootstrap file: `apps/expo/app/_hooks/useAppBootstrap.ts`
- [ ] Install updated Expo font packages in the workspace

Verification:

```bash
rg -n "@expo-google-fonts/poppins|@expo-google-fonts/cairo|Poppins_|Cairo_" apps/expo
rg -n "@expo-google-fonts/dm-sans|@expo-google-fonts/tajawal|DMSans_|Tajawal_" apps/expo
```

---

## Task 3: Native font-family helper

- [x] Add `packages/ui/responsive/useFontFamily.ts`
- [x] Export `useFontFamily` and `FontWeight` from `packages/ui/responsive/index.ts`

Verification:

```bash
rg -n "useFontFamily|FontWeight" packages/ui/responsive
```

---

## Task 4: Repo checks

- [ ] Install Expo dependencies so the new imports resolve locally
- [ ] Run `yarn tsc -p apps/next/tsconfig.json --noEmit --incremental false`
- [ ] Run `yarn tsc -p apps/expo/tsconfig.json --noEmit --incremental false`
- [ ] Run `yarn guard:checks`

Notes:

- `packages/tokens/designSystemTokens.test.ts` already exists; do not recreate it.
- `node --test packages/tokens/designSystemTokens.test.ts` is not a dependable verification command in this workspace as-is.
- Use `rg`, not `grep`, for repo searches in this Windows environment.

