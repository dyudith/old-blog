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
