-- Initial schema for the personal site.
-- Keep database changes versioned here. Do not modify the remote schema
-- directly through the Supabase Dashboard once migrations are in use.

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  long_description text,
  image text,
  url text,
  github_url text,
  technologies text[] not null default '{}',
  status text not null default 'idea'
    check (status in ('active', 'archived', 'idea')),
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  cover_image text,
  status text not null default 'to_read'
    check (status in ('to_read', 'reading', 'finished', 'abandoned')),
  started_at timestamptz,
  finished_at timestamptz,
  rating numeric(3, 1),
  notes text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.music_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'log'
    check (kind in ('now_playing', 'log')),
  artist text not null,
  track text,
  album text,
  is_current boolean not null default false,
  listened_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists music_entries_one_current_idx
  on public.music_entries (is_current)
  where is_current = true;

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  description text,
  category text,
  image text,
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  website text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_published_created_at_idx
  on public.projects (published, created_at desc);

create index if not exists projects_featured_published_idx
  on public.projects (featured, published);

create index if not exists books_published_created_at_idx
  on public.books (published, created_at desc);

create index if not exists links_published_featured_idx
  on public.links (published, featured);

create index if not exists guestbook_status_created_at_idx
  on public.guestbook_entries (status, created_at desc);

-- Keep updated_at correct for rows changed by the CMS.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at
before update on public.books
for each row execute function public.set_updated_at();

drop trigger if exists links_set_updated_at on public.links;
create trigger links_set_updated_at
before update on public.links
for each row execute function public.set_updated_at();

drop trigger if exists guestbook_entries_set_updated_at on public.guestbook_entries;
create trigger guestbook_entries_set_updated_at
before update on public.guestbook_entries
for each row execute function public.set_updated_at();

-- Public content is readable only when explicitly published/approved.
alter table public.projects enable row level security;
alter table public.books enable row level security;
alter table public.music_entries enable row level security;
alter table public.links enable row level security;
alter table public.guestbook_entries enable row level security;

drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects"
on public.projects
for select
to anon, authenticated
using (published = true);

drop policy if exists "Public can read published books" on public.books;
create policy "Public can read published books"
on public.books
for select
to anon, authenticated
using (published = true);

drop policy if exists "Public can read current music" on public.music_entries;
create policy "Public can read current music"
on public.music_entries
for select
to anon, authenticated
using (is_current = true);

drop policy if exists "Public can read published links" on public.links;
create policy "Public can read published links"
on public.links
for select
to anon, authenticated
using (published = true);

drop policy if exists "Public can read approved guestbook entries" on public.guestbook_entries;
create policy "Public can read approved guestbook entries"
on public.guestbook_entries
for select
to anon, authenticated
using (status = 'approved');

-- Visitors may submit a guestbook entry, but cannot choose an approved/hidden
-- status themselves. Moderation will be added to the admin CMS later.
drop policy if exists "Public can submit guestbook entries" on public.guestbook_entries;
create policy "Public can submit guestbook entries"
on public.guestbook_entries
for insert
to anon, authenticated
with check (status = 'pending');
