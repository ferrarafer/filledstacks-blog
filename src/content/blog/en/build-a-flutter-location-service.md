---
title: Build a Flutter Location Service
description: In this tutorial I show you how to get your location in Flutter from a service.
published: 2019-09-13
updated: 2019-09-13
postSlug: build-a-flutter-location-service
ogImage: /assets/blog/snippets/025/025.jpg
ogVideo: https://www.youtube.com/embed/UdBUe_NP-BI
featured: false
draft: false
tags:
  - flutter
  - location
categories:
  - snippet
lang: en
---

Getting your location in Flutter is an easy task. This tutorial will show you how to wrap the location package into a service that's easy to consume in your application. Create a new Flutter project and follow along.

## Setup

Provider is my default dependency provider / state management solution so we'll use that as well. We'll add both packages to the pubspec.

```yaml
provider: ^3.0.0
location: ^2.3.5
```

### Android

Add the location permission into the `AndroidManifest.xml` manifest outside of the application tag.

```xml
...
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

    <application
        android:name="io.flutter.app.FlutterApplication"
        android:label="The Guardian"
        android:icon="@mipmap/ic_launcher">
        ...
    </application>
...
```

Update your gradle.properties file to this

```
android.enableJetifier=true
android.useAndroidX=true
org.gradle.jvmargs=-Xmx1536M
```

Update your build.gradle file dependencies to this

```
 dependencies {
      classpath 'com.android.tools.build:gradle:3.3.0'
      classpath 'com.google.gms:google-services:4.2.0'
  }
```

And make sure your `compileSdkVersion` is 28.

### iOS

Add the Location Permissions to your info plist with the appropriate Messages.

```xml
	<key>NSLocationWhenInUseUsageDescription</key>
	<string>This app requires access to your location for FilledStacks tutorial.</string>
	<key>NSLocationAlwaysUsageDescription</key>
	<string>This app requires access to your location for FilledStacks tutorial.</string>
```

_That's all the setup done. If you're running into AndroidX problems make sure to migrate or use an older version of this package if you don't want to migrate._

## Service Implementation

If there's one thing I can recommend is to read up on the Single Responsibility Principle. Based on this I've made it a habit to architect my apps using single purpose services that I inject / locate where required. Let's create our `LocationService`. This service will:

1. Provider a stream of continuous updates we can depend on
2. Provider a function to do a once off request for the current location

Create a new file under the services folder called location_service.dart. We'll start by adding the single request `getLocation()` function that can be used for once off retrieval.

```dart
import 'package:location/location.dart';

class LocationService {
  UserLocation _currentLocation;

  var location = Location();

  Future<UserLocation> getLocation() async {
    try {
      var userLocation = await location.getLocation();
      _currentLocation = UserLocation(
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      );
    } on Exception catch (e) {
      print('Could not get location: ${e.toString()}');
    }

    return _currentLocation;
  }
}
```

We'll also introduce our own Location model to make sure our outside code is not dependent on the package representation of the model. Create a new file under the models folder called user_location.dart

```dart
class UserLocation {
  final double latitude;
  final double longitude;

  UserLocation({this.latitude, this.longitude});
}

```

Now lets add the Stream that emits all user location updates to us. All the code below is in the Location Service.

```dart
  StreamController<UserLocation> _locationController =
      StreamController<UserLocation>();

  Stream<UserLocation> get locationStream => _locationController.stream;

  LocationService() {
    // Request permission to use location
    location.requestPermission().then((granted) {
      if (granted) {
        // If granted listen to the onLocationChanged stream and emit over our controller
        location.onLocationChanged().listen((locationData) {
          if (locationData != null) {
            _locationController.add(UserLocation(
              latitude: locationData.latitude,
              longitude: locationData.longitude,
            ));
          }
        });
      }
    });
  }
```

This service is meant to be used from the object that controls the view's state and handles the logic, not the view itself. With that said, to keep this tutorial short and in scope I'll only pass in the stream to the provider to show how we can use that. Look at [this tutorial](/post/flutter-architecture-my-provider-implementation-guide) to see how services are used in Models. We'll wrap the main app with a StreamProvider and provide the stream to the builder from the LocationService.

```dart
class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return StreamProvider<UserLocation>(
      builder: (context) => LocationService().locationStream,
      child: MaterialApp(
          title: 'Flutter Demo',
          theme: ThemeData(
            primarySwatch: Colors.blue,
          ),
          home: Scaffold(
            body: HomeView(),
          )),
    );
  }
}
```

Then in our `HomeView` we will consume that stream and print out the location values.

```dart
class HomeView extends StatelessWidget {
  const HomeView({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var userLocation = Provider.of<UserLocation>(context);
    return Center(
      child: Text(
          'Location: Lat${userLocation?.latitude}, Long: ${userLocation?.longitude}'),
    );
  }
}
```

Check out some of the other [snippets](/snippets) and come back tomorrow to see the new one.
