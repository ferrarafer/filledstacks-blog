import type { CollectionEntry } from "astro:content";

export type SocialObjects = {
  name: SocialMedia;
  href: string;
  active: boolean;
  linkTitle: string;
}[];

export type SocialIcons = {
  [social in SocialMedia]: string;
};

export type SocialMedia =
  | "Github"
  | "Facebook"
  | "Instagram"
  | "LinkedIn"
  | "Mail"
  | "Twitter"
  | "Twitch"
  | "YouTube"
  | "WhatsApp"
  | "Snapchat"
  | "Pinterest"
  | "TikTok"
  | "CodePen"
  | "Discord"
  | "GitLab"
  | "Reddit"
  | "Skype"
  | "Steam"
  | "Telegram"
  | "Mastodon";

export type NavigationItem =
  | "tutorials"
  | "tutorial"
  | "snippets"
  | "snippet"
  | "tags"
  | "search"
  | "about";

export type Language = "en" | "es";

export type CollectionEntryOptions =
  | CollectionEntry<"snippets">
  | CollectionEntry<"tutorials">;
