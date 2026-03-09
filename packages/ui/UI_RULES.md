1️⃣ Vertical Rhythm Law

UI must follow proportional spacing rules.

Spacing Scale (from tokens only)

Allowed spacing tokens:

xs < sm < md < lg < xl
Rhythm Rules

Internal spacing must be smaller than external spacing.

Section spacing must be ≥ lg.

Card internal spacing must be ≤ md.

No more than 3 vertical spacing levels stacked inside a component.

Never mix xs and xl in the same vertical stack.

Grid gaps must be ≤ section spacing.

Avoid inconsistent top/bottom spacing — spacing must be symmetrical unless functionally justified.

2️⃣ Typography Hierarchy Law

Only semantic text roles are allowed.

Allowed Text Roles

Display

Heading

Body

Caption

Price

Hierarchy Rules

Price must be visually dominant within commerce components.

Heading must be larger than Body.

Body must be larger than Caption.

No arbitrary font sizes.

No text-[17px] or custom pixel sizes.

Do not override font weights outside defined tokens.

Maximum 3 typography roles per component block.

3️⃣ Surface & Elevation Law

There are only three surface types:

Background

Elevated

Interactive

Surface Rules

Elevated surfaces must use radius.md.

Interactive surfaces must always have press/hover states.

No nested elevated surfaces unless structurally necessary.

Shadow levels must remain consistent across all elevated components.

Do not mix multiple elevation styles within a single component.

4️⃣ Density Law (Marketplace-Specific)

Marketplace UI must prioritize clarity and conversion.

Commerce Rules

Product image ratio must be fixed (1:1 or 4:5).

Product title maximum: 2 lines.

Price must appear immediately below title.

Discount badge must be near price or image corner.

CTA must align consistently within grid cards.

Internal product card spacing ≤ md.

Avoid excessive whitespace inside commerce components.

No decorative elements that compete with price visibility.

5️⃣ Layout Law

Layout must remain predictable and scalable.

Layout Constraints

Flexbox only. No CSS Grid.

No arbitrary width percentages.

Container padding must follow global container padding token.

All sections must align to the same horizontal container.

Avoid full-bleed elements unless intentionally hero-level.

Max 2 nested layout wrappers inside a component.

6️⃣ Variant Discipline Law

Variants must remain minimal.

Rules

Maximum 2 variant dimensions per primitive (e.g., size + intent).
No chained variant logic (no 5 combined styles).
Variants must map to tokens — not raw values.
Do not create new variant types without updating system.

7️⃣ Utility Discipline Law

Uniwind utilities must respect system integrity.
Allowed
Token-based spacing
Token-based colors
Token-based typography
Not Allowed
Arbitrary values (px-[13px])
Random margin overrides
Inline style overrides
One-off styling hacks

8️⃣ Section Composition Law

Every section must follow:
Section wrapper (spacing.lg or above)
Section header (Heading + optional caption)
Content block (grid/list)
Optional CTA
No random stacking of unrelated blocks.

9️⃣ Visual Noise Law

Marketplace UI must avoid clutter.
Maximum 2 accent colors per component.
Only one dominant element per block.
Avoid decorative borders unless functional.
Badges must not overpower price.
No gradient unless hero-level.

🔟 System Integrity Rule

When generating new components:
Follow token system strictly.
Follow UI_RULES.md strictly.
Do not introduce new scales.
Do not introduce new typography sizes.
Do not introduce new spacing values.
Do not invent new color roles.

11️⃣ Canonical Component Blueprints (Mandatory)

Purpose

These blueprints are the default implementation contracts for shared marketplace components.
All new commerce UI must conform unless explicitly superseded here.

Button Blueprint

Component: `packages/ui/components/Button.tsx`

Variant dimensions (max 2):
- `variant`: `solid | outline | ghost`
- `size`: `sm | md | lg`

Sizing (tokenized only):
- `sm`: minHeight `32`, horizontal padding `sm`
- `md`: minHeight `40`, horizontal padding `md`
- `lg`: minHeight `48`, horizontal padding `lg`

Visual rules:
- Radius: `radius.md`
- Text role: `Label` (uppercase allowed for commerce CTAs)
- Primary CTA must use `solid`
- Secondary actions use `outline` or `ghost`
- Disabled state required

Product Card Blueprint

Component: `packages/ui/components/ProductCard.tsx`

Layout rules:
- Fixed image ratio: `4:5` family only
- Internal spacing: `<= md`
- Title max: 2 lines
- Price row directly below title/meta and visually dominant
- Discount/stock badge near image corner
- Mobile CTA fixed at card bottom
- Web hover actions reveal-on-demand only

State rules (required):
- `loading`
- `empty`
- `error`
- `disabled`
- `out-of-stock`

Spacing rhythm (default):
- Card outer section gap: `md`
- Content block vertical gap: `sm`
- Micro/meta gap: `xs`

Section Header Blueprint

Component: `packages/ui/components/SectionHeading.tsx`

Allowed roles in block:
- `Heading` + optional `Caption`
- Optional CTA on same row end

Spacing:
- Header block internal gap: `sm`
- Section wrapper outside header: `>= lg`

Input/Search Blueprint

Components: `packages/ui/primitives/Input.tsx` and search wrappers under `components/chrome`

Rules:
- Input heights must map to size tokens (`sm | md | lg`)
- Search container must keep one dominant action (submit)
- Secondary actions (clear, trending) are supportive and lower visual weight
