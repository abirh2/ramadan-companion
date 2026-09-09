---
name: Deen Companion
description: A calm, precise foundation for an everyday Islamic companion.
colors:
  canvas-light: "oklch(0.97 0.012 82)"
  surface-light: "oklch(0.992 0.006 82)"
  grouped-light: "oklch(0.95 0.014 80)"
  feature-light: "oklch(0.29 0.055 190)"
  canvas-dark: "oklch(0.17 0.02 230)"
  surface-dark: "oklch(0.205 0.021 225)"
  grouped-dark: "oklch(0.235 0.022 225)"
  feature-dark: "oklch(0.30 0.045 195)"
  teal: "oklch(0.32 0.065 190)"
  teal-dark: "oklch(0.72 0.085 185)"
  brass: "oklch(0.54 0.08 75)"
  brass-dark: "oklch(0.73 0.075 80)"
  ink: "oklch(0.20 0.018 75)"
  warm-white: "oklch(0.93 0.012 80)"
typography:
  page-title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  section-title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 650
    lineHeight: 1.3
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "0.01em"
  eyebrow:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "0.08em"
  body-secondary:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  caption:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.45
  feature-number:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 650
    lineHeight: 1
    letterSpacing: "-0.03em"
  quran-translation:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.75
  arabic-body:
    fontFamily: "Noto Naskh Arabic, serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.9
  quran-arabic:
    fontFamily: "Noto Naskh Arabic, serif"
    fontSize: "1.875rem"
    fontWeight: 500
    lineHeight: 2
rounded:
  control-sm: "10px"
  control: "12px"
  grouped: "16px"
  surface: "20px"
  feature: "24px"
  round: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  touch: "44px"
  touch-android: "48px"
components:
  button-primary:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.surface-light}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 16px"
  surface-grouped:
    backgroundColor: "{colors.grouped-light}"
    textColor: "{colors.ink}"
    rounded: "{rounded.grouped}"
    padding: "16px"
  surface-feature:
    backgroundColor: "{colors.feature-light}"
    textColor: "{colors.surface-light}"
    rounded: "{rounded.feature}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 12px"
---

# Design System: Deen Companion

## Overview

**Creative North Star: “The Quiet Courtyard”**

Deen Companion should feel like a composed place users can return to throughout the day: warm, spacious, legible, and quietly exact. Its visual language sits between modern iOS restraint and contemporary Islamic editorial craft. Islamic identity is carried by the warm mineral palette, assured Arabic typography, and disciplined rhythm—not by repeated religious motifs or ornamental calligraphy.

This is an Operate system for a mobile-first Capacitor product. Familiar controls, readable hierarchy, touch comfort, and resilient light/dark theming take precedence over novelty. Brand expression is concentrated in deep teal feature surfaces, restrained brass details, and unusually careful typesetting.

**Key Characteristics:**

- Warm ivory rather than sterile white; tinted midnight rather than black.
- Tonal surface hierarchy with sparse, ambient elevation.
- Manrope for Latin UI; Noto Naskh Arabic for Arabic and Quran text.
- Moderately rounded geometry with a deliberate radius scale.
- Teal for action and selection; brass for rare editorial emphasis.

## Colors

The palette is warm and mineral: ivory, ink, deep teal, muted brass, and blue-tinted midnight. Light and dark appearances are independently composed around the same semantic roles.

### Primary

- **Courtyard Teal** (`oklch(0.32 0.065 190)` light; `oklch(0.72 0.085 185)` dark): primary actions, selected states, focus, and wayfinding.
- **Deep Feature Teal** (`oklch(0.29 0.055 190)` light; `oklch(0.30 0.045 195)` dark): important feature surfaces only.

### Secondary

- **Aged Brass** (`oklch(0.56 0.08 75)` light; `oklch(0.73 0.075 80)` dark): restrained editorial emphasis and meaningful highlights, never the default action color.

### Neutral

- **Warm Ivory** (`oklch(0.97 0.012 82)`): light canvas.
- **Porcelain** (`oklch(0.992 0.006 82)`): primary light surface.
- **Tinted Midnight** (`oklch(0.17 0.02 230)`): dark canvas.
- **Midnight Slate** (`oklch(0.205 0.021 225)`): primary dark surface.
- **Warm Ink** (`oklch(0.20 0.018 75)`): light primary text.
- **Moonlit Ivory** (`oklch(0.93 0.012 80)`): dark primary text.

**The Reserved Accent Rule.** Teal communicates action, selection, or importance. Brass marks rare editorial emphasis. Neither is scattered as decoration.

## Typography

**Display and Body Font:** Manrope (with system-ui fallback)  
**Arabic Font:** Noto Naskh Arabic (with Arabic Typesetting and serif fallbacks)

