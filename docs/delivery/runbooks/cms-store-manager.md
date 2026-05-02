# CMS Store Manager Runbook

This runbook covers the current store-manager content lifecycle for home page blocks.

## Admin Surface

- Open `/admin/marketing/cms/blocks`.
- Select the target release and page scope.
- Edit block fields in the block editor.
- Use `Save Block` after content edits.
- Drag/reorder blocks, then use `Save order`.
- Use preview before publishing.
- Publish only after the page reports no unsaved block or order changes.

## Verified Lifecycle

The automated smoke uses real admin API routes and verifies:

- release listing
- draft release creation
- hero block creation
- promo strip creation
- block reorder persistence
- hero copy edit
- publish
- published home API response
- rollback to the original published release
- post-rollback home API response
- scheduled release creation

Command:

```bash
yarn verify:cms-lifecycle
```

## Media Library Status

Current admin upload surfaces support image upload for block images, offer banners, and site branding. Uploaded files are stored under the Next app public upload path for local/client deployment use.

Limitations before large-scale production use:

- no DAM-style foldering or search
- no image moderation workflow
- no CDN invalidation workflow beyond normal app/static delivery
- no bulk media migration tool yet

For first client delivery, use uploaded optimized image files or approved remote image URLs. Add CDN/DAM integration later only when a client requires larger media operations.

## Rollback And Scheduling

Rollback is available through the release rollback API and verified by the lifecycle smoke. Scheduling persists `scheduledAt` on draft releases; automatic future publish workers are not enabled yet. Until the jobs runner is implemented, scheduled releases are an operator workflow: create scheduled draft, review it, then publish manually at the scheduled time.

## CMS Block Coverage

Home blocks currently verified through the admin/page-block flow include hero, promo strip, hero carousel, flash sale, offer banners, product slider, brand spotlight, education banner, top brands, UGC/testimonials, and newsletter CTA. Testimonials are currently represented by the `ugc_gallery` block and `TestimonialsBlock` renderer.

Explicit FAQ block editing is not part of the current admin block set. Use `education_banner` for simple support/guide content until a dedicated FAQ accordion is added.
