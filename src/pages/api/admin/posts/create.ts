import type { APIRoute } from 'astro';
import { buildPostContent, createBlogPost, getBlogPost } from '../../../../lib/github-content';
import { DEFAULT_COVER, uploadBlogCover } from '../../../../lib/blog-storage';

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
  const tags = String(form.get('tags') ?? '').split(',').map((tag) => tag.trim()).filter(Boolean);
  const body = String(form.get('body') ?? '');
  const coverImageAlt = String(form.get('coverImageAlt') ?? '').trim();
  const coverFile = form.get('coverImage');

  if (!['draft', 'publish'].includes(action)) return redirect('/admin/posts/new?error=Acci%C3%B3n%20inv%C3%A1lida', 303);
  if (!title || !description || !slugPattern.test(slug) || !datePattern.test(date)) {
    return redirect('/admin/posts/new?error=Datos%20inv%C3%A1lidos', 303);
  }
  if (action === 'publish' && coverFile instanceof File && coverFile.size > 0 && !coverImageAlt) {
    return redirect('/admin/posts/new?error=La%20portada%20necesita%20un%20texto%20alternativo', 303);
  }

  const path = `src/content/blog/${slug}.mdx`;
  try {
    await getBlogPost(path);
    return redirect('/admin/posts/new?error=Ya%20existe%20un%20post%20con%20ese%20slug', 303);
  } catch {
    // Expected when the file does not exist.
  }

  let uploadedPath = '';
  let coverImage = DEFAULT_COVER;

  try {
    if (coverFile instanceof File && coverFile.size > 0) {
      const uploaded = await uploadBlogCover(coverFile, slug);
      uploadedPath = uploaded.path;
      coverImage = uploaded.url;
    }

    const content = buildPostContent({
      title, description, date, tags,
      draft: action !== 'publish',
      coverImage,
      coverImageAlt: coverImageAlt || 'Portada predeterminada de OldBlog',
      body,
    });

    await createBlogPost(path, content, `content: ${action === 'publish' ? 'publish' : 'save draft'} ${slug}`);
  } catch (err) {
    if (uploadedPath) {
      const { deleteBlogCover } = await import('../../../../lib/blog-storage');
      await deleteBlogCover(uploadedPath);
    }
    const message = encodeURIComponent(err instanceof Error ? err.message : 'No se pudo crear el post.');
    return redirect(`/admin/posts/new?error=${message}`, 303);
  }

  return redirect('/admin/posts', 303);
};
