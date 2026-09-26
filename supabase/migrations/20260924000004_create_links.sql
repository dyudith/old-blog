create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  description text,
  category text,
  image text,
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists links_category_idx on public.links (category);

create trigger links_set_updated_at
  before update on public.links
  for each row execute function public.set_updated_at();

alter table public.links enable row level security;

create policy "links_public_read"
  on public.links
  for select
  to anon, authenticated
  using (published = true);
