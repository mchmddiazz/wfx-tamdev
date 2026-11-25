# Tamdev Portfolio — Design System & Wireframe Spec
> Source of truth for Figma wireframing. Reflects the live codebase as of `feature/work-experience-cms`.
>
> **Live:** [tamdev.biz.id](https://tamdev.biz.id) · **Stack:** React + Vite + TypeScript + Tailwind CSS + Framer Motion + Supabase

---

## Table of Contents

1. [Design Tokens](#1-design-tokens)
2. [Public Portfolio — Page Layout](#2-public-portfolio--page-layout)
3. [Public Sections Wireframes](#3-public-sections-wireframes)
   - 3.1 Navigation
   - 3.2 Hero
   - 3.3 About
   - 3.4 Work Experience (Background)
   - 3.5 Projects (Work)
   - 3.6 Contact
4. [CMS Admin Pages](#4-cms-admin-pages)
   - 4.1 Admin Shell Layout
   - 4.2 Login Page
   - 4.3 Work Experience CMS
   - 4.4 Projects CMS
   - 4.5 Profile & Resume CMS
   - 4.6 Social Links CMS
5. [Interaction & Animation Reference](#5-interaction--animation-reference)
6. [Data Models](#6-data-models)
7. [File Map](#7-file-map)
8. [Routes Reference](#8-routes-reference)

---

## 1. Design Tokens

### 1.1 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `orange-600` | `#EA580C` | Primary accent — headings, timeline nodes, links, logo |
| `orange-500` | `#F97316` | Timeline border (`/30` opacity variant) |
| `orange-400` | `#FB923C` | Dark-mode metadata text |
| `indigo-600` | `#4F46E5` | CMS primary action buttons |
| `indigo-500` | `#6366F1` | Hover state for primary buttons |
| `indigo-400` | `#818CF8` | CMS company name highlight |
| `neutral-950` | `#0A0A0A` | CMS page background |
| `neutral-900` | `#171717` | CMS header / sidebar / modal background |
| `neutral-800` | `#262626` | CMS nav active, input border, dividers |
| `neutral-200` | `#E5E5E5` | Public site background (light mode) |
| `black` | `#000000` | Public site background (dark mode) |
| `zinc-900` | `#18181B` | CMS card background (active) |
| `zinc-950` | `#09090B` | CMS card background (hidden/inactive) |
| `zinc-700` | `#3F3F46` | CMS secondary button background |
| `zinc-400` | `#A1A1AA` | CMS label / meta text |
| `red-600` | `#DC2626` | Destructive action (Delete button) |
| `emerald-400` | `#34D399` | Online status indicator dot |
| `emerald-600` | `#059669` | Email "Copied!" feedback text |

### 1.2 Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Display / Headings | `Gambarino` (custom OTF) | 600 | `2xl`–`6xl` |
| Body / Base | `HealTheWebB` (custom OTF) | 400 | `sm`–`base` |
| Code / Mono / Metadata | `font-mono` (system) | 400–500 | `xs`–`sm` |
| CMS Page Title | `HealTheWebB` bold | 700 | `2xl` (24px) |
| CMS Labels | `HealTheWebB` | 400 | `sm` (14px) |

> **Note:** `font-gambarino` is loaded via `@font-face` from `/public/font/HealTheWebB.otf` and `tailwind.config.js` custom extend.

### 1.3 Spacing & Layout

| Token | Value | Usage |
|---|---|---|
| Max content width (public — most sections) | `max-w-4xl` = 56rem / 896px | Portfolio sections |
| Max content width (public — About) | `max-w-7xl` = 80rem / 1280px | About 2-col grid |
| Max content width (CMS) | `max-w-5xl` = 64rem / 1024px | Admin layout |
| Section padding X | `px-6` (mobile) → `px-8` (sm+) | Public sections |
| CMS content padding | `p-4` (mobile) → `p-8` (md+) | Admin pages |
| CMS header height | `h-16` = 64px | Sticky top bar |
| Border radius — cards | `rounded-xl` / `rounded-2xl` | CMS cards & modals |
| Border radius — buttons | `rounded-lg` = 8px | All buttons |
| Border radius — inputs | `rounded-lg` = 8px | All form inputs |

### 1.4 Breakpoints (Tailwind Defaults)

| Name | Min-width | Notes |
|---|---|---|
| `sm` | 640px | Mobile → Tablet transition |
| `md` | 768px | Tablet → Desktop |
| `lg` | 1024px | Desktop (public nav switches from mobile bar → sidebar) |

### 1.5 Shadows & Effects

| Token | Usage |
|---|---|
| `shadow-2xl` | Modals |
| `shadow-xl` | About profile image |
| `backdrop-blur-sm` | Modal backdrop, mobile nav gradient |
| `backdrop-blur-md` | CMS sticky header |
| `ring-4 ring-neutral-200 dark:ring-black` | Timeline node ring |

---

## 2. Public Portfolio — Page Layout

### 2.1 Section Order (Single-Page App — `/`)

```
┌─────────────────────────────────────────────────────┐
│  Navigation (sidebar on desktop / top bar on mobile)│
├─────────────────────────────────────────────────────┤
│  #intro — Hero Section          (100vh)             │
├─────────────────────────────────────────────────────┤
│  #about — About                 (min-h-screen)      │
├─────────────────────────────────────────────────────┤
│  #background — Work Experience  (min-h-screen)      │
├─────────────────────────────────────────────────────┤
│  #work — Projects               (min-h-screen)      │
├─────────────────────────────────────────────────────┤
│  #contact — Contact             (min-h-screen)      │
└─────────────────────────────────────────────────────┘
```

> **Value section (`#values`) is currently commented out** in `App.tsx` — do not wireframe yet, but document the component exists in `Value.tsx`.

### 2.2 Scroll & Loading States

| State | Behaviour |
|---|---|
| Initial page load | `Loading` overlay (`AnimatePresence`) fades out, then main content fades in (`opacity 0 → 1`, 300ms) |
| Scroll progress | `ScrollProgress` bar: thin line at top of viewport, `bg-orange-600`, scales on X from 0→1 based on scroll |
| Section entry | `whileInView` triggers animation once, at 15–30% visibility threshold |

---

## 3. Public Sections Wireframes

### 3.1 Navigation

**Desktop (≥ `lg`, 1024px):** Fixed left sidebar, `w-64`, full height

```
┌────────────────┐
│  Tamdev.       │  ← text-xl font-gambarino text-orange-600
│                │
│   • Intro      │  ← active: dot indicator (layoutId spring), text-orange-600
│     About      │  ← inactive: text-neutral-500 dark:text-neutral-400
│     Background │
│     Work       │
│     Contact    │
│                │
│     Resume*    │  ← underline decoration-dotted, download link
│                │
│  [🌙 Toggle]  │  ← ThemeToggle at bottom
└────────────────┘
```

- Each nav item: `whileHover={{ x: 4 }}`, stagger entrance `delay: 0.08 * idx`
- Active dot: `motion.span layoutId="activeNavIndicator"`, `spring stiffness:380 damping:28`

**Mobile (< `lg`):** Sticky top bar + hamburger → full-screen overlay menu

```
┌──────────────────────────────────────────────┐  ← fixed top-0, gradient from-neutral-200/black
│  Tamdev.                     [🌙]  [☰ / ✕]  │
└──────────────────────────────────────────────┘

   On open → full-screen overlay (z-[100]):
┌──────────────────────────────────────────────┐
│  Tamdev.                     [🌙]  [✕]       │
│                                              │
│  Intro                                       │  ← text-3xl font-gambarino, stagger slide-up
│  About                                       │
│  Background                                  │
│  Work                                        │
│  Contact                                     │
│  ─────────────────────────────               │
│  Resume*                                     │  ← underline dotted
└──────────────────────────────────────────────┘
```

- Mobile overlay: `fixed inset-0 z-[100]`, `bg-neutral-200 dark:bg-black`
- Items animate: `opacity 0, x -20` → `opacity 1, x 0`, stagger `0.07s`

---

### 3.2 Hero Section (`#intro`)

**Container:** `min-h-screen`, full width, `bg-neutral-200 dark:bg-black`
**Content:** Centered vertically, left-aligned text, `max-w-4xl`, `px-6 sm:px-8`
**On desktop:** offset right by `pl-64` to account for sidebar

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  Design.             ← Gambarino, text-4xl→6xl,          │
│  Deploy.                text-orange-600, stagger lines   │
│  Connect.                                                 │
│  Engineering                                              │
│  functional digital                                       │
│  experiences that drive                                   │
│  real results.                                            │
│                                                           │
│  ● Online    ← emerald-400 dot, font-mono text-xs        │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Typography:** Each line of the headline is a separate `motion.div` with:
- `initial: { opacity: 0, y: 24 }` → `visible: { opacity: 1, y: 0 }`, duration 650ms
- Stagger children: `0.08s` delay per line

**Supabase-driven:** Headline text fetched from `site_profile.headline` (falls back to default static copy)

---

### 3.3 About Section (`#about`)

**Container:** `min-h-screen`, `bg-neutral-200 dark:bg-black`, `px-6 sm:px-8 py-16`
**Inner grid:** `max-w-7xl mx-auto`, `grid-cols-1 md:grid-cols-2`, `gap-8 md:gap-14`

```
Mobile (single column):
┌──────────────────────────────────────────────┐
│  ┌────────────────────────────────────────┐  │
│  │                                        │  │
│  │           [Profile Photo]              │  │  ← w-full rounded-2xl, shadow-xl
│  │                                        │  │    border border-neutral-300/800
│  └────────────────────────────────────────┘  │
│                                              │
│  Hi, I'm Diaz           ← text-xl→2xl        │
│                            font-gambarino    │
│                            text-orange-600   │
│                                              │
│  Network Engineer with a 5+ year...          │  ← font-mono text-sm/base
│  (bio paragraph — Supabase driven)           │    text-neutral-700/neutral-300
└──────────────────────────────────────────────┘

Desktop (2-column):
┌────────────────────────┬────────────────────────┐
│  [Profile Photo]       │  Hi, I'm Diaz           │
│  max-w-md mx-auto      │  (greeting + bio)        │
│  whileHover scale 1.02 │  x: 20→0, 700ms, dl15  │
└────────────────────────┴────────────────────────┘
```

**Supabase-driven:** `subheadline` (greeting), `bio`, `profile_image_url` from `site_profile` table.

---

### 3.4 Work Experience Section (`#background`)

**Component:** `Background.tsx`
**Container:** `min-h-screen`, `max-w-4xl mx-auto`, `px-6 sm:px-8`, `py-12`
**Background:** `bg-neutral-200` (light) / `bg-black` (dark)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  WORK EXPERIENCE     ← Gambarino, text-orange-600,       │
│                         text-lg/xl/2xl                   │
│  │                                                       │
│  │  ← border-l-2, border-orange-500/30                   │
│  │                                                       │
│  ●  ← 14×14px circle, bg-orange-600,                    │
│  │    ring-4 ring-neutral-200 dark:ring-black            │
│  │    group-hover: scale-125, transition 300ms           │
│  │                                                       │
│  │  Digiserve by Telkom Indonesia                        │  ← font-mono font-medium text-base text-orange-600
│  │  Intern Network Engineer (SD-WAN Project)             │  ← font-bold text-2xl md:text-3xl text-white
│  │  Sep 2026 - Present · 3 mos · Bandung                 │  ← font-mono text-xs text-orange-400, flex gap-2
│  │                                                       │
│  │  Installed, replaced, and configured SD-WAN           │  ← font-mono text-sm text-neutral-300
│  │  hardware for PT Indomarco Prismatama...              │    max-w-2xl leading-relaxed
│  │                                                       │
│  ●  [next entry...]                                      │
│  │                                                       │
└──────────────────────────────────────────────────────────┘
```

**Timeline node detail:**
- `w-3.5 h-3.5` (14px) circle
- `bg-orange-600` fill
- `ring-4 ring-neutral-200 dark:ring-black` white/black outline ring
- Hover → `scale-125` via CSS transition 300ms on parent `group`

**Entry motion:** `initial: { opacity: 0, x: -12 }` → `animate: { opacity: 1, x: 0 }`, 600ms, stagger `0.1s` per item, triggered by `whileInView`

**Supabase-driven:** Fetches `work_experiences` where `is_active = true`, ordered by `sort_order ASC, created_at ASC`

---

### 3.5 Projects Section (`#work`)

**Component:** `Work.tsx`
**Container:** `min-h-screen`, `bg-white dark:bg-neutral-950` (or similar), `px-6 sm:px-8`
**Inner:** `max-w-4xl mx-auto`

```
┌──────────────────────────────────────────────────────────┐
│  PROJECTS            ← Gambarino, text-orange-600         │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  [← Prev]   [Image Carousel / Swiper]  [Next →]  │   │  ← Swiper with Navigation + Pagination + Autoplay
│  │                                                  │   │
│  │             ●●●○○○  (pagination dots)            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  Green Rebel Foods           ← project title             │
│  Shopify · Liquid · JavaScript                           │  ← tech stack tags / font-mono text-xs
│  Implemented custom cart logic...                        │  ← description
│                                               [↗ Link]  │
└──────────────────────────────────────────────────────────┘
```

**Swiper config:** `Navigation`, `Pagination`, `Autoplay` modules from `swiper/react`

**Project card anatomy:**
- Thumbnail image with `cursor-grab` and `3D tilt` via `useMotionValue` + `useSpring` + `useTransform`
- Project link: `ArrowUpRight` icon, animated `opacity 0` → `opacity 1` + translate on hover
- Bottom underline: `absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full bg-orange-600`, 500ms transition

**Supabase-driven:** Fetches from `projects` table (`is_published = true`), fallback to `LegacyProjects.ts`

---

### 3.6 Contact Section (`#contact`)

**Container:** `min-h-screen`, `bg-neutral-200 dark:bg-black`, `px-6 sm:px-8 py-16`
**Inner:** `max-w-4xl mx-auto`

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  GET IN TOUCH        ← Gambarino, text-orange-600         │
│  Contact title subtitle from CMS                         │  ← font-mono text-sm text-neutral-500
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  hello@tamdev.biz.id          [Copy ✉]            │  │  ← email link + copy-to-clipboard button
│  │                      ↑ ArrowUpRight hover          │  │    underline slides from 0→100% on hover
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─────────────────┐  ┌───────────┐  ┌───────────────┐  │
│  │  GitHub ↗       │  │ LinkedIn  │  │  Instagram    │  │  ← Social links from Supabase
│  └─────────────────┘  └───────────┘  └───────────────┘  │
│                                                          │
│  ─────────────────────────────────────────────────────   │
│        Build with Passion, Tamdev © 2026                 │  ← footer, font-mono text-xs text-center
└──────────────────────────────────────────────────────────┘
```

**Copy email button states:**
- Default: `Copy` icon (`lucide-react`)
- Copied: `Check` icon + "Copied!" text in `emerald-400/600`
- Transition: `AnimatePresence` scale 0.5→1 / 0.8→1

**Social links layout:**
- `flex flex-col gap-4`, each link is `motion.div` with `ArrowUpRight` icon
- Hover: `ArrowUpRight` slides from `-translate-x-1 translate-y-1` → `translate-x-0 translate-y-0`
- Bottom border: same `w-0 → w-full` underline animation as projects

**Supabase-driven:** Contact title/subtitle from `site_profile`, social links from `social_links` table

---

## 4. CMS Admin Pages

### 4.1 Admin Shell Layout (`AdminLayout.tsx`)

**Route prefix:** `/admin/*` (protected by `ProtectedRoute` → redirect to `/wfx-login`)

**Desktop (≥ `md`, 768px):**

```
┌──────────────────────────────────────────────────────────────┐
│ ■ Tamdev CMS   Projects  Profile & Resume  Social Links      │  ← sticky h-16
│               Work Experience                                │    bg-neutral-900/90, backdrop-blur-md
│                                        View Live ↗  [Logout]│    border-b border-neutral-800
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   max-w-5xl mx-auto px-4 sm:px-6 py-8                       │
│   ┌──────────────────────────────────────────────────────┐   │
│   │                 <Outlet />                           │   │
│   │          (page content renders here)                 │   │
│   └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Mobile (< `md`):** Hamburger → slide-in drawer

```
┌──────────────────────────────────────────────────────────────┐
│ [☰]  ■ Tamdev CMS                                           │  ← mobile top bar
└──────────────────────────────────────────────────────────────┘

   Drawer (AnimatePresence, x: -256→0, 250ms easeOut):
┌──────────────────────────────────────────────────────────────┐
│  user@email.com                                    [✕]       │  ← bg-neutral-900, w-64
│  ──────────────                                              │    border-r border-neutral-800
│  Projects                                                    │
│  Profile & Resume                                            │
│  Social Links                                                │
│  Work Experience                                             │
│  ──────────────                                              │
│  [Logout]                                                    │
└──────────────────────────────────────────────────────────────┘
```

**Nav items:**
- Active: `text-orange-500 font-semibold`
- Inactive: `text-neutral-400 hover:text-white`

---

### 4.2 Login Page (`/wfx-login`)

```
┌──────────────────────────────────────────────────────────────┐
│                   bg-neutral-950, min-h-screen               │
│                                                              │
│       ┌──────────────────────────────────────────┐          │
│       │  ■ Tamdev CMS                             │          │  ← bg-neutral-900, border-zinc-800
│       │  Sign in to manage your portfolio         │          │    rounded-2xl, max-w-sm, shadow-2xl
│       │                                           │          │
│       │  Email                                    │          │
│       │  ┌────────────────────────────────────┐  │          │
│       │  │  admin@example.com                 │  │          │
│       │  └────────────────────────────────────┘  │          │
│       │                                           │          │
│       │  Password                                 │          │
│       │  ┌────────────────────────────────────┐  │          │
│       │  │  ••••••••                           │  │          │
│       │  └────────────────────────────────────┘  │          │
│       │                                           │          │
│       │             [Sign In]                     │          │  ← bg-indigo-600, full-width
│       └──────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────┘
```

---

### 4.3 Work Experience CMS (`/admin/experience`)

> Mirrors the **Projects CMS** layout (`neutral-900/60`, `border-neutral-800`, `orange-600` primary CTA, pagination, and `emerald`/`amber` status pills).

#### 4.3.1 Page Header

```
┌──────────────────────────────────────────────────────────────────────┐
│  Work Experience (2)                 [Import Legacy] [+ Add Experience]│  ← bg-neutral-900/60, border-neutral-800
│  Manage professional work history, ordering, and visibility.         │    p-5 rounded-xl
└──────────────────────────────────────────────────────────────────────┘
```

| Element | Spec |
|---|---|
| Title | `text-xl font-bold` (`Work Experience ({count})`) |
| Subtitle | `text-xs text-neutral-400 mt-0.5` |
| "Import Legacy" button | `bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 px-3 py-2 rounded-lg text-xs font-medium` (shown when `experiences.length < LEGACY_WORK_EXPERIENCES.length`) |
| "+ Add Experience" button | `bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-semibold` |

#### 4.3.2 Experience Card List & Pagination

```
┌──────────────────────────────────────────────────────────────┐  bg-neutral-900/70, border border-neutral-800
│  Intern Network Engineer (SD-WAN Project)  at                │  rounded-xl, p-4, hover:border-neutral-700
│  Digiserve by Telkom Indonesia  [Visible]                    │  ← emerald-500/10 text-emerald-400
│  Sep 2026 - Present • Bandung, Indonesia • Order: 0          │  ← text-xs text-neutral-400
│  Installed, replaced, and configured SD-WAN hardware...      │  ← text-xs text-neutral-400 line-clamp-2
│                                            [Edit] [Delete]   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Web Developer  at  Boleh Dicoba Digital  [Hidden]           │  ← amber-500/10 text-amber-400
│  Sep 2019 - Feb 2025 • Bandung, Indonesia • Order: 1         │
│  Designing and customizing client e-commerce...              │
│                                            [Edit] [Delete]   │
└──────────────────────────────────────────────────────────────┘

Showing 1–5 of N experiences                  [Prev] [1] [2] [Next]
```

**Card content:**
- `role` → `font-semibold text-sm text-white`
- `"at"` separator → `text-xs text-neutral-500`
- `company` → `text-sm font-medium text-orange-400`
- Status pill → `text-[10px] px-2 py-0.5 rounded-full` (`Visible`: `bg-emerald-500/10 text-emerald-400 border-emerald-500/20`, `Hidden`: `bg-amber-500/10 text-amber-400 border-amber-500/20`)
- Meta row → `text-xs text-neutral-400 mt-0.5` (`{period} • {city} • Order: {sort_order}`)
- Description → `text-xs text-neutral-400 mt-1.5 line-clamp-2 max-w-2xl`

**Action buttons (right-aligned, `self-end sm:self-center shrink-0`):**
- Edit → `bg-neutral-800 hover:bg-neutral-700 text-xs px-3 py-1.5 rounded`
- Delete → `bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs px-3 py-1.5 rounded`

**Pagination:** 5 items per page (`ITEMS_PER_PAGE = 5`), active page button `bg-orange-600 text-white`, inactive `bg-neutral-900 border border-neutral-800 text-neutral-400`.

**Empty state:**
```
┌──────────────────────────────────────────────┐
│                                              │  bg-neutral-900/40 border-dashed border-neutral-800
│      No work experiences in database yet.    │  rounded-xl py-12 text-center
│         [Add Your First Experience]          │  bg-white text-black px-4 py-2 rounded-lg text-xs
└──────────────────────────────────────────────┘
```

#### 4.3.3 Add / Edit Modal

**Container:** `fixed inset-0 z-50`, centered, `max-w-2xl w-full`
**Card:** `bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl`
**Backdrop:** `bg-black/75 backdrop-blur-sm`

```
┌──────────────────────────────────────────────────────┐
│  Add New Experience                              ×   │  ← border-b border-neutral-800 pb-4 mb-5
│                                                      │
│  ┌─────────────────────┐  ┌──────────────────────┐  │  ← 2-col grid (md:grid-cols-2 gap-4)
│  │ Company *           │  │ Role / Title *       │  │
│  │ bg-neutral-800      │  │ focus:border-orange  │  │
│  └─────────────────────┘  └──────────────────────┘  │
│  ┌─────────────────────┐  ┌──────────────────────┐  │
│  │ Period *            │  │ City (optional)      │  │
│  └─────────────────────┘  └──────────────────────┘  │
│  Description *                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │ textarea rows-4                                │  │
│  └────────────────────────────────────────────────┘  │
│  ┌────────┐   [✓] Visible on public site             │  ← Sort Order (w-20) + Checkbox (accent-orange-600)
│  │ Order  │                                          │
│  └────────┘                                          │
│  ──────────────────────────────────────────────────  │  ← border-t border-neutral-800 pt-4 mt-2
│                         [Cancel] [Create Experience] │  ← bg-orange-600 hover:bg-orange-700
└──────────────────────────────────────────────────────┘
```

#### 4.3.4 Delete Confirmation Modal

```
┌──────────────────────────────────────────┐
│  Delete Experience                       │  ← text-lg font-bold text-white
│                                          │
│  Are you sure? This action cannot        │  ← text-neutral-400 text-sm mb-6
│  be undone.                              │
│                                          │
│                   [Cancel]  [Delete]     │  ← Cancel: neutral-800, Delete: red-600
└──────────────────────────────────────────┘
```

---

### 4.4 Projects CMS (`/admin/projects`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Projects                                              [+ New Project]│
│  Manage your portfolio projects.                                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  [thumb]  Green Rebel Foods                   [Published]      │  │  ← is_published = true: green badge
│  │           Shopify · Liquid · JavaScript                        │  │
│  │           Implemented custom cart logic...                     │  │
│  │                                        [Edit]  [Delete]        │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  [thumb]  WFX Telegram Bot                    [Draft]          │  │  ← is_published = false: zinc badge
│  │           ...                                                  │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 4.5 Profile & Resume CMS (`/admin/profile`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Profile & Resume                                                    │
│  Edit your public profile information.                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Headline (Hero Text)                                                │
│  ┌──────────────────────────────────────────────────────────────┐   │  ← textarea
│  │  Design.\nDeploy.\nConnect.\nEngineering functional...       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Greeting / Subheadline                                              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Hi, I'm Diaz                                                │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Bio                                                                 │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Network Engineer with a 5+ year...                          │   │  ← textarea rows-6
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Profile Image URL                Contact Title / Subtitle           │
│  ┌────────────────────────────┐  ┌──────────────────────────────┐   │
│  │  https://...               │  │  GET IN TOUCH                │   │
│  └────────────────────────────┘  └──────────────────────────────┘   │
│                                                                      │
│  Resume PDF URL                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  https://...resume.pdf                                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│                                               [Save Changes]         │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 4.6 Social Links CMS (`/admin/socials`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Social Links                                         [+ Add Link]   │
│  Manage your contact links shown in the Contact section.             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  GitHub         github.com/wfx-tamdev    [Active]            │   │
│  │                                          [Edit] [Delete]     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  LinkedIn       linkedin.com/in/...      [Active]            │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 5. Interaction & Animation Reference

### 5.1 Page Transitions (Public)

| Element | Enter | Trigger |
|---|---|---|
| Section containers | `opacity 0, y 15` → `opacity 1, y 0`, 800ms | `whileInView`, once, 15–30% visible |
| Timeline entries | `opacity 0, x -12` → `opacity 1, x 0`, 600ms, stagger 100ms | `whileInView` |
| Timeline node | `scale-125` on `group-hover` | CSS transition 300ms |
| About photo | `opacity 0, scale 0.94` → `opacity 1, scale 1`, 700ms | `whileInView` |
| About text | `opacity 0, x 20` → `opacity 1, x 0`, 700ms, delay 150ms | `whileInView` |
| Hero headline lines | `opacity 0, y 24` → `opacity 1, y 0`, 650ms, stagger 80ms | On mount |
| Nav items (desktop) | `x -10, opacity 0` → `x 0, opacity 1`, stagger `0.08s × idx` | On mount |
| Project card tilt | `rotateX / rotateY` via cursor position | `mousemove` / `mouseleave` |
| Project link underline | `w-0` → `w-full`, 500ms | CSS hover |
| Contact social underline | `w-0` → `w-full`, 500ms | CSS hover |
| App initial fade-in | `opacity 0` → `opacity 1`, 300ms | After `Loading` exits |

### 5.2 CMS Modals

| State | Animation |
|---|---|
| Enter | `opacity 0, scale 0.95, y 10` → `opacity 1, scale 1, y 0` — 200ms easeOut |
| Exit | `opacity 1, scale 1, y 0` → `opacity 0, scale 0.95, y 10` — 150ms |
| Backdrop enter | `opacity 0` → `opacity 1` — 200ms |
| Backdrop exit | `opacity 1` → `opacity 0` — 150ms |

### 5.3 CMS Card List

| State | Animation |
|---|---|
| Initial mount | `opacity 0, y 12` → `opacity 1, y 0`, 250ms easeOut, stagger `i × 50ms` |

### 5.4 Mobile Nav Overlay

| State | Animation |
|---|---|
| Open | `opacity 0` → `opacity 1`, nav items stagger slide from x -20 |
| Close | `opacity 1` → `opacity 0` |
| Hamburger ↔ X icon | `AnimatePresence` rotate -90→0 / 0→90 on key change, 200ms |

### 5.5 Keyboard Behaviour

- `Escape` → closes any open modal (Add/Edit or Delete)
- `Escape` → closes mobile nav sidebar drawer
- Form `submit` → closes modal on success, refetches list

---

## 6. Data Models

### 6.1 `site_profile`

| Column | Type | Required | Notes |
|---|---|---|---|
| `id` | `int` | Auto | Always `1` (single row) |
| `headline` | `text` | ✅ | Hero multi-line text |
| `subheadline` | `text` | ✅ | About greeting |
| `bio` | `text` | ✅ | About paragraph |
| `profile_image_url` | `text` | ➖ | About photo URL |
| `resume_pdf_url` | `text` | ➖ | Nav / About resume link |
| `contact_title` | `text` | ➖ | Contact section heading |
| `contact_subtitle` | `text` | ➖ | Contact section sub-heading |
| `updated_at` | `timestamptz` | ➖ | Set on edit |

### 6.2 `work_experiences`

| Column | Type | Required | Notes |
|---|---|---|---|
| `id` | `uuid` | Auto | `gen_random_uuid()` |
| `company` | `text` | ✅ | e.g. "Google" |
| `role` | `text` | ✅ | e.g. "Senior Engineer" |
| `period` | `text` | ✅ | e.g. "Jan 2022 - Present" |
| `city` | `text` | ➖ | Optional |
| `description` | `text` | ✅ | Full paragraph |
| `sort_order` | `int` | ✅ | 0-based, ascending |
| `is_active` | `bool` | ✅ | `false` = Hidden in CMS, never shown on frontend |
| `created_at` | `timestamptz` | Auto | |
| `updated_at` | `timestamptz` | ➖ | Set on edit |

**Frontend query:**
```ts
supabase
  .from("work_experiences")
  .select("*")
  .eq("is_active", true)
  .order("sort_order", { ascending: true })
  .order("created_at", { ascending: true })
```

### 6.3 `projects`

| Column | Type | Required | Notes |
|---|---|---|---|
| `id` | `uuid` | Auto | |
| `title` | `text` | ✅ | |
| `slug` | `text` | ✅ | URL-safe identifier |
| `category` | `text` | ✅ | e.g. "Shopify", "Network" |
| `description` | `text` | ✅ | |
| `thumbnail_url` | `text` | ✅ | |
| `live_url` | `text` | ➖ | |
| `repo_url` | `text` | ➖ | |
| `tech_stack` | `text[]` | ✅ | Array of tech names |
| `sort_order` | `int` | ✅ | |
| `is_published` | `bool` | ✅ | `false` = draft |
| `created_at` | `timestamptz` | Auto | |

### 6.4 `social_links`

| Column | Type | Required | Notes |
|---|---|---|---|
| `id` | `uuid` | Auto | |
| `platform` | `text` | ✅ | e.g. "GitHub" |
| `label` | `text` | ✅ | Display text |
| `url` | `text` | ✅ | Full URL |
| `sort_order` | `int` | ✅ | |
| `is_active` | `bool` | ✅ | |
| `created_at` | `timestamptz` | Auto | |

### 6.5 `site_sections`

| Column | Type | Required | Notes |
|---|---|---|---|
| `id` | `uuid` | Auto | Primary key |
| `type` | `text` | ✅ | `hero`, `about`, `background`, `work`, `contact`, `values`, `custom_cta` |
| `nav_label` | `text` | ✅ | Menu label in `Navigation.tsx` |
| `anchor_id` | `text` | ✅ | Scroll target `#id` |
| `show_in_nav` | `bool` | ✅ | Show/hide from navigation menu |
| `is_visible` | `bool` | ✅ | Show/hide section on public page |
| `sort_order` | `int` | ✅ | 0-based order |
| `draft_settings` | `jsonb` | ✅ | Edited in `/admin/customize` |
| `published_settings` | `jsonb` | ✅ | Rendered on `/` |
| `has_unpublished_changes` | `bool` | ✅ | Draft vs Live indicator |

---

## 7. File Map

```
src/
├── App.tsx                     ← Routes: / (PortfolioPage) + /admin/* (CMS)
├── main.tsx                    ← Vite entry
├── index.css                   ← Tailwind directives
├── custom.css                  ← Font-face declarations
├── vite-env.d.ts
│
├── components/
│   ├── Hero.tsx                ← #intro section (Supabase: headline)
│   ├── About.tsx               ← #about section (Supabase: bio, greeting, photo)
│   ├── Background.tsx          ← #background Work Experience (Supabase: work_experiences)
│   ├── Work.tsx                ← #work Projects (Swiper carousel, Supabase: projects)
│   ├── Contact.tsx             ← #contact (Supabase: social_links, site_profile)
│   ├── Navigation.tsx          ← Sidebar (desktop) / Top bar (mobile), ThemeToggle
│   ├── Loading.tsx             ← Intro loading overlay
│   ├── ScrollProgress.tsx      ← Scroll-based orange progress bar
│   ├── ThemeToggle.tsx         ← Dark/light mode toggle button
│   ├── Value.tsx               ← [COMMENTED OUT] Values section
│   └── admin/
│       └── ProtectedRoute.tsx  ← Auth guard (Supabase session check)
│
├── pages/admin/
│   ├── Login.tsx               ← /wfx-login
│   ├── ManageProjects.tsx      ← /admin/projects
│   ├── ManageProfile.tsx       ← /admin/profile
│   ├── ManageSocials.tsx       ← /admin/socials
│   └── ManageWorkExperience.tsx ← /admin/experience
│
├── layouts/
│   └── AdminLayout.tsx         ← CMS shell: sticky navbar + drawer + <Outlet />
│
├── contexts/
│   └── ThemeContext.tsx         ← Dark/light mode provider
│
├── data/
│   ├── LegacyProjects.ts        ← Fallback static project data
│   ├── LegacySocials.ts         ← Fallback static social links
│   └── LegacyWorkExperiences.ts ← Fallback + Import Legacy seed
│
├── lib/
│   ├── supabase.ts              ← Supabase client
│   ├── motion.ts                ← Shared Framer Motion variants
│   └── storage.ts               ← Supabase Storage helpers
│
├── types/
│   └── cms.ts                   ← Interfaces: SiteProfile, Project, SocialLink, WorkExperience
│
└── assets/
    ├── img/                     ← Project thumbnails + profile photo (.webp)
    ├── icons/                   ← Arrow icons (.png)
    └── resume.pdf

public/
├── favicon.ico
├── Ambarino.otf                 ← Gambarino display font
└── font/
    └── HealTheWebB.otf          ← Body font

supabase/migrations/
├── 20261125_create_work_experiences.sql   ← DDL + seed data
└── 20261125_fix_rls_work_experiences.sql  ← RLS grant patch
```

---

## 8. Routes Reference

| Path | Component | Auth Required |
|---|---|---|
| `/` | `PortfolioPage` (single-page portfolio) | ❌ |
| `/wfx-login` | `Login` | ❌ |
| `/admin/projects` | `ManageProjects` inside `AdminLayout` | ✅ |
| `/admin/profile` | `ManageProfile` inside `AdminLayout` | ✅ |
| `/admin/socials` | `ManageSocials` inside `AdminLayout` | ✅ |
| `/admin/experience` | `ManageWorkExperience` inside `AdminLayout` | ✅ |
| `/admin/customize` | `CustomizeSite` (full-screen split-screen editor) | ✅ |
| `*` | Redirect → `/` | — |

---

*Last updated: 2026-11-25 — reflects `feature/work-experience-cms` branch*
