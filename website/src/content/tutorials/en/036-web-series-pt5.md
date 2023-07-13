---
title: Flutter Web Hover and Mouse Cursor
description: In this tutorial we will be adding the basic hover functionality found on most websites.
authors:
  - en/dane-mackier
published: 2019-12-06
updated: 2019-12-06
postSlug: flutter-web-hover-and-mouse-cursor
ogImage: /assets/tutorials/036/036.jpg
ogVideo: https://www.youtube.com/embed/VABcKZLpvyg
featured: false
draft: false
tags:
  - flutter-web
  - ui
  - api
  - web-development
# codeUrl: https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F036%2F00-starting.zip?alt=media&token=81f753d3-979b-4474-854a-0d508d283ea4
# sponsorBanner: 'https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/stacked-800-200.jpg?alt=media&token=b085fcaf-45da-4e72-b726-5bd1b7203a55'
# sponsorUrl: 'https://stacked.filledstacks.com/'
---

In this tutorial we will be covering two of the most popular feedback mechanisms in Web Development and Design.

1. Changing the cursor to a pointer when over a clickable item
2. Changing the state of an item being hovered over

This tutorial will make use of [the code from the last part](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F036%2F00-starting.zip?alt=media&token=81f753d3-979b-4474-854a-0d508d283ea4) which you can download here. If you want to add this to your own Flutter web project then make sure you're on the master channel. You can switch by running to following commands

```
flutter channel master
flutter doctor
```

This will trigger the Dart and Flutter SDK downloads that you'll need to follow along. You can also check out the [Create a Flutter Web Project section](https://www.filledstacks.com/post/create-and-deploy-a-flutter-web-app/#create-a-flutter-web-project) in part 1 and come back here.

## Change cursor to pointer

To implement this we'll use dart extensions to make it easier to add into our code base.

### Implementation

Under the lib folder create a new folder called extensions and inside create a file called hover_extensions.dart.

```dart
import 'package:flutter/material.dart';
import 'dart:html' as html;

extension HoverExtensions on Widget {
  // Get a regerence to the body of the view
  static final appContainer =
      html.window.document.getElementById('app-container');

  Widget get showCursorOnHover {
    return MouseRegion(
      child: this,
      // When the mouse enters the widget set the cursor to pointer
      onHover: (event) {
        appContainer.style.cursor = 'pointer';
      },
      // When it exits set it back to default
      onExit: (event) {
        appContainer.style.cursor = 'default';
      },
    );
  }
}
```

First thing we do is get a reference to the body, which should have an id of app-container. Open up the index.html in the web folder and set the id of the body to app-container.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>the_basics</title>
  </head>
  <body id="app-container">
    <script src="main.dart.js" type="application/javascript"></script>
  </body>
</html>
```

The last thing to do is update your dart version in your pubspec.yaml to bigger than 2.6.0

```yaml
sdk: ">=2.6.0 <3.0.0"
```

### Usage

Extensions help a lot with certain kinds of nesting situations. To add this hover functionality to a widget you simply import the extensions and then call `.showCursorOnHover` on the widget. Head over to the navbar_item.dart and import the extension and add it to the end of the `ScreenTypeLayout`.

```dart
import 'package:the_basics/extensions/hover_extensions.dart';

class NavBarItem extends StatelessWidget {
  ...
  @override
  Widget build(BuildContext context) {
    ...
    return GestureDetector(
      child: Provider.value(
        value: model,
        child: ScreenTypeLayout(
          tablet: NavBarItemTabletDesktop(),
          mobile: NavBarItemMobile(),
        ).showCursorOnHover,
      ),
    );
  }
}
```

That's it. If you run the code now and hover over your navbar items you'll see the mouse cursor changing. We'll also add it to the Call to Action button as well as our Episode list items. Open up call_to_action.dart and add the `.showCursorOnHover` call.

```dart
import 'package:the_basics/extensions/hover_extensions.dart';

class CallToAction extends StatelessWidget {
  ...
  @override
  Widget build(BuildContext context) {
    return ScreenTypeLayout(
      mobile: CallToActionMobile(title),
      tablet: CallToActionTabletDesktop(title),
    ).showCursorOnHover;
  }
}
```

Next, Open up the episode_item.dart file and add the same code to the end of the `Card` widget.

## Changing state of UI on Hover

For this tutorial I will be doing a specific UI state change on hover. You can see it on the FilledStacks website as well. When a mouse pointer is over an item I like the effect of it translating up by a few pixels and then coming back down. That's what we'll implement. I'll be showing you a pattern using extensions as well that will allow you to build a library for your specific app (or for the community, wink wink) that can easily be used for web development. We'll start by creating the widget that will do the animation for us. Under the widgets folder create a new file called translate_on_hover.dart

```dart
import 'package:flutter/material.dart';

class TranslateOnHover extends StatefulWidget {
  final Widget child;
  // You can also pass the translation in here if you want to
  TranslateOnHover({Key key, this.child}) : super(key: key);

  @override
  _TranslateOnHoverState createState() => _TranslateOnHoverState();
}

class _TranslateOnHoverState extends State<TranslateOnHover> {
  final nonHoverTransform = Matrix4.identity()..translate(0, 0, 0);
  final hoverTransform = Matrix4.identity()..translate(0, -10, 0);

  bool _hovering = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (e) => _mouseEnter(true),
      onExit: (e) => _mouseEnter(false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        child: widget.child,
        transform: _hovering ? hoverTransform : nonHoverTransform,
      ),
    );
  }

  void _mouseEnter(bool hover) {
    setState(() {
      _hovering = hover;
    });
  }
}

```

We make use of the `MouseRegion` again to determine when the pointer has entered the bounds of our widget, we do this by calling `_mouseEnter`. In this function we set the `_hovering` state to either true or false causing a rebuild of our widget. We then wrap the child that we pass in with an `AnimatedContainer` with a duration of 200 ms. When the hovering state changes we change the transform, one that is translated by nothing (nonHoverState) and when hovering we set it to a transform that's moved up by 10 logic units.

Next up we want to turn this into an extension so that it's easier to reuse without constantly having to nest widgets. Go to the hover_extensions.dart file and add another extension.

```dart
  Widget get moveUpOnHover {
    return TranslateOnHover(
      child: this,
    );
  }
```

That's it. Now head over to the call_to_action.dart and add the moveUpOnHover call after the showCursorOnHover.

```dart
class CallToAction extends StatelessWidget {
  ...
  @override
  Widget build(BuildContext context) {
    return ScreenTypeLayout(
      mobile: CallToActionMobile(title),
      tablet: CallToActionTabletDesktop(title),
    ).showCursorOnHover.moveUpOnHover;
  }
}

```

That's it. Now you can go through the code and add it to any that you want to move up when hovering over it :) Easy peasy. I hope you found value in this, I'm planning to work on a little package where I will keep all my helper web extensions for some of the basic functionalities like this. There are some additional more advanced builders I'd like to create for hover functionality but that will have to wait.

Thanks for reading, see you next week :)
