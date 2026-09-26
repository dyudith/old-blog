/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: import('@supabase/supabase-js').User | null;
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  // SUPABASE_SERVICE_ROLE_KEY existe en .env pero deliberadamente no se tipa
  // acá con un client-safe helper: se va a leer directamente con
  // process.env en el código server-only del CMS (Fase 4), nunca vía
  // import.meta.env compartido con módulos que podrían importarse desde el cliente.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
