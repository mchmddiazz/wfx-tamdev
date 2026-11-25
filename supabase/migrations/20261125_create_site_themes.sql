-- ============================================================
-- Migration: site_themes table (Shopify-style Live & Draft Themes)
-- Run in Supabase Dashboard > SQL Editor
-- ============================================================

create table public.site_themes (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  is_live    boolean not null default false,
  sections   jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.site_themes enable row level security;

grant select on public.site_themes to anon, authenticated;
grant insert, update, delete on public.site_themes to authenticated;

create policy "Public read site_themes"
  on public.site_themes for select to anon, authenticated using (true);

create policy "Admin manage site_themes"
  on public.site_themes for all to authenticated using (true) with check (true);

-- Seed 1 Live theme + 1 Draft theme
insert into public.site_themes (name, is_live, sections)
values
  (
    'Tamdev Portfolio (Main)',
    true,
    '[
      {"id":"live-hero","type":"hero","nav_label":"Intro","anchor_id":"intro","show_in_nav":true,"is_visible":true,"sort_order":0,"draft_settings":{},"published_settings":{},"has_unpublished_changes":false},
      {"id":"live-about","type":"about","nav_label":"About","anchor_id":"about","show_in_nav":true,"is_visible":true,"sort_order":1,"draft_settings":{},"published_settings":{},"has_unpublished_changes":false},
      {"id":"live-bg","type":"background","nav_label":"Background","anchor_id":"background","show_in_nav":true,"is_visible":true,"sort_order":2,"draft_settings":{},"published_settings":{},"has_unpublished_changes":false},
      {"id":"live-work","type":"work","nav_label":"Work","anchor_id":"work","show_in_nav":true,"is_visible":true,"sort_order":3,"draft_settings":{},"published_settings":{},"has_unpublished_changes":false},
      {"id":"live-contact","type":"contact","nav_label":"Contact","anchor_id":"contact","show_in_nav":true,"is_visible":true,"sort_order":4,"draft_settings":{},"published_settings":{},"has_unpublished_changes":false}
    ]'::jsonb
  ),
  (
    'Network & SD-WAN Focus (Draft)',
    false,
    '[
      {"id":"draft-hero","type":"hero","nav_label":"Intro","anchor_id":"intro","show_in_nav":true,"is_visible":true,"sort_order":0,"draft_settings":{},"published_settings":{},"has_unpublished_changes":false},
      {"id":"draft-bg","type":"background","nav_label":"Experience","anchor_id":"background","show_in_nav":true,"is_visible":true,"sort_order":1,"draft_settings":{"heading":"NETWORK & DEV EXPERIENCE"},"published_settings":{"heading":"NETWORK & DEV EXPERIENCE"},"has_unpublished_changes":false},
      {"id":"draft-about","type":"about","nav_label":"About","anchor_id":"about","show_in_nav":true,"is_visible":true,"sort_order":2,"draft_settings":{},"published_settings":{},"has_unpublished_changes":false},
      {"id":"draft-work","type":"work","nav_label":"Projects","anchor_id":"work","show_in_nav":true,"is_visible":true,"sort_order":3,"draft_settings":{},"published_settings":{},"has_unpublished_changes":false},
      {"id":"draft-cta","type":"custom_cta","nav_label":"Hire Me","anchor_id":"highlight","show_in_nav":true,"is_visible":true,"sort_order":4,"draft_settings":{"eyebrow":"OPEN TO WORK","heading":"Available for Network & Web Projects","body":"Need help with enterprise SD-WAN deployments, routing setups, or custom web apps? Let us collaborate.","ctaLabel":"Get in Touch","ctaHref":"#contact"},"published_settings":{},"has_unpublished_changes":false},
      {"id":"draft-contact","type":"contact","nav_label":"Contact","anchor_id":"contact","show_in_nav":true,"is_visible":true,"sort_order":5,"draft_settings":{},"published_settings":{},"has_unpublished_changes":false}
    ]'::jsonb
  );
