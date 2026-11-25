# Tamdev CMS Roadmap v1.2 — Design Specification

**Date:** 2026-11-25  
**Status:** Draft (Pending User Approval)  
**Target Repo:** `wfx-tamdev` (React + TypeScript + Vite + Tailwind + Framer Motion + Supabase)

---

## 1. Intent & Why

Tamdev CMS currently splits portfolio management across separate Content admin pages (`Projects`, `Profile & Resume`, `Work Experience`, `Social Links`) and a Shopify-style Theme Customizer (`ThemesDashboard` + `CustomizeSite`). Because `About`, `Background`, `Work`, and `Navigation` read directly from shared Supabase tables (`site_profile`, `work_experiences`, `projects`), draft themes cannot have independent content, and exported theme JSON files do not carry portfolio content.

**v1.2** shifts the CMS to a **self-contained, theme-first architecture**:
- Only **Social Links** remains in the global Content menu.
- **Projects**, **Profile**, and **Work Experience** move into **dynamic section blocks** inside Theme Customize.
- **Header** (logo / logo + text / text + resume link) and **Copyright** become **static blocks** pinned in Theme Customize.
- **Certificates** is added as a new template section with dynamic certificate blocks.
- **Import Theme (.json)** lets users import exported or hand-authored theme JSON files as new draft themes.

This enables complete content isolation per theme (e.g., drafting a new portfolio focus without affecting the live theme) and portable full-site JSON backups.

---

## 2. Goals, Non-Goals & Anti-Goals

### Goals
- Simplify the Admin **Content** sidebar to **Social Links** only.
- Store all dynamic section content (Projects, Profile, Work Experience, Certificates) and static chrome (Header, Copyright) inside `site_themes.sections` JSONB.
- Support **Import Theme from JSON** in `ThemesDashboard` to create a new draft theme.
- Support **Static Blocks** (`header`, `copyright`) pinned at top and bottom of `CustomizeSite` (cannot be reordered or deleted).
- Support **Dynamic Blocks** (repeatable item lists: add, edit, reorder, remove, toggle active/published) for `work` (Projects), `background` (Work Experience), and `certificates` (Certificates), plus inline profile fields for `about` (Profile).
- Seed default/migrated themes from existing `site_profile`, `projects`, `work_experiences`, or legacy fallbacks so existing content is preserved.

### Non-Goals
- Dropping or migrating away the existing Supabase tables (`projects`, `site_profile`, `work_experiences`) — they remain untouched in DB as legacy/seed sources.
- Moving **Social Links** (`social_links` table) into theme JSON — Social Links stays global in the Content menu.
- Multi-page routing or arbitrary nested sub-blocks.

### Anti-Goals
- Editing shared Supabase tables from inside Draft themes (would break live-theme isolation).
- Requiring a breaking Supabase SQL migration for `site_themes` (must work with the existing `site_themes` schema).
- Duplicating Resume PDF upload in both Header and Profile sections.

---

## 3. Constraints

- **Existing DB Schema:** `site_themes` has `id`, `name`, `is_live`, `sections` (JSONB), `created_at`, `updated_at`. No schema migration is required.
- **Media Storage:** Uploaded images (profile avatar, project thumbnails, header logo, certificate badges) and Resume PDF continue to use Supabase Storage (`portfolio-media` bucket via `uploadPortfolioFile` in `src/lib/storage.ts`). Theme JSON stores public URLs.
- **Preview Sync:** `CustomizeSite` communicates with `CustomizePreview` iframe via `window.postMessage` (`TAMDEV_PREVIEW_UPDATE`, `TAMDEV_PREVIEW_SELECT`).
- **Backwards Compatibility:** Themes or `DEFAULT_SECTIONS` without `header` or `copyright` blocks must gracefully fall back to sensible defaults when rendered on `PortfolioPage` or `CustomizePreview`, and when opened in `CustomizeSite` (auto-normalized).

---

## 4. Approaches Considered

