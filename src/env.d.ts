/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: import('@supabase/supabase-js').User | null;
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
