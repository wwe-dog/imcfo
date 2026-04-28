---
name: Zenith Finance
colors:
  surface: '#fcf8ff'
  surface-dim: '#dcd8e3'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f2fd'
  surface-container: '#f1ecf7'
  surface-container-high: '#ebe6f1'
  surface-container-highest: '#e5e1ec'
  on-surface: '#1c1b22'
  on-surface-variant: '#474553'
  inverse-surface: '#312f38'
  inverse-on-surface: '#f3effa'
  outline: '#787585'
  outline-variant: '#c8c4d6'
  surface-tint: '#5a4ac7'
  primary: '#5848c5'
  on-primary: '#ffffff'
  primary-container: '#7162e0'
  on-primary-container: '#fffbff'
  inverse-primary: '#c7bfff'
  secondary: '#5c50b1'
  on-secondary: '#ffffff'
  secondary-container: '#a599ff'
  on-secondary-container: '#392a8b'
  tertiary: '#7c5400'
  on-tertiary: '#ffffff'
  tertiary-container: '#9c6b00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4dfff'
  primary-fixed-dim: '#c7bfff'
  on-primary-fixed: '#170065'
  on-primary-fixed-variant: '#422faf'
  secondary-fixed: '#e5deff'
  secondary-fixed-dim: '#c7bfff'
  on-secondary-fixed: '#180065'
  on-secondary-fixed-variant: '#443797'
  tertiary-fixed: '#ffddae'
  tertiary-fixed-dim: '#feba44'
  on-tertiary-fixed: '#281800'
  on-tertiary-fixed-variant: '#614000'
  background: '#fcf8ff'
  on-background: '#1c1b22'
  surface-variant: '#e5e1ec'
typography:
  display-amount:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '300'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  container-padding: 20px
  gutter: 16px
---

## Brand & Style

The design system is anchored in the philosophy of "Financial Clarity." It aims to reduce the cognitive load and anxiety often associated with money management by utilizing a hyper-minimalist aesthetic. The target audience values intentionality, seeking a personal tool that feels more like a wellness app than a traditional banking interface.

The visual style is a blend of **Minimalism** and **Soft-Modernism**. It prioritizes extreme white space, a disciplined color palette, and high-quality typography to create an ethereal, "Zen-like" atmosphere. By removing all non-essential decorative elements, the design system ensures that the user's data remains the primary focus, presented with a sense of calm and premium restraint.

## Colors

The palette for the design system is centered on a singular "Ethereal Violet" that serves as the primary action color. This hue is chosen for its calming yet modern quality. 

- **Primary:** Used for key actions, active states, and brand moments.
- **Backgrounds:** A tiered system of pure white (#FFFFFF) and a very light cool gray (#F9FAFB) to create subtle separation without the use of heavy lines.
- **Neutrals:** Grays are kept cool-toned to maintain the crisp, clean feel. 
- **Functional Colors:** Success (green) and Error (red) should be desaturated to match the softness of the primary violet, ensuring they do not disrupt the overall "Zen" aesthetic.

## Typography

The design system utilizes **Manrope** for its refined, geometric balance. The typographic hierarchy is strictly enforced to guide the eye through financial data without friction.

- **Display Amounts:** Large, light weights are used for account balances and primary figures to make them feel significant yet airy.
- **Hierarchy:** High contrast in font size is preferred over heavy weights to indicate importance.
- **Legibility:** Generous line heights are applied to body text to prevent information density from feeling overwhelming.

## Layout & Spacing

The layout philosophy for the design system is based on an **8pt grid**, but with a heavy emphasis on dynamic "Safe Zones." 

- **Margins:** Screens utilize a consistent 20px horizontal margin to provide breathing room.
- **Rhythm:** Vertical spacing is intentionally loose (using `xl` and `xxl` units) between major sections to emphasize the "Zen" feel.
- **Grid:** A standard 4-column mobile grid is used, but elements often span the full width to maintain a clean, singular column of focus.

## Elevation & Depth

Depth in the design system is achieved through **low-contrast outlines** and **ambient shadows**. We avoid traditional Material-style shadows in favor of a flatter, more editorial look.

- **Cards:** Use a 1px border (#F1F1F4) or a very soft, diffused shadow (0px 4px 20px rgba(0, 0, 0, 0.02)).
- **Layers:** Surfaces do not "float" high; they sit just above the background.
- **Glassmorphism:** Reserved exclusively for the bottom navigation bar and top headers to provide a sense of context and continuity as content scrolls beneath.

## Shapes

The shape language is sophisticated and approachable. The design system uses a **Level 2 (Rounded)** strategy.

- **Cards & Containers:** 16px corner radius creates a friendly, modern container for data.
- **Interactive Elements:** Buttons and inputs use a slightly smaller 12px radius to feel more precise.
- **Icons:** Must feature rounded terminals and a consistent 1.5px stroke weight to match the softness of the UI containers.

## Components

The components within the design system are designed to be as unobtrusive as possible.

- **Buttons:** Primary buttons use a solid #8A7CFB fill with white text. Secondary buttons are ghost-style with the primary color for the stroke and text.
- **Large Inputs:** Specifically for financial amounts, inputs feature `display-amount` typography, no background fill, and a simple 1px bottom border that glows slightly when focused.
- **Cards:** Minimalist containers with thin borders and no heavy shadows. Content inside cards should be padded with at least 16px of internal whitespace.
- **Bottom Navigation:** A simple, high-transparency frosted glass bar with 3-4 minimalist outline icons. The active state is indicated by a small violet dot beneath the icon.
- **Chips:** Small, pill-shaped tags used for categorizing transactions, utilizing a very pale violet background (#F3F1FF) and violet text.