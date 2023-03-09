import type { CollectionEntryOptions } from "@types";
import { slugifyStr } from "./slugify";

const getUniqueTags = (posts: CollectionEntryOptions[]) => {
  let tags: string[] = [];
  const filteredPosts = posts.filter(({ data }) => !data.draft);
  filteredPosts.forEach(post => {
    tags = [...tags, ...post.data.tags]
      .map(tag => slugifyStr(tag))
      .filter(
        (value: string, index: number, self: string[]) =>
          self.indexOf(value) === index
      );
  });
  return tags;
};

export default getUniqueTags;
