import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

export const prerender = false;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createSupabaseServerClient(cookies, request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect('/admin/login', 303);

  const form = await request.formData();
  const name = String(form.get('name') ?? '').trim();
  const slug = String(form.get('slug') ?? '').trim();
  const description = String(form.get('description') ?? '').trim();

  if (!name || !description || !slugPattern.test(slug)) {
    return redirect('/admin/projects/new?error=Datos%20inv%C3%A1lidos', 303);
  }

  const technologies = String(form.get('technologies') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const { error } = await supabase.from('projects').insert({
    name,
    slug,
    description,
    long_description: String(form.get('long_description') ?? '').trim() || null,
    image: String(form.get('image') ?? '').trim() || null,
    url: String(form.get('url') ?? '').trim() || null,
    github_url: String(form.get('github_url') ?? '').trim() || null,
    technologies,
    status: String(form.get('status') ?? 'idea') as 'active' | 'archived' | 'idea',
    featured: form.has('featured'),
    published: form.has('published'),
  });

  if (error) {
    const message = encodeURIComponent(error.message);
    return redirect(`/admin/projects/new?error=${message}`, 303);
  }

  return redirect('/admin/projects', 303);
};
