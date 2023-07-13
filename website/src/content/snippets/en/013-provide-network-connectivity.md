---
title: Providing Network Status Through Provider in Flutter
description: This tutorial shows you how to get the device's network status in Flutter and provde it anywhere in your code.
authors:
  - en/dane-mackier
published: 2019-05-22
updated: 2019-05-22
postSlug: providing-network-status-through-provider-in-flutter
ogImage: /assets/snippets/013/013.jpg
featured: false
draft: true
tags:
  - flutter
  - provider
# friendlyId: snippet-013
---

If your app depends on a stable connection, then it's a good idea to provide feedback in your app on the connection status. There's two ways of doing this, you can do the check before the request is made or you can update your UI in real-time to reflect your network status. In this tutorial I will show you how to provide a network status stream for your widgets to consume.

We'll be using the provider package. Check out the [full architecture guide](/post/flutter-architecture-my-provider-implementation-guide).

## Implementation Overview

We will use the [connectivity package](https://pub.dev/packages/connectivity) to provide a stream through the StreamProvider and we will consume it within our widgets and disable or change their state based on that connection state.

### Setup

Add the connectivity package to your pubspec as well as provider.

```yaml
connectivity: ^0.4.3+1
provider: ^2.0.1
```

### Providing the stream data

The provider package has multiple proivders that allow you to easily expose values to the rest of your widget tree without much boilerplate. One that I'm really grateful for it the StreamProvider. It exposes your value as a normal value and manages the subscriptions for you. The StreamProvider required you to supply a StreamController and thie connectivity package only exposes it's stream. This is good for us because we can take this limitation and make it better for our code. Just a little coding tip

> Abstract your code from any third party references as much as possible. This way you can swap them out when better ones come a long

We'll use the third party connectivity package only in one class. Our ConnectivityService. In this service we'll subscribe to the stream in the constructor, convert the status from the package into our own enum ConnectivityStatus and add that onto our own stream controller. Keeping the rest of our code clear from third party dependencies. Let's first create the enum we'll be using in our codebase.

```dart
enum ConnectivityStatus {
  WiFi,
  Cellular,
  Offline
}
```

Now Create a new file under a services folder called connectivity_service.dart.

```dart
import 'dart:async';

import 'package:connectivity/connectivity.dart';
import 'package:stackoverflow_sandbox/enums/connectivity_status.dart';

class ConnectivityService {
  // Create our public controller
  StreamController<ConnectivityStatus> connectionStatusController = StreamController<ConnectivityStatus>();

  ConnectivityService() {
    // Subscribe to the connectivity Chanaged Steam
    Connectivity().onConnectivityChanged.listen((ConnectivityResult result) {
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

Now we can provider the controller to the StreamProvider. Go to the main.dart file and wrap your MaterialApp with a StreamProvider of our enum type and supply the controller in the builder function.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return StreamProvider<ConnectivityStatus>(
        builder: (context) => ConnectivityService().connectionStatusController,
        child: MaterialApp(
          theme: ThemeData(),
          home: Home(),
        ));
  }
}
```

Now wherever we want to use the ConnectivityStatus all we do is `Provider.of<ConnectivityStatus>(context)`. Nothing else, no subscriptions or anything like that. The widgets will rebuild when a value is emitted on the stream so we don't have to manage anything. Let's make some simple UI to showcase how it works. We'll display the status in text and then we'll show different buttons depending on the status. When on WiFi we'll show a blue button that says "Sync Large Files" and when on Cellular we'll show a red button that says "Turn on Cellular Sync".

Create a new view called home_view.dart

```dart
class Home extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // Get the stream value
    var connectionStatus = Provider.of<ConnectivityStatus>(context);

    return Scaffold(
      body: Center(
        child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Text('Connection Status: ${connectionStatus}'),
              connectionStatus == ConnectivityStatus.WiFi // Check status and show different buttons
                  ? FlatButton(
                      child: Text('Sync Large files'),
                      color: Colors.blue[600],
                      onPressed: () {})
                  : FlatButton(
                      child: Text('Turn on Cellular Sync'),
                      color: Colors.red[600],
                      onPressed: () {},
                    )
            ]),
      ),
    );
  }
}
```

With this setup tou can now get access to your ConnectionStatus anywhere in your app by using `Provider.of<ConnectivityStatus>(context)` with the bonus of it being decoupled from the thirdparty library. You can swap out the ConnectivityService implementation and the outside will have no effect :)

Checkout and subscribe to my [Youtube Channel](https://www.youtube.com/c/filledstacks?sub_confirmation=1). Follow me [on Instagram](https://www.instagram.com/filledstacks/) for snippets and day-to-day programming. Checkout all the [other snippets](/snippets) here. You might find some more Flutter magic.