### Approach A: Extend `SiteSection` inside `site_themes.sections` (Selected)
Keep `site_themes.sections: SiteSection[]` as the single JSON array per theme.
- Add `header` and `copyright` as `SectionType` entries marked `isStatic: true` in `SECTION_REGISTRY`. `CustomizeSite` pins static blocks at the top (`header`) and bottom (`copyright`) without move/delete controls.
- Widen `draft_settings` / `published_settings` on `SiteSection` from `Record<string, string | boolean>` to `Record<string, unknown>` (or typed `SectionSettings`) so sections can store both scalar fields and repeatable `items[]` arrays.
- **Pros:** Zero DB migration; 100% compatible with existing JSON export (`{ name, exportedAt, sections }`); reuses the existing `postMessage` preview sync.
- **Cons:** Mixed scalar/array values in `settings` require typed accessor helpers per section type.

### Approach B: Add separate `header_config` / `footer_config` columns to `site_themes`
Add new JSONB columns on `site_themes` via SQL migration and separate `blocks` from `settings`.
- **Pros:** Separates static chrome from sections at the DB level.
- **Cons:** Requires DB migration, duplicates draft/publish state sync, and breaks compatibility with existing exported theme JSON files.

**Decision:** **Approach A** (user-confirmed).

---

## 5. Detailed Design

### 5.1 Content Menu & Admin Routes (`AdminLayout.tsx`, `App.tsx`)
- In `src/layouts/AdminLayout.tsx`:
  - `CONTENT_NAV` keeps only `{ to: '/admin/socials', label: 'Social Links', icon: Share2 }`.
  - Remove `Projects`, `Profile & Resume`, and `Work Experience` from `CONTENT_NAV` and `PAGE_TITLES`.
