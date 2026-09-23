// Datos mock que sobreviven a la Fase 2. Los posts ya migraron a
// src/content/blog (ver src/lib/blog.ts) y salieron de este archivo.
// Lo que queda acá (projects, now playing/reading) se reemplaza por
// Supabase recién en la Fase 3.

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
