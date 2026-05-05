
# Home Page Layout Rules

## Desktop (Large Screens)
- **Container**: Centered max-width container for content (not full-bleed, except for backgrounds).
- **Hero Slider**: Displays multiple slides partially (~30% width each) to encourage scrolling.
- **Product/Bundle Carousels**: Display ~4-5 items per view.
- **Split Sections**: 
  - 50% Text / 50% Image split.
  - Side-by-side alignment.
- **Brand Grid**: 6 columns.

## Tablet (Medium Screens)
- **Hero Slider**: Slides increase in width (~40-60%).
- **Product/Bundle Carousels**: Display ~2-3 items per view.
- **Split Sections**: Remains side-by-side if space permits, otherwise stacks.
- **Brand Grid**: 3 columns.
- **Padding**: Reduced vertical padding between sections.

## Mobile (Small Screens)
- **Hero Slider**: Single slide focus (~85% width) with a peek at the next slide.
- **Product/Bundle Carousels**: 
  - Display ~1.5 items (60% width) to clearly indicate horizontal scrolling.
  - Snap behavior is strict (snap-center).
- **Split Sections**:
  - **Stacking**: Vertically stacked.
  - **Order**: Text usually on top, Image on bottom (or vice versa depending on visual weight).
  - **Aspect Ratio**: Images may change from landscape/portrait to square (`aspect-square`) to fit the viewport better.
- **Brand Grid**: 3 columns (dense layout).
- **Sticky Elements**: Bottom "Add to Cart" bar appears on PDP (not Home, but relevant to mobile layout system).

## Layout Patterns
- **Grid vs. Carousel**:
  - **Products**: Always use horizontal Carousels (Sliders) on the Home page to save vertical space.
  - **Brands**: Use Grids to show volume and variety at a glance.
- **Z-Indexing**:
  - **Header**: Sticky top (highest z-index).
  - **Modals/Drawers**: Overlay everything.
  - **Dropdowns**: Overlay content.
