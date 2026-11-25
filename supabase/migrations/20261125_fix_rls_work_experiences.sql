-- ============================================================
-- QUICK FIX: Repair RLS policies on existing work_experiences
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- Drop the broken policy (if it was created)
drop policy if exists "Authenticated full access" on public.work_experiences;
drop policy if exists "Public read access" on public.work_experiences;
drop policy if exists "Authenticated insert" on public.work_experiences;
drop policy if exists "Authenticated update" on public.work_experiences;
drop policy if exists "Authenticated delete" on public.work_experiences;

-- Allow public read (portfolio visitors)
create policy "Public read access"
  on public.work_experiences
  for select
  to anon, authenticated
  using (true);

-- Allow CMS (logged-in users) to insert
create policy "Authenticated insert"
  on public.work_experiences
  for insert
  to authenticated
  with check (true);

-- Allow CMS to update
create policy "Authenticated update"
  on public.work_experiences
  for update
  to authenticated
  using (true)
  with check (true);

-- Allow CMS to delete
create policy "Authenticated delete"
  on public.work_experiences
  for delete
  to authenticated
  using (true);
