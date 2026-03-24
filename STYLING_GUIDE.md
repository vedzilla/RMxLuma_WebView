# RedefineMe Web — Styling Guide

A complete reference for styling conventions, design tokens, component patterns, and best practices used across the RedefineMe web app.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Design Tokens](#design-tokens)
3. [Typography](#typography)
4. [Color System](#color-system)
5. [Spacing & Layout](#spacing--layout)
6. [Border Radius & Shadows](#border-radius--shadows)
7. [Responsive Design](#responsive-design)
8. [Component Patterns](#component-patterns)
9. [Animation & Motion](#animation--motion)
10. [Image Handling](#image-handling)
11. [Z-Index Stacking](#z-index-stacking)
12. [Category Colors](#category-colors)
13. [Hover & Interaction Patterns](#hover--interaction-patterns)
14. [Dark Mode](#dark-mode)
15. [Utility Helpers](#utility-helpers)
16. [Dependencies](#dependencies)
17. [File Reference](#file-reference)

---

## Tech Stack

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| CSS Engine     | Tailwind CSS 4 (via `@tailwindcss/postcss`)         |
| Animations     | Framer Motion v12                                   |
| Class Merging  | `cn()` — clsx + tailwind-merge                      |
| Font           | Space Grotesk (Google Fonts, loaded via `next/font`) |
| 3D             | Spline (landing page only)                          |
| UI Primitives  | Radix UI (Slot for polymorphic components)           |
| Dashboard UI   | shadcn/ui (scoped to `.dashboard-scope`)             |

---

## Design Tokens

All design tokens are CSS custom properties defined in `:root` inside `src/app/globals.css`. Tailwind utilities are mapped to these tokens via the `@theme inline` block.

### Core Palette

| Token            | Value                          | Tailwind Class   | Usage                       |
| ---------------- | ------------------------------ | ---------------- | --------------------------- |
| `--bg`           | `#FAFAFA`                      | `bg-bg`          | Page background             |
| `--surface`      | `#FFFFFF`                      | `bg-surface`     | Cards, elevated surfaces    |
| `--text`         | `#0F172A`                      | `text-text`      | Primary text (slate-900)    |
| `--muted`        | `#64748B`                      | `text-subtle`    | Secondary text, captions    |
| `--border`       | `#E5E7EB`                      | `border-border`  | Borders, dividers           |
| `--accent`       | `#6366F1`                      | `text-brand`     | Primary accent (indigo)     |
| `--accentHover`  | `#4F46E5`                      | `text-brand-hover` | Accent hover state        |
| `--accentSoft`   | `#EEF2FF`                      | `bg-accentSoft`  | Light accent background     |
| `--red`          | `#EF4444`                      | `text-red`       | CTA, destructive, emphasis  |
| `--redGlow`      | `rgba(239,68,68,0.4)`          | `bg-redGlow`     | Red glow effects            |
| `--redSoft`      | `rgba(239,68,68,0.1)`          | `bg-redSoft`     | Light red background        |

### Shadows

| Token          | Value                              | Usage               |
| -------------- | ---------------------------------- | -------------------- |
| `--shadow`     | `0 6px 24px rgba(15,23,42,0.08)`  | Elevated elements    |
| `--shadowSoft` | `0 4px 14px rgba(15,23,42,0.06)`  | Subtle elevation     |

Tailwind mappings: `shadow` → `--shadowSoft`, `shadow-md` → `--shadow`.

### Border Radius

| Token         | Value                  | Tailwind        | Computed (at 16px base) |
| ------------- | ---------------------- | --------------- | ----------------------- |
| `--radius`    | `16px`                 | —               | Base value              |
| `--radius-sm` | `calc(--radius * 0.6)` | `rounded-sm`   | ~10px                   |
| `--radius-md` | `calc(--radius * 0.8)` | `rounded-md`   | ~13px                   |
| `--radius-lg` | `var(--radius)`        | `rounded-lg`   | 16px                    |
| `--radius-xl` | `calc(--radius * 1.25)`| `rounded-xl`   | 20px                    |
| `--radius-2xl`| `calc(--radius * 1.5)` | `rounded-2xl`  | 24px                    |

---

## Typography

### Font

**Space Grotesk** — loaded via `next/font/google` in `src/app/layout.tsx`, applied globally through the `--font-space-grotesk` CSS variable.

```css
font-family: var(--font-space-grotesk), 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
```

### Base Styles

```css
body {
  font-size: 16px;
  line-height: 1.5;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3 {
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
  text-wrap: balance;
}
```

### Typography Scale (common patterns in components)

| Element     | Size                          | Weight | Tracking        | Line Height |
| ----------- | ----------------------------- | ------ | --------------- | ----------- |
| Hero H1     | `text-[36px] md:text-[60px]`  | 600    | `tracking-[-0.03em]` | `leading-[1.1]` |
| Section H2  | `text-[18px]`                 | 600    | `tracking-[-0.02em]` | `leading-[1.2]` |
| Body        | `text-[15px]` or `text-base`  | 400    | `tracking-[-0.01em]` | `leading-[1.5]` |
| Small/Label | `text-sm` (14px)              | 500–600 | default         | default     |
| Caption     | `text-xs` (12px)              | 400    | default         | default     |

### Text Colors

| Usage            | Class           |
| ---------------- | --------------- |
| Primary text     | `text-text`     |
| Secondary text   | `text-subtle`   |
| Accent text      | `text-brand`    |
| CTA / emphasis   | `text-red`      |
| On dark bg       | `text-surface`  |

---

## Color System

### When to Use Each Color

| Color         | When                                                |
| ------------- | --------------------------------------------------- |
| `bg`          | Page-level background, section fills                |
| `surface`     | Cards, modals, elevated panels, inputs              |
| `text`        | Headlines, primary body text, dark buttons          |
| `subtle`      | Descriptions, timestamps, placeholder text          |
| `brand`       | Links, active states, accent highlights             |
| `brand-hover` | Hover state for brand-colored interactive elements  |
| `accentSoft`  | Light accent backgrounds (tags, badges, highlights) |
| `red`         | Primary CTA buttons, destructive actions            |
| `redGlow`     | Glow/shadow effects behind red CTAs                 |
| `redSoft`     | Light red backgrounds (error states, badges)        |
| `border`      | All borders, dividers, separators                   |

### Dashboard Color System (scoped)

The society dashboard uses a separate shadcn/ui-based token set, scoped to `.dashboard-scope`:

| Token        | Value     | Usage                 |
| ------------ | --------- | --------------------- |
| `--primary`  | `#C04138` | Dashboard primary     |
| `--chart-1`  | `#C04138` | Chart color (darkest) |
| `--chart-2`  | `#E8765E` | Chart color           |
| `--chart-3`  | `#F2A07B` | Chart color           |
| `--chart-4`  | `#F7C59F` | Chart color           |
| `--chart-5`  | `#FAEBD7` | Chart color (lightest)|

These are isolated from the public-facing app tokens to prevent conflicts.

---

## Spacing & Layout

### Container

The standard content container is:

```tsx
<div className="max-w-[1120px] mx-auto px-[18px]">
```

- **Max width**: `1120px` — consistent across most pages
- **Horizontal padding**: `18px` — mobile gutter
- **Centering**: `mx-auto`

### Grid System

| Pattern                                      | Usage                       |
| -------------------------------------------- | --------------------------- |
| `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px]` | Event card grids   |
| `grid grid-cols-1 sm:grid-cols-2 gap-5`     | Form fields, society grids  |
| `flex flex-col gap-4`                        | Stacked content sections    |
| `flex items-center justify-between`          | Header rows, toolbar rows   |

### Common Spacing Values

| Value         | Usage                                |
| ------------- | ------------------------------------ |
| `gap-[14px]`  | Card grid gaps                       |
| `gap-4` (16px)| Section internal spacing             |
| `gap-5` (20px)| Form field gaps                      |
| `p-4` (16px)  | Card padding (compact)               |
| `p-6` (24px)  | Card padding (spacious)              |
| `px-[18px]`   | Container horizontal padding         |
| `py-8` (32px) | Section vertical padding             |
| `mb-6` (24px) | Section bottom margin                |

---

## Border Radius & Shadows

### Radius Usage

| Element          | Class          | Result |
| ---------------- | -------------- | ------ |
| Cards            | `rounded-xl`   | 20px   |
| Buttons          | `rounded-lg`   | 16px   |
| Inputs           | `rounded-lg`   | 16px   |
| Pills / tags     | `rounded-full` | 999px  |
| Avatars          | `rounded-full` | Circle |
| Modal panels     | `rounded-xl`   | 20px   |

### Shadow Usage

| Element           | Class                      |
| ----------------- | -------------------------- |
| Cards             | `shadow-[var(--shadow)]`   |
| Subtle elevation  | `shadow-[var(--shadowSoft)]` or `shadow` |
| Dropdowns         | `shadow-md`                |
| Modals            | Custom or `shadow-md`      |

---

## Responsive Design

### Approach: Mobile-First

Base styles target mobile. Breakpoint prefixes layer on progressively.

### Breakpoints

| Prefix | Min Width | Usage                           |
| ------ | --------- | ------------------------------- |
| `sm:`  | 640px     | Two-column forms, wider cards   |
| `md:`  | 768px     | Two-column grids, modal widths  |
| `lg:`  | 1024px    | Three-column grids, hero layout |
| `xl:`  | 1280px    | Max container widths            |

### Custom 750px Breakpoint

For finer mobile/desktop control, custom utility classes are defined in `globals.css`:

```css
@media (min-width: 751px) { .mobile-only { display: none !important; } }
@media (max-width: 750px) { .desktop-only { display: none !important; } }
```

Use `mobile-only` and `desktop-only` classes for elements that should appear in only one context (e.g., hamburger menu vs. horizontal nav).

### Common Responsive Patterns

```tsx
// Stacked on mobile, grid on desktop
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px]"

// Hero heading scales up
className="text-[36px] md:text-[60px]"

// Modal width adapts
className="w-full md:w-[600px] lg:w-[700px]"

// Hide/show navigation
className="mobile-only"   // Shows only on ≤750px
className="desktop-only"  // Shows only on ≥751px
```

---

## Component Patterns

### Buttons (`PublicButton`)

Location: `src/components/ui/PublicButton.tsx`

Three variants, all sharing a common base:

```tsx
// Base classes (all variants)
"inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
```

| Variant   | Classes                                              | Usage              |
| --------- | ---------------------------------------------------- | ------------------- |
| `primary` | `bg-text text-surface hover:bg-subtle`               | Default actions     |
| `outline` | `border border-border bg-transparent text-text hover:bg-bg` | Secondary actions |
| `ghost`   | `bg-transparent text-text hover:bg-bg`               | Tertiary / inline   |

Supports `asChild` via Radix `Slot` for rendering as `<a>` or other elements.

```tsx
<PublicButton variant="primary">Get Started</PublicButton>
<PublicButton variant="outline" asChild>
  <a href="/discover">Browse Events</a>
</PublicButton>
```

### Cards

Standard card pattern:

```tsx
<div className="bg-surface border border-border rounded-xl shadow-[var(--shadow)] p-4">
  {/* Card content */}
</div>
```

- Background: `bg-surface` (white)
- Border: `border border-border`
- Radius: `rounded-xl` (20px)
- Shadow: `shadow-[var(--shadow)]`
- Padding: `p-4` (compact) or `p-6` (spacious)
- Hover: add `hover:shadow-md` or `hover:bg-bg` for interactive cards

### Modals

The `EventModal` uses a right-slide pattern:

```tsx
// Backdrop
<div className="fixed inset-0 z-50 bg-[rgba(15,23,42,0.45)]" />

// Panel (slides from right)
<div className="fixed right-0 top-0 h-full w-full md:w-[600px] lg:w-[700px]
                bg-surface overflow-y-auto transition-transform duration-300 ease-out">
```

- Backdrop click and Escape key close the modal
- Transform-based slide animation (300ms ease)

### Form Inputs

```tsx
<input className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg
                  text-text focus:outline-none focus:ring-2 focus:ring-brand/40
                  transition" />
```

- Background: `bg-bg` (slightly off-white, not pure white)
- Focus: 2px ring in accent color at 40% opacity
- Consistent `rounded-lg` radius with buttons

### Navigation (Header)

- Sticky: `sticky top-0 z-50`
- Border bottom: `border-b border-border`
- Background: `bg-surface` (white)
- Desktop: horizontal nav links + dropdowns
- Mobile: hamburger icon triggers right-slide panel

### Footer

- Background: `bg-text` (dark, inverted)
- Text: `text-surface` (white on dark)
- Logo crossfade animation between dot/no-dot variants

---

## Animation & Motion

### CSS Keyframes (globals.css)

| Animation             | Duration | Usage                              |
| --------------------- | -------- | ---------------------------------- |
| `logoDotFade`         | 6s       | Logo crossfade (dot visible)       |
| `logoNoDotFade`       | 6s       | Logo crossfade (no-dot visible)    |
| `pulse`               | 2s       | Live indicator badge (scale + opacity) |
| `slide-in-from-right` | 0.3s     | Mobile menu entrance               |
| `aurora`              | 60s      | Background gradient drift (landing)|

### Framer Motion Conventions

**Hero entrance animations** (staggered):

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.2 }}
>
```

**Modal transitions** (state-driven):

```tsx
style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
transition: 'transform 300ms ease'
```

**AnimatePresence** for enter/exit:

```tsx
<AnimatePresence mode="wait">
  <motion.span key={currentText}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
  />
</AnimatePresence>
```

### Tailwind Transition Classes

| Class                  | Usage                           |
| ---------------------- | ------------------------------- |
| `transition-colors`    | Button hover, link hover        |
| `transition-transform` | Scale/position changes          |
| `transition-opacity`   | Fade effects                    |
| `transition-all`       | Multiple property transitions   |
| `duration-300`         | Standard transition speed       |

---

## Image Handling

### Next.js Image Component

Always use `next/image` for optimized loading:

```tsx
import Image from 'next/image';

// Fixed dimensions
<Image src={url} alt={alt} width={400} height={300} className="rounded-xl object-cover" />

// Fill container
<div className="relative w-full aspect-[4/3]">
  <Image src={url} alt={alt} fill className="object-cover rounded-xl" />
</div>
```

### Priority Loading

Add `priority` to above-the-fold images (LCP optimization):

```tsx
<Image src={heroImage} alt="..." priority />
```

### Allowed Domains

Configured in `next.config.js` `remotePatterns`:

| Domain                                      | Source          |
| ------------------------------------------- | --------------- |
| `dgzzf6k1ibya0.cloudfront.net`             | CloudFront CDN  |
| `redefine-me-image-bucket.s3.amazonaws.com` | S3 bucket       |
| `scontent-man2-1.cdninstagram.com`          | Instagram CDN   |
| `images.unsplash.com`                       | Placeholder     |
| `via.placeholder.com`                       | Fallback        |

---

## Z-Index Stacking

Consistent z-index layers prevent overlap conflicts:

| Z-Index    | Usage                              |
| ---------- | ---------------------------------- |
| `z-10`     | Content layer                      |
| `z-20`     | Secondary overlays                 |
| `z-30`     | Global spotlight effect            |
| `z-40`     | Modal backdrop                     |
| `z-50`     | Header (sticky), modal panel, dropdowns |
| `z-[150]`  | Mobile menu backdrop               |
| `z-[200]`  | Mobile menu panel                  |

---

## Category Colors

Dynamic category colors used by `FilterPills` and `CategoryCard`:

```typescript
const categoryColors = {
  'Sports':       '#3B82F6',  // Blue
  'Business':     '#6366F1',  // Indigo
  'Culture':      '#A855F7',  // Purple
  'Wellbeing':    '#10B981',  // Green
  'Social':       '#F59E0B',  // Amber
  'Tech':         '#EF4444',  // Red
  'Arts':         '#EC4899',  // Pink
  'Food & Drink': '#F97316',  // Orange
}
```

Applied via inline styles with opacity variants:
- Selected: `backgroundColor: "${color}20"` (12.5% opacity)
- Unselected: `backgroundColor: "${color}1A"` (10% opacity)
- Hover: `brightness-95` filter, `scale-[1.02]` transform

---

## Hover & Interaction Patterns

### Buttons

```tsx
"hover:bg-[rgba(15,23,42,0.04)]"  // Subtle background on hover (nav links)
"hover:bg-subtle"                  // Darken (primary button)
"hover:bg-bg"                      // Lighten (outline/ghost button)
```

### Cards

```tsx
"hover:-translate-y-0.5"           // Lift effect
"hover:shadow-[var(--shadow)]"     // Shadow upgrade
"hover:border-text"                // Strengthen border
"transition-all duration-[0.12s]"  // Snappy 120ms transition
```

### Links & Text

```tsx
"text-subtle hover:text-text transition-colors"  // Standard link hover
```

### Focus States

```tsx
"focus:outline-none focus:ring-2 focus:ring-brand/40"  // Input/button focus ring
```

---

## Dark Mode

**Status**: Not implemented. All tokens are light-mode only.

Some groundwork exists in the aurora background component (`dark:[background-image:...]`, `dark:invert-0`), but there is no `.dark` class toggle in the HTML. The CSS variable architecture is ready for a future dark mode implementation via `:root.dark {}` overrides.

---

## Utility Helpers

### `cn()` — Conditional Class Merging

Location: `src/lib/utils.ts`

```tsx
import { cn } from "@/lib/utils";

// Merges classes, deduplicates Tailwind conflicts
className={cn(
  "base-classes",
  isActive && "active-classes",
  className // allow parent overrides
)}
```

Built on `clsx` + `tailwind-merge`. Always use `cn()` instead of raw string concatenation for conditional classes.

---

## Dependencies

Key styling-related packages:

| Package                      | Version | Purpose                       |
| ---------------------------- | ------- | ----------------------------- |
| `tailwindcss`                | ^4      | Utility CSS engine            |
| `@tailwindcss/postcss`       | ^4      | PostCSS plugin for Tailwind 4 |
| `tailwind-merge`             | ^3.5    | Tailwind class deduplication  |
| `clsx`                       | ^2.1    | Conditional classnames        |
| `framer-motion`              | ^12.23  | Animation library             |
| `tw-animate-css`             | ^1.4    | Animation utility classes     |
| `@radix-ui/react-slot`       | ^1.2    | Polymorphic component pattern |
| `lucide-react`               | ^0.577  | Icon library                  |
| `@splinetool/react-spline`   | ^4.1    | 3D scenes (landing page)      |
| `shadcn`                     | ^4.0    | Dashboard UI components       |

---

## File Reference

### Styling Source Files

| File                              | Contains                                     |
| --------------------------------- | -------------------------------------------- |
| `src/app/globals.css`             | All tokens, theme mapping, keyframes, base styles |
| `src/lib/utils.ts`               | `cn()` class merge helper                    |
| `postcss.config.mjs`             | Tailwind v4 PostCSS plugin                   |
| `next.config.js`                 | Image domains, security headers              |

### Key Component Files

| File                                  | Pattern Example               |
| ------------------------------------- | ----------------------------- |
| `src/components/ui/PublicButton.tsx`   | Button variants               |
| `src/components/Header.tsx`           | Sticky nav, dropdowns, mobile menu |
| `src/components/Footer.tsx`           | Dark section, logo animation  |
| `src/components/EventCard.tsx`        | Card pattern                  |
| `src/components/EventModal.tsx`       | Modal + backdrop              |
| `src/components/SearchBar.tsx`        | Input pattern                 |
| `src/components/FilterPills.tsx`      | Pill/tag pattern              |
| `src/components/ui/aurora-background.tsx` | Animated background       |
| `src/components/ui/spotlight.tsx`     | Cursor glow effect            |

### Page Client Components

| File                                                          | Layout Pattern        |
| ------------------------------------------------------------- | --------------------- |
| `src/app/(landing)/LandingPageClient.tsx`                     | Aurora bg, hero, 3D   |
| `src/app/(app)/discover/DiscoverPageClient.tsx`               | Grid + filters        |
| `src/app/(app)/categories/[categorySlug]/CategoryPageClient.tsx` | Hero + grid        |
| `src/app/(app)/support/SupportPageClient.tsx`                 | Form layout           |
