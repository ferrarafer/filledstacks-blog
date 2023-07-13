---
title: Better Animation When Keyboard Opens
description: This Flutter tutorial shows you how to listen to keyboard appearance and animate your widgets based on it.
authors:
  - en/dane-mackier
published: 2019-06-13
updated: 2019-06-13
postSlug: better-animation-when-keyboard-opens
ogImage: /assets/snippets/027/027.jpg
featured: false
draft: false
tags:
  - flutter
  - foundation
# friendlyId: snippet-027
---

In this tutorial we'll go over listening to the keyboard visibility and giving your view a smoother transition when it shows up. We'll use the keyboard_visibility package to listen for the visibility and the AnimatedContainer to animate our view's UI.

## Listening to the keyboard

We'll start by adding the package to the pubspec

```yaml
keyboard_visibility: ^0.5.6
```

We'll have a simple setup. Our MyApp widget will show a HomeView as the home of the MaterialApp. The HomeView will be a stateful widget.

```dart
class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      home: HomeView(),
    );
  }
}

class HomeView extends StatefulWidget {
  const HomeView({Key key}) : super(key: key);

  @override
  _HomeViewState createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  @override
  Widget build(BuildContext context) {
    return Scaffold();
  }
}
```

In the initState function we'll listen for the keyboard visibility.

```dart
 @override
  void initState() {
    KeyboardVisibilityNotification().addNewListener(
      onChange: (bool visible) {
        print('keyboard $visible');
      },
    );

    super.initState();
  }
```

## Animating the UI

Lets say we have a UI where the text field is in the center of the screen. When we tap it we want it to go to the top. For this we'll use an animated container as our root widget and set the alignment to top center when the keyboard shows. Lets first make our UI. Make your build widget look like this.

```dart
 @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AnimatedContainer(
        curve: Curves.easeOut,
        duration: Duration(
          milliseconds: 400,
        ),
        width: double.infinity,
        height: double.infinity,
        padding: const EdgeInsets.all(20),
        alignment: Alignment.center,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Text(
              'Let\'s start your search',
              style: TextStyle(fontSize: 30),
            ),
            TextField(
              decoration: InputDecoration(
                  hasFloatingPlaceholder: true, hintText: 'Enter things here'),
            )
          ],
        ),
      ),
    );
```

That should give you a title and text field in the center of your screen. Next lets do the animation, we'll start by keeping the alignment value as a class variable and changing it's value in the setState.

```dart
// Add variable to top of class
Alignment childAlignment = Alignment.center;

@override
void initState() {
  KeyboardVisibilityNotification().addNewListener(
    onChange: (bool visible) {
      // Add state updating code
      setState(() {
        childAlignment = visible ? Alignment.topCenter : Alignment.center;
      });
    },
  );

  super.initState();
}

// Updated animated container alignment property
...
AnimatedContainer(
  curve: Curves.easeOut,
  duration: Duration(
    milliseconds: 400,
  ),
  width: double.infinity,
  height: double.infinity,
  padding: const EdgeInsets.all(20),
  alignment: childAlignment, // <=== Make sure to use childAlignment here
  child: Column(...),
);

```

When you tap on the input field now you'll see the column animating to the top of the screen in a much smoother fashion than the usual keyboard jump.

Check out some of the other [snippets](/snippets) to get some more Flutter knowledge.
