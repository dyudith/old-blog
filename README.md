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

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key

GITHUB_TOKEN=tu-github-token
GITHUB_REPOSITORY=dyudith/old-blog
GITHUB_BRANCH=main
```

## Fase 4.1 — autenticación

- `/admin/login` — inicio de sesión con Supabase Auth.
- `/admin` — panel protegido server-side.
- `/api/admin/login` y `/api/admin/logout`.
- `src/middleware.ts` — valida la sesión.
- `src/lib/supabase/server.ts` — bridge SSR compatible con las cookies de Astro 6.

En Supabase debe existir el usuario administrador en **Authentication → Users**.

## Fase 4.2 — CMS estructurado

La migración `20260929200000_initial_schema.sql` ya aplicada no debe modificarse. Los cambios posteriores se agregan como nuevas migraciones.

## Fase 4.4 — CMS de Posts

Los posts siguen siendo contenido editorial MDX en `src/content/blog/`. El CMS no los mueve a Supabase: el panel privado usa la GitHub Contents API para leer, crear, editar y eliminar los archivos MDX.

Rutas:

- `/admin/posts` — listado de posts.
- `/admin/posts/new` — crear un post.
- `/admin/posts/edit?path=...` — editar un post.
- `/api/admin/posts/create` — creación server-side.
- `/api/admin/posts/update` — actualización server-side.
- `/api/admin/posts/delete` — eliminación server-side.

### GitHub Token

El token se usa exclusivamente en código server-side y nunca se expone al navegador.

Para el endpoint de Contents de GitHub, un fine-grained personal access token necesita permiso **Contents: Read and write** sobre este repositorio. GitHub documenta que ese permiso permite crear, actualizar y eliminar archivos del repositorio.

El CMS hace un commit por cada operación de contenido. Los cambios pasan a formar parte del repositorio y después deben ejecutar el flujo de build/deploy habitual del sitio.

## Auth

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

La `service_role` debe permanecer únicamente en el servidor. Nunca la pongas en una variable `PUBLIC_*` ni en código cliente.

El área `/admin` valida la sesión server-side. Projects y Posts requieren una sesión autenticada.

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
