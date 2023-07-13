---
title: Flutter Application Life cycle Management
description: This tutorial helps you to manage your Flutter application when it goes into the background.
authors:
  - en/dane-mackier
published: 2019-08-09
updated: 2019-08-09
postSlug: flutter-application-life-cycle-management
ogImage: /assets/tutorials/022/022.jpg
ogVideo: https://www.youtube.com/embed/NfvA-7-HzYk
featured: false
draft: false
tags:
  - flutter
  - life-cycle
relatedSnippets:
  - en/009-shared-preferences-service
  - en/010-custom-startup-logic
relatedTutorials:
  - en/017-effective-logging-in-flutter
---

Something that's been brought up recently was the question about how to stop services when the app goes into the background. This post will show you how to handle all that in one place in an extendable way. We'll be using the WidgetsBindingObserver to listen to the `AppLifecycleState` and call stop/start on our services. We'll start by creating the Manager and wrapping our app with it. Create a new file called lifecycle_manager.dart

```dart

class LifeCycleManager extends StatefulWidget {
  final Widget child;
  LifeCycleManager({Key key, this.child}) : super(key: key);

  _LifeCycleManagerState createState() => _LifeCycleManagerState();
}

class _LifeCycleManagerState extends State<LifeCycleManager>
    with WidgetsBindingObserver {
  @override
  void initState() {
    WidgetsBinding.instance.addObserver(this);
    super.initState();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    print('state = $state');
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: widget.child,
    );
  }
}
```

Then in the main file we can wrap our `MaterialApp` with the new widget.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return LifeCycleManager(
      child: MaterialApp(
        title: 'Flutter Demo',
        home: HomeView(),
      ),
    );
  }
}
```

If you run this and you minimise your app you'll see the state logs being printed out in the console.

```
state = AppLifecycleState.inactive
state = AppLifecycleState.paused
state = AppLifecycleState.inactive
state = AppLifecycleState.resumed
```

We'll use this to make our decision on what to call on our services. To give the services that's subscribed to streams a common interface we'll create a StoppableService abstract class that these services has to implement. We'll add some functionality to the base class to track if it's been stopped so we can use that to our advantage as well.

```dart
abstract class StoppableService {
  bool _serviceStoped = false;
  bool get serviceStopped => _serviceStoped;

  @mustCallSuper
  void stop() {
    _serviceStoped = true;
  }

  @mustCallSuper
  void start() {
    _serviceStoped = false;
  }
}
```

And an implementation of this will look like this.

```dart
class LocationService extends StoppableService {
  @override
  void start() {
    super.start();
    // start subscription again
  }

  @override
  void stop() {
    super.stop();
    // cancel stream subscription
  }
}
```

We lack the benefits of reflection in Flutter so we'll have to keep track of these services in our LifeCycleManager and loop over them to stop and start them. In the `LifeCycleManager` we'll keep a list of the `StoppableServices` and loop over them in the lifecycle function call.

```dart
class _LifeCycleManagerState extends State<LifeCycleManager>
    with WidgetsBindingObserver {

  List<StoppableService> services = [
    locator<LocationService>(),
  ];

  ...

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    services.forEach((service) {
      if (state == AppLifecycleState.resumed) {
        service.start();
      } else {
        service.stop();
      }
    });
  }
}
```

This can be added into your app now if you're using an architecture like the one I [show off here](/post/flutter-architecture-my-provider-implementation-guide). It gives you a single spot to manage all your services when it comes to cancelling / re-subscribing based on lifecycle events. Checkout some of my other [tutorials](/tutorials) and [snippets](/snippets) here.
