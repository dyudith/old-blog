import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import type { Database } from './database.types';

function parseCookieHeader(header: string | null) {
  if (!header) return [];

  return header
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separator = part.indexOf('=');
      const name = separator >= 0 ? part.slice(0, separator) : part;
      const value = separator >= 0 ? part.slice(separator + 1) : '';
      return { name, value };
    });
}

export function createSupabaseServerClient(request: Request, cookies: AstroCookies) {
  return createServerClient<Database>(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get('cookie'));
        },

        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookies.set(name, value, options);
          }
        },
      },
    },
  );
}
