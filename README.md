# sitio-personal

Sitio personal con estética "old web" (2000–2010) reinterpretada con arquitectura moderna.

## Stack

- Astro 6.4.8 + Node adapter para SSR selectivo.
- TypeScript.
- React para islands puntuales.
- MDX para contenido editorial del blog.
- Supabase/PostgreSQL para datos estructurados.
- Supabase Auth para el área privada.
- Pagefind para búsqueda.
- RSS + sitemap + SEO.

## Cómo correrlo localmente

```bash
npm install
npm run dev
```

Abrí `http://localhost:4321`.

Para producción:

```bash
supabase login
supabase link --project-ref <tu-project-ref>
supabase db push
```

Pagefind puede no ejecutarse en Termux/Android; el build del resto del sitio sigue siendo verificable.

## Arquitectura de contenido

- **MDX + Git:** posts y contenido editorial.
- **Supabase:** projects, books, music, links y guestbook.
- **CMS privado:** administra las entidades estructuradas desde `/admin`.
- **Posts:** el editor MDX y la publicación automática a GitHub quedan para la siguiente subfase.

## Fase 3 — Supabase

Las migraciones están en `supabase/migrations/` y el seed en `supabase/seed.sql`.

Las páginas públicas leen Supabase a través de repositories en `src/repositories/`; no consultan la base directamente.

## Fase 4.1 — autenticación

- `/admin/login` — inicio de sesión con Supabase Auth.
- `/admin` — panel protegido server-side.
- `/api/admin/login` y `/api/admin/logout`.
- `src/middleware.ts` — valida la sesión.
- `src/lib/supabase/server.ts` — bridge SSR compatible con las cookies de Astro 6.

En Supabase debe existir el usuario administrador en **Authentication → Users**.

## Fase 4.2 — CMS estructurado

Ya están disponibles:

- `/admin/projects` — crear, editar, publicar/despublicar y eliminar proyectos.
- `/admin/books` — gestionar libros y estado de lectura.
- `/admin/music` — historial y “escuchando ahora”.
- `/admin/links` — gestionar enlaces.

El CRUD usa endpoints server-only y la `service_role` nunca se envía al navegador.

## Auth

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

La `service_role` debe permanecer únicamente en el servidor. Nunca la pongas en una variable `PUBLIC_*` ni en código cliente.

## Próximas subfases

- 4.3 — moderación del guestbook.
- 4.4 — CMS de posts, borradores y preview MDX.
- 4.5 — publicación MDX → GitHub → deploy.
- 4.6 — storage de imágenes.

## Estructura relevante

```
src/
  components/
    astro/
    react/
  layouts/
  lib/
    supabase/
  repositories/
  content/
    blog/
  pages/
    admin/
    api/admin/
    blog/
    projects/
  styles/
supabase/
  migrations/
  seed.sql
```
