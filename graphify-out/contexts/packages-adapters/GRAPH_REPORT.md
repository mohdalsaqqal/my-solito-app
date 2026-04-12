# Graph Report - packages/adapters  (2026-04-12)

## Corpus Check
- 48 files · ~62,703 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 187 nodes · 230 edges · 19 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `MockHttpClient` - 9 edges
2. `MockHttpClient` - 8 edges
3. `HttpClient` - 8 edges
4. `OdooClient` - 7 edges
5. `MockNetworksClient` - 7 edges
6. `NetworksClient` - 6 edges
7. `buildLoyaltyWallet()` - 4 edges
8. `resolveLocalesDir()` - 4 edges
9. `ensureStoreFile()` - 3 edges
10. `readAdminMockState()` - 3 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (0): 

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (9): decodeCursor(), encodeCursor(), paginate(), pickCustomField(), projectRow(), ensureStoreFile(), readAdminMockState(), updateAdminMockState() (+1 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (1): NetworksClient

### Community 3 - "Community 3"
Cohesion: 0.18
Nodes (2): handleNetworksWebhookInline(), MockNetworksClient

### Community 4 - "Community 4"
Cohesion: 0.24
Nodes (2): createTestAdapters(), MockHttpClient

### Community 5 - "Community 5"
Cohesion: 0.31
Nodes (3): HttpClient, isHttpError(), sleep()

### Community 6 - "Community 6"
Cohesion: 0.22
Nodes (1): MockHttpClient

### Community 7 - "Community 7"
Cohesion: 0.48
Nodes (1): OdooClient

### Community 8 - "Community 8"
Cohesion: 0.5
Nodes (4): buildLoyaltyWallet(), buildTierProgress(), ensureLoyaltyState(), resolveLoyaltyRules()

### Community 9 - "Community 9"
Cohesion: 0.5
Nodes (4): listNamespaces(), readLocaleNamespace(), resolveLocalesDir(), writeLocaleNamespace()

### Community 10 - "Community 10"
Cohesion: 0.5
Nodes (4): buildSeedPromotions(), nowIso(), readPromotions(), round2()

### Community 11 - "Community 11"
Cohesion: 0.67
Nodes (3): applyFilters(), applySort(), normalizeSet()

### Community 12 - "Community 12"
Cohesion: 0.67
Nodes (3): normalizeCart(), readCart(), writeCart()

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (2): mergeMenuRecord(), now()

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (2): normalizeIdentifier(), resolveLoginEmail()

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 13`** (2 nodes): `mergeMenuRecord()`, `now()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (2 nodes): `normalizeIdentifier()`, `resolveLoginEmail()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (2 nodes): `capabilities.ts`, `capabilities-provider.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `networks-security.test.ts`, `createClient()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (1 nodes): `products.search.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `seed.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `OdooClient` connect `Community 7` to `Community 2`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._