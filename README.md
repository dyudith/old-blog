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
```

No subas `.env` ni claves al repositorio.

## Auth

Debe existir un usuario administrador en **Supabase → Authentication → Users**.

El área `/admin` ya valida la sesión server-side. El CRUD todavía está pendiente; por ahora las migraciones dejan RLS preparado para lectura pública del contenido publicado y para enviar entradas pendientes al guestbook.

## Build

```bash
npm run build
npm run preview
```

En Termux/Android, Pagefind puede no ejecutarse por su binario nativo; el resto del build puede completarse igualmente.
