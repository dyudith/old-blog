import type { APIRoute } from 'astro';
import { buildPostContent, updateBlogPost } from '../../../../lib/github-content';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { DEFAULT_COVER, uploadBlogCover } from '../../../../lib/blog-storage';

export const prerender = false;

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createSupabaseServerClient(request, cookies);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/admin/login', 303);

  const form = await request.formData();
  const path = String(form.get('path') ?? '');
  const sha = String(form.get('sha') ?? '');
  const action = String(form.get('action') ?? 'save');
  const currentDraft = String(form.get('currentDraft') ?? 'true') === 'true';
  const existingCoverImage = String(form.get('existingCoverImage') ?? '').trim();
  const title = String(form.get('title') ?? '').trim();
  const description = String(form.get('description') ?? '').trim();
  const date = String(form.get('date') ?? '').trim();
  const tags = String(form.get('tags') ?? '').split(',').map((tag) => tag.trim()).filter(Boolean);
  const body = String(form.get('body') ?? '');
  const coverImageAlt = String(form.get('coverImageAlt') ?? '').trim();
  const coverFile = form.get('coverImage');

  if (!['save', 'publish', 'unpublish'].includes(action)) {
    return redirect(`/admin/posts/edit?path=${encodeURIComponent(path)}&error=Acci%C3%B3n%20inv%C3%A1lida`, 303);
  }
  if (!path || !sha || !title || !description || !datePattern.test(date)) {
    return redirect(`/admin/posts/edit?path=${encodeURIComponent(path)}&error=Datos%20inv%C3%A1lidos`, 303);
  }
  if (action === 'publish' && !currentDraft) {
    return redirect(`/admin/posts/edit?path=${encodeURIComponent(path)}&error=El%20post%20ya%20est%C3%A1%20publicado`, 303);
  }
  if (action === 'unpublish' && currentDraft) {
    return redirect(`/admin/posts/edit?path=${encodeURIComponent(path)}&error=El%20post%20ya%20est%C3%A1%20en%20borrador`, 303);
  }
  if (coverFile instanceof File && coverFile.size > 0 && !coverImageAlt) {
    return redirect(`/admin/posts/edit?path=${encodeURIComponent(path)}&error=La%20portada%20necesita%20un%20texto%20alternativo`, 303);
  }

  const draft = action === 'publish' ? false : action === 'unpublish' ? true : currentDraft;
  let uploadedPath = '';
  let coverImage = existingCoverImage || DEFAULT_COVER;

  try {
    if (coverFile instanceof File && coverFile.size > 0) {
      const slug = path.split('/').pop()?.replace(/\.mdx$/, '') || 'post';
      const uploaded = await uploadBlogCover(coverFile, slug);
      uploadedPath = uploaded.path;
      coverImage = uploaded.url;
    }

    const content = buildPostContent({
      title, description, date, tags, draft, coverImage,
      coverImageAlt: coverImageAlt || 'Portada predeterminada de OldBlog',
      body,
    });

    await updateBlogPost(
      path, sha, content,
      `content: ${action === 'publish' ? 'publish' : action === 'unpublish' ? 'unpublish' : 'update'} ${path.split('/').pop()}`,
    );
  } catch (err) {
    if (uploadedPath) {
      const { deleteBlogCover } = await import('../../../../lib/blog-storage');
      await deleteBlogCover(uploadedPath);
    }
    const message = encodeURIComponent(err instanceof Error ? err.message : 'No se pudo guardar el post.');
    return redirect(`/admin/posts/edit?path=${encodeURIComponent(path)}&error=${message}`, 303);
  }

  return redirect('/admin/posts', 303);
};
