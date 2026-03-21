# AGENTS.md Rebuild Design

## Date
2026-03-21

## Goal
Rebuild the root `AGENTS.md` into a product-specific operating handbook that is easier to apply during implementation while restoring missing companion docs for deeper UI guidance.

## Problem
The prior root file had three issues:
- it mixed hard rules with long-form explanation and future-state guidance
- it referenced UI companion docs that were missing from the repository
- it was large enough to reduce signal during active coding

## Decision
Adopt a hybrid documentation model:
- root `AGENTS.md` becomes the executable contract
- UI and commerce composition detail moves to companion docs in `docs/`
- the rebuild remains product-specific to this commerce platform

## Root File Scope
The rebuilt root file keeps:
- platform operating model
- `P0` architecture rules
- layer boundaries
- canonical data flow
- environment contract
- role exposure
- commerce UI contracts
- UI system rules
- AI workflow rules
- pause triggers
- verification and definition of done

## Companion Docs
Create and maintain:
- `docs/UI_ARCHITECTURE.md`
- `docs/COMMERCE_PATTERNS.md`
- `docs/UI_COMPONENT_INVENTORY.md`

## Why This Structure
- The root file stays readable during implementation.
- The repo regains the missing referenced docs.
- Product-specific rules remain close to the codebase.
- Agents get a reliable entry point and clear places to retrieve deeper context.

## Expected Outcome
- stronger rule clarity
- less duplication
- easier maintenance
- better alignment between the root contract and UI composition guidance

## Notes
- This change is documentation and policy restructuring only.
- Existing architecture rules remain the source of truth unless intentionally revised later.
