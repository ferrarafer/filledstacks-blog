---
title: Easy SignIn button styling with Flutter SignIn
description: This is a guide that shows all the Social button styles available to us.
authors:
  - en/dane-mackier
published: 2019-06-20
updated: 2019-06-20
postSlug: easy-sign-in-button-styling-with-flutter-sign-in
ogImage: /assets/snippets/031/031.jpg
featured: false
draft: false
tags:
  - flutter
  - ui
# friendlyId: snippet-031
---

Instead of styling your own sign in / sign up buttons when developing you can use the [flutter_signin_button](https://pub.dev/packages/flutter_signin_button) package to speed up your development. This post will show you the buttons available as well as the styling options.

### Installation

To get this to work you have to install the signin_button package as well as font Awesome. Add this to your pubspec

```yaml
flutter_signin_button: ^0.2.8
font_awesome_flutter: ^8.4.0
```

### Usage

To show how to use this we'll just show a scaffold in the MaterialApp as the body.

```dart
class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        title: 'Flutter Demo',
        home: Scaffold(
          body: Container(
            width: double.infinity,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
              ],
            ),
          ),
        ));
  }
}

```

We'll make use of the buttons and adjust their styling. Here are all the button types that can be used.

```dart
enum Buttons {
  Email,
  Google,
  Facebook,
  GitHub,
  LinkedIn,
  Pinterest,
  Tumblr,
  Twitter
}
```

To use a button all you do is construct the widget and give it a type and an onPressed.

```dart
 children: <Widget>[
  SignInButton(
    Buttons.Google,
    onPressed: () {},
  ),
],
```

You can also set the button to mini (See facebook in the header image)

```dart
 SignInButton(
    Buttons.Facebook,
    onPressed: () {},
    mini: true,
  ),

```

And when not in mini mode you can also update the text you want to show. (See twitter in the header)

```dart
SignInButton(
    Buttons.Twitter,
    onPressed: () {},
    text: "Follow FilledStacks on Twitter",
  ),
```

Check out some of the other [snippets](/snippets) here.
