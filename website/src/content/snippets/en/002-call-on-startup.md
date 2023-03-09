---
title: How to call a function on start in Flutter stateless widgets
description: Ever wondered how you would call an async function on start in Flutter from a stateless widget? Well here you go.
authors:
  - en/dane-mackier
published: 2019-05-02
updated: 2019-05-02
postSlug: how-to-call-a-function-on-start-in-flutter-stateless-widgets
ogImage: /assets/snippets/002/002.jpg
featured: false
draft: false
tags:
  - flutter
  - foundation
  - helpers
relatedSnippets:
  - en/010-custom-startup-logic
---

One of the most common scenarios in Mobile development is calling an async function when a new view is shown. In Flutter this can be done using a stateful widget and calling your code in the `initState` function.

```dart
class Example extends StatefulWidget {
  Example({Key key}) : super(key: key);

  _ExampleState createState() => _ExampleState();
}

class _ExampleState extends State<Example> {

  @override
  void initState() {
    _getThingsOnStartup().then((value){
      print('Async done');
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Container();
  }

  Future _getThingsOnStartup() async {
    await Future.delayed(Duration(seconds: 2));
  }
}
```

What if you want to call it from a stateless widget? Well, that's possible too. Use a stateful widget as a your root widget that you can provide a callback function too to execute your startup logic. See example below.

Create a StatefulWrapper that takes in a function to call and a child to display.

```dart
/// Wrapper for stateful functionality to provide onInit calls in stateles widget
class StatefulWrapper extends StatefulWidget {
  final Function onInit;
  final Widget child;

  const StatefulWrapper({@required this.onInit, @required this.child});

  @override
  _StatefulWrapperState createState() => _StatefulWrapperState();
}

class _StatefulWrapperState extends State<StatefulWrapper> {

@override
  void initState() {
    if(widget.onInit != null) {
      widget.onInit();
    }
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
```

Wrap your stateles widget's UI in a StatefulWrapper and pass on the onInit logic you would like to run

```dart
class StartupCaller extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return StatefulWrapper(
      onInit: () {
        _getThingsOnStartup().then((value) {
          print('Async done');
        });
      },
      child: Container(),
    );
  }

  Future _getThingsOnStartup() async {
    await Future.delayed(Duration(seconds: 2));
  }
}
```

and that's it. The function will only be called once when the stateful widget is initialized.

Checkout and subscribe to my [Youtube Channel](https://www.youtube.com/c/filledstacks?sub_confirmation=1). Follow me [on Instagram](https://www.instagram.com/filledstacks/) for snippets and day-to-day programming. Checkout all the [other snippets](/snippets) here. You might find some more Flutter magic.
