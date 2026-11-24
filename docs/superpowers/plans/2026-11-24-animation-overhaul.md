# Animation Overhaul & Accessibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the entire animation system across `wfx-tamdev` with kinetic storytelling, micro-interactions, smooth route transitions, bug fixes, and accessibility/reduced-motion compliance, while providing a previewable branch before merging to `main`.

**Architecture:** 
- Centralize animation tokens, spring configurations, and accessible motion utilities (`useReducedMotion`) in a dedicated utility.
- Refactor existing components to eliminate duplicate refs and manual `IntersectionObserver` redundancy in favor of declarative Framer Motion hooks and variants.
- Introduce route-level transition orchestration in `App.tsx` and modal transition wrappers using `<AnimatePresence>`.

**Tech Stack:** React 18, Vite, Framer Motion 12, Lucide React, Tailwind CSS v4, Swiper.

**Spec:** `/home/flowyourcode/.gemini/antigravity-cli/brain/c2e6ec7e-ac73-4aad-8e6a-a07f9d1757b1/animation_analysis_and_suggestions.md`

## Global Constraints

- Never break existing functionality, CMS Supabase bindings, or responsive layouts.
- Always respect `prefers-reduced-motion` to ensure accessibility.
- Maintain smooth 60fps/120fps performance by using transform and opacity CSS/GPU-composited properties.
- Keep `main` clean until user previews and explicitly approves merging.

## Review Focus

- The exit animation of `Loading.tsx` must gracefully dissolve before revealing page content without layout flashes.
- Card 3D tilt in `Work.tsx` must return to neutral flat orientation smoothly when the mouse leaves.
- Modal dialogs in CMS (`ManageProjects.tsx`, `ManageSocials.tsx`) must animate open and closed cleanly on Escape key, backdrop click, or close button.
- Desktop and mobile navigation active indicators must update accurately with page scroll.
- Production build (`pnpm build`) must pass without TypeScript errors.

---

### Task 1: Environment Branch Setup & Core Motion Utilities

**Files:**
- Create: `src/lib/motion.ts`
- Branch: `feature/animation-overhaul`

- [ ] Create and switch to feature branch `feature/animation-overhaul`.
- [ ] Create `src/lib/motion.ts` containing:
  - Spring presets (gentle, snappy, bouncy)
  - Common fade/slide variants
  - Custom hook / utility wrapping `useReducedMotion`
- [ ] Run `pnpm build` to verify clean compilation.

---

### Task 2: Fix Core Bugs in Loader, Background & Global Scroll Indicator

**Files:**
- Modify: `src/components/Loading.tsx`
- Modify: `src/components/Background.tsx`
- Create: `src/components/ScrollProgress.tsx`
- Modify: `src/index.css`

- [ ] Refactor `Loading.tsx`:
  - Convert root `<div>` to `<motion.div>` with `exit={{ opacity: 0, y: -16, transition: { duration: 0.5, ease: 'easeInOut' } }}`.
  - Shorten post-typing pause from 1800ms to 700ms for a snappier experience.
  - Add accent pop animation to the asterisk `*`.
- [ ] Refactor `Background.tsx`:
  - Eliminate duplicate `ref={ref}` on lines 114 & 161.
  - Remove redundant `IntersectionObserver` in favor of declarative `whileInView` and `viewport={{ once: true, amount: 0.2 }}`.
  - Add an animated vertical timeline guide with pulsing indicator dots connecting experience cards.
- [ ] Create `ScrollProgress.tsx`:
  - Fixed top 2px progress bar using `useScroll()` and `scaleX: scrollYProgress` with orange-600 accent.
- [ ] Clean up dead `@keyframes fadeIn` and `@keyframes gradient-x` from `src/index.css`.
- [ ] Verify build with `pnpm build`.

---

### Task 3: Micro-Interactions in Navigation, ThemeToggle & Contact

**Files:**
- Modify: `src/components/Navigation.tsx`
- Modify: `src/components/ThemeToggle.tsx`
- Modify: `src/components/Contact.tsx`

- [ ] In `ThemeToggle.tsx`:
  - Add `<AnimatePresence mode="wait">` to Sun/Moon icon switch with rotation and scale pop (`whileTap={{ scale: 0.85 }}`).
- [ ] In `Navigation.tsx`:
  - Add staggered entrance animation to desktop nav links (`delay: index * 0.08`).
  - Add a smooth gliding active indicator (`layoutId="activeNavIndicator"`) next to the active menu item.
  - Add rotation transition between `<Menu>` and `<X>` on mobile hamburger toggle.
- [ ] In `Contact.tsx`:
  - Add diagonal hover indicator `ArrowUpRight` that slides subtly (`group-hover:translate-x-1 group-hover:-translate-y-1`).
  - Add interactive "Copy Email" button with animated "Copied!" toast/badge.
- [ ] Verify build with `pnpm build`.

---

### Task 4: Kinetic Storytelling in Hero, About, Reintegrating Value & Work 3D Physics

**Files:**
- Modify: `src/components/Hero.tsx`
- Modify: `src/components/About.tsx`
- Modify: `src/components/Value.tsx`
- Modify: `src/components/Work.tsx`
- Modify: `src/App.tsx`

- [ ] In `Hero.tsx`:
  - Refactor to staggered line-by-line reveal using Framer Motion container & item variants.
  - Add animated scroll-down indicator cue at the bottom.
- [ ] In `About.tsx`:
  - Stagger image and bio entrance independently.
  - Add subtle hover micro-interaction (`whileHover={{ scale: 1.02 }}`) on profile image.
- [ ] In `Value.tsx` & `App.tsx`:
  - Reintroduce `<Value />` into the main public portfolio between `<Background />` and `<Work />` or `<About />` and `<Background />`.
  - Update `Navigation.tsx` if desired or keep as sub-story section.
- [ ] In `Work.tsx`:
  - Upgrade 3D card tilt to use Framer Motion `useMotionValue` and `useSpring` for fluid physics and smooth reset.
  - Add hover zoom on project thumbnails (`group-hover:scale-105 duration-500`).
  - Add spring hover/tap interactions on carousel arrow navigation buttons.
- [ ] Verify build with `pnpm build`.

---

### Task 5: Admin CMS Modals, List Transitions & Route Transitions

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/admin/ManageProjects.tsx`
- Modify: `src/pages/admin/ManageSocials.tsx`
- Modify: `src/pages/admin/Login.tsx`

- [ ] In `ManageProjects.tsx` & `ManageSocials.tsx`:
  - Wrap modal dialogs in `<AnimatePresence>` with backdrop fade (`opacity: 0 -> 1`) and modal scale spring (`initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}`).
- [ ] In `Login.tsx`:
  - Add subtle card fade-up entrance animation.
- [ ] In `App.tsx`:
  - Wrap top-level routes or layouts in animated route transition with `<AnimatePresence mode="wait">`.
- [ ] Verify build with `pnpm build`.

---

### Task 6: Comprehensive Verification & User Preview Ready

- [ ] Run full production build: `pnpm build`.
- [ ] Start dev server or preview build to verify all interactive animations and ensure no console errors.
- [ ] Present git diff and preview instructions to user so they can review changes before merging into `main`.
