# FilledStacks Webapp 📄

![FilledStacks](public/filledstacks-og.png)
![Typescript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![GitHub](https://img.shields.io/github/license/satnaing/astro-paper?color=%232F3741&style=for-the-badge)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white&style=for-the-badge)](https://conventionalcommits.org)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=for-the-badge)](http://commitizen.github.io/cz-cli/)

## 🚀 Project Structure

```bash
/
├── public/
│   ├── assets/
│   │   └── authors/
│   │   │   └── dane-mackier.png
│   │   │   └── fernando-ferrara.png
│   │   └── snippets/
│   │   │   └── 001/
│   │   │   │   └── 001.jpg
│   │   │   └── [snippet]/
│   │   └── tutorials/
│   │   │   └── 001/
│   │   │   │   └── 001.jpg
│   │   │   └── [tutorial]/
│   │   └── logo.svg
│   │   └── logo.png
│   ├── locales/
│   │   └── en/
│   │   │   └── translation.json
│   │   └── es/
│   │   │   └── translation.json
│   └── favicon.svg
│   └── filledstacks-og.png
│   └── robots.txt
│   └── toggle-theme.js
├── src/
│   ├── assets/
│   │   └── socialIcons.ts
│   ├── components/
│   ├── content/
│   │   └── authors/
│   │   │   └── en/
│   │   │   │   └── dane-mackier.json
│   │   │   │   └── fernando-ferrara.json
│   │   │   │   └── [author].json
│   │   │   └── es/
│   │   │   │   └── dane-mackier.json
│   │   │   │   └── fernando-ferrara.json
│   │   │   │   └── [author].json
│   │   └── newsletter/
│   │   └── snippets/
│   │   │   └── en/
│   │   │   │   └── 001-svelte-looks-good.md
│   │   │   │   └── [snippet].md
│   │   │   └── es/
│   │   │   │   └── 001-svelte-looks-good.md
│   │   │   │   └── [snippet].md
│   │   └── tutorials/
│   │   │   └── en/
│   │   │   │   └── 001-flutter-tiktok.md
│   │   │   │   └── [tutorial].md
│   │   │   └── es/
│   │   │   │   └── 001-flutter-tiktok.md
│   │   │   │   └── [tutorial].md
│   │   └── _schemas.ts
│   │   └── config.ts
│   ├── layouts/
│   └── pages/
│   └── styles/
│   └── utils/
│   └── config.ts
│   └── types.ts
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

Any static assets, like images, can be placed in the `public/` directory.

All collections are stored in `src/content` directory.

## 📖 Documentation

- [Configuration](/wiki/configuration.md)
- [Add Author to Authors Collection](/wiki/add-author-to-collection.md)
- [Add Snippet to Snippets Collection](/wiki/add-snippet-to-collection.md)
- [Add Tutorial to Tutorials Collection](/wiki/add-tutorial-to-collection.md)

## 💻 Tech Stack

**Main Framework** - [Astro](https://astro.build/)  
**Type Checking** - [TypeScript](https://www.typescriptlang.org/)  
**Component Framework** - [ReactJS](https://reactjs.org/)  
**Styling** - [TailwindCSS](https://tailwindcss.com/)  
**UI/UX** - [Figma](https://figma.com)  
**Fuzzy Search** - [FuseJS](https://fusejs.io/)  
**Icons** - [Boxicons](https://boxicons.com/) | [Tablers](https://tabler-icons.io/)  
**Code Formatting** - [Prettier](https://prettier.io/)  
**Linting** - [ESLint](https://eslint.org)

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                                                                                                           |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `npm install`          | Installs dependencies                                                                                                            |
| `npm run dev`          | Starts local dev server at `localhost:3000`                                                                                      |
| `npm run build`        | Build your production site to `./dist/`                                                                                          |
| `npm run preview`      | Preview your build locally, before deploying                                                                                     |
| `npm run format:check` | Check code format with Prettier                                                                                                  |
| `npm run format`       | Format codes with Prettier                                                                                                       |
| `npm run sync`         | Generates TypeScript types for all Astro modules. [Learn more](https://docs.astro.build/en/reference/cli-reference/#astro-sync). |
| `npm run cz`           | Commit code changes with commitizen                                                                                              |
| `npm run lint`         | Lint with ESLint                                                                                                                 |

## ✨ Feedback & Suggestions

If you have any suggestions/feedback, you can contact me via [my email](mailto:dane@filledstacks.com). Alternatively, feel free to open an issue if you find bugs or want to request new features.

## 📜 License

Licensed under the MIT License, Copyright © 2023

---

Made with 💜 by [FilledStacks](https://filledstacks.com) 👨🏻‍💻
