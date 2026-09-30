import { createSupabaseAdminClient } from './supabase/admin';

const BUCKET = 'blog';
const MAX_COVER_SIZE = 6 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export const DEFAULT_COVER = '/default-cover.svg';

export async function uploadBlogCover(file: File, slug: string) {
  if (!file || file.size === 0) throw new Error('No se recibió una imagen de portada.');
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Formato de portada no permitido. Usá JPG, PNG, WebP o AVIF.');
  }
  if (file.size > MAX_COVER_SIZE) {
    throw new Error('La portada supera el límite de 6 MB.');
  }

  const path = `covers/${slug}-${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
  const db = createSupabaseAdminClient();

  const { error } = await db.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) throw error;

  const { data } = db.storage.from(BUCKET).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function deleteBlogCover(path: string) {
  if (!path || !path.startsWith('covers/')) return;
  const db = createSupabaseAdminClient();
  await db.storage.from(BUCKET).remove([path]);
}
