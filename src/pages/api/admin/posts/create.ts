import type { APIRoute } from 'astro';
import {
  buildPostContent,
  createBlogPost,
  getBlogPost,
} from '../../../../lib/github-content';

export const prerender = false;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = (await import('../../../../lib/supabase/server')).createSupabaseServerClient(request, cookies);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect('/admin/login', 303);

  const form = await request.formData();
  const action = String(form.get('action') ?? 'draft');
  const title = String(form.get('title') ?? '').trim();
  const slug = String(form.get('slug') ?? '').trim();
  const description = String(form.get('description') ?? '').trim();
  const date = String(form.get('date') ?? '').trim();
  const tags = String(form.get('tags') ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const body = String(form.get('body') ?? '');
  const coverImage = String(form.get('coverImage') ?? '').trim();
  const coverImageAlt = String(form.get('coverImageAlt') ?? '').trim();

  if (!['draft', 'publish'].includes(action)) {
    return redirect('/admin/posts/new?error=Acci%C3%B3n%20inv%C3%A1lida', 303);
  }

  if (!title || !description || !slugPattern.test(slug) || !datePattern.test(date)) {
    return redirect('/admin/posts/new?error=Datos%20inv%C3%A1lidos', 303);
  }

  const path = `src/content/blog/${slug}.mdx`;

  try {
    await getBlogPost(path);
    return redirect('/admin/posts/new?error=Ya%20existe%20un%20post%20con%20ese%20slug', 303);
  } catch {
    // 404 is expected when the file does not exist.
  }

  const content = buildPostContent({
    title,
    description,
    date,
    tags,
    draft: action !== 'publish',
    coverImage,
    coverImageAlt,
    body,
  });

  try {
    await createBlogPost(path, content, `content: ${action === 'publish' ? 'publish' : 'save draft'} ${slug}`);
  } catch (err) {
    const message = encodeURIComponent(err instanceof Error ? err.message : 'No se pudo crear el post.');
    return redirect(`/admin/posts/new?error=${message}`, 303);
  }

  return redirect('/admin/posts', 303);
};