- In `src/App.tsx`:
  - Remove `/admin/projects`, `/admin/profile`, and `/admin/experience` routes (or redirect them to `/admin/customize` — *builder call: redirect to `/admin/customize` so stale bookmarks don't 404*).
  - Keep `/admin/socials` (`ManageSocials`), `/admin/customize` (`ThemesDashboard`), `/admin/customize/editor` (`CustomizeSite`), `/admin/preview` (`CustomizePreview`).

### 5.2 Types & Section Registry (`src/types/cms.ts`, `src/lib/sectionRegistry.ts`)
- Extend `SectionType`:
  ```ts
  export type SectionType =
    | 'header'
    | 'hero'
    | 'about'
    | 'background'
    | 'work'
    | 'certificates'
    | 'values'
    | 'custom_cta'
    | 'contact'
    | 'copyright';
  ```
- Define block item interfaces for dynamic sections (matching existing `Project` and `WorkExperience` shapes so components need minimal changes):
  - `ProjectBlockItem`: `id`, `title`, `category`, `description`, `thumbnail_url`, `live_url`, `repo_url`, `tech_stack: string[]`, `is_published: boolean`
  - `WorkExperienceBlockItem`: `id`, `company`, `role`, `period`, `city?`, `description`, `is_active: boolean`
  - `CertificateBlockItem`: `id`, `title`, `issuer`, `date`, `credential_url?`, `image_url?`, `is_active: boolean`
- Update `SiteSection` settings type to `Record<string, any>` (or `SectionSettingsValue` union of `string | boolean | unknown[]`).
- Add `isStatic?: boolean` (and `category: 'static' | 'portfolio' | 'custom'`) to `SectionDefinition` in `SECTION_REGISTRY`:
  - `header` (`isStatic: true`):
    - `displayMode`: `'text' | 'logo' | 'logo_with_text'` (default `'text'`)
    - `brandText`: string (default `'Tamdev.'`)
    - `logoUrl`: string (default `''`)
    - `showResumeLink`: boolean (default `true`)
    - `resumeLabel`: string (default `'Resume*'`)
    - `resumePdfUrl`: string (default `''`, falls back to bundled `resume.pdf`)
  - `copyright` (`isStatic: true`):
    - `text`: string (default `'Build with Passion, Tamdev © 2026'`)
  - `about` (Profile — dynamic section):
    - `subheadline`: string (greeting, e.g., `"Hi, I'm Diaz"`)
    - `bio`: string
    - `profileImageUrl`: string (upload/URL; falls back to bundled `profile.webp`)
    - *(Note: Resume PDF upload is intentionally excluded from Profile; it lives in `header`.)*
  - `background` (Work Experience):
    - `heading`: string (default `'WORK EXPERIENCE'`)
    - `items`: `WorkExperienceBlockItem[]`
  - `work` (Projects):
    - `heading`?: string (optional, default `'Selected Work'` / existing UI)
    - `items`: `ProjectBlockItem[]`
  - `certificates` (NEW template section):
    - `heading`: string (default `'CERTIFICATES'`)
    - `subtitle`: string (optional)
    - `items`: `CertificateBlockItem[]`
  - `contact`:
    - `title`: string (optional override, default `"Let's\nConnect"`)
    - `subtitle`: string (optional override, default `'Available for collaborations, opportunities, or just a friendly chat.'`)
- Update `DEFAULT_SECTIONS` to include `header` (first), the portfolio sections, and `copyright` (last).

### 5.3 Storage Buckets (`src/lib/storage.ts`)
- Expand `uploadPortfolioFile` `folder` union from `'projects' | 'profile' | 'resume'` to include `'logos' | 'certificates'`.

### 5.4 Import Theme from JSON (`src/pages/admin/ThemesDashboard.tsx`)
- Add an **Import JSON** button next to **Create Draft** in `ThemesDashboard.tsx` (using a hidden `<input type="file" accept=".json,application/json" />`).
- On file selection:
  1. Parse JSON and validate that `sections` is a non-empty array of objects with valid `type` values from `SECTION_REGISTRY`. Show an inline/alert error message if invalid.
  2. Normalize imported sections (ensure `header` and `copyright` exist, assign `sort_order`, ensure `draft_settings` and `published_settings` exist; if `published_settings` is missing/empty or a section uses a single `settings` object, populate both `draft_settings` and `published_settings` from it so Preview and Publish from `ThemesDashboard` render the imported content immediately).
  3. Determine theme name: use `parsed.name` (suffixed with `(Imported)` if a theme with that name already exists, or fallback to filename).
  4. Insert into `site_themes` with `is_live: false` and refresh the themes list (or navigate to editor — *builder call: stay on dashboard and show success toast/refresh so user sees the imported draft*).

### 5.5 Static Blocks Rendering (`Navigation.tsx`, `Copyright.tsx`, `Contact.tsx`, `App.tsx`, `CustomizePreview.tsx`)
- **`Navigation.tsx`**:
  - Accept `settings?: Record<string, any>` (from the `header` section's `published_settings` in `PortfolioPage`, or `draft_settings` in `CustomizePreview`).
  - Render brand according to `displayMode`:
    - `'text'`: renders `brandText` (default `'Tamdev.'`).
    - `'logo'`: renders `<img>` from `logoUrl` (falls back to `brandText` if `logoUrl` is empty).
    - `'logo_with_text'`: renders `<img>` + `brandText`.
  - Render Resume link only when `showResumeLink !== false`, using `settings?.resumePdfUrl` if set; if `settings?.resumePdfUrl` is undefined (unseeded legacy theme), fall back to `site_profile.resume_pdf_url` then bundled `defaultResumePdf`.
- **`Copyright.tsx`** (new component, e.g. `src/components/Copyright.tsx`):
  - Renders the footer copyright bar (`Build with Passion, Tamdev © 2026` or `settings.text`) when `copyright` section `is_visible` is true.
- **`Contact.tsx`**:
  - Remove the hardcoded copyright `<div>` from `Contact.tsx` so Copyright is controlled solely by the static `copyright` block.
  - Accept `settings?: Record<string, any>` for `title` and `subtitle` (if undefined, fall back to `site_profile.contact_title`/`contact_subtitle` then defaults).
  - Keep fetching `social_links` from Supabase `social_links` table.
- **`App.tsx` (`PortfolioPage`) & `CustomizePreview.tsx`**:
  - Extract the `header` section (if present) and pass its settings to `<Navigation items={navItems} settings={headerSettings} />`.
  - Extract the `copyright` section (if present and `is_visible`) and render `<Copyright settings={copyrightSettings} />` after `<main>`.
  - Filter `header` and `copyright` out of `<main>` `SectionRenderer` loop and out of `navItems`.

### 5.6 Dynamic Blocks & Certificate Section (`About.tsx`, `Background.tsx`, `Work.tsx`, `Certificates.tsx`, `SectionRenderer.tsx`)
- **`About.tsx`**: Read `subheadline`, `bio`, `profileImageUrl` from `settings` prop. Only if `settings?.bio === undefined` (unseeded legacy theme), fall back to `site_profile` query then `DEFAULT_GREETING`, `DEFAULT_BIO`, `profileImage`.
- **`Background.tsx`**: Read `items` (`WorkExperienceBlockItem[]`) from `settings` prop (filter `is_active !== false`). Only if `settings?.items === undefined` (unseeded legacy theme), fall back to `work_experiences` query then `LEGACY_WORK_EXPERIENCES`.
- **`Work.tsx`**: Read `items` (`ProjectBlockItem[]`) from `settings` prop (filter `is_published !== false`). Only if `settings?.items === undefined` (unseeded legacy theme), fall back to `projects` query then `FALLBACK_PROJECTS`.
- **`Certificates.tsx`** (new component):
  - Renders a clean, theme-consistent section (matching `Background.tsx` / `Value.tsx` typography & Framer Motion reveal) displaying `heading`, optional `subtitle`, and a responsive grid/list of active `CertificateBlockItem` cards (optional badge/image, title, issuer, date, optional external credential link).
- **`SectionRenderer.tsx`**:
  - Pass `settings` to `About`, `Background`, `Work`, `Certificates`, and `Contact`.

### 5.7 Theme Customizer Inspector & Seeding (`CustomizeSite.tsx`)
- **Sidebar Grouping:**
  - Pin **Header** (`type === 'header'`) at the top under a "Static" label (inspectable & toggleable if desired, no move/delete).
  - Keep reorderable/deletable sections in the middle ("Sections"), with **Add Section** including `Certificates`.
  - Pin **Copyright** (`type === 'copyright'`) at the bottom under a "Static" label (inspectable & visibility-toggleable, no move/delete).
  - Auto-normalize loaded `sections` so themes created before v1.2 automatically get `header` and `copyright` blocks prepended/appended if missing.
- **Inspector Controls:**
  - Support `'select'` (for Header `displayMode`), `'image'` (URL input + file upload button via `uploadPortfolioFile`), `'file'` (for Header Resume PDF upload), and `'block_list'` (for `work`, `background`, `certificates` items).
  - `BlockListEditor`: lists items with up/down reorder, active/published toggle, delete, and inline/expandable edit form for item fields (including image upload for project thumbnails and certificate badges, comma-separated or tag input for `tech_stack`).
- **One-Time Seed Helper:**
  - When a theme's `about`, `background`, or `work` section has no `items` / `bio` configured yet (or when creating a new draft from legacy fallback), provide a convenient "Import from existing CMS data" or auto-seed on first normalization from `site_profile`, `work_experiences`, and `projects` (with legacy static fallbacks if tables are empty) so existing portfolio data is immediately editable in the Customizer.

---

## 6. Left to the Builder

- Exact Tailwind styling and responsive layout of `Certificates.tsx` cards (following existing `bg-neutral-200 dark:bg-black`, `font-gambarino`, `font-mono`, `orange-600` accent conventions).
- Exact UI layout of `BlockListEditor` in `CustomizeSite.tsx` (accordion/expandable cards inside the 320px/360px inspector sidebar).
- Unit/type verification (`npm run build` / `tsc --noEmit` / `npm run lint`) and manual/browser verification of the flows.
