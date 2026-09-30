import type { APIRoute } from 'astro';
import {
  buildPostContent,
  updateBlogPost,
} from '../../../../lib/github-content';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

export const prerender = false;

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createSupabaseServerClient(request, cookies);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect('/admin/login', 303);

  const form = await request.formData();
  const path = String(form.get('path') ?? '');
  const sha = String(form.get('sha') ?? '');
  const title = String(form.get('title') ?? '').trim();
  const description = String(form.get('description') ?? '').trim();
  const date = String(form.get('date') ?? '').trim();
  const tags = String(form.get('tags') ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const body = String(form.get('body') ?? '');
  const coverImage = String(form.get('coverImage') ?? '').trim();
  const coverImageAlt = String(form.get('coverImageAlt') ?? '').trim();

  if (!path || !sha || !title || !description || !datePattern.test(date)) {
    return redirect('/admin/posts?error=Datos%20inv%C3%A1lidos', 303);
  }

  const content = buildPostContent({
    title,
    description,
    date,
    tags,
    draft: form.has('draft'),
    coverImage,
    coverImageAlt,
    body,
  });

  try {
    await updateBlogPost(path, sha, content, `content: update ${path.split('/').pop()}`);
  } catch (err) {
    const message = encodeURIComponent(err instanceof Error ? err.message : 'No se pudo guardar el post.');
    return redirect(`/admin/posts/edit?path=${encodeURIComponent(path)}&error=${message}`, 303);
  }

  return redirect('/admin/posts', 303);
};
