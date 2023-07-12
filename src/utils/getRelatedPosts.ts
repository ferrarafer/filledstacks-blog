import type { CollectionEntryOptions, Language } from "@types";
import getSnippetsCollection from "./getSnippetsCollection";
import i18next from "i18next";
import getTutorialsCollection from "./getTutorialsCollection";

interface Props {
  post: CollectionEntryOptions;
}

export default async function getRelatedPosts({ post }: Props) {
  // get snippets
  const snippets = await getSnippetsCollection({
    language: i18next.language as Language,
  });

  // get tutorials
  const tutorials = await getTutorialsCollection({
    language: i18next.language as Language,
  });

  let posts = [...snippets, ...tutorials];

  // exclude current post from posts
  posts = posts.filter(p => p.id != post.id);

  // get related posts specified in the post meta and remove them from posts
  let allRelatedMetaPosts: { collection: string; slug: string }[] = [
    ...(post.data.relatedSnippets ?? []),
    ...(post.data.relatedTutorials ?? []),
  ];
  let relatedPosts: CollectionEntryOptions[] = [];
  if (allRelatedMetaPosts && allRelatedMetaPosts.length > 0) {
    for (let p of allRelatedMetaPosts) {
      let i = posts.findIndex(post => post.slug === p.slug);
      if (i <= -1) continue;

      relatedPosts.push(posts[i]);
      posts.splice(i, 1);
    }
  }

  // find most similar posts based on all the tags present
  let rankedPosts: { id: string; collection: string; rank: number }[] = [];
  for (let i = 0; i < posts.length; i++) {
    rankedPosts.splice(i, 0, {
      id: posts[i].id,
      collection: posts[i].collection,
      rank: getRank({
        originalTags: post.data.tags,
        searchTags: posts[i].data.tags,
      }),
    });
  }

  // sort ranked posts by rank
  rankedPosts = rankedPosts.sort((a, b) => b.rank - a.rank);

  let sortedPostsByRank: CollectionEntryOptions[] = [];
  for (let i = 0; i < rankedPosts.length; i++) {
    const targetPost = posts.find(
      ({ id, collection }) =>
        id === rankedPosts[i].id && collection === rankedPosts[i].collection
    );

    if (targetPost === undefined) continue;

    sortedPostsByRank[i] = targetPost;
  }

  posts = [...relatedPosts, ...sortedPostsByRank];

  return posts.slice(0, 3);
}

function getRank({
  originalTags = [],
  searchTags = [],
}: {
  originalTags: string[];
  searchTags: string[];
}): number {
  const matches = searchTags.filter(t => originalTags.indexOf(t) !== -1);

  return matches.length;
}
