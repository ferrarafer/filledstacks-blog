import type { Language } from "@types";
import { getCollection, type CollectionEntry } from "astro:content";

interface Props {
  language?: Language;
  draft?: boolean;
  featured?: boolean;
}

export default async function getTutorialsCollection({
  language = "en",
  draft,
  featured,
}: Props) {
  let collection: CollectionEntry<"tutorials">[] = await Promise.all(
    await getCollection("tutorials")
  );

  collection = collection.filter(({ id }) => id.startsWith(`${language}/`));

  if (draft != null) {
    collection = collection.filter(({ data }) => data.draft === draft);
  }

  if (featured != null) {
    collection = collection.filter(({ data }) => data.featured === featured);
  }

  collection = collection.sort(
    (a, b) => b.data.published.valueOf() - a.data.published.valueOf()
  );

  return collection;
}
