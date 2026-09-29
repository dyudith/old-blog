import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return redirect('/admin/login?error=Completa%20email%20y%20contrase%C3%B1a', 303);
  }

  const supabase = createSupabaseServerClient(cookies, request);
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return redirect('/admin/login?error=Credenciales%20inv%C3%A1lidas', 303);
  }

  return redirect('/admin', 303);
};
