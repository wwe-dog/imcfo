# Visual Experience Doctrine

## 1. Doctrine

Current visual direction: Dark Liquid CFO Style.

This is a doctrine, not a permanent constitutional style.

## 2. Visual Role

Visual design should help the user feel that IMCFO is:

- financial
- calm
- personal
- operational
- modern
- trustworthy

It should not feel like a generic bookkeeping table, but it must still behave like a reliable financial tool.

## 3. Current Style Direction

Current direction may include:

- dark interface
- liquid glass surfaces
- CFO HUD
- sphere / orbit / operating-state metaphors
- voice-first record entry
- cinematic transitions

These details belong in doctrine and specs. They are not permanent constitutional constraints.

## 4. Brand Identity

### Logo Mark

The IMCFO brand mark is an infinity symbol (∞) with a directional arrow breaking out of the right end, pointing upper-right.

The symbol expresses two ideas simultaneously:
- The loop: personal finance is a continuous operating system, not a one-time record.
- The arrow: the cycle has direction — it moves forward and grows.

The form is smooth and rounded with no sharp corners. The stroke weight is consistent throughout the loop and arrow.

### Wordmark

The wordmark is "IMCFO" in a geometric sans-serif with generous letter-spacing. It carries the same four-color brand gradient as the logo mark.

### Tagline

循环增长 · 洞察财务 · 掌控人生

Three phrases separated by centered dots. Light weight, dark gray, centered below the wordmark.

### Four-Color Brand System

IMCFO uses four distinct brand colors. Each color has an independent identity and can be used individually. When used in combination, they form the brand gradient.

- **Pink** #FF5DBB: warm, energetic, youthful. The starting point of the brand.
- **Purple** #8A5CFF: bridges warm and cool. Premium without heaviness.
- **Blue** #3B8BFF: clear and trustworthy. The financial anchor of the palette.
- **Cyan** #00D2D9: fresh and modern. The forward-moving end of the brand.

These four colors are a system, not just gradient endpoints. They may be used separately as categorical or accent colors across the product.

### Gradient Behavior

When the four colors are used as a gradient, the transition must follow the path or form of the element it is applied to — not cut across it as a flat linear fill.

In the logo mark, the gradient flows along the stroke of the infinity curve: pink enters at the left loop origin, transitions through purple at the crossing, continues through blue into the right loop, and arrives at cyan at the arrow tip. The color moves with the shape, not against it.

This path-following behavior is the defining characteristic of the IMCFO brand gradient. A flat left-to-right linear gradient applied to the logo mark is incorrect.

### Brand Color and Semantic Color Separation

