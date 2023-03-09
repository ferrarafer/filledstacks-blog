import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

export function remarkReadingTime() {
  return function (tree, { data, file }) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    data.astro.frontmatter.minutes = Math.ceil(readingTime.minutes.toFixed(2));
    data.astro.frontmatter.words = readingTime.words;
  };
}