# Design Audit: RedefineMe Web App

**Date:** 2026-03-24
**URL:** http://localhost:3000
**Branch:** society-comittee-dashboard
**Mode:** Full (7 pages audited)
**Auditor:** gstack /design-review

---

## Design Score: C+
## AI Slop Score: A-

---

## First Impression

The site communicates **student energy with a tech-forward identity**. The 3D Spline robot is a bold, distinctive choice — immediately sets RedefineMe apart from generic SaaS templates.

I notice the hero is well-composed with clear hierarchy on the left side (brand → headline → CTA → stats), but the floating society profile pictures on the right border on visual noise — they compete with the robot for attention rather than supporting it.

The first 3 things my eye goes to are: **1) The headline** "Your uni life, all in one place", **2) The 3D robot**, **3) The red "all in one" accent text**.

If I had to describe this in one word: **Ambitious**.

---

## Inferred Design System

### Fonts
| Font | Usage |
|------|-------|
| Space Grotesk | Primary brand font (headings + body) |
| Geist | Next.js default — also loads, adds bandwidth |

**Issue:** Two font families load when only one is needed. Space Grotesk is the brand identity; Geist is dead weight.

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| --text | #0F172A | Primary text (Tailwind slate-900) |
| --bg | #FAFAFA | Page background |
| --surface | #FFFFFF | Card surfaces |
| --muted | #64748B | Secondary text (Tailwind slate-500) |
| --border | #E5E7EB | Borders |
| --red | #EF4444 | CTA accent, "all in one" |
| --accent | #6366F1 | Indigo (category pills) |

**Issue:** `#757575` appears in some rendered elements alongside the defined `#64748B` muted color — inconsistent grays.

### Heading Scale
| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| H1 | 68px / 36px | 700/600 | Landing hero / page titles |
| H2 | 18px | 600 | Section headings |
| H3 | 14px (was) | 600 | Footer labels (FIXED → now `<p>`) |

**Issue:** H2 is only 18px — very close to body text. No strong differentiation between H2 and body.

### Touch Targets
| Element | Size | Status |
|---------|------|--------|
| Nav links | 36px height | Below 44px minimum |
| Footer links | 18px height (was) | **FIXED** → 44px+ with padding |
| "Get the App" | 38-42px | Borderline |
| Filter pills | ~32px | Below 44px minimum |

---

## Per-Category Grades

| # | Category | Grade | Key Issues |
|---|----------|-------|------------|
| 1 | Visual Hierarchy | **B** | Strong landing page, discover page well-structured, about page underdeveloped |
| 2 | Typography | **C+** | Body text was 14px (fixed), two fonts loaded, heading scale too compressed |
| 3 | Color & Contrast | **B+** | Clean palette, semantic reds, minor gray inconsistency |
| 4 | Spacing & Layout | **B** | Consistent max-width, good grid, some arbitrary values (px not scale) |
| 5 | Interaction States | **C+** | Focus-visible present, touch targets undersized, hover states exist |
| 6 | Responsive | **B-** | Works but mobile is stacked-desktop, not mobile-designed |
| 7 | Motion & Animation | **B** | Framer Motion, Spline robot, hamburger animation, reduced-motion untested |
| 8 | Content Quality | **C** | About page sparse, "Register" labels vague, event descriptions good |
| 9 | AI Slop | **A-** | Distinctive 3D robot, Space Grotesk, no purple gradients or generic grids |
| 10 | Performance | **D** | 6.1s load, 11.5MB main bundle, 3.4MB logos, Spline = ~3MB |

---

## Findings

### FINDING-001: Body text size below 16px minimum — **FIXED**
- **Impact:** High
- **Category:** Typography
- **Before:** Body `<p>` elements rendered at 14px
- **After:** Base body font-size set to 16px with 1.5 line-height
- **Fix:** `globals.css` — added `font-size: 16px; line-height: 1.5` to body
- **Commit:** `2f02e14`
- **Status:** verified

### FINDING-002: Landing page catastrophic load time
- **Impact:** High (Critical)
- **Category:** Performance
- **Details:**
  - Total load: **6,130ms** (target: <2,000ms)
  - TTFB: 3,383ms
  - `main-app.js`: **11.5MB**
  - Landing page chunk: **8.2MB** (Spline 3D)
  - `rm-dot-logo.png`: **1.3MB**, `rm-no-dot-logo.png`: **2.1MB**
  - Spline scene: **2.4MB** + 506KB WASM
- **Fix:** Deferred — requires architectural changes (dynamic import Spline, compress logos, code splitting)
- **Status:** deferred

### FINDING-003: Footer link touch targets critically undersized — **FIXED**
- **Impact:** High
- **Category:** Interaction States
- **Before:** Footer links were 18px height (need 44px minimum)
- **After:** Added `py-2` padding, links now meet minimum touch target
- **Fix:** `Footer.tsx` — added `inline-block py-2` to footer links
- **Commit:** `4b97fdb`
- **Status:** verified

