import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import astroI18next from "astro-i18next";
import { remarkReadingTime } from "./remark-reading-time.mjs";

export default defineConfig({
  site: "https://filledstacks-blog.web.app/",
  integrations: [
    tailwind({
      config: {
        applyBaseStyles: false,
      },
    }),
    react(),
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: {
          en: "en",
          es: "es",
        },
      },
    }),
    astroI18next(),
  ],
  markdown: {
    remarkPlugins: [
      remarkToc,
      [
        remarkCollapse,
        {
          test: "Table of contents",
        },
      ],
      remarkReadingTime,
    ],
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true,
    },
    extendDefaultPlugins: true,
  },
});
