---
title: Request Permissions in Flutter as a Service
description: In this tutorial I show you how to request permissions in Fluter.
authors:
  - en/dane-mackier
published: 2019-06-12
updated: 2019-06-12
postSlug: request-permissions-in-flutter-as-a-service
ogImage: /assets/snippets/026/026.jpg
featured: false
draft: false
tags:
  - flutter
  - foundation
  - permissions
# friendlyId: snippet-026
---

Requesting permissions usually become a messy task when there's a lot of paths you want to take your user on based on the permissions. To start the clean up process of all the permissions code we'll wrap it in a service with dedicated permission request functions on it.

## Setup

In this tutorial we'll be using the permissions_handler package to request our permissions so lets add that to the pubspec.

```yaml
# Permission checking
permission_handler: ^3.1.0
```

We'll create functions to request two types of permission, we'll do Location as well as Contacts. First we need to tell the OS that our app will be using these permissions.

### Android

In the AndroidManifest add the `uses-permission` tags for the two features.

```xml
    <uses-permission android:name="android.permission.READ_CONTACTS" />
    <uses-permission android:name="android.permission.WRITE_CONTACTS" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

### iOS

In the info.plist file add the keys along with your message

```xml
  <key>NSContactsUsageDescription</key>
	<string>This app requires contacts access to function.</string>
	<key>NSLocationWhenInUseUsageDescription</key>
	<string>This app requires access to your location when in use to show relevan information.</string>
	<key>NSLocationAlwaysUsageDescription</key>
	<string>This app requires always on access to to your location to notifiy you when are near a store.</string>
```

## Implementation

The `PermissionsService` will have a dedicated function on it for the permissions that you require. This way it can be called when the user wants to use the functionality that requires it. It will also be easy to write custom logic per function(group) through providing callbacks. Create a new file called permissions_service.dart and in it we'll make a class that has an instance of the `PermissionHandler` from the package.

```dart
import 'package:permission_handler/permission_handler.dart';

class PermissionsService {
  final PermissionHandler _permissionHandler = PermissionHandler();
}

```

Then we can add a generic function that takes in a `PermissionGroup` to request a permission of what we want.

```dart
...
 Future<bool> _requestPermission(PermissionGroup permission) async {
    var result = await _permissionHandler.requestPermissions([permission]);
    if (result[permission] == PermissionStatus.granted) {
      return true;
    }

    return false;
  }
...
```

And using this function we can create specific functions for each permission.

```dart
...
  /// Requests the users permission to read their contacts.
  Future<bool> requestContactsPermission() async {
    return _requestPermission(PermissionGroup.contacts);
  }

  /// Requests the users permission to read their location when the app is in use
  Future<bool> requestLocationPermission() async {
    return _requestPermission(PermissionGroup.locationWhenInUse);
  }
...
```

## Custom Permission Logic

Many of the times when it comes to permissions we want to do something custom or want to prompt the user again to allow us the permissions. Because we have dedicated functions we can now handle each permission request in a custom way. Lets say the app needs to have access to the contacts to work, something like whatsapp. We can supply a function that will be called when the permission is denied so that we can show a dialog on the outside. _Checkout [this tutorial for quick dialogs](/snippet/quick-and-easy-dialogs-in-flutter-with-rf-flutter)_

We'll pass in a `onPermissionDenied` function that will get called when the user declines a permission.

```dart
 /// Requests the users permission to read their contacts.
  Future<bool> requestContactsPermission({Function onPermissionDenied}) async {
    var granted = await _requestPermission(PermissionGroup.contacts);
    if (!granted) {
      onPermissionDenied();
    }
    return granted;
  }
```

Now on the outside you can pass in your function, show your dialog when it's denied and then request it again if the user chooses to do so :)

## Has permissions

Another thing is to check if the app has a permission already. We'll create the same setup, a generic function that takes in a `PermissionGroup` and then use dedicated functions for specific permissions. You don't have to do this I just find it easier to maintain and it makes the outside code less dependent on the `PermissionHandler` package.

```dart
...
  Future<bool> hasContactsPermission() async {
    return hasPermission(PermissionGroup.contacts);
  }

  Future<bool> hasPermission(PermissionGroup permission) async {
    var permissionStatus =
        await _permissionHandler.checkPermissionStatus(permission);
    return permissionStatus == PermissionStatus.granted;
  }
...
```

## Usage

In the code we can now use the service to request permissions like this.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      home: Scaffold(
        body: Center(
          child: MaterialButton(
            color: Colors.yellow[300],
            child: Text('Request contacts permission'),
            onPressed: () {
              PermissionsService().requestContactsPermission(
                  onPermissionDenied: () {
                print('Permission has been denied');
              });
            },
          ),
        ),
      ));
  }
}

```

Services should be injected or located as shown [here using provider only](/snippet/dependency-injection-in-flutter-using-proxy-provider) or in an architecture like [this with Provider and get_it](https://www.filledstacks.com/post/flutter-architecture-my-provider-implementation-guide). Having your functionality wrapped in a service removes any relation between your code and third party implementation details so it's always a preferred solution for me.

Check out more of the [snippets](/snippets) on the site. New snippets every weekday.
