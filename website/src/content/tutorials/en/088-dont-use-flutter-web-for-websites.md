---
title: Don't use Flutter Web for Websites
description: Making sure you're using Flutter Web for what it's meant for.
authors:
  - en/dane-mackier
published: 2023-06-30
updated: 2023-06-30
postSlug: don-t-use-flutter-web-for-websites
ogImage: /assets/tutorials/088/thumbnail.jpeg
featured: false
draft: false
tags:
  - flutter-web
---

In this post, I want to make it clear when to choose Flutter Web for your product.

<br>

By understanding the difference between a website and a web application you can ensure you make a decision that benefits you and your team.

<br>

Most people don’t consider what the user’s purpose is when using the app and therefore are judging the Flutter Web framework on the technical specs.

### Flutter Web is terrible for websites, but it’s probably the best tool for web applications.

In this post we’ll dive into:

- The difference between websites and web applications
- Examples of websites and web applications
- A framework to identify which one you’re building

Let’s start at the beginning, understanding the difference between websites and web applications.

## Websites vs Web apps

In the simplest terms, websites share static information that your users can read/watch. The user often can not interact with the information, only consume it. There are no additional intentions or actions for the user besides reading text, looking at images, or watching videos.

<br>

A web app, in the simplest terms, is a web page that allows the user to complete a specific task (not consume static information). The user can create, analyze, distribute, or modify data/media on a web app. Most web applications are tools that users use to help them achieve a piece of a task of a specific task.

<br>

Websites rely on SEO and fast startup times, web apps often have loading screens and require 0 SEO functionality. _Side note, your landing page can be built in a static site framework and your app can live on [app.yourapp.com](http://app.yourapp.com) domain, that way your landing page is indexed and your app has no requirement for SEO / instant loading._

## Examples of websites vs web apps

To make the above clearer, here are examples of what would classify as a website:

- Blogs
- Portfolio
- News site
- Landing page
- Listing sites (property, items for sale, etc)

<br>

As for web apps, it’s easier to give apps that exist:

- Gmail: email clients
- Figma: design tools
- Zapier: automation tooling
- Notion: management software
- Mail Chimp: email marketing tools
- Dropbox: cloud storage interfaces
- Google Docs: document creation apps
- Firebase products: cloud hosting services
- Admin dashboards: back office tooling for products
- Youtube Studio: analytics and content management

Even with this information, it’s not always clear what you’ll be building, to help you make a decision before you start, let's look at a simple framework you can use.

## Identify what you’re building

To make the final decision on your technology here’s a simple framework.

1. Identify the users’ primary action
2. Classify that action into 1 of 2 categories

If the primary action is consuming information that the user can’t manipulate or interact with then you’re building a website.

<br>

If the primary action is completing a task that requires more than just reading/consuming, then you’re building a web app.

<br>

By using this you should know when to avoid Flutter web and when to use it for your software.

<br>

And if you’re going to be building a Flutter web app, you can check out my [Master Flutter Web course](https://masterflutterweb.carrd.co/) where students and teams are learning to build production Flutter web applications.
