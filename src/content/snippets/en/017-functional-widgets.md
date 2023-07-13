---
title: Create Functional Widgets in Flutter to Reduce Boilerplate
description: This Flutter tutorial shows you how to use the functional_widget package to write more compact stateless widgets.
authors:
  - en/dane-mackier
published: 2019-05-28
updated: 2019-05-28
postSlug: create-functional-widgets-in-flutter-to-reduce-boilerplate
ogImage: /assets/snippets/017/017.jpg
featured: false
draft: false
tags:
  - flutter
# friendlyId: snippet-017
---

In this tutorial we'll be turning normal Widget returning functions into complete stateless widgets through the power of the functional_widget code generator.

We know by now that StatelessWidgets are preferred over function because of all benefits.

- Performance optimization
- Integrated widget inspector
- Can Define Keys
- Gets it's own context

Just to name a few. But, sometimes we still use functions because "We're just grouping some widgets together, and it's faster and easier to make". I mean, writing this

```dart

Widget headerSection(String title, String name) => Column(
  children:[
    Text(title),
    Text('All posts from $name')
  ]);

```

is much shorter than this

```dart
class HeaderSection extends StatelessWidget {
  final String title;
  final String name;

  const HeaderSection({Key key, this.title, this.name}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Text(title),
      Text('All posts from $name'),
    ]);
  }
}
```

I write functions to group things, even when I know it's the wrong thing to do. It just looks better and it's easy to write. A poor excuse to write less performant code, I know 🙄

## Implementation

`functional_widget_annotation` provides you with the abilities to annotate your functions that return Widgets, which then tells functional_widget to generate your stateless widget code for you. We need two packages for this to work. In the pubspec add the following packages under the appropriate places.

```yaml
dependencies:
  functional_widget_annotation: ^0.5.0

dev_dependencies:
  functional_widget: ^0.6.0
  build_runner: ^1.3.1
```

Then to run the generator, you will use the build_runner

```
flutter pub pub run build_runner watch
```

This will watch the source folder and generate the new widgets whenever anything changes. Let's create an example with a home view, a header widget that takes in two strings and a decoratedContainer widget that shows a fancy container. The way this works is that it generate the Stateless widget code for you based on the function that you decorated. The function MUST return a widget, and the file must be partial to [filename].g.dart. We'll set `part main.g.dart`. The .g.dart file contains all the generated widget code, you can look through it, I won't post it in here. It's normal Stateless widget code.

```dart

// Import packages for functional widget to work
import 'package:flutter/foundation.dart';
import 'package:functional_widget_annotation/functional_widget_annotation.dart';

// include the partial generated file
part 'main.g.dart';

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(home: HomeView('Home view Title'));
  }
}

@widget
Widget homeView(String title) => Scaffold(
        body: Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            HeaderSection(title, 'FilledStacks'),
            const DecoratedContainer(),
        ]),
    ));

@widget
Widget headerSection(String title, String name) => Column(children: [
      Text(title),
      Text('All posts from $name'),
    ]);

@widget
Widget decoratedContainer() => Container(
      width: 100,
      height: 100,
      decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10.0),
          color: Colors.red,
          boxShadow: [
            BoxShadow(color: Colors.red, blurRadius: 16.0),
          ]),
    );

```

Each function generates a stateless widget making the function name the class name starting with an uppercase letter. So when referring to the widget you use the Uppercase name instead of the actual declared function name. For example

```dart

@widget
Widget myCustomWidget() => Container();

// will be used as

MyCustomWidget();

```

If you're not impressed or excited about this then you probably have not built 10 widgets for a single view 😅 It's a life saver. I'll be using this going forward. Especially for widgets that are used only in one view.

Checkout and subscribe to my [Youtube Channel](https://www.youtube.com/c/filledstacks?sub_confirmation=1) for weekly tutorials. Follow me [on Instagram](https://www.instagram.com/filledstacks/) for snippets and day-to-day programming. Checkout all the [other snippets](/snippets) here. You might find some more Flutter magic.
