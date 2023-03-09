---
title: Code push for Flutter is finally here
description: An introduction and guide on using the new Flutter code push capabilities.
authors:
  - en/dane-mackier
published: 2023-06-23
updated: 2023-06-23
postSlug: code-push-for-flutter-is-finally-here
ogImage: /assets/tutorials/087/thumbnail.jpeg
# ogVideo: https://www.youtube.com/embed/j24ctnLxi_o
featured: false
draft: false
tags:
  - shorebird
# friendlyId: shorebird-1
---

I’d like to share the greatest hidden tool in the Flutter ecosystem, Code push for Flutter.</br>

<br>

This means that we, as Flutter developers, can now instantly update apps in production without having to push a new build to the store.

<br>

It’s what I called a hidden super power for every Flutter developer.

<br>

![LinkedIn post about shorebird](/assets/tutorials/087/1.png)

## No more 2 day waiting for builds to be approved. It’s now instant.

In this post I’d like to:

- Introduce you to the project
- Showcase how it works

## Introduction

Shorebird is a code push for Flutter. It’s a cloud service that allows developers to push app updates directly to users' devices.

It’s easy to integrate, works with any dart code and supports Android ([iOS coming in July](https://twitter.com/shorebirddev/status/1666583390110507008?s=20)).

### Team

If you think this is some side project, think again, the team is absolutely stacked! It’s built by the founder of Flutter, [Eric Seidel](https://twitter.com/_eseidel) who is working with [Felix Angelov](https://twitter.com/felangelov), the creator of the bloc library and mason, and last but not least Bryan Oltman, former architecture-lead at google in Flutter’s enterprise team. This product is a game changer for production teams, agencies and freelancers.

## A quick showcase

### Install shorebird cli

Everything is done through the CLI, there’s no web interface yet. To install it we’ll use curl.

```
curl --proto '=https' --tlsv1.2 https://raw.githubusercontent.com/shorebirdtech/install/main/install.sh -sSf | bash
```

When it completes run

```
shorebird
```

You should see the output for all the commands and a helpful set of information.

### Create shorebird account

Next thing to do is to create an account.

```
shorebird account create
```

This will open a google sign in form in your default browser and when you complete it’ll save your credentials to the path you provided.

### Initialize shorebird in your project

Shorebird has no free plan (yet 😉) so if you want to try this out you’ll have to upgrade to a paid account of $20 / month. It’s absolutely worth it. Saving multiple days of waiting for $20 is absolutely worth it. To upgrade run the following.

```
shorebird account subscribe
```

Then you can initialize your project

```
shorebird init
```

You have to provide your apps package name (how Shorebird will refer to the app). When completed it will add a new file `shorebird.yaml` and add an entry to include that in your `pubspec.yaml`

### Quick Shorebird config overview

Your yaml will look something like this

```

# This file is used to configure the Shorebird updater used by your application.
# Learn more at https://shorebird.dev
# This file should be checked into version control.

# This is the unique identifier assigned to your app.
# It is used by your app to request the correct patches from Shorebird servers.
app_id: 8c846e87-1461-4b09-8708-170d78331aca

```

Another other cool thing, if you have flavors it’ll create different profiles for your Shorebird app automatically which you can push instantly as well. Say goodbye to CI/CD minutes simply to get releases to your QA team 👏

### Run the app

Shorebird has a forked version of the Flutter engine that adds code push functionality. It’s not a replacement for Flutter, but rather a replacement for the Flutter engine. Because of this, instead of doing the normal

```
flutter run --release
```

We will instead do

```
shorebird run
```

### Create a shorebird release and push

The last step is to create the release with the updated code. _This can only be done if you ran the app with shorebird and not pure flutter._

```
shorebird release android
```

This will then ask you for your version number and once entered will push your release.

<br>

![Shorebird successful upload image](/assets/tutorials/087/2.png)

<br>

This is one of the most exciting updates to Flutter that I’ve experienced since starting as a Flutter developer.

<br>

I will be following the progress of this tool closely and will be sharing more detailed tutorials in the future as new functionality gets added.

<br>

Make sure to [subscribe so](https://filledstacks.substack.com/) you don't miss any posts
