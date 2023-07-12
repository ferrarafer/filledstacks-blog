---
title: Run Flutter Web Without The Errors
description: Flutter Web Tutorial. Flutter Web Dev not working? A Guide to run Flutter Web when the intructions are not working.
authors:
  - en/dane-mackier
published: 2019-05-08
updated: 2019-05-08
postSlug: run-flutter-web-without-the-errors
ogImage: /assets/snippets/005/005.jpg
featured: false
draft: false
tags:
  - flutter-web
  - web-development
# friendlyId: snippet-005
---

This morning as I woke up I was extremely excited for the Flutter Announcements that happened overnight (for me). First thing I looked for was [Flutter Web](https://github.com/flutter/flutter_web) which I found 😁

I Followed all the getting started instructions but then ran into some issues. I'm going to detail my issues and how I solved it in hopes that it helps you reading this. I'll go over the setup process and then add the errors in that I received in between.

## The Setup

Here are the steps you have to follow to get Flutter Web running (I'm using windows)

1. Upgrade Flutter to the latest
2. Activate the webdev package
3. Ensure your path points to all the correct directories (3)
4. Clone the webdev repo and run hello world

### Flutter Upgrade

To setup everything we start up upgrading Flutter to make sure we're on a version > 1.5.

```cmd
flutter upgrade
```

### Activate the webdev package

To install the [webdev package](https://pub.dev/packages/webdev), which provides the build tools for Flutter for web, run the following:

```cmd
flutter packages pub global activate webdev
```

### Ensure PATH is correct

This is where I experienced most of the problems. When I followed the steps laid out in the readme of the repo but ran into a few errors. This first one was the webdev command not being recognized. Even though it had all the paths that were mentioned added.

![Flutter Web command error](/assets/snippets/005/005-first-error.jpg)

I was getting this in VS code so I opened a new powershell window and got the same thing. I added two paths to my environment variables

```
C:\src\flutter\.pub-cache\bin
C:\Users\User\AppData\Roaming\Pub\Cache\bin // %APPDATA%\Pub\Cache\bin
```

Then ran the webdev serve command in a new powershell in the hello_world repo. This time I didn't get an error. Instead I got 'dart' not recognized and 'pub' not recognized. So I figured the webdev is executing dart and pub as commands and need the dart-sdk bin in the path (which I didn't have).

So I added

```
C:\src\flutter\bin\cache\dart-sdk\bin
```

To my path as well. Once this was complete I could serve hello_world.

### Clone WebDev and Run Hello World

Clone [this repo](https://github.com/flutter/flutter_web), navigate to examples/hello_world

In the repo run

```cmd
flutter packages upgrade
```

then run

```cmd
webdev serve
```

And that's it. Hopefully no one runs into this.

Checkout and subscribe to my [Youtube Channel](https://www.youtube.com/c/filledstacks?sub_confirmation=1). Follow me [on Instagram](https://www.instagram.com/filledstacks/) for snippets and day-to-day programming. Checkout all the [other snippets](/snippets) here. You might find some more Flutter magic.
