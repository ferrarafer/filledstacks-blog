---
title: Flutter Navigation Cheatsheet - A Guide to the Navigator
description: A simple guide that covers all the navigation scenarios encountered when building apps on Flutter.
authors:
  - en/dane-mackier
published: 2019-04-07
updated: 2019-04-07
postSlug: flutter-navigation-cheatsheet-a-guide-to-the-navigator
ogImage: /assets/tutorials/005/005.jpg
ogVideo: https://www.youtube.com/embed/DlArCl8jvlo
featured: false
draft: false
tags:
  - flutter
  - navigation
---

A simple guide that covers all the navigation scenarios encountered when building apps on Flutter

As a recently active member answering questions on Stackoverflow’s Flutter tag I see and answer similar questions often. I’m going to be creating a series of posts and videos that will serve as a guide to the basic scenarios that doesn’t always have a clear answer anywhere. I’ve answered 2 questions about this situation and I see one every 2 weeks or so. There’s ([This one](https://stackoverflow.com/questions/48644903/flutter-call-back-to-originating-widget-on-back-button/55546551#55546551)) and ([This one](https://stackoverflow.com/questions/54971988/how-to-intercept-back-button-in-appbar-in-flutter/54972427#54972427)). _**This is not a comprehensive guide to navigation, it should serve more as a cheatsheet for common scenarios people struggle with, there’s no named route navigation in here.**_

The [tutorial guide](https://youtu.be/DlArCl8jvlo) that shows how you can use this cheatsheet to cover all realworld navigation situations.

Here are the points that we’ll cover.

1. Navigate to a different page
2. Navigate back from a page programatically
3. Get a result after a page is closed
4. Override the back button on a page

The code for this example can be found in [this repo](https://github.com/FilledStacks/flutter-tutorials) under 005-navigation

## Navigate to a different page

Flutter provides us with a Navigator that we have access to. You provide it with your current BuildContext and ask it to perform some navigations.

```dart
Navigator.push(context, new MaterialPageRoute(
  builder: (context) => Page2()
));
```

This will push page2 onto your navigation stack.

## Navigate back from a page programatically

To remove the current page from the stack you can use the pop call on the navigator.

```dart

// Removes the current view
Navigator.pop(context);
```

## Get result after a page is closed

In one of the questions that I answered the dev wanted to know how to re-run a function on the calling page (The page where the navigation came from) when the newly pushed page is closed.

Luckily for us the Navigator calls are all Futures, so we can await a result from them. The way we return a result is by passing a value to the .pop method. So how you handle this is

1. await on your navigation call
2. Pass value to the .pop function
3. When await completes check your value matches the value passed in 2

```dart
 // In your calling widget where you want to navigate from, await your navigation result
 var navigationResult = await Navigator.push(
        context, new MaterialPageRoute(builder: (context) => Page2()));

 // Check your navigation result
 if(navigationResult == 'my_value') {
  print('I have received results from the navigation');
 }

 // Where you perform your pop call
 Navigator.pop(context, 'my_value');
```

#Override the back button on a page
If you don’t want the back button to navigate away from your current view you can use a widget called WillPopScope. Surround your scaffold widget with it, and return a false value to the onWillPop call. False tells the system they don’t have to handle the scope pop call.

**Note**: _You should not surround your entire app with this (Material App). You should be using this per page widget that you want the functionality to run on. **Surround your Scaffold for your page.**_

```dart
@override
Widget build(BuildContext context) {
  return WillPopScope(
    onWillPop: () => Future.value(false),
    child: Scaffold(
      body: Container(
        child: Center(
          child: Text('Page 2',
              style: TextStyle(fontSize: 30.0, fontWeight: FontWeight.bold)),
        ),
      ),
    ),
  );
}
```

If you to still want to return a custom value when the app navigates back you can perform the pop call before you return false.

```dart
WillPopScope(
      onWillPop: () async {
          // You can await in the calling widget for my_value and handle when complete.
          Navigator.pop(context, 'my_value');
          return false;
        },
        ...
);
```

With these few pieces of code I was able to do everything that I’ve required in terms of navigation while building an app. The [video is also out](https://youtu.be/DlArCl8jvlo) that guides you through using this cheat sheet.

Thanks for reading.
