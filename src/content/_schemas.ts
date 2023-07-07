import { reference, z } from "astro:content";

export const authorSchema = z
  .object({
    image: z.string().optional(),
    mastodon: z.string().url().optional(),
    name: z.string(),
    title: z.string().optional(),
    twitter: z.string().url().optional(),
  })
  .strict();

export const snippetSchema = z.object({
  authors: z.array(reference("authors")).default(["en/dane-mackier"]),
  description: z.string(),
  draft: z.boolean().optional(),
  featured: z.boolean().optional(),
  ogImage: z.string().optional(),
  ogVideo: z.string().url().optional(),
  postSlug: z.string().optional(),
  published: z.date(),
  relatedPosts: z.array(reference("snippets")).optional(),
  tags: z.array(z.string()).default(["others"]),
  title: z.string(),
  updated: z.date().optional(),
});

export const tutorialSchema = z.object({
  authors: z.array(reference("authors")).default(["en/dane-mackier"]),
  description: z.string(),
  draft: z.boolean().optional(),
  featured: z.boolean().optional(),
  ogImage: z.string().optional(),
  ogVideo: z.string().url().optional(),
  postSlug: z.string().optional(),
  published: z.date(),
  relatedPosts: z.array(reference("tutorials")).optional(),
  tags: z.array(z.string()).default(["others"]),
  title: z.string(),
  updated: z.date().optional(),
});

export type BlogFrontmatter = z.infer<
  typeof snippetSchema | typeof tutorialSchema
>;
