# Design Guidelines

This document defines the visual and interaction system for the Deen Companion app.  
It is meant to be concrete enough that any developer or designer can implement consistent UI and UX without guessing.

---

## 1. Overall Design Principles

1. **Minimal and calm**
   - Avoid clutter, heavy borders, and too many colors.
   - Favor whitespace, soft shadows, and simple shapes.

2. **Subtle Islamic aesthetic**
   - Use geometric patterns, crescent/moon/lantern motifs, and Arabic typography sparingly.
   - No overly ornate or busy backgrounds.

3. **Content first**
   - Iftar times, prayer times, ayah/hadith text, and donation summaries should always be visually primary.
   - Decorative elements must never compete with readability.

4. **Mobile-first**
   - Primary layout optimized for mobile screens.
   - Desktop is an enhanced version (wider grid, more breathing room), not a completely different layout.

---

## 2. Layout & Spacing

### 2.1 Layout

- Base layout:
  - `max-width: 800px` (4xl) or `1280px` (6xl) container centered on desktop.
  - Full-width (with paddings) on mobile.
- Grid:
  - Mobile: single-column layout for cards.
  - Desktop: 2-column grid for dashboard cards.
- Page structure:
  - **Global header** (sticky): "Deen Companion" title + ThemeToggle + NavMenu + AuthButton
  - **Page content area**: Back button + page title + content
  - Footer is optional and minimal (version, small credits).

### 2.1.1 Navigation Pattern (Standardized - November 2024)

**Global Header** (in `src/app/layout.tsx`):
- Present on ALL pages
- Sticky at top: `sticky top-0 z-50`
- Contains: App title (clickable link to home) + Theme toggle + Navigation menu + Auth button
- Theme toggle is always visible (no login required)
- Never duplicated per-page

**Page-Level Navigation** (in page content):
- Back button + page title positioned at top of content area
- Consistent pattern across all pages except homepage

Example page structure:

```tsx
// Global header is automatic via layout.tsx
// Page content only:
<div className="container mx-auto px-4 py-6 max-w-4xl">
  <div className="mb-6">
    <Link 
      href="/" 
      className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="text-sm">Back to Home</span>
    </Link>
    <h1 className="text-3xl font-bold">Page Title</h1>
    <p className="text-muted-foreground mt-2">Optional description</p>
  </div>
  
  {/* Page content */}
</div>
```

**Max-width conventions:**
- Standard content pages: `max-w-4xl` (1024px)
- Wide layouts (maps, charts, tables): `max-w-6xl` (1280px)
- Admin dashboard: `max-w-7xl` (1536px)

### 2.2 Spacing Scale

Use Tailwind spacing units consistently:

* Small spacing: `4` (1rem)
* Default section padding: `6`–`8` (1.5–2rem)
* Card padding: `4`–`5`
* Gaps in grids: `4` on mobile, `6` on desktop

Rules of thumb:

* No element should touch the screen edge; always have at least `px-4`.
* Cards should have at least `p-4`, larger cards `p-5` or `p-6`.

---

## 3. Color System

Use Tailwind CSS or a custom theme file that maps to these semantic tokens.

### 3.1 Palette

| Role         | Hex       | Usage                            |
| ------------ | --------- | -------------------------------- |
| Primary      | `#0f3d3e` | Buttons, links, key accents      |
| Primary Soft | `#165f60` | Hover states, secondary accents  |
| Accent Gold  | `#d4af37` | Highlights, borders on key cards |
| Background   | `#f5f3f0` | Main page background             |
| Surface      | `#ffffff` | Cards, modals, input backgrounds |
| Text         | `#1a1a1a` | Primary text                     |
| Muted Text   | `#6b7280` | Secondary information, labels    |
| Error        | `#b91c1c` | Validation messages              |
| Success      | `#15803d` | Positive feedback                |

### 3.2 Dark Mode

Dark mode should feel like a calm “Ramadan night”:

| Role        | Hex                    | Usage                                    |
| ----------- | ---------------------- | ---------------------------------------- |
| Background  | `#020617`              | Main background                          |
| Surface     | `#020617` or `#111827` | Card background                          |
| Text        | `#e5e7eb`              | Primary text                             |
| Muted Text  | `#9ca3af`              | Secondary text                           |
| Primary     | `#22c55e`              | Accents (slightly brighter in dark mode) |
| Accent Gold | `#facc15`              | Highlights (sparingly)                   |

