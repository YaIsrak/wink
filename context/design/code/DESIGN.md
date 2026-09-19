---
name: Wink
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#575e70'
  on-secondary: '#ffffff'
  secondary-container: '#d9dff5'
  on-secondary-container: '#5c6274'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#dce2f7'
  secondary-fixed-dim: '#c0c6db'
  on-secondary-fixed: '#141b2b'
  on-secondary-fixed-variant: '#404758'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.005em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-tablet: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies pure, razor-sharp minimalism anchored in architectural discipline and ultra-high typographic contrast. Designed for sophisticated digital products requiring speed, legibility, and distraction-free workflows, the system strips away all decorative noise. 

The aesthetic is uncompromisingly black and white monochrome. Visual rhythm is achieved strictly through scale, spatial density, hairline borders, and precise surface containment. Every interaction feels immediate, tactile, and deliberate. The emotional impact is confident, calm, and crystalline—prioritizing content and utility above visual ornamentation while preserving premium craftsmanship through deliberate structural proportions.

## Colors

The palette operates under a strict monochrome hierarchy with surgical micro-accents reserved exclusively for status feedback:

- **Base Surfaces**: The primary background is pristine `#FFFFFF`. Secondary container surfaces stack using systematic neutral off-whites: `#F9FAFB` (canvas base/card background), `#F3F4F6` (hover, active tabs, and input wells), and `#E5E7EB` (pressed surfaces).
- **Text & Foregrounds**: Primary headers and critical icons are pure `#000000` or `#111827`. Secondary body and contextual metadata use balanced cool neutrals `#4B5563` and `#6B7280`. Disabled elements use `#9CA3AF`.
- **Borders & Dividers**: Hairline borders rely on crisp `#E5E7EB` for structural divisions, transitioning to `#D1D5DB` on interactive control outlines and hovered frames. Focus rings use crisp `#000000` with a 2px offset.
- **Micro-Accents**: Restrained to functional feedback only. Destructive notices and alerts invoke `#EF4444`. Success indicators and confirmation ticks utilize `#10B981` or solid black checks. Notification badges default to solid black capsules with `#FFFFFF` text, using subtle `#EF4444` only for urgent alerts.

## Typography

Typography is set entirely in **Inter**, relying on tight optical tracking at large display sizes and neutral readability at standard text scales.

- **Weight Contrast**: Keep weights strictly bifurcated—headings rely on crisp `600` (Semi-Bold) or `700` (Bold) to punch out cleanly against pure white backdrops, while body copy stays anchored in standard `400` (Regular) and `500` (Medium).
- **Tracking Discipline**: Display and headline treatments feature negative letter-spacing (`-0.015em` to `-0.03em`) for a cohesive architectural lockup. Micro-labels, metadata, and status badges take slight positive letter-spacing (`0.01em` to `0.04em`) with uppercase or medium-case treatments for immediate scan-ability.

## Layout & Spacing

The layout is anchored on an 8-point geometric scale (with a 4-point micro-scale for compact UI elements).

- **Grid Architecture**: 
  - **Desktop (1024px+)**: 12-column layout, max content constraint of 1280px, 48px outer canvas margins, and 24px gutters.
  - **Tablet (768px – 1023px)**: 8-column layout, 32px canvas margins, 20px gutters.
  - **Mobile (<768px)**: 4-column layout, 16px canvas margins, 16px gutters.
- **Rhythm**: Spacing between unrelated content modules relies on generous intervals (`space-xl`), allowing the stark black-on-white palette room to breathe. Internal component padding stays tight and compact (`space-xs` to `space-md`) to ensure interfaces remain dense, functional, and uncluttered.

## Elevation & Depth

This design system avoids blurry drop shadows, soft simulated depth, and skeuomorphic gradients. Depth is established through **low-contrast outlines, surface tonal tiers, and crisp layered containment**:

