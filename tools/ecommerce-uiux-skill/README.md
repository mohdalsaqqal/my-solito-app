# E-Commerce UI/UX Skill for Claude Code

A comprehensive skill package for designing and building production-grade e-commerce interfaces. Built for use with [superpowers](https://github.com/obra/superpowers).

## Installation

```bash
# From your superpowers skills directory
cp -r /path/to/ecommerce-uiux-skill ~/.claude/skills/ecommerce-uiux

# Or if using superpowers' skill manager
superpowers skill install ./ecommerce-uiux-skill
```

## What's Included

```
ecommerce-uiux/
├── SKILL.md                        # Core philosophy, patterns, and guidelines
├── README.md                       # This file
├── tokens/
│   ├── design-tokens.css           # Default (Modern DTC) design system tokens
│   └── design-tokens-luxury.css    # Luxury brand variant tokens
└── components/
    ├── product-card.html           # Product card with hover, quick-add, wishlist, badges
    ├── cart-drawer.html            # Slide-out cart with upsells, express checkout
    └── filter-sidebar.html         # Category filter with color swatches, size, price, rating
```

## What This Skill Covers

When this skill is active, Claude Code will apply e-commerce best practices to:

- **Product Pages** — PDP layout, image gallery, variant selectors, sticky add-to-cart
- **Product Cards** — Image swap on hover, quick-add, wishlist, badges, swatches
- **Shopping Cart** — Drawer pattern, quantity controls, cross-sells, free shipping progress
- **Checkout Flow** — Single-page or stepped, express checkout prominence, form UX
- **Category Pages** — Filter/sort UX, grid layout, active filter pills, result counts
- **Search** — Instant results, no-results states, trending suggestions
- **Mobile Commerce** — Touch targets, bottom sheets, sticky CTAs, thumb-zone optimization

## Aesthetic Directions Supported

The skill guides Claude toward one of five e-commerce aesthetic directions:

| Direction | Examples | Key Characteristics |
|-----------|----------|---------------------|
| **Luxury/Editorial** | Net-a-Porter, Chanel | Whitespace, serif fonts, gold accents |
| **Modern DTC** | Allbirds, Glossier | Clean, warm, personality-driven |
| **Marketplace** | Amazon, Target | Dense, scannable, functional |
| **Streetwear/Hype** | Supreme, Kith | Bold type, dark themes, urgency |
| **Artisan/Handmade** | Etsy premium | Warm textures, humanist, story-forward |

## Usage with Claude Code

Once installed, Claude Code will automatically use this skill when you ask for:

```
"Create a product card for my fashion store"
"Build a checkout page with express payment options"
"Design a filter sidebar for a clothing category"
"Make a cart drawer with cross-sell recommendations"
"Build a product detail page with image gallery"
```

## Design Tokens

Import the appropriate token file into your project:

```css
/* For most brands */
@import './skills/ecommerce-uiux/tokens/design-tokens.css';

/* For luxury brands */
@import './skills/ecommerce-uiux/tokens/design-tokens-luxury.css';
```

Tokens cover: brand colors, neutrals, semantic colors (sale, success, error), typography scale, spacing scale, border radii, shadows, transitions, z-index scale, and layout variables.

## Accessibility

This skill enforces WCAG 2.1 AA compliance including:
- 4.5:1 color contrast minimum for text
- Visible focus indicators on all interactive elements  
- `aria-label` on all icon-only buttons
- `role="status"` for dynamic cart count updates
- Descriptive error messages linked via `aria-describedby`
- Keyboard navigation for all interactions

## Works Best With

- `frontend-design` skill — for aesthetic execution and overall visual design
- `docx` skill — for design spec handoff documents
- `pdf` skill — for printable design documentation

## License

MIT — free to use, modify, and distribute.
