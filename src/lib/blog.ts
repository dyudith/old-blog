import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

/** Posts publicados (sin drafts), ordenados del más nuevo al más viejo. */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Post anterior y siguiente en orden cronológico (por fecha de publicación). */
export function getAdjacentPosts(posts: BlogPost[], currentId: string) {
  // posts viene ordenado del más nuevo al más viejo; para "anterior/siguiente"
  // cronológico invertimos el criterio: "siguiente" = más nuevo, "anterior" = más viejo.
  const chronological = [...posts].reverse();
  const index = chronological.findIndex((p) => p.id === currentId);
  return {
    previous: index > 0 ? chronological[index - 1] : undefined,
    next: index >= 0 && index < chronological.length - 1 ? chronological[index + 1] : undefined,
  };
}

/**
 * Posts relacionados: coincidencia simple por cantidad de tags compartidos.
 * Excluye el post actual, ordena por más coincidencias y devuelve como máximo `limit`.
 */
export function getRelatedPosts(posts: BlogPost[], current: BlogPost, limit = 3): BlogPost[] {
  return posts
    .filter((p) => p.id !== current.id)
    .map((p) => ({
      post: p,
      shared: p.data.tags.filter((tag) => current.data.tags.includes(tag)).length,
    }))
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, limit)
    .map(({ post }) => post);
}

/** Todos los tags presentes en el contenido real, con su cantidad de posts. */
export function getAllTags(posts: BlogPost[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}

/** Agrupa posts por año y mes para el archivo cronológico. */
export function groupPostsByYearAndMonth(posts: BlogPost[]) {
  const groups = new Map<number, Map<number, BlogPost[]>>();
  for (const post of posts) {
    const year = post.data.date.getFullYear();
    const month = post.data.date.getMonth();
    if (!groups.has(year)) groups.set(year, new Map());
    const monthMap = groups.get(year)!;
    if (!monthMap.has(month)) monthMap.set(month, []);
    monthMap.get(month)!.push(post);
  }
  return [...groups.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, monthMap]) => ({
      year,
      months: [...monthMap.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([month, monthPosts]) => ({ month, posts: monthPosts })),
    }));
}

export const monthNames = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
