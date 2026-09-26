-- Music: una sola tabla para "now playing", canciones sueltas y (a futuro)
-- entradas de playlist, distinguidas por `kind`. Evita crear tres tablas
-- para lo que hoy es la misma forma de dato. Si más adelante una playlist
-- necesita ser una entidad propia (con nombre, orden, portada), se separa
-- entonces — no antes.
--
-- `is_current` marca la entrada que se muestra como "escuchando ahora"; se
-- garantiza que haya como máximo una vía índice parcial único.

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

create unique index if not exists music_entries_single_current_idx
  on public.music_entries (is_current)
  where is_current = true;

create index if not exists music_entries_listened_at_idx on public.music_entries (listened_at desc);

alter table public.music_entries enable row level security;

create policy "music_entries_public_read"
  on public.music_entries
  for select
  to anon, authenticated
  using (true);