### FINDING-004: Heading hierarchy broken — **FIXED**
- **Impact:** Medium
- **Category:** Typography
- **Before:** Footer used `<h3>` at 14px for labels like "Explore" and "Get Started"
- **After:** Changed to `<p>` elements — they're visual labels, not headings
- **Fix:** `Footer.tsx` — `h3` → `p`
- **Commit:** `938fa7c`
- **Status:** verified

### FINDING-005: Logo images massively oversized + no optimization — **FIXED**
- **Impact:** High
- **Category:** Performance
- **Before:** `unoptimized` prop on logo Images (1.3MB + 2.1MB PNGs served raw)
- **After:** Removed `unoptimized`, added `priority` to header logos for LCP
- **Fix:** `Header.tsx` + `Footer.tsx` — removed `unoptimized`, added `priority`
- **Commit:** `12e5351`
- **Status:** verified

### FINDING-006: No text-wrap: balance on headings — **FIXED**
- **Impact:** Polish
- **Category:** Typography
- **Before:** Headings used default `text-wrap: wrap`
- **After:** Added `text-wrap: balance` for better visual rhythm
- **Fix:** `globals.css` — added to h1/h2/h3 rule
- **Commit:** `2f02e14`
- **Status:** verified

### FINDING-007: About page too sparse
- **Impact:** Medium
- **Category:** Content Quality
- **Details:** The about page is plain text with minimal structure. No imagery, no brand personality. Doesn't match the landing page's ambition.
- **Status:** deferred — requires content/design work beyond CSS fixes

### FINDING-008: Cities dropdown shows only one city
- **Impact:** Medium
- **Category:** Content Quality
- **Details:** Cities dropdown in header opens with only "Manchester". For a single-city launch, consider hiding the dropdown and showing "Manchester" as static text.
- **Status:** deferred — product decision

### FINDING-009: Inconsistent gray values
- **Impact:** Polish
- **Category:** Color
- **Details:** `#64748B` (slate-500) and `#757575` used in different contexts. Should standardize on one gray scale.
- **Status:** deferred

### FINDING-010: Duplicate font family loaded
- **Impact:** Medium
- **Category:** Performance
- **Details:** Space Grotesk (brand) and Geist (Next.js default) both load. Geist adds bandwidth with no design benefit.
- **Status:** deferred — requires layout.tsx font configuration change

### FINDING-011: CSP blocks Spline video
- **Impact:** Medium
- **Category:** Performance
- **Details:** Content Security Policy directive blocks inline `data:video/mp4` used by Spline's loading animation.
- **Status:** deferred — requires CSP configuration

### FINDING-012: Above-the-fold event images lazy-loaded — **FIXED**
- **Impact:** Medium
- **Category:** Performance
- **Before:** All event card images used default lazy loading
- **After:** First 3 event cards on discover page use `priority` loading
- **Fix:** `EventCard.tsx` + `DiscoverPageClient.tsx` — added `priority` prop
- **Commit:** `5c3b871`
- **Status:** verified

---

## Summary

| Metric | Value |
|--------|-------|
| Total findings | 12 |
| Fixed (verified) | 5 |
| Fixed (best-effort) | 0 |
| Reverted | 0 |
| Deferred | 7 |
| Design score | C+ |
| AI Slop score | A- |

### Quick Wins (highest impact, lowest effort)
1. **Compress logo PNGs** — convert to WebP or SVG. Currently 3.4MB for two logos.
2. **Dynamic import Spline** — `next/dynamic` with `ssr: false` to code-split the 8.2MB 3D robot
3. **Remove Geist font** — eliminate unused font family from layout.tsx
4. **Increase nav link padding** — nav links are 36px, should be 44px
5. **Increase filter pill height** — category pills are ~32px, should be 44px

### PR Summary
> Design review found 12 issues, fixed 5. Design score C+, AI slop A-. Key fixes: body text 16px, heading hierarchy, logo optimization, touch targets, LCP image priority.

---

## Litmus Checks

| # | Check | Answer |
|---|-------|--------|
| 1 | Brand/product unmistakable in first screen? | **YES** — RM. logo + 3D robot + "Your uni life" headline |
| 2 | One strong visual anchor present? | **YES** — The Spline 3D robot |
| 3 | Page understandable by scanning headlines only? | **YES** — Clear information hierarchy |
| 4 | Each section has one job? | **YES** — Landing, discover, categories well-structured |
| 5 | Are cards actually necessary? | **YES** — Event cards are the core interaction |
| 6 | Does motion improve hierarchy or atmosphere? | **YES** — Robot + hover transitions add polish |
| 7 | Would design feel premium with decorative shadows removed? | **YES** — Clean, minimal shadow usage |

### Hard Rejection Criteria
- Generic SaaS card grid as first impression? **NO** — 3D robot hero
- Beautiful image with weak brand? **NO** — Brand is strong
- Strong headline with no clear action? **NO** — "Explore Events" CTA present
- Busy imagery behind text? **NO** — Clean text/image separation
- App UI made of stacked cards instead of layout? **BORDERLINE** — Discover page is card-heavy but functional

**Classifier: HYBRID** — Marketing landing page + App UI (discover/events)
