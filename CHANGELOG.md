# Changelog

All notable changes to the `wfx-tamdev` project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Animation Overhaul & Accessibility

### Added
- **Global Motion Utilities (`src/lib/motion.ts`)**:
  - Reusable physics-based spring configurations (`springTransition`, `gentleSpring`, `bouncySpring`, `smoothEase`).
  - Standard animation variants (`fadeInUp`, `staggerContainer`, `modalVariants`, `backdropVariants`).
  - Accessible motion hook (`useAccessibleMotion`) wrapping Framer Motion's `useReducedMotion`.
- **Scroll Progress Indicator (`src/components/ScrollProgress.tsx`)**:
  - Persistent 2.5px top progress bar tied to `scrollYProgress` with spring smoothing.
- **Core Values Section Reintegration (`src/components/Value.tsx`)**:
  - Re-introduced the values showcase ("Innovation", "Quality", "Collaboration") into the main page flow (`App.tsx`) and navigation (`#values`).
- **Interactive Contact Features (`src/components/Contact.tsx`)**:
  - Added diagonal hover arrow indicator (`ArrowUpRight`) with nudge animation on social links.
  - Added interactive "Copy email to clipboard" button with animated "Copied!" checkmark feedback badge.
- **Kinetic Hero Enhancements (`src/components/Hero.tsx`)**:
  - Staggered line-by-line reveal using Framer Motion container and item variants.
  - Animated floating "Scroll down" cue indicator.
- **Physics-Based 3D Card Tilt (`src/components/Work.tsx`)**:
  - Refactored project cards to use `useMotionValue`, `useSpring`, and `useTransform` for smooth GPU-accelerated tilt and spring return.
  - Added card thumbnail hover zoom (`group-hover:scale-105`) and spring tap feedback on carousel navigation arrows.
- **Interactive Navigation Elements (`src/components/Navigation.tsx`)**:
  - Added animated gliding active indicator (`layoutId="activeNavIndicator"`) that tracks sections as the user scrolls.
  - Added staggered entrance delay for desktop menu links.
  - Added rotating icon transition on mobile hamburger toggle (`Menu` ↔ `X`).
- **Tactile Theme Toggle (`src/components/ThemeToggle.tsx`)**:
  - Added rotating icon crossfade with `AnimatePresence` and spring tap response (`whileTap={{ scale: 0.85 }}`).
- **Route & Page Transitions (`src/App.tsx`, `src/layouts/AdminLayout.tsx`)**:
  - Top-level page crossfades with `<AnimatePresence mode="wait">` across `/`, `/wfx-login`, and `/admin/*`.
  - Subtle entrance animation on CMS sub-route navigation via `<Outlet />`.
- **Reduced Motion Support (`src/index.css`)**:
  - Added global `@media (prefers-reduced-motion: reduce)` reset for accessibility and performance.

### Fixed
- **Loading Screen Exit Transition (`src/components/Loading.tsx`)**:
  - Converted root container to `<motion.div>` with `exit={{ opacity: 0, y: -20 }}` so it gracefully dissolves out of `<AnimatePresence>`.
  - Reduced idle pause after typing completes from 1800ms to 700ms for a snappier intro.
- **Duplicate Ref Bug in Experience Section (`src/components/Background.tsx`)**:
  - Resolved conflict where multiple DOM nodes shared the identical React `ref`.
  - Replaced manual `IntersectionObserver` with declarative `whileInView`.
  - Added an animated vertical timeline guide with pulsing milestone indicator nodes.
- **CMS Modal Dialogs (`src/pages/admin/ManageProjects.tsx`, `src/pages/admin/ManageSocials.tsx`)**:
  - Wrapped Project and Social modals inside `<AnimatePresence>` with backdrop fade and spring scale entry/exit (`scale: 0.95 -> 1`).

### Removed
- **Unused CSS Keyframes (`src/index.css`)**:
  - Removed dead `@keyframes fadeIn` and `@keyframes gradient-x` definitions.
