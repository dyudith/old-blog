import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createSupabaseServerClient(cookies, request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect('/admin/login', 303);

  const form = await request.formData();
  const id = String(form.get('id') ?? '');

  if (!id) return redirect('/admin/projects', 303);

  const { error } = await supabase.from('projects').delete().eq('id', id);

  if (error) {
    return new Response(error.message, { status: 400 });
  }

  return redirect('/admin/projects', 303);
};