- **Baseline Surfaces**: The primary page canvas sits on `#FFFFFF`. Secondary parent containers and panels use `#F9FAFB`.
- **Card & Surface Outlines**: All interactive containers, dialogs, and cards are framed with a precise 1px solid border (`#E5E7EB`). 
- **Active & Hover Elevation**: Depth states do not push elements forward via soft blurred shadows. Instead, elevation is expressed via 1px border contrast shifts (from `#E5E7EB` to `#111827`), fill adjustments (from `#FFFFFF` to `#F9FAFB`), or an ultra-crisp, tight offset shadow: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`.
- **Floating Modals & Flyouts**: Elevated overlays feature a dual-edge definition: a 1px solid `#E5E7EB` border paired with an ambient, razor-sharp shadow `0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)`.

## Shapes

The design system rejects bubble-like, pill-shaped treatments for structural and primary controls, favoring tailored, architectural micro-radii:

- **Standard Radii (6px / 0.375rem)**: Applied to buttons, input fields, dropdown triggers, and interactive cards. This keeps edges crisp and geometric while softening mechanical harshness.
- **Outer Shells & Modals (8px / 0.5rem)**: Large panels, contextual modals, and dialog boxes scale slightly to maintain proportionate corner geometry.
- **Capsule Exception (9999px)**: Reserved exclusively for small notification counter pills, presence status badges, and compact tags to distinguish informational indicators from actionable interactive rectangles.

## Components

### Buttons
- **Primary Button**: Solid `#000000` background with `#FFFFFF` text. Border radius of 6px (`rounded-md`). Padding: 8px 16px for standard, 6px 12px for compact. Hover state transitions to `#1F2937` with no scale transform. Active state: `#374151`.
- **Secondary / Outlined Button**: Pristine `#FFFFFF` surface with a 1px solid `#E5E7EB` border, text in `#111827`. Hover state shifts border to `#D1D5DB` and background to `#F9FAFB`.
- **Ghost / Minimal Button**: Transparent background, text `#4B5563`, hover fills to `#F3F4F6` with text `#000000`.

### Text Inputs & Form Fields
- Height of 40px with a 6px border radius. 
- Background `#FFFFFF`, border 1px solid `#E5E7EB`.
- Text color `#111827`, placeholder text `#9CA3AF`.
- **Focus State**: Border switches to `#000000` with a 1px or 2px clean solid focus ring without diffuse glow.
- **Error State**: 1px solid `#EF4444` border with a 12px error caption below in `#EF4444`.

### Checkboxes & Radio Buttons
- 16x16px boxes with 4px corner radius (checkbox) or fully circular (radio).
- Default: `#FFFFFF` fill with a 1px solid `#D1D5DB` border.
- Selected: Solid `#000000` fill with a pure white `#FFFFFF` crisp checkmark or solid white radio dot. Optional status variants can display a `#10B981` fill or a `#10B981` check icon on a pure white container.

### Chips & Badges
- Chips (Interactive Filters): 6px radius, `#FFFFFF` background, 1px solid `#E5E7EB`, text `#374151`. Active filter state inverts to `#000000` fill with `#FFFFFF` text.
- Notification Badges: Pill-shaped (`rounded-full`), height 18px, min-width 18px. Default badge is `#000000` fill with `#FFFFFF` typography (`label-xs`). Alert badge uses `#EF4444` fill with `#FFFFFF` text.

### Cards
- `#FFFFFF` background with a 1px solid `#E5E7EB` border and 6px–8px radius.
- Padding: 20px–24px.
- Clickable cards transition to a 1px `#111827` border and a `#F9FAFB` subtle background tint on hover.

### Lists & Tables
- Divided with 1px horizontal hairline borders (`#F3F4F6` or `#E5E7EB`). 
- Table headers use `#F9FAFB` surface, 11px uppercase `label-xs` typography in `#6B7280`, and 8px vertical padding. Rows hover with a seamless `#F9FAFB` fill transition.

### Modals & Dialogs
- Maximum width 520px, 8px border radius, 1px solid `#E5E7EB`, `#FFFFFF` surface. Backdrop overlay is a neutral `#000000` at 30% opacity without heavy blur.