import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { createSupabaseAdminClient } from '../../../../lib/supabase/admin';

export const prerender = false;

const resources = ['projects', 'books', 'music', 'links'] as const;
type Resource = (typeof resources)[number];

function isResource(value: string): value is Resource {
  return resources.includes(value as Resource);
}

function csv(value: FormDataEntryValue | null) {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export const POST: APIRoute = async ({ params, request, cookies, redirect }) => {
  const resource = params.resource ?? '';
  if (!isResource(resource)) return new Response('Recurso no encontrado', { status: 404 });

  const sessionClient = createSupabaseServerClient(request, cookies);
  const { data: { user } } = await sessionClient.auth.getUser();

  if (!user) return redirect('/admin/login', 303);

  const form = await request.formData();
  const action = String(form.get('_action') ?? '');
  const id = String(form.get('id') ?? '').trim();
  const db = createSupabaseAdminClient();

  try {
    if (action === 'delete') {
      if (!id) return new Response('Falta el id', { status: 400 });

      const result =
        resource === 'projects'
          ? await db.from('projects').delete().eq('id', id)
          : resource === 'books'
            ? await db.from('books').delete().eq('id', id)
            : resource === 'music'
              ? await db.from('music_entries').delete().eq('id', id)
              : await db.from('links').delete().eq('id', id);

      if (result.error) throw result.error;
      return redirect(`/admin/${resource}`, 303);
    }

    if (action !== 'save') return new Response('Acción no válida', { status: 400 });

    if (resource === 'projects') {
      const row = {
        slug: String(form.get('slug') ?? '').trim(),
        name: String(form.get('name') ?? '').trim(),
        description: String(form.get('description') ?? '').trim(),
        long_description: String(form.get('long_description') ?? '').trim() || null,
        image: String(form.get('image') ?? '').trim() || null,
        url: String(form.get('url') ?? '').trim() || null,
        github_url: String(form.get('github_url') ?? '').trim() || null,
        technologies: csv(form.get('technologies')),
        status: String(form.get('status') ?? 'active') as 'active' | 'archived' | 'idea',
        featured: form.get('featured') === 'on',
        published: form.get('published') === 'on',
      };
      if (!row.slug || !row.name || !row.description) return redirect('/admin/projects?error=Completa%20los%20campos%20obligatorios', 303);

      const result = id
        ? await db.from('projects').update(row).eq('id', id)
        : await db.from('projects').insert(row);
      if (result.error) throw result.error;
    }

    if (resource === 'books') {
      const row = {
        title: String(form.get('title') ?? '').trim(),
        author: String(form.get('author') ?? '').trim(),
        cover_image: String(form.get('cover_image') ?? '').trim() || null,
        status: String(form.get('status') ?? 'to_read') as 'to_read' | 'reading' | 'finished' | 'abandoned',
        started_at: String(form.get('started_at') ?? '').trim() || null,
        finished_at: String(form.get('finished_at') ?? '').trim() || null,
        rating: String(form.get('rating') ?? '').trim() ? Number(form.get('rating')) : null,
        notes: String(form.get('notes') ?? '').trim() || null,
        published: form.get('published') === 'on',
      };
      if (!row.title || !row.author) return redirect('/admin/books?error=Completa%20los%20campos%20obligatorios', 303);

      const result = id
        ? await db.from('books').update(row).eq('id', id)
        : await db.from('books').insert(row);
      if (result.error) throw result.error;
    }

    if (resource === 'music') {
      const row = {
        kind: String(form.get('kind') ?? 'log') as 'now_playing' | 'log',
        artist: String(form.get('artist') ?? '').trim(),
        track: String(form.get('track') ?? '').trim() || null,
        album: String(form.get('album') ?? '').trim() || null,
        is_current: form.get('is_current') === 'on',
        listened_at: String(form.get('listened_at') ?? '').trim() || new Date().toISOString(),
      };
      if (!row.artist) return redirect('/admin/music?error=El%20artista%20es%20obligatorio', 303);

      if (row.is_current) {
        await db.from('music_entries').update({ is_current: false }).eq('is_current', true);
      }

      const result = id
        ? await db.from('music_entries').update(row).eq('id', id)
        : await db.from('music_entries').insert(row);
      if (result.error) throw result.error;
    }

    if (resource === 'links') {
      const row = {
        name: String(form.get('name') ?? '').trim(),
        url: String(form.get('url') ?? '').trim(),
        description: String(form.get('description') ?? '').trim() || null,
        category: String(form.get('category') ?? '').trim() || null,
        image: String(form.get('image') ?? '').trim() || null,
        featured: form.get('featured') === 'on',
        published: form.get('published') === 'on',
      };
      if (!row.name || !row.url) return redirect('/admin/links?error=Completa%20los%20campos%20obligatorios', 303);

      const result = id
        ? await db.from('links').update(row).eq('id', id)
        : await db.from('links').insert(row);
      if (result.error) throw result.error;
    }

    return redirect(`/admin/${resource}`, 303);
  } catch (error) {
    const message = encodeURIComponent(error instanceof Error ? error.message : 'Error al guardar');
    return redirect(`/admin/${resource}?error=${message}`, 303);
  }
};
