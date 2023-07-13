import { localizePath } from "astro-i18next";
import { SITE } from "@config";
import getSnippetsCollection from "@utils/getSnippetsCollection";
import i18next, { t, changeLanguage } from "i18next";
import rss from "@astrojs/rss";
import slugify from "@utils/slugify";
import type { Language } from "@types";

changeLanguage("en");

export async function get() {
  const posts = await getSnippetsCollection({
    language: i18next.language as Language,
    draft: false,
  });

  return rss({
    title: `${SITE.title} | ${t("snippets.title")}`,
    description: t("snippets.description"),
    site: `${SITE.website}/snippets`,
    items: posts.map(({ data }) => ({
      link: localizePath(`/snippet/${slugify(data)}`, i18next.language),
      title: data.title,
      description: data.description,
      pubDate: new Date(data.published),
    })),
  });
}
