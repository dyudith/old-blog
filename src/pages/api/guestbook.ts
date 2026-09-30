import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../lib/supabase/server';

export const prerender = false;

const namePattern = /\\S/;

function redirectWithMessage(request: Request, location: string, key: 'success' | 'error', message: string) {
  const url = new URL(location, request.url);
  url.searchParams.set(key, message);
  return Response.redirect(url, 303);
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();

  if (String(form.get('company') ?? '').trim()) {
    return redirectWithMessage(request, '/guestbook', 'success', 'Mensaje enviado.');
  }

  const name = String(form.get('name') ?? '').trim();
  const message = String(form.get('message') ?? '').trim();
  const website = String(form.get('website') ?? '').trim();

  if (!namePattern.test(name) || name.length > 80 || !namePattern.test(message) || message.length > 1000) {
    return redirectWithMessage(request, '/guestbook', 'error', 'Revisá los datos del formulario.');
  }

  let normalizedWebsite: string | null = null;
  if (website) {
    try {
      const parsed = new URL(website);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
      normalizedWebsite = parsed.toString();
    } catch {
      return redirectWithMessage(request, '/guestbook', 'error', 'El sitio web no es válido.');
    }
  }

  const supabase = createSupabaseServerClient(request, cookies);
  const { error } = await supabase.from('guestbook_entries').insert({
    name,
    message,
    website: normalizedWebsite,
    status: 'pending',
  });

  if (error) {
    return redirectWithMessage(request, '/guestbook', 'error', 'No se pudo enviar el mensaje.');
  }

  return redirectWithMessage(request, '/guestbook', 'success', 'Mensaje enviado.');
};
