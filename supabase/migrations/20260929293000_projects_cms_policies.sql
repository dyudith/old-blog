-- CMS permissions for the authenticated admin area.
-- The application has no public signup route. If additional authenticated
-- users are introduced later, replace these policies with an explicit
-- admin-role policy before granting CMS access to them.

drop policy if exists "Authenticated users can create projects" on public.projects;
create policy "Authenticated users can create projects"
on public.projects
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update projects" on public.projects;
create policy "Authenticated users can update projects"
on public.projects
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete projects" on public.projects;
create policy "Authenticated users can delete projects"
on public.projects
for delete
to authenticated
using (true);
