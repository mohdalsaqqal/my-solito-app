# Account Test Detail Design

Date: 2026-02-23

## Goal
Provide a dedicated test detail experience under `/account/tests/[id]` where a customer can:
- view test metadata and result summary
- inspect test metrics and pharmacist notes
- review recommended products
- add recommended products directly to cart

## Chosen UX
- Dedicated page (best UX for dense clinical + commerce data)
- `/account/tests` remains history list
- `View result` opens `/account/tests/[id]`

## Data Contract
Added account test detail contract with:
- test metadata (id, date, status, pharmacist, branch)
- summary + notes
- metrics list
- recommended products list including image/brand/name/price/inStock

## API
- `GET /api/account/tests` returns history rows
- `GET /api/account/tests/[id]` returns one detailed test payload

## UI States
- loading skeleton
- error with retry
- empty recommendation state
- out-of-stock per recommended product
- added/adding interaction feedback

## Conversion Actions
- Add single recommended product to cart
- Add all in-stock recommendations to cart
- View product route from recommendation row

## Architecture Compliance
Maintains canonical chain:
UI -> apiClient -> BFF -> provider registry -> adapters

No direct adapter imports in app/ui layers.