Use Tailwind’s `dark:` variants or a theme provider from shadcn.

---

## 4. Typography

### 4.1 Font Choices

* Headings:

  * Suggested: **Outfit** or **Manrope** (Google Fonts)
  * Clean, geometric, modern.
* Body text:

  * System UI or **Inter**.
* Arabic text:

  * **Amiri** (serif, traditional) or **Scheherazade New**.

### 4.2 Type Scale

Use a simple scale mapped to Tailwind utilities:

* Page title: `text-2xl` / `font-semibold`
* Section title: `text-xl` / `font-semibold`
* Card title: `text-lg` / `font-medium`
* Body text: `text-sm` or `text-base`
* Fine print / labels: `text-xs` or `text-[13px]`

Arabic ayah/hadith:

* Arabic: `text-lg`–`text-xl` with slightly increased line-height.
* Translation: `text-sm`–`text-base` muted.

Example:

```tsx
<p className="font-arabic text-xl leading-relaxed">
  الرَّحْمَـٰنِ الرَّحِيمِ
</p>
<p className="mt-2 text-sm text-muted-foreground">
  The Most Gracious, the Most Merciful.
</p>
```

Follow standard Tailwind leading, e.g. `leading-relaxed` or `leading-7`.

---

## 5. Components & ShadCN Usage

### 5.1 Core Components

Use `shadcn/ui` as the primary component library, on top of Tailwind.

Critical components to use consistently:

* `Card` – for dashboard items and content sections.
* `Button` – primary actions, outlined secondary actions.
* `Dialog` – for add/edit donation, confirmation flows.
* `Input`, `Textarea`, `Select`, `RadioGroup` – forms.
* `Tabs` – for toggling views (e.g., “This Ramadan / This Year / All Time” in Charity).
* `Sheet` – mobile nav menu if you add one.

ShadCN brings Radix-based accessibility and consistent styling — do not reinvent basic controls.

### 5.2 Card Design

* `rounded-2xl`
* `border` with low contrast (`border-border`)
* `shadow-sm`
* `bg-card` surface color

Example:

```tsx
<Card className="rounded-2xl border shadow-sm">
  <CardHeader>
    <CardTitle>Next Prayer</CardTitle>
    <CardDescription>Asr in 01:23</CardDescription>
  </CardHeader>
  <CardContent>
    {/* details */}
  </CardContent>
</Card>
```

---

## 6. Islamic Look & Feel

There is no single “Islamic UI library”, but you can combine:

1. **ShadCN for structure and common components**, plus
2. **Pattern and icon libraries** for subtle Islamic styling, plus
3. **Arabic-focused fonts** for ayah/hadith sections.

### 6.1 Additional UI / Design Libraries to Pair with ShadCN

You can safely add:

1. **Tailwind Plugins**

   * `@tailwindcss/typography`

     * Better prose for Quran/hadith content (`prose` classes).
   * `tailwindcss-animate`

     * Smooth, minimal animations (already used by shadcn).

2. **Pattern / Background Generators**

   * **Hero Patterns** (SVG patterns)

     * Use soft geometric backgrounds in headers or top strips.
   * **Haikei / Blobmaker**

     * Subtle shapes behind hero content if desired.
   * Any SVG-based geometric Islamic pattern sets

     * Integrated as absolutely-positioned background layers with very low opacity.

3. **Icon Libraries**

   * **Lucide React**

     * Already used within shadcn; great for generic icons.
   * **Iconify** or **react-icons**

     * Access icons like:

       * Mosque outline
       * Crescent moon
       * Lantern
     * Use sparingly: e.g., an icon in the Ramadan card, or next to titles.

4. **Charts (for later)**

   * **Recharts** or **Chart.js (via react-chartjs-2)**

     * For donation stats, zakat breakdown.
   * Keep styling minimal: borders off, muted axis, subtle grid.

### 6.2 Islamic Aesthetic Guidelines

* Use **geometric accents**, not full-page textures.

  * For example: a small patterned strip at the top of the page, or behind the header only.
* Limit number of religious icons:

  * Good candidates:

    * Crescent moon for Ramadan
    * Mosque silhouette for Places
    * Prayer bead/tasbeeh icon for Zikr