**Character:** Manrope keeps the interface contemporary and precise without becoming clinical. Noto Naskh Arabic supplies authentic proportions, excellent shaping, and clear diacritics; Arabic never inherits the Latin UI face.

### Hierarchy

- **Page Title** (700, 2rem, 1.15): top-level screen identity; fixed rather than fluid for predictable app layouts.
- **Section Title** (650, 1.375rem, 1.3): major content groups.
- **Body** (400, 1rem, 1.6): primary interface and reading copy; prose should generally stay within 65–75ch.
- **Secondary Body** (400, 0.9375rem, 1.55): supporting context.
- **Navigation / Label** (650, 0.8125rem, 1.25): concise controls and navigation.
- **Caption** (500, 0.8125rem, 1.45): metadata; use secondary or tertiary text color without dropping below AA contrast for meaningful content.
- **Feature Number** (650, 2.5rem, 1): countdowns and primary measurements; use lining tabular numerals.
- **Quran Translation** (400, 1.0625rem, 1.75): sustained English reading.
- **Arabic Body** (500, 1.25rem, 1.9): hadith, dua, and general Arabic text.
- **Quran Arabic** (500, 1.875rem, 2): Quran text with generous leading, RTL direction, and maximum diacritic clarity.

**The Script Integrity Rule.** Arabic and Quran text use their dedicated role, language metadata, and RTL direction. Do not fake Arabic character with weight, spacing, or a Latin serif.

## Layout

The base rhythm uses 4, 8, 12, 16, 24, and 32px steps. Content may sit directly on the canvas; containers are introduced only when grouping or prominence carries meaning. Respect iOS/Android safe-area insets and allow the browser or OS text-size preference to scale the root rem. Mobile touch targets should be at least 44px on iOS and 48px on Android where the compact layout permits.

## Elevation & Depth

Depth is tonal first. Most surfaces have no shadow. Hairlines separate adjacent regions, low elevation is reserved for floating controls and overlays, and feature elevation is reserved for genuinely important surfaces.

### Shadow Vocabulary

- **Hairline:** inset or single-pixel tonal separation without blur.
- **Low:** `0 1px 2px rgb(22 47 46 / 0.06), 0 8px 24px -18px rgb(22 47 46 / 0.28)`.
- **Feature:** `0 2px 4px rgb(17 45 44 / 0.08), 0 18px 42px -24px rgb(17 45 44 / 0.38)`.

**The Flat-by-Default Rule.** A border or tonal shift establishes most groups. Add elevation only when the surface must visually leave the canvas.

## Shapes

Controls use 10–12px corners, grouped surfaces use 16px, major surfaces use 20px, and feature surfaces use 24px. Fully round geometry is limited to switches, avatars, icon buttons, counters, and badges whose meaning benefits from the shape. Do not turn every control into a pill.

## Components

### Buttons

- **Shape:** 12px corners; 44px minimum default height.
- **Primary:** Courtyard Teal with high-contrast foreground; pressed state darkens in light mode and slightly deepens in dark mode.
- **Secondary / Outline / Ghost:** tonal or bordered, never shadowed by default.
- **Focus:** a clearly visible teal ring with separation from the control edge.

### Cards / Containers

- **Primary surface:** near-white or lifted midnight, 20px radius, subtle border, no shadow.
- **Grouped surface:** quiet tonal fill, 16px radius, subtle border, no shadow.
- **Elevated surface:** lifted fill and low ambient shadow, used sparingly for overlays.
- **Feature surface:** deep teal, 24px radius, tinted light text, optional feature elevation.

### Inputs / Fields

- **Style:** primary surface, 12px radius, strong hairline, at least 44px high.
- **Focus:** strong teal border and visible focus ring.
- **Error / Disabled:** error state combines color with message or icon; disabled state reduces emphasis without removing legibility.

### Navigation

Navigation labels are compact, semibold, and sentence case. Active state uses color plus weight, fill, underline, or position so color is never the only cue. Native safe areas and platform back behavior remain intact.

## Do's and Don'ts

### Do:

- **Do** use semantic surface and text roles so light and dark appearances remain synchronized.
- **Do** let important content sit directly on the canvas when grouping is already clear.
- **Do** use Noto Naskh Arabic, `lang="ar"`, and `dir="rtl"` for Arabic passages.
- **Do** reserve larger radius and deeper elevation for feature-level importance.

### Don't:

- **Don't** use pure black, cold gray canvases, bright yellow gold, or purple/blue AI gradients.
- **Don't** stack cards within cards or use shadows on every container.
- **Don't** use decorative crescents, mosques, or unattributed calligraphy as filler.
- **Don't** rely on color alone for success, warning, selection, or error state.
- **Don't** use arbitrary radii, one-off shadows, or screen-specific palette values when a semantic role exists.
