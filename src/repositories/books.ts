import { supabase } from '../lib/supabase/client';
import type { Database } from '../lib/supabase/database.types';

export type BookRow = Database['public']['Tables']['books']['Row'];

/** No hay todavía una página /books (fuera de alcance de esta fase). Se deja
 * lista para cuando se agregue, sin tener que tocar el schema ni RLS. */
export async function getPublishedBooks(): Promise<BookRow[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error al leer books de Supabase: ${error.message}`);
  return data ?? [];
}
