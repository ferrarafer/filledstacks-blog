import { localizePath } from "astro-i18next";
import { SITE } from "@config";
import getTutorialsCollection from "@utils/getTutorialsCollection";
import i18next, { t, changeLanguage } from "i18next";
import rss from "@astrojs/rss";
import slugify from "@utils/slugify";
import type { Language } from "@types";

changeLanguage("en");

export async function get() {
  const posts = await getTutorialsCollection({
    language: i18next.language as Language,
    draft: false,
  });

  return rss({
    title: SITE.title,
    description: SITE.desc,
    site: SITE.website,
    items: posts.map(({ data }) => ({
      link: localizePath(`/post/${slugify(data)}`, i18next.language),
      title: data.title,
      description: data.description,
      pubDate: new Date(data.published),
    })),
  });
}
