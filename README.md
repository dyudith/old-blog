# sitio-personal

Sitio personal con estética "old web" (2000–2010) reinterpretada y arquitectura moderna.

## Stack

- Astro 6
- TypeScript
- React
- MDX
- Supabase
- Supabase CLI para schema y migraciones

## Cómo correrlo localmente

```bash
npm install
npm run dev
```

Abrí `http://localhost:4321`.

## Supabase

El schema de PostgreSQL está versionado en `supabase/migrations/`. Astro no crea las tablas automáticamente al conectarse a Supabase: las migraciones son las que crean y modifican el schema.

Después de hacer pull del repo, la primera configuración del proyecto local es:

```bash
supabase login
supabase link --project-ref <tu-project-ref>
supabase db push
```

El `project-ref` es el identificador que aparece en la URL del proyecto de Supabase.

Para comprobar qué migraciones están aplicadas:

```bash
supabase migration list
```

Después de modificar el schema, los cambios deben hacerse mediante una nueva migración y luego aplicarse con `supabase db push`. No hagas cambios estructurales directamente en el Dashboard una vez que el proyecto esté gestionado con migraciones.

### Variables de Astro

En `.env`:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key

GITHUB_TOKEN=tu-github-token
GITHUB_REPOSITORY=dyudith/old-blog
GITHUB_BRANCH=main
```

No subas `.env` ni claves al repositorio.

## Fase 4.2 — CMS de Projects

El panel privado ya incluye CRUD para proyectos:

- `/admin/projects` — listado de proyectos.
- `/admin/projects/new` — crear proyectos.
- `/admin/projects/:id/edit` — editar proyectos.
- Publicar/despublicar y marcar como destacado.
- Eliminar proyectos.
- Los proyectos públicos se renderizan server-side para que los cambios del CMS no requieran regenerar manualmente las páginas.

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

Debe existir un usuario administrador en **Supabase → Authentication → Users**.

El área `/admin` valida la sesión server-side. Projects y Posts requieren una sesión autenticada.

## Build

```bash
npm run build
npm run preview
```

En Termux/Android, Pagefind puede no ejecutarse por su binario nativo; el resto del build puede completarse igualmente.
