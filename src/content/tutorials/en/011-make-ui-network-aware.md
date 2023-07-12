---
title: Make Your Flutter app Network Aware using Provider and Connectivity Status
description: Flutter tutorial showing how to build network connectivity into your app using Provider and Connectivity Status.
authors:
  - en/dane-mackier
published: 2019-05-24
updated: 2019-05-24
postSlug: make-your-flutter-app-network-aware-using-provider-and-connectivity-status
ogImage: /assets/tutorials/011/011.jpg
ogVideo: https://www.youtube.com/embed/u9O8NOnQi_A
featured: false
draft: false
tags:
  - flutter
  - provider
  - ui
relatedSnippets:
  - en/038-device-information
  - en/010-custom-startup-logic
---

In the parts of the world where I come from, Africa, there's a high chance that some of the users of your app will not have the best network connection at all times. Luckily for me and many others we have fast and reliable internet speeds, but the users of our app might not. If your app relies on a stable connection (like WiFI) it's a good idea to provide feedback in your app when it's not connected to it, or when there's no connection.

# Implementation

I've setup a project with basic UI so I can show how easily it intergates with existing UI. You can [clone the repo here](https://github.com/FilledStacks/flutter-tutorials) and go to folder 011 and open the start project.

The way we're implementing is as follows. We'll create a Service that listens to the connectivityChanged stream provided by the connectivity package. we'll transform the result from it our own enum and emit that over a streamController. This way we are not dependent on the thrid party package outside of our service.

We'll start by adding the required packages

```yaml
connectivity: ^0.4.3+1
provider: ^2.0.1
```

Create the enum we'll be using internally to differentiate our network conditions. Create a new folder called enums and add a file called connectivity_status.dart

```dart
enum ConnectivityStatus {
  WiFi,
  Cellular,
  Offline
}
```

Then create a services folder and in it a new file called connectivity_service.dart. This class will contain a StreamController of type `ConnectivityStatus`. In the constructor we will subscribe to the onConnectivityChanged function from the Connectivity class. We will convert the result it to our internal enum and add that onto our controller.

```dart
import 'dart:async';

import 'package:connectivity/connectivity.dart';
import 'package:network_aware/enums/connectivity_status.dart';

class ConnectivityService {
  // Create our public controller
  StreamController<ConnectivityStatus> connectionStatusController = StreamController<ConnectivityStatus>();

  ConnectivityService() {
    // Subscribe to the connectivity Chanaged Steam
    Connectivity().onConnectivityChanged.listen((ConnectivityResult result) {
      // Use Connectivity() here to gather more info if you need t

      connectionStatusController.add(_getStatusFromResult(result));
    });
  }

  // Convert from the third part enum to our own enum
  ConnectivityStatus _getStatusFromResult(ConnectivityResult result) {
    switch (result) {
      case ConnectivityResult.mobile:
        return ConnectivityStatus.Cellular;
      case ConnectivityResult.wifi:
        return ConnectivityStatus.WiFi;
      case ConnectivityResult.none:
        return ConnectivityStatus.Offline;
      default:
        return ConnectivityStatus.Offline;
    }
  }
}
```

Now we'll use provider to get this value to our widgets in a very nice way. Head over to the main.dart file and wrap your Material app in a stream proivder of type `ConnectivityStatus`. For the builder we'll create a new instance of our ConnectivityService and provide the connectionStatusController.

```dart
@override
Widget build(BuildContext context) {
  return StreamProvider<ConnectivityStatus>(
    builder: (context) => ConnectivityService().connectionStatusController,
    child: MaterialApp(
      title: 'Connectivity Aware UI',
      theme: ThemeData(
          textTheme: Theme.of(context)
              .textTheme
              .apply(bodyColor: Colors.white, displayColor: Colors.white)),
      home: HomeView(),
    ),
  );
}
```

What this allows us to do is access any value from that stream using `Provider.of<ConnectivityStatus>(context)` anywhere in our app. When a new value is emitted this value automatically updates and the widget using it is rebuilt. Much cleaner than managing your stream subscriptions yourself in a stateful widget.

## Network sensitivity

The way we'll implement this is by creating a widget that you can place other widgets in. This widget will provide "Network sensitivity" to any widget it's wrapped around. Create a new widget called NetworkSensitive that extends a stateless widget. Make it take in a Widget child, and a double value (default 0.5) for opacity.

```dart
class NetworkSensitive extends StatelessWidget {
  final Widget child;
  final double opacity;

  NetworkSensitive({
    this.child,
    this.opacity = 0.5,
  });

   @override
  Widget build(BuildContext context) {
    return Container();
  }
}
```

This is how our widget will work. When the connection is on WiFi we'll return the child as it was passed in. When the connection is on Cellular we'll wrap it in an Opacity widget to make it semi-transparent. When there is no connection we'll wrap it in an Opacity widget with a lower opacity. We can wrap it in an IgnorePointer as well, but you'll just have to make sure to give the user feedback some other way when tapped, if needed.

```dart
...

@override
  Widget build(BuildContext context) {
    // Get our connection status from the provider
    var connectionStatus = Provider.of<ConnectivityStatus>(context);

    if (connectionStatus == ConnectivityStatus.WiFi) {
      return child;
    }

    if (connectionStatus == ConnectivityStatus.Cellular) {
      return Opacity(
        opacity: opacity,
        child: child,
      );
    }

    return Opacity(
      opacity: 0.1,
      child: child,
    );
  }

...
```

This takes care of the widget. Now we can go wrap any UI element that we want to be sensitive to the network status. I'll wrap the errorCounter and the UserCounter so we can just see it working. It's just a normal widget so you can wrap anything with it, even your entire scaffold if you'd like.

```dart
...
// Wrap the Error's Stats counter
 child: NetworkSensitive(
      child: StatsCounter(
        size: screenHeight(context,
                dividedBy: 2, decreasedBy: toolbarHeight) -
            CounterMargins, // 60 margins
        count: 13,
        title: 'Errors',
        titleColor: Colors.red,
      ),
    ),
...

// Wrap the  Users counter
...
 NetworkSensitive(
    child: StatsCounter(
      size: screenHeight(context,
              dividedBy: 3, decreasedBy: toolbarHeight) -
          CounterMargins,
      count: 55,
      title: 'Users',
    ),
  ),
...

```

The app will appear as below automatically based on the state of the users connectivity. It changes in real time as you update your device's network connections.

![Connection UI States](/assets/tutorials/011/011-final-ui.jpg)

With this setup you can now get your connectionStatus anywhere in the app by simply using

```dart
var connectionStatus = Provider.of<ConnectivityStatus>(context);
```

So when you're about to perform any logic, check the status and execute a different function based on the status, or just show a dialog. However you want to handle it. Thanks for reading.

Checkout and subscribe to my [Youtube Channel](https://www.youtube.com/c/filledstacks?sub_confirmation=1) for weekly tutorials. Follow me [on Instagram](https://www.instagram.com/filledstacks/) for snippets and day-to-day programming. Checkout all the [other tutorials](/tutorials) here.I release weekly guides and tutorials.
