import { defineCollection } from "astro:content";
import { authorSchema, snippetSchema, tutorialSchema } from "./_schemas";

const authorCollection = defineCollection({
  type: "data",
  schema: authorSchema,
});

const snippetCollection = defineCollection({
  type: "content",
  schema: snippetSchema,
});

const tutorialCollection = defineCollection({
  type: "content",
  schema: tutorialSchema,
});

export const collections = {
  authors: authorCollection,
  snippets: snippetCollection,
  tutorials: tutorialCollection,
};
