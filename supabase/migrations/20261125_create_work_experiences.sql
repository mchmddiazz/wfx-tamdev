-- ============================================================
-- Migration: create work_experiences table
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

create table if not exists public.work_experiences (
  id          uuid primary key default gen_random_uuid(),
  company     text not null,
  role        text not null,
  period      text not null,
  city        text,
  description text not null,
  sort_order  integer not null default 1,
  is_active   boolean not null default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz
);

-- Enable Row Level Security
alter table public.work_experiences enable row level security;

-- Allow public read access (for the portfolio site)
create policy "Public read access"
  on public.work_experiences for select
  using (true);

-- Allow authenticated users full access (for the CMS)
create policy "Authenticated full access"
  on public.work_experiences for all
  using (auth.role() = 'authenticated');

-- ============================================================
-- Seed: existing hard-coded experiences from Background.tsx
-- ============================================================

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
