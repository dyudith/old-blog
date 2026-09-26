# sitio-personal

Sitio personal con estética "old web" (2000–2010) reinterpretada y arquitectura
moderna. **Fase 1**: fundación — sin base de datos ni CMS todavía.

## Stack (Fase 1)

- [Astro](https://astro.build) (`output: 'static'`, el default — sin adapter, sin rutas dinámicas todavía)
- TypeScript (`strict`)
- React (integración instalada, sin usarse todavía — reservado para islands futuras)
- CSS con variables (`src/styles/global.css`) para poder rediseñar sin tocar componentes

## Cómo correrlo localmente

```bash
npm install
npm run dev
```

Abrí `http://localhost:4321`.

## Cómo verificar que funciona

- `/` — home con presentación, últimos posts y proyectos destacados
- `/blog` — listado de posts (mock)
- `/blog/primer-post` (y los otros slugs de `src/lib/mock-data.ts`) — detalle de post
- `/projects` — listado de proyectos (mock)
- `/projects/este-sitio` — detalle de proyecto
- `/about` — página estática

Build de producción:

```bash
npm run build
npm run preview
```

## Estructura

```
src/
  components/
    astro/     -> Header, Sidebar, Footer (estáticos)
    react/     -> vacío por ahora, reservado para islands
  layouts/
    BaseLayout.astro
  lib/
    mock-data.ts   -> datos de ejemplo (posts, projects)
  pages/
    index.astro
    about.astro
    blog/index.astro, blog/[slug].astro
    projects/index.astro, projects/[slug].astro
  styles/
    global.css     -> design tokens (colores, tipografías, spacing)
```

## Qué queda preparado para la Fase 2

- `mock-data.ts` tiene la misma forma que tendrá el contenido real, para que
  migrar a Content Collections (MDX) no rompa los componentes.
- Comentarios en el código marcan explícitamente dónde entra MDX
  (`blog/[slug].astro`), dónde entra Supabase (`projects/[slug].astro`) y
  dónde se agregará RSS/sitemap.
- `astro.config.mjs` documenta por qué no se usa `output: 'hybrid'` (removido
  en Astro 5) y cómo se van a agregar rutas dinámicas más adelante.

## No incluido todavía (a propósito)

Base de datos, autenticación, CMS, guestbook, comentarios, sync GitHub↔MDX.


## Fase 4.1 — autenticación y shell de administración

La primera subfase del CMS agrega un área privada basada en **Supabase Auth**:

- `/admin/login` — inicio de sesión con email y contraseña.
- `/admin` — panel protegido server-side.
- `/api/admin/login` — endpoint de autenticación.
- `/api/admin/logout` — cierre de sesión.
- `src/middleware.ts` — valida la sesión con `supabase.auth.getUser()` y protege `/admin/*`.
- `src/lib/supabase/server.ts` — cliente Supabase SSR con cookies.
- Node adapter para permitir rutas server-rendered sin convertir el contenido público en una SPA.

Todavía no se implementan CRUD, moderación, editor MDX ni publicación a GitHub.

### Configuración local de Fase 4.1

Después de actualizar el repo:

```bash
npm install
npm run build
npm run dev
```

En Supabase debe existir un usuario administrador en **Authentication → Users**.

Variables necesarias en `.env`:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
```

La `service_role` todavía no participa en esta fase.
