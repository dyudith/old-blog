import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { deleteBlogPost } from '../../../../lib/github-content';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createSupabaseServerClient(request, cookies);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect('/admin/login', 303);

  const form = await request.formData();
  const path = String(form.get('path') ?? '');
  const sha = String(form.get('sha') ?? '');

  if (!path || !sha) return redirect('/admin/posts', 303);

  try {
    await deleteBlogPost(path, sha, `content: delete ${path.split('/').pop()}`);
  } catch (err) {
    const message = encodeURIComponent(err instanceof Error ? err.message : 'No se pudo eliminar el post.');
    return redirect(`/admin/posts?error=${message}`, 303);
  }

  return redirect('/admin/posts', 303);
};