* Avoid:

  * Neon gradients
  * Excessive gold
  * Busy patterned backgrounds behind text

---

## 7. Motion & Microinteractions

### 7.1 General Rules

* Animations should be subtle and purposeful.
* Use duration in the `150ms–250ms` range.
* Easing: `ease-out` or `ease-in-out`.

### 7.2 Recommended Effects

* Cards:

  * Slight scale and shadow on hover (`scale-[1.01]`).
* Buttons:

  * Background color transitions on hover.
* Zikr Counter:

  * Small scale “pop” on increment.
* Dialogs:

  * Fade + slight slide from top or bottom (shadcn defaults).

Avoid large, bouncy animations that distract from worship-related content.

---

## 8. Visual Hierarchy by Feature

### 8.1 Dashboard

* Top-most visual priority:

  * Next prayer countdown
  * Ramadan countdown (during Ramadan)
* Secondary:

  * Quran / Hadith of the day
  * Charity summary
* Tertiary:

  * Zikr summary
  * Places

The arrangement on the dashboard should reflect this order.

### 8.2 Prayer Times

* Table must be very clear:

  * Prayer name aligned left, time aligned right.
* Next prayer highlighted:

  * Slight accent background or bold label.

### 8.3 Quran / Hadith

* Arabic should be visually distinct:

  * Slightly larger, different font, maybe right-aligned for Arabic text.
* Translation has comfortable line length and spacing.

### 8.4 Charity

* Totals at top in clear numeric cards.
* List of donations below with muted styling; highlight amounts and types.

---

## 9. Accessibility

The Deen Companion app follows WCAG 2.1 Level AA standards to ensure accessibility for all users, including those using assistive technologies.

### 9.1 Visual Accessibility

* **Color Contrast:**
  * Maintain at least **WCAG AA contrast ratio** (4.5:1) for text and important UI elements
  * Large text (18px+): minimum 3:1 contrast ratio
  * Don't rely solely on color to convey information (use icons, text, patterns)

* **Font Sizes:**
  * Body text: `text-sm` (14px) minimum for essential content
  * Avoid `text-xs` for anything critical
  * All text must be resizable without loss of functionality

* **Focus Indicators:**
  * All interactive elements must have visible focus states
  * Focus ring: 2-3px solid outline with high contrast
  * Default: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
  * Never remove focus indicators (`outline: none` without replacement)

* **Touch Targets:**
  * Minimum 44x44px for mobile tap targets
  * Adequate spacing between interactive elements
  * Buttons use `size` prop: `sm` (32px), `default` (36px), `lg` (40px)

### 9.2 Keyboard Accessibility

* **Tab Order:**
  * Logical tab order matching visual layout
  * Use `tabIndex={-1}` for programmatic focus only (e.g., skip link targets)
  * Never use positive `tabIndex` values

* **Keyboard Shortcuts:**
  * `Tab` / `Shift+Tab` - Navigate between elements
  * `Enter` / `Space` - Activate buttons and links
  * `Escape` - Close modals and dropdowns
  * Custom shortcuts must not conflict with browser/screen reader shortcuts

* **Focus Management:**
  * Focus trapped in open modals
  * Focus returned to trigger element when modal closes
  * Skip link provided to bypass navigation

### 9.3 Semantic HTML

* **Landmarks:**
  * Use semantic HTML elements: `<header>`, `<nav>`, `<main>`, `<section>`, `<aside>`, `<footer>`
  * Main content must have `id="main-content"` for skip link
  * Sections should have `aria-label` or `aria-labelledby`

