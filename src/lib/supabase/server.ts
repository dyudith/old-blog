import { createServerClient } from '@supabase/ssr';
import type { AstroCookies } from 'astro';
import type { Database } from './database.types';

export function createSupabaseServerClient(
  cookies: AstroCookies,
  request: Request,
) {
  return createServerClient<Database>(
    import.meta.env.SUPABASE_URL,
    import.meta.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          const cookieHeader = request.headers.get('cookie');

          if (!cookieHeader) {
            return [];
          }

          return cookieHeader
            .split(';')
            .map((cookie) => {
              const separatorIndex = cookie.indexOf('=');

              if (separatorIndex === -1) {
                return null;
              }

              return {
                name: cookie.slice(0, separatorIndex).trim(),
                value: cookie.slice(separatorIndex + 1).trim(),
              };
            })
            .filter(
              (cookie): cookie is { name: string; value: string } =>
                cookie !== null && cookie.name.length > 0,
            );
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
