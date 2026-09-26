-- Datos de ejemplo para levantar el proyecto sin cargar todo a mano.
-- Reutiliza el contenido que ya existía en mock-data.ts.

insert into public.projects (slug, name, description, github_url, technologies, status, featured)
values
  ('este-sitio', 'Este mismo sitio', 'Sitio personal con estética old-web y stack moderno (Astro + Supabase).', 'https://github.com/tu-usuario/sitio-personal', array['Astro', 'TypeScript', 'React', 'Supabase'], 'active', true),
  ('tracker-habitos', 'Tracker de hábitos', 'Pequeña app para llevar rutinas diarias.', null, array['React', 'SQLite'], 'idea', false)
on conflict (slug) do nothing;

insert into public.books (title, author, status, rating)
values
  ('The Pragmatic Programmer', 'David Thomas & Andrew Hunt', 'reading', null),
  ('Designing Data-Intensive Applications', 'Martin Kleppmann', 'to_read', null),
  ('Mundo del fin del mundo', 'Luis Sepúlveda', 'finished', 4)
on conflict do nothing;

insert into public.music_entries (kind, artist, track, album, is_current)
values
  ('now_playing', 'Boards of Canada', 'Roygbiv', 'Music Has the Right to Children', true),
  ('log', 'Bonobo', 'Kerala', 'Migration', false),
  ('log', 'Tycho', 'A Walk', 'Dive', false)
on conflict do nothing;

insert into public.links (name, url, description, category, featured)
values
  ('GitHub', 'https://github.com', 'Mis repos.', 'social', true),
  ('Astro Docs', 'https://docs.astro.build', 'La documentación que más consulto.', 'referencia', false)
on conflict do nothing;

insert into public.guestbook_entries (name, message, status)
values
  ('Visitante de ejemplo', '¡Lindo sitio! Saludos desde 2026.', 'approved'),
  ('Otro visitante', 'Mensaje todavía sin moderar.', 'pending')
on conflict do nothing;