* **Heading Hierarchy:**
  * One `<h1>` per page (page title)
  * Proper nesting: h1 > h2 > h3 (don't skip levels)
  * Use headings for structure, not just styling

* **Interactive Elements:**
  * Buttons for actions: `<button>` or `<Button>`
  * Links for navigation: `<a>` or `<Link>`
  * Don't use `<div>` or `<span>` for clickable elements

### 9.4 ARIA Labels and Roles

* **When to Use ARIA:**
  * When semantic HTML alone isn't sufficient
  * For dynamic content updates
  * Custom interactive widgets
  * **Rule:** No ARIA is better than bad ARIA

* **Common Patterns:**
  ```tsx
  // Icon buttons
  <Button aria-label="Close dialog" size="icon">
    <X className="h-4 w-4" aria-hidden="true" />
  </Button>

  // Loading states
  <div role="status" aria-live="polite">
    <Loader2 aria-hidden="true" />
    <span className="sr-only">Loading...</span>
  </div>

  // Form inputs
  <label htmlFor="email">Email</label>
  <input
    id="email"
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby="email-error"
  />
  <span id="email-error" role="alert">{error}</span>

  // Dynamic content
  <div aria-live="polite" aria-atomic="true">
    {countdown}
  </div>
  ```

* **Screen Reader Only Content:**
  * Use `sr-only` class for visually hidden content
  * Use `aria-hidden="true"` for decorative images/icons

### 9.5 Forms and Validation

* **Labels:**
  * Every input must have an associated `<label>`
  * Use `htmlFor` / `id` to link labels to inputs
  * Don't rely solely on placeholders

* **Required Fields:**
  * Visual indicator (asterisk) with `aria-label="required"`
  * `required` attribute on input
  * `aria-required="true"` for screen readers

* **Validation:**
  * Error messages with `role="alert"` or `aria-live="assertive"`
  * Link errors to fields with `aria-describedby`
  * Mark invalid fields with `aria-invalid="true"`
  * Show errors inline near the field

### 9.6 Dynamic Content

* **Live Regions:**
  * `aria-live="polite"` - Announcements that don't interrupt (prayer times, countdowns)
  * `aria-live="assertive"` - Important alerts (errors, critical messages)
  * `aria-atomic="true"` - Announce entire region content on change

* **Loading States:**
  * Use `role="status"` for loading indicators
  * Provide text alternative: `<span className="sr-only">Loading...</span>`
  * Use `aria-busy="true"` on loading containers

* **Status Messages:**
  * Success: `role="status"` with `aria-live="polite"`
  * Errors: `role="alert"` with `aria-live="assertive"`
  * Always provide text, not just color/icons

### 9.7 Accessible Components

* **Modals/Dialogs:**
  * Use `Dialog` component from shadcn/ui (built-in accessibility)
  * `aria-labelledby` points to dialog title
  * `aria-describedby` points to dialog description
  * Focus trapped within modal
  * `Escape` key closes modal

* **Dropdowns:**
  * Use `DropdownMenu` component (Radix UI based)
  * Proper `role="menu"` and `role="menuitem"`
  * Keyboard navigation with arrow keys
  * `aria-expanded` state management

* **Tabs:**
  * Use `Tabs` component from shadcn/ui
  * `role="tablist"`, `role="tab"`, `role="tabpanel"`
  * Arrow key navigation between tabs
  * `aria-selected` state

### 9.8 Testing Checklist

**Before Marking Complete:**
- [ ] All images have alt text (or `aria-hidden` if decorative)
- [ ] All buttons/links have descriptive labels
- [ ] Forms have associated labels
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader announcements are logical
- [ ] Modal focus management works
- [ ] Loading/error states are announced
- [ ] Heading hierarchy is correct

**Tools:**
- Manual keyboard testing (unplug mouse)
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Browser DevTools accessibility inspector
- jest-axe for automated testing
- Lighthouse accessibility audit

---

## 10. Component Examples by Page

This section is for reference when building.

### 10.1 Dashboard Card Style

* Use consistent spacing and typography for all dashboard cards.
* Titles: `text-sm font-medium text-muted-foreground`
* Primary value: `text-2xl font-semibold`
* Secondary info: `text-xs text-muted-foreground`

Example structure:

```tsx
<Card className="rounded-2xl border shadow-sm">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Next Prayer
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-1">
    <p className="text-2xl font-semibold">Asr in 01:23</p>
    <p className="text-xs text-muted-foreground">
      Today • 3:45 PM • Umm al-Qura
    </p>
  </CardContent>
</Card>
```

---

## 11. Future Design Extensions (Later)

These are not required for V1 but should influence decisions now:

* Multiple themes:

  * “Ramadan Night”, “Minimal White”, etc.
* Language-aware layout:

  * Right-to-left support for Arabic UI later.
* Custom illustrations:

  * Subtle hero illustration for the landing/dashboard header.

Design choices made now (color tokens, typography, spacing, semantic component usage) should be flexible enough to accommodate these extensions without a redesign.

```
::contentReference[oaicite:0]{index=0}
```
