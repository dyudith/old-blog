import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const url = import.meta.env.SUPABASE_URL;
const anonKey = import.meta.env.SUPABASE_ANON_KEY;

/**
 * Cliente con la "anon" key: solo puede leer/escribir lo que las policies de
 * RLS permitan a un visitante anónimo. La seguridad real la da RLS en
 * PostgreSQL, no el secreto de esta key — por eso es seguro que termine
 * incluso en código que corre en el navegador si en el futuro hiciera falta.
 *
 * Sirve tanto para páginas prerenderizadas (se llama en build time, en el
 * frontmatter ---) como para futuras rutas con `prerender = false` o
 * endpoints/actions (se llama por request, en el servidor). Es el mismo
 * cliente en los dos casos porque la diferencia entre "estático" y "SSR" en
 * Astro es de CUÁNDO se ejecuta el código, no de CON QUÉ credenciales.
 *
 * Deliberadamente NO se crea acá un cliente con la service_role key. Ese
 * cliente es un archivo aparte que se agrega recién en la Fase 4
 * (src/lib/supabase/admin-client.ts o similar), usado solo desde endpoints
 * server-only del CMS, nunca desde código que pueda terminar en el bundle
 * del navegador. Este archivo no se toca cuando eso pase.
 *
 * `supabase` es `null` si faltan las variables de entorno, para que el
 * build no se rompa cuando todavía no configuraste Supabase (ej. estás
 * trabajando solo en contenido MDX). Los repositories son responsables de
 * manejar ese `null` explícitamente — ver src/repositories/*.
 */
export const supabase: SupabaseClient<Database> | null =
  url && anonKey ? createClient<Database>(url, anonKey) : null;

if (!supabase && import.meta.env.DEV) {
  console.warn(
    '[supabase] SUPABASE_URL / SUPABASE_ANON_KEY no configuradas — ' +
      'las páginas que dependen de Supabase (Projects, etc.) van a mostrarse vacías. ' +
      'Copiá .env.example a .env y completá tus credenciales para probarlas.'
  );
}
