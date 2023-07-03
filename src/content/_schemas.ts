import { z } from "astro:content";

export const blogSchema = z
  .object({
    author: z.string().optional(),
    published: z.date(),
    updated: z.date().optional(),
    title: z.string(),
    postSlug: z.string().optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).default(["others"]),
    categories: z.array(z.string()).default(["tutorial"]),
    ogImage: z.string().optional(),
    ogVideo: z.string().url().optional(),
    description: z.string(),
    lang: z.string().optional(),
  })
  .strict();

export type BlogFrontmatter = z.infer<typeof blogSchema>;
