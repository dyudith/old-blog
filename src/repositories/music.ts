import { supabase } from '../lib/supabase/client';
import type { Database } from '../lib/supabase/database.types';

export type MusicEntryRow = Database['public']['Tables']['music_entries']['Row'];

export async function getCurrentlyPlaying(): Promise<MusicEntryRow | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('music_entries')
    .select('*')
    .eq('is_current', true)
    .maybeSingle();

  if (error) throw new Error(`Error al leer "now playing" de Supabase: ${error.message}`);
  return data;
}