The four brand colors (#FF5DBB, #8A5CFF, #3B8BFF, #00D2D9) are identity colors, not state indicators.

The semantic color system (green #4ade80 for positive states, amber #fbbf24 for attention states, red #f87171 for action-required states) remains separate and must not be replaced or overridden by brand colors.

Brand gradient elements and semantic state indicators must always be visually distinguishable from each other.

## 5. Background and Surface System

### Base Background

Main background color: #090C1D

This is a near-black deep blue. It is not pure black. The blue undertone
connects to the brand's blue end (#3B8BFF) and creates a foundation for
the ambient glow system.

### Ambient Glow System

Two brand color blobs are positioned on the background to create the
liquid glass environment:

Top-left blob:
- Color: rgba(0, 210, 217, 0.50) — brand cyan #00D2D9
- Size: 240px diameter
- Blur: 50px
- Position: top-left, offset so approximately 25–30% of the blob is
  outside the screen edge

Bottom-right blob:
- Color: rgba(255, 93, 187, 0.50) — brand pink #FF5DBB
- Size: approximately 211px diameter (88% of top-left blob)
- Blur: 50px
- Position: bottom-right, offset so approximately 22–28% of the blob
  is outside the screen edge

The two blobs must not overlap at the center of the screen. They create
ambient light from opposing corners, not a gradient wash across the
full surface.

### Glass Surface Hierarchy

Two glass surface levels sit above the background:

Primary glass surface (main cards):
- Background: rgba(255, 255, 255, 0.08)
- Border: 0.5px solid rgba(255, 255, 255, 0.18)
- Border radius: 20px
- Used for: main financial data cards, primary content panels

Secondary glass surface (supporting cards):
- Background: rgba(255, 255, 255, 0.05)
- Border: 0.5px solid rgba(255, 255, 255, 0.12)
- Border radius: 16px
- Used for: transaction lists, secondary information panels

Navigation bar surface:
- Background: rgba(9, 12, 29, 0.80) with backdrop blur
- Border top: 0.5px solid rgba(255, 255, 255, 0.08)
- Used for: bottom navigation bar

### Surface Rules

- Glass surfaces must not have opaque backgrounds. Transparency is
  required for the ambient glow to show through.
- The blob system is a background layer only. It must not be placed
  inside cards or used as card decoration.
- Additional blobs or colors beyond the two defined above require a
  visual specs update, not a constitution change.
- The ambient glow system may be adjusted per screen if a screen has
  a significantly different content weight, but the two-blob pink/cyan
  structure is the baseline.

## 6. Spacing and Layout System

### Base Unit

All spacing values must be multiples of 4px.

The base unit is 4px. Arbitrary spacing values that do not derive
from this unit are not permitted.

### Spacing Scale

Named spacing sizes:

- xs: 4px — icon inner spacing, tightly related inline elements
- sm: 8px — tag inner padding, inline element gaps
- md: 12px — gaps between elements within a card, list row spacing
- base: 16px — card inner padding, screen horizontal margin
- lg: 20px — gaps between cards, spacing within a section
- xl: 24px — spacing between sections, module-level gaps
- 2xl: 32px — page top clearance, major module separation

Screen horizontal margin is base (16px) on both sides.
All cards and content align to this margin.

### Border Radius Scale

Named border radius sizes:

- xs: 4px — tags, small chips, micro badges
- sm: 8px — small interactive elements, inner sub-cards
- md: 12px — compact cards, smaller panels
- lg: 16px — secondary glass cards, supporting panels
- xl: 20px — primary glass cards, main content panels
- 2xl: 28px — bottom sheets, modal surfaces
- pill: 9999px — buttons, voice input bar, circular tags

No arbitrary border radius values outside this scale are permitted.

### Containment Rule

Not every element requires a glass surface container.

Elements may appear directly on the background without a card or
surface wrapper when:

- They are brand or identity elements (logo, wordmark, tagline)
- They are section labels or page-level headings
- They are standalone display-scale metrics that carry sufficient
  visual weight on their own
- They are navigation labels or ambient indicators
- They are decorative or structural dividers

Wrapping every element in a glass card creates visual heaviness and
reduces the contrast between contained and uncontained content.
The distinction between what has a container and what does not is
itself a design decision that carries meaning.

Glass surfaces are reserved for interactive content, financial data
cards, and input areas that require clear boundary definition.

## 7. Typography System

Current font stack:

- Chinese: HarmonyOS Sans SC, with system fallbacks: -apple-system, PingFang SC, Microsoft YaHei.
- Numbers and Latin: Inter, with tabular-nums enabled on all financial figures.

Current type scale (Balanced):

- Display: 36px / weight 500. Used for primary balance figures and key metrics.
- Headline: 18px / weight 500. Used for screen titles and section headers.
- Body: 15px / weight 400. Used for transaction names and descriptions.
- Caption: 12px / weight 400. Used for dates, categories, and secondary labels.
- Label: 11px / weight 400. Used for field labels and micro-annotations.

Display number treatment:

- Integer part: full opacity.
- Decimal part: 65% opacity. Decimal is precision information, not decision information.
- Currency symbol: same size as the number it accompanies.
- All financial numbers must use font-variant-numeric: tabular-nums.

This typography system is a doctrine, not a permanent constraint. Font choices may change through ADR if a better cross-platform alternative is identified.

## 8. Color Semantics

Color carries cognitive cost. That cost must be spent on what matters.

Three-level color system:

- Green (#4ade80): positive state. Income, assets growing, healthy balance, net profit positive.
- Amber (#fbbf24): attention state. Something worth noticing, but no immediate action required. Examples: low account balance, negative cash flow while net profit is positive.
- Red (#f87171): action state. Current financial state has a problem that requires a decision. Examples: net loss, outstanding debt, account balance negative.

Neutral outflow color:

- Routine expense transactions use rgba(255,255,255,0.55) on the dark background.
- Expenses are financial facts, not warnings. Red is reserved for states that require action.
- This preserves the signal value of red: when the user sees red, it means something needs their attention.

Rules:

- Red must not be used for routine outflows or normal expense display.
- Amber must not be used for states that require immediate action.
- Green must not be used for neutral or negative states.
- Color trigger thresholds (such as what balance level triggers amber) belong in specs, not in this doctrine.

## 9. Visual Safety Rules

- Key numbers must remain readable.
- Labels and error states must remain readable.
- Report tables and charts must be scannable.
- Motion must not block recording, confirmation, or report reading.
- Decorative elements must not imply financial meaning unless they are data-bound.
- Visual layer consumes financial data; it does not create financial data.
- Loading states and empty states must be visually distinct from real financial data. Placeholder numbers, skeleton values, or default zeros must never appear as if they are actual account balances, report figures, or transaction amounts.

## 10. Critic Notes

The visual system must continually defend against:

- excessive sci-fi tone
- concept-demo feeling
- weak financial trust
- low contrast
- performance debt
- decorative charts that do not improve understanding

## 11. Evolution

Future visual systems may replace Dark Liquid CFO Style if they better serve personal CFO clarity, trust, and product identity.

Such changes should update visual specs and, if they redefine the product identity, be recorded through ADR.

## 12. Current Mobile Application Rule

The current mobile app must apply Dark Liquid CFO Style across the full app surface, not only the home dashboard.

This means:

- App shell, bottom navigation, management, reports, settings, account, asset/liability, and transaction screens use the same deep background system.
- Shared UI primitives should use transparent glass surfaces instead of opaque white cards.
- The current bottom navigation remains 首页 / 管理 / 报表 / 我的 unless a separate product decision changes route structure.
- Home and management are not merged by this doctrine update. Any information architecture merge belongs in a specs update.
- Existing accounting, storage, report, and AI posting boundaries remain unchanged.

Current mobile implementation tokens:

- Base background: `#090C1D`.
- Primary glass: `rgba(255, 255, 255, 0.08)` with `rgba(255, 255, 255, 0.18)` hairline border.
- Secondary glass: `rgba(255, 255, 255, 0.05)` with `rgba(255, 255, 255, 0.12)` hairline border.
- Navigation glass: `rgba(9, 12, 29, 0.80+)` with subtle top or outline border.
- Brand colors: `#FF5DBB`, `#8A5CFF`, `#3B8BFF`, `#00D2D9`.
- Semantic colors: `#4ade80`, `#fbbf24`, `#f87171`.

Implementation rules:

- Legacy warm orange may remain only as a compatibility alias for attention/amber, not as the primary brand identity.
- White surfaces must be removed from normal app chrome and content cards unless the screen explicitly needs a document-like export preview.
- Visual effects must stay subordinate to input, confirmation, report reading, and financial data clarity.
- Screens must not create financial numbers, formulas, or state meanings through visual styling.
