// Datos mock de Fase 1. En Fase 3 esto se reemplaza por Content Collections
// (posts) y Supabase (projects, books, music). La forma de estos objetos
// ya está pensada para parecerse al modelo de datos futuro, para que el
// reemplazo no rompa los componentes que los consumen.

export interface PostSummary {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  tags: string[];
}

export interface Project {
  slug: string;
  name: string;
  description: string;
  url?: string;
  githubUrl?: string;
  technologies: string[];
  status: 'active' | 'archived' | 'idea';
  featured: boolean;
}

export const posts: PostSummary[] = [
  {
    slug: 'primer-post',
    title: 'Mi primer post en esta reconstrucción',
    description: 'Por qué estoy reviviendo mi rincón de internet en 2026.',
    date: '2026-09-10',
    tags: ['personal', 'proyectos'],
  },
  {
    slug: 'islands-en-astro',
    title: 'Entendiendo las islands de Astro',
    description: 'Notas mientras aprendo a usar React solo donde hace falta.',
    date: '2026-09-15',
    tags: ['programacion', 'astro'],
  },
  {
    slug: 'diario-de-un-refactor',
    title: 'Diario de un refactor que se me fue de las manos',
    description: 'Cómo una migración de "dos horas" terminó en una semana.',
    date: '2026-09-20',
    tags: ['programacion'],
  },
];

export const projects: Project[] = [
  {
    slug: 'este-sitio',
    name: 'Este mismo sitio',
    description: 'Sitio personal con estética old-web y stack moderno (Astro + Supabase).',
    githubUrl: 'https://github.com/tu-usuario/sitio-personal',
    technologies: ['Astro', 'TypeScript', 'React', 'Supabase'],
    status: 'active',
    featured: true,
  },
  {
    slug: 'tracker-habitos',
    name: 'Tracker de hábitos',
    description: 'Pequeña app para llevar rutinas diarias.',
    technologies: ['React', 'SQLite'],
    status: 'idea',
    featured: false,
  },
];

export const nowPlaying = {
  artist: 'Boards of Canada',
  track: 'Roygbiv',
};

export const nowReading = {
  title: 'The Pragmatic Programmer',
  author: 'David Thomas & Andrew Hunt',
};
