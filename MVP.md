# OldBlog — MVP 1.0

> Documento de referencia del MVP. Consultar antes de iniciar una nueva fase o agregar una funcionalidad importante.

## Meta

OldBlog MVP 1.0 debe permitir crear, editar, eliminar, guardar como borrador, publicar y despublicar posts; usar una portada propia o predeterminada; administrar Projects, Books, Music y Links; moderar el Guestbook; autenticarse mediante Supabase Auth; guardar posts como MDX en GitHub; guardar datos dinámicos e imágenes en Supabase; desplegar automáticamente; y conocer el estado del despliegue.

## Arquitectura objetivo

```text
Astro
├── Blog editorial       → MDX en GitHub
├── Contenido dinámico   → Supabase
├── Auth / Admin         → Supabase Auth + /admin
├── Imágenes             → Supabase Storage
├── CMS                  → Astro server-side
└── Deploy               → GitHub Actions → Hosting
```

## Estado de las fases

- [x] Fase 1 — Astro Foundation
- [x] Fase 2 — Blog Editorial
- [x] Fase 3 — Supabase / PostgreSQL
- [x] Fase 4.1 — Auth + Admin
- [x] Fase 4.2 — CMS dinámico
- [x] Fase 4.3 — Guestbook
- [x] Fase 4.4 — Posts CMS
- [~] Fase 4.5 — Storage (implementado; migración aplicada; falta QA)
- [~] Fase 4.6 — Publishing / CI-CD (CI de build implementado; falta deploy)
- [ ] Fase 4.7 — Production / Hosting
- [ ] Fase 4.8 — QA MVP
- [ ] MVP 1.0

## Posts CMS

Las acciones deben ser explícitas:

- Nuevo borrador: **Guardar borrador** / **Publicar**.
- Borrador existente: **Guardar cambios** / **Publicar**.
- Post publicado: **Guardar cambios** / **Despublicar**.

Estado editorial:

```text
DRAFT
PUBLISHED
```

No depender únicamente de un checkbox `draft` para representar las acciones del usuario.

## Estado de despliegue

Separar estado editorial de deployment:

```text
PENDING
BUILDING
DEPLOYED
FAILED
```

Un commit exitoso en GitHub no equivale automáticamente a que la web ya esté desplegada.

## Flujo de publicación

```text
CMS
 ↓
Validación
 ↓
Generación MDX
 ↓
Commit en GitHub
 ↓
GitHub Actions
 ↓
npm run build
 ↓
Deploy
 ↓
DEPLOYED / FAILED
```

No necesitamos cron, Redis ni una cola propia para el MVP. El push a GitHub será el disparador natural del CI/CD.

## Storage de imágenes

Usar **Supabase Storage** con el bucket previsto:

```text
blog/
└── covers/
```

La portada no es obligatoriamente una imagen subida por el usuario. Todo post debe mostrar una portada:

```text
imagen propia → usar imagen subida
sin imagen     → usar portada predeterminada
```

Reglas iniciales: JPG, PNG, WebP, AVIF si la implementación lo soporta; límite aproximado de 6 MB; preview antes de guardar; alt cuando corresponda; preferir paths únicos para evitar sobrescrituras innecesarias.

No implementar todavía una media library completa.

## Fuente de verdad

### GitHub / MDX

Los posts continúan en `src/content/blog/*.mdx`. GitHub es la fuente de verdad del contenido editorial. Los posts no se migran a Supabase.

### Supabase

Supabase mantiene Projects, Books, Music, Links, Guestbook, Auth y Storage.

## Guestbook

Público en `/guestbook`, con nombre, website opcional, mensaje y honeypot. Los nuevos mensajes quedan `PENDING`.

Admin en `/admin/guestbook`, con acciones aprobar, ocultar y eliminar.

## Admin

El panel debe cubrir:

```text
/admin
├── Posts
├── Projects
├── Books
├── Music
├── Links
└── Guestbook
```

Para el MVP no necesitamos múltiples roles, permisos granulares, analytics, estadísticas ni auditoría avanzada.

