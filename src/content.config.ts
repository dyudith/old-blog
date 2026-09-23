import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      // Imagen destacada opcional. `image()` valida que el archivo exista y
      // deja que Astro la optimice (ver punto 12, imágenes).
      coverImage: image().optional(),
      coverImageAlt: z.string().optional(),
    }),
});

export const collections = { blog };
