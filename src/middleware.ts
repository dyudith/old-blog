import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from './lib/supabase/server';

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServerClient(context.cookies);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  context.locals.user = user;

  const isAdminRoute = context.url.pathname === '/admin' || context.url.pathname.startsWith('/admin/');
  const isLoginRoute = context.url.pathname === '/admin/login';

  if (isAdminRoute && !isLoginRoute && !user) {
    return context.redirect('/admin/login');
  }

  if (isLoginRoute && user) {
    return context.redirect('/admin');
  }

  return next();
});