## Seguridad

Secretos exclusivamente server-side:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GITHUB_TOKEN
GITHUB_REPOSITORY
GITHUB_BRANCH
```

Nunca exponer `GITHUB_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY` ni otros secretos mediante `PUBLIC_*` o código cliente.

## CI/CD y hosting

Flujo esperado:

```text
push a main
   ↓
GitHub Actions
   ↓
npm ci
   ↓
npm run build
   ↓
deploy
```

Hosting objetivo inicial: **Netlify**, salvo incompatibilidad concreta detectada durante la implementación. Hostinger queda como alternativa.

Antes del deployment definitivo revisar `output`, Node adapter, rutas server-side, API routes, middleware, variables de entorno y Supabase en build/runtime.

## Portada predeterminada

Debe existir un asset del proyecto que funcione como portada por defecto.

```text
post.coverImage
   ↓
si existe → portada del post
si no     → portada predeterminada
```

El usuario no debe poder publicar un post que visualmente quede sin portada.

## SEO

Cada post publicado debe tener title, description, slug, fecha, tags, portada, alt cuando corresponda, metadata SEO, Open Graph y URL canónica. RSS, sitemap y búsqueda deben continuar funcionando con los posts publicados.

## QA obligatorio antes de MVP 1.0

### Posts

- [ ] Crear borrador
- [ ] Editar borrador
- [ ] Publicar
- [ ] Ver post publicado
- [ ] Editar publicado
- [ ] Despublicar
- [ ] Volver a publicar
- [ ] Eliminar
- [ ] Validar slug duplicado
- [ ] Validar campos obligatorios
- [ ] Portada propia
- [ ] Portada predeterminada
- [ ] Preview de portada
- [ ] Alt

### Deploy

- [ ] Commit generado
- [ ] GitHub Actions iniciado
- [ ] Build correcto
- [ ] Deploy correcto
- [ ] Estado BUILDING
- [ ] Estado DEPLOYED
- [ ] Estado FAILED
- [ ] Post visible realmente en producción

### Guestbook

- [ ] Envío público
- [ ] Estado pendiente
- [ ] Aprobación
- [ ] Aparición pública
- [ ] Ocultamiento
- [ ] Eliminación

### CMS

- [ ] Projects
- [ ] Books
- [ ] Music
- [ ] Links

### Seguridad

- [ ] `/admin` protegido
- [ ] APIs administrativas protegidas
- [ ] service role nunca llega al cliente
- [ ] GitHub token nunca llega al cliente

## Fuera del MVP

No implementar salvo decisión explícita:

- comentarios
- likes
- analytics
- newsletter
- usuarios públicos
- múltiples roles
- media library completa
- WYSIWYG
- autosave
- historial propio de versiones
- publicaciones programadas
- notificaciones
- dashboard estadístico
- editor Markdown sofisticado

## Regla de trabajo

Antes de implementar una nueva funcionalidad:

1. Revisar este archivo.
2. Identificar qué punto del MVP resuelve.
3. Verificar si pertenece a una fase existente.
4. No introducir arquitectura adicional si puede resolverse con la arquitectura actual.
5. Mantener GitHub como fuente de verdad de los posts.
6. Mantener Supabase como fuente de verdad de los datos dinámicos.
7. Mantener secretos exclusivamente server-side.
8. Actualizar este archivo si una decisión de arquitectura cambia el alcance o flujo del MVP.
9. Marcar las tareas completadas durante la implementación.
10. No declarar MVP 1.0 hasta completar la sección de QA.

## Criterio de finalización

OldBlog es **MVP 1.0** cuando funcione de extremo a extremo:

```text
Crear post
   ↓
Guardar / Publicar
   ↓
MDX en GitHub
   ↓
CI/CD
   ↓
Build
   ↓
Deploy
   ↓
Post visible en producción
```

Y además funcionen CMS dinámico, Guestbook, Auth, Storage, portada predeterminada, seguridad y QA completo.

**Esta es la meta de referencia del proyecto.**
