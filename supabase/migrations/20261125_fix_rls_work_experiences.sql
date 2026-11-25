-- ============================================================
-- QUICK FIX: Repair RLS on existing work_experiences table
-- Use this if the table already exists (skip the create above)
-- Run in Supabase Dashboard > SQL Editor
-- ============================================================

-- Drop any previously created policies
drop policy if exists "Authenticated full access" on public.work_experiences;
drop policy if exists "Public read access" on public.work_experiences;
drop policy if exists "Authenticated insert" on public.work_experiences;
drop policy if exists "Authenticated update" on public.work_experiences;
drop policy if exists "Authenticated delete" on public.work_experiences;
drop policy if exists "Public read work_experiences" on public.work_experiences;
drop policy if exists "Admin manage work_experiences" on public.work_experiences;

-- Apply grants (this was the missing piece)
grant select on public.work_experiences to anon, authenticated;
grant insert, update, delete on public.work_experiences to authenticated;

-- Public read
create policy "Public read work_experiences"
  on public.work_experiences for select to anon, authenticated using (true);

-- Admin full access
create policy "Admin manage work_experiences"
  on public.work_experiences for all to authenticated using (true) with check (true);
