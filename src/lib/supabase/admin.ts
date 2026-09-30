import { createClient } from '@supabase/supabase-js';
import { getSecret } from 'astro:env/server';
import type { Database } from './database.types';

export function createSupabaseAdminClient() {
  const url = getSecret('SUPABASE_URL');
  const serviceRoleKey = getSecret('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !serviceRoleKey) {
    throw new Error('Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY para el CMS.');
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
