import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Fase 1: no declaramos `output`, queda en 'static' (default de Astro 5+).
// output: 'hybrid' fue removido en Astro 5 — 'static' ya soporta rutas
// server-renderizadas por página con `export const prerender = false`
// cuando lleguemos a /admin y los endpoints dinámicos (Fase 4+),
// junto con un adapter (ej. @astrojs/node o @astrojs/vercel).
export default defineConfig({
  integrations: [react()],
  site: 'https://example.com', // TODO: reemplazar por el dominio real
});
