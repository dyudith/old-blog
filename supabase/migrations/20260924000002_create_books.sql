-- Books: sin relaciones todavía (tal como pediste). Un libro es una entidad
-- autocontenida; "autor" queda como texto plano en vez de una tabla `authors`
-- porque no hay ninguna funcionalidad hoy que necesite consultar "todos los
-- libros de un autor" como entidad independiente.

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  cover_image text,
  status text not null default 'to_read'
    check (status in ('to_read', 'reading', 'finished', 'abandoned')),
  started_at date,
  finished_at date,
  rating smallint check (rating between 1 and 5),
  notes text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists books_status_idx on public.books (status);

create trigger books_set_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

alter table public.books enable row level security;

create policy "books_public_read"
  on public.books
  for select
  to anon, authenticated
  using (published = true);
