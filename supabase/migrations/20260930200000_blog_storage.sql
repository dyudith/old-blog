-- Storage for public blog cover images.
-- Files are uploaded server-side by the admin CMS using the Supabase service role.
-- Public visitors only need read access to the bucket.

insert into storage.buckets (id, name, public)
values ('blog', 'blog', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read blog covers" on storage.objects;
create policy "Public can read blog covers"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'blog');
