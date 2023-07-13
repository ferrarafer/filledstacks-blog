---
title: Use RxDart in Flutter to synchronize UI
description: Short RxDart and Flutter Guide that shows you how to sync up UI events using Subjects as a MessageBus.
authors:
  - en/dane-mackier
published: 2019-05-07
updated: 2019-05-07
postSlug: use-rx-dart-in-flutter-to-synchronize-ui
ogImage: /assets/snippets/004/004.jpg
featured: false
draft: false
tags:
  - flutter
  - rx-dart
  - stream
  - helpers
relatedTutorials:
  - en/026-stream-basics
---

Let's say you have an app that has a row of buttons. When one of those buttons are tapped you want the tapped one to grow and the rest to shrink. To achieve this functionality we can use a behaviour subject from [RxDart](https://pub.dartlang.org/packages/rxdart) and [get_it](https://pub.dartlang.org/packages/get_it) to get tat subject where it's needed. This functionality can be used when:

- You have a row of buttons that you want to de-activate when one is selected and only have one active
- You have a custom toolbar that you want to react to a new item being selected
- You have multiple UI elements that you want to synchronize in the visible UI to a single event

## Setup

Add the packages to your pubspec

```yaml
    ...

    get_it: ^1.0.3
    rxdart: ^0.21.0

    ...
```

Create a service_locator.dart file in the lib folder.

```dart
import 'package:get_it/get_it.dart';

import 'package:connected_buttons/services/button_messagebus.dart';

GetIt locator = GetIt();

void setupLocator() {
  locator.registerSingleton(ButtonMessagebus());
}

```

Create a new folder called services. Under services create a file called button_message_bus.dart. This "Service" will provide a pipeline where you can place Id's and listen for id's. We'll be using a `BehaviourSubject` from RxDart which will always broadcast the last value on the stream if you subscribe and all emitted values there after. We'll expose the stream as idStream and we'll add a function that we can place ID's onto the stream with. When a button is tapped all it will do is place an id on the stream. Nothing else.

The button will already be registered to listen to the stream so it will react accordingly.

```dart
import 'package:rxdart/rxdart.dart';

class ButtonMessagebus {
  BehaviorSubject<int> _buttonIdSubject = BehaviorSubject<int>.seeded(-1);

  Stream<int> get idStream => _buttonIdSubject.stream;

  void broadcastId(int id) {
    _buttonIdSubject.add(id);
  }
}
```

Create a new folder called widgets. In that folder create a new file called connected_button.dart. It'll be a stateful widget that changes it's width and height depending on the id coming from the stream. If the ID matches we want to grow, else we shrink. We'll use the locator to get our MessageBus and subscribe in the initState function.

```dart
iimport 'dart:async';

import 'package:connected_buttons/services/button_messagebus.dart';
import 'package:flutter/material.dart';
import '../service_locator.dart';

class ConnectedButton extends StatefulWidget {
  final int id;

  ConnectedButton({@required this.id});

  @override
  _ConnectedButtonState createState() => _ConnectedButtonState();
}

class _ConnectedButtonState extends State<ConnectedButton> {
  bool _active = false;
  double _size = 100;

  ButtonMessagebus _messageBus = locator<ButtonMessagebus>();
  StreamSubscription<int> messageSubscription;

  @override
  void initState() {
    // Listen for Id received
    messageSubscription = _messageBus.idStream.listen(_idReceived);
    super.initState();
  }

  void _idReceived(int id) {
     setState(() {
        if (id == widget.id) {
          _active = true;
          _size = 140;
        } else {
          _active = false;
          _size = 100;
        }
      });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        // Broadcast Id
        _messageBus.broadcastId(widget.id);
      },
      child: _buttonUi,
    );
  }

  @override
  void dispose() {
    super.dispose();
    messageSubscription.cancel();
  }

  Widget get _buttonUi => AnimatedContainer(
        curve: Curves.easeIn,
        width: _size,
        height: _size,
        alignment: Alignment.center,
        decoration: BoxDecoration(
            color: Colors.grey[500], borderRadius: BorderRadius.circular(10.0)),
        duration: Duration(milliseconds: 150),
        child: Text(
          'id: ${widget.id} -> ${_active.toString()}',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      );
}
```

The important part of the code above is in the initState function where you subscribe to the id's being emitted. This is where you can perform your custom logic. Lastly, go to the main.dart file setup the locator. Put three or more buttons into the view and click away.

```dart
import 'package:flutter/material.dart';
import 'service_locator.dart';
import './widgets/connected_button.dart';

void main() {
  setupLocator();
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        title: 'Flutter Demo',
        theme: ThemeData(
          primarySwatch: Colors.blue,
        ),
        home: Scaffold(
            backgroundColor: Colors.grey[800],
            body: Column(
              mainAxisSize: MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: <Widget>[
                ConnectedButton(id: 0),
                ConnectedButton(id: 1),
                ConnectedButton(id: 2)
              ],
            )));
  }
}

```

You can listen to the id being broadcast anywhere in your app. All you do is register to the idStream and add your logic you want to run when an id is emitted.

Checkout and subscribe to my [Youtube Channel](https://www.youtube.com/c/filledstacks?sub_confirmation=1). Follow me [on Instagram](https://www.instagram.com/filledstacks/) for snippets and day-to-day programming. Checkout all the [other snippets](/snippets) here. You might find some more Flutter magic.
