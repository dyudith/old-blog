-- Projects: contenido estructurado con CRUD real (Fase 4+).
-- `technologies` es text[] a propósito: hoy es solo un badge, sin
-- atributos propios. Si en el futuro necesita ícono/color/orden,
-- se migra a una tabla `technologies` + join — no antes.

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
  status text not null default 'active'
    check (status in ('active', 'archived', 'idea')),
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_published_idx on public.projects (published);
create index if not exists projects_featured_idx on public.projects (featured) where featured = true;

-- updated_at automático en cada UPDATE
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

-- Lectura pública: solo proyectos publicados. El resto (insert/update/delete)
-- queda sin política -> denegado por defecto hasta que exista un rol admin
-- en Fase 4 (evita depender de "ocultar botones" en el frontend).
create policy "projects_public_read"
  on public.projects
  for select
  to anon, authenticated
  using (published = true);
