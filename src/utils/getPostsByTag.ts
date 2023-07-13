import type { CollectionEntryOptions } from "@types";
import { slugifyAll } from "./slugify";

const getPostsByTag = (posts: CollectionEntryOptions[], tag: string) =>
  posts.filter(post => slugifyAll(post.data.tags).includes(tag));

export default getPostsByTag;
