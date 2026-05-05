
# Home Page Interaction & Behavior Spec

## Navigation & links
- **Primary CTAs**: Buttons navigate to Collection or Product Listing Pages (PLP).
- **Product Cards**: Clicking the card body navigates to the Product Detail Page (PDP).
- **Brand Tiles**: Clicking a tile navigates to the specific Brand Page.

## Scroll & Slider Behaviors
- **Hero Slider**: 
  - Horizontal scroll with snap points (`snap-start`).
  - Supports touch swiping on mobile.
  - Supports mouse wheel or trackpad scrolling on desktop.
- **Product & Bundle Carousels**:
  - **Buttons**: Left/Right chevron buttons scroll the container by a fixed amount.
  - **Overflow**: Hidden scrollbars (`no-scrollbar`) for a cleaner look, relying on swipe/buttons.
- **Marquee**:
  - Continuous infinite loop animation (CSS keyframes).
  - Non-interactive (informational only).

## Hover States (Desktop)
- **Hero Slide**:
  - **Background**: Scales up slightly (parallax zoom effect).
  - **Product Image**: Scales up and rotates slightly.
  - **Text/CTA**: Translates upward slightly to indicate lift.
- **Product Card**:
  - **Image**: Scales zoom effect within bounds.
  - **Overlay**: "Quick View" and "Add to Cart" buttons fade in from bottom.
  - **Wishlist Icon**: Appears/fades in top right.
- **Bundle Card**:
  - **Image**: Scales zoom effect.
  - **Shadow**: Card elevation increases (box-shadow).
- **Brand Grid Tile**:
  - **Background**: Changes to a subtle off-white/gray.
  - **Text**: Primary brand code changes color to the accent color.
  - **Subtitle**: Opacity increases for better readability.

## Click Actions & State Feedback
- **Add to Cart**:
  - **Immediate**: Button state changes to "Added!" (visual confirmation).
  - **Delayed**: Reverts to original state after ~2 seconds.
  - **Global**: Updates the cart counter in the header.
  - **Drawer**: Triggers the Cart Drawer to slide open.
- **Quick View**:
  - Opens a modal overlaying the current page.
  - Background blurs.
  - Prevents body scrolling while open.
- **Newsletter Submit**:
  - Prevents default form submission behavior (page reload).
  - Should show success message or validation error.

## Mobile Specifics
- **Hovers**: Disabled/Not applicable. Actions (like Add to Cart) must be visible or accessible via tap.
- **Sliders**: Peek behavior (showing part of the next slide) is critical to indicate scrollability since scrollbars are hidden.
- **Split Sections**: Stack vertically. Text usually precedes image for context, or image precedes text for visual hook (needs consistency rule).
