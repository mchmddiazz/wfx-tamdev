-- ============================================================
-- Migration: site_sections table (Shopify-style Dynamic Sections & Menu)
-- Run in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Create Table
create table public.site_sections (
  id                      uuid primary key default gen_random_uuid(),
  type                    text not null, -- 'hero' | 'about' | 'background' | 'work' | 'contact' | 'values' | 'custom_cta'
  nav_label               text not null,
  anchor_id               text not null,
  show_in_nav             boolean not null default true,
  is_visible              boolean not null default true,
  sort_order              int not null default 0,
  draft_settings          jsonb not null default '{}'::jsonb,
  published_settings      jsonb not null default '{}'::jsonb,
  has_unpublished_changes boolean not null default false,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

-- 2. Enable RLS & Grants
alter table public.site_sections enable row level security;

grant select on public.site_sections to anon, authenticated;
grant insert, update, delete on public.site_sections to authenticated;

-- 3. Public Read Policy
create policy "Public read site_sections"
  on public.site_sections for select to anon, authenticated using (true);

-- 4. Admin Write Policy
create policy "Admin manage site_sections"
  on public.site_sections for all to authenticated using (true) with check (true);

-- 5. Seed: default portfolio sections
insert into public.site_sections (
  type, nav_label, anchor_id, show_in_nav, is_visible, sort_order, draft_settings, published_settings
)
values
  ('hero',       'Intro',      'intro',      true, true, 0, '{}'::jsonb, '{}'::jsonb),
  ('about',      'About',      'about',      true, true, 1, '{}'::jsonb, '{}'::jsonb),
  ('background', 'Background', 'background', true, true, 2, '{}'::jsonb, '{}'::jsonb),
  ('work',       'Work',       'work',       true, true, 3, '{}'::jsonb, '{}'::jsonb),
  ('contact',    'Contact',    'contact',    true, true, 4, '{}'::jsonb, '{}'::jsonb);
