-- ============================================================
-- Migration: work_experiences table
-- Matches the pattern of site_profile / projects setup
-- Run in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Create Table
create table public.work_experiences (
  id          uuid primary key default gen_random_uuid(),
  company     text not null,
  role        text not null,
  period      text not null,
  city        text,
  description text not null,
  sort_order  int not null default 1,
  is_active   boolean not null default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 2. Enable RLS & Grants  (same pattern as site_profile / projects)
alter table public.work_experiences enable row level security;

grant select on public.work_experiences to anon, authenticated;
grant insert, update, delete on public.work_experiences to authenticated;

-- 3. Public Read Policy
create policy "Public read work_experiences"
  on public.work_experiences for select to anon, authenticated using (true);

-- 4. Admin Write Policy
create policy "Admin manage work_experiences"
  on public.work_experiences for all to authenticated using (true) with check (true);

-- 5. Seed: existing hard-coded experiences from Background.tsx
insert into public.work_experiences (company, role, period, city, description, sort_order, is_active)
values
  (
    'Digiserve by Telkom Indonesia',
    'Intern Network Engineer (SD-WAN Project)',
    'Sep 2026 - Present',
    'Bandung, Indonesia',
    'Installed, replaced, and configured SD-WAN hardware for Digiserve enterprise clients at PT Indomarco Prismatama retail sites, managing network deployment projects across Greater Bandung, Priangan Timur, Sumedang, and Sukabumi. Responsible for cable routing, labeling, server rack setup, and testing network connectivity and failover performance while collaborating with the central NOC team for remote device provisioning and creating accurate work completion reports.',
    1,
    true
  ),
  (
    'Boleh Dicoba Digital',
    'Web Developer',
    'Sep 2019 - Feb 2025',
    'Bandung, Indonesia',
    'Designing and customizing client e-commerce websites using Shopify and Liquid templates from brief to deployment, consistently optimizing page load performance to meet platform standards while redesigning interfaces based on Figma mockups, collaborating with design teams, resolving technical issues, and documenting troubleshooting procedures.',
    2,
    true
  );
