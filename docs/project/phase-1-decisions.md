# Phase 1 Decisions

## 2026-03-26

### Decision: Phase 1 delivers one real store end-to-end
Phase 1 scope is a full production store across required web, Expo, and admin workflows. Phase 2 will extend the same system into SaaS without rewriting Phase 1.

### Decision: Layout ownership stays internal
The team may borrow CMS architecture ideas, but page layout ownership remains inside the internal platform model rather than a third-party CMS.

### Decision: Blocks are versioned contracts
Blocks are not treated as raw components. Each normalized block must support explicit versioning and must be rendered through the registry by `type + version`.

### Decision: BFF resolves data-bearing blocks
Any block that contains intent such as product query, editorial reference, or store config is resolved in the BFF before shared UI consumes it.

### Decision: ProductQuery is a merchandising layer, not a search engine
Phase 1 will use a structured ProductQuery model designed for curated storefront merchandising, manual overrides, and scheduling, without prematurely becoming a search/ranking engine.

### Decision: Admin release APIs dual-write through internal page stores during migration
Phase 1 admin release and preview routes will persist draft page state in internal page-config and page-version stores while keeping the existing release-provider path active for homepage compatibility. This preserves the current storefront runtime while the admin model is generalized in later tasks.
