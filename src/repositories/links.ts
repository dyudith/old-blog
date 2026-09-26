import { supabase } from '../lib/supabase/client';
import type { Database } from '../lib/supabase/database.types';

export type LinkRow = Database['public']['Tables']['links']['Row'];

export async function getPublishedLinks(): Promise<LinkRow[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('published', true)
    .order('featured', { ascending: false });

  if (error) throw new Error(`Error al leer links de Supabase: ${error.message}`);
  return data ?? [];
}
