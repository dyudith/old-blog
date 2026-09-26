-- Guestbook: solo el schema en esta fase (la UI de envío llega en Fase 5).
-- Las policies sí quedan completas ahora para no tener que revisar RLS
-- cuando se conecte el formulario: los visitantes van a poder INSERTAR
-- (siempre como 'pending', nunca aprobado por sí mismos) pero no
-- actualizar ni ver mensajes de otros que no estén aprobados.

create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null check (char_length(message) between 1 and 1000),
  website text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists guestbook_status_idx on public.guestbook_entries (status);

create trigger guestbook_set_updated_at
  before update on public.guestbook_entries
  for each row execute function public.set_updated_at();

alter table public.guestbook_entries enable row level security;

-- Lectura pública: solo mensajes aprobados.
create policy "guestbook_public_read_approved"
  on public.guestbook_entries
  for select
  to anon, authenticated
  using (status = 'approved');

-- Escritura pública: cualquiera puede insertar, pero SIEMPRE como 'pending'.
-- Esto evita que alguien mande un mensaje ya 'approved' manipulando el
-- request. No se permite UPDATE/DELETE público bajo ninguna circunstancia
-- (eso queda exclusivamente para el admin en Fase 4).
create policy "guestbook_public_insert_pending"
  on public.guestbook_entries
  for insert
  to anon, authenticated
  with check (status = 'pending');
