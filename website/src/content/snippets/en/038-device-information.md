---
title: Provide Battery Information in Flutter
description: This article shows how to create a device information service for your Flutter app.
authors:
  - en/dane-mackier
published: 2019-07-02
updated: 2019-07-02
postSlug: provide-battery-information-in-flutter
ogImage: /assets/snippets/038/038.jpg
featured: false
draft: false
tags:
  - flutter
# friendlyId: snippet-038
---

Like in [this tutorial](/post/make-your-flutter-app-network-aware-using-provider-and-connectivity-status) where we provide our network status to the app, we sometimes make decisions on other information as well, a note worthy one being the battery percentage.

In this tutorial we'll build a DeviceInformationSerivce that will provide a stream of Battery Percentage values. The full `DeviceInformationService` also provides the connection status, along with some other info but we'll only provide the Battery info to keep the tutorial on point.

## Setup

We'll start by adding the packages that are required for this functionality.

```yaml
battery: ^0.3.0+4
provider: ^3.0.0
```

Then we'll create model class to hold the `BatteryInformation`.

```dart
class BatteryInformation {
  final int batteryLevel;

  BatteryInformation(this.batteryLevel);
}
```

## Implementation

We'll create a `DeviceInformationService` that will expose a stream that emits the battery level every 5 seconds. We'll provide that stream through a `StreamProvider` to consume in our UI. We'll start by creating the device_information_service.dart

```dart
import 'dart:async';

import 'package:battery/battery.dart';
import 'package:device_information/device_information.dart';

class DeviceInformationService {
  bool _broadcastBattery = false;
  Battery _battery = Battery();

}
```

We'll create an instance of the battery package class and keep that locally. Then we can go ahead and setup our `StreamController` and expose the Stream through a property.

```dart
  Stream<BatteryInformation> get batteryLevel => _batteryLevelController.stream;

  StreamController<BatteryInformation> _batteryLevelController =
      StreamController<BatteryInformation>();
```

The function to emit the batteryLevel every 5 seconds will be a future that has a while loop with the condition if `_broadcastBattery` is true. This will allow us to cancel this broadcast if needed. Create a new function `_broadcastBatteryLevel` that gets the batteryLevel and emits it over the stream then waits for 5 seconds.

```dart
  Future _broadcastBatteryLevel() async {
    _broadcastBattery = true;
    while (_broadcastBattery) {
      var batteryLevel = await _battery.batteryLevel;
      _batteryLevelController
          .add(BatteryInformation(batteryLevel));
      await Future.delayed(Duration(seconds: 5));
    }
  }
```

We'll also create a `stopBroadcast` function that we won't use in this tutorial but just to have it in case you want to call it on dispose. To stop services that rely on streams when your app goes into the background you can implement a [Lifecycle Manager](/snippet/build-a-lifecycle-manager-to-manage-your-services) and call stop in there. We won't cover that in this tutorial.

```dart
  void stopBroadcast() {
    _broadcastBattery = false;
  }
```

## Usage

To use this stream throughout the app we will Provide it through a StreamProvider.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return StreamProvider(
      builder: (BuildContext context) =>
          DeviceInformationService().batteryLevel,
      child: MaterialApp(title: 'Flutter Demo', home: BatteryView()),
    );
  }
}
```

_Note: Services functionality are to be used only from your business logic / view models like [this example](/post/flutter-architecture-my-provider-implementation-guide), not directly from a view. Outside of initialisation. This tutorial won't do that so it can stay on topic_

We'll consume the provided information in our UI using the `Provider.of` call.

```dart
class BatteryView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var batteryInfromation = Provider.of<BatteryInformation>(context);
    return Scaffold(
      body: Center(
        child: Text('Battery Level: ${batteryInfromation?.batteryLevel}'),
      ),
    );
  }
}
```

Based on the Battery level you can now make decisions in your UI to grey out or hide widgets based on the percentage. To see how to build widgets that reacts to your device's information check out [this tutorial](/post/make-your-flutter-app-network-aware-using-provider-and-connectivity-status). Check out all the other [Snippets](/snippets) for more Flutter tutorials.
