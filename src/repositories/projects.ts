import { supabase } from '../lib/supabase/client';
import type { Database } from '../lib/supabase/database.types';

export type ProjectRow = Database['public']['Tables']['projects']['Row'];

export async function getPublishedProjects(): Promise<ProjectRow[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error al leer projects de Supabase: ${error.message}`);
  return data ?? [];
}

export async function getProjectBySlug(slug: string): Promise<ProjectRow | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) throw new Error(`Error al leer el project "${slug}" de Supabase: ${error.message}`);
  return data;
}

export async function getAllProjects(): Promise<ProjectRow[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Error al leer projects de Supabase: ${error.message}`);
  return data ?? [];
}

export async function getProjectById(id: string): Promise<ProjectRow | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Error al leer el project "${id}" de Supabase: ${error.message}`);
  return data;
}
