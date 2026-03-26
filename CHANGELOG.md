# Changelog

All notable changes to the RedefineMe web app will be documented in this file.

## [0.1.0.0] - 2026-03-26

### Added
- Web onboarding flow: multi-step wizard (profile picture, university, course, study level, interests)
- Auth callback routing: admin -> /admin, society account -> /society, onboarded student -> /discover, new student -> /onboarding
- Middleware guard: force onboarding for authenticated users without a profile on all routes
- Course selection step with university-filtered course list
- Society picker page with card-based UI for committee members
- Auth-aware "Manage Society" button in header (desktop + mobile)
- "Get Started" CTA on landing page linking to /auth
- Aurora background and motion animations to society dashboard
- Dashboard motion components (DashboardSection, DashboardPageHeader)
- Supabase data layer: interests, study levels, courses, onboarding, user profile checks

### Changed
- Dashboard design aligned with main site brand identity (indigo primary, updated tokens)
- Dashboard-scoped red CTA color override for action buttons
- CSP headers split per route (landing page vs app routes) to fix auth flow blocking
- Sidebar and topbar use backdrop-blur glassmorphism
- Society dashboard pages restyled with consistent card layouts and motion
- Next.js bumped to latest version
- Google profile images allowed in CSP img-src

### Fixed
- CSP blocking OAuth callback flow
- Renamed "Societies" to "Manage Society" for clarity
