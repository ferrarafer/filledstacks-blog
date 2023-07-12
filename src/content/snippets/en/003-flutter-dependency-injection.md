---
title: Dependency Injection in Flutter
description: Setup dependency injection in Flutter using Get It.
authors:
  - en/dane-mackier
published: 2019-05-03
updated: 2019-05-03
postSlug: dependency-injection-in-flutter
ogImage: /assets/snippets/003/003.jpg
featured: false
draft: false
tags:
  - flutter
  - dependency-injection
  - foundation
# friendlyId: snippet-003
---

In Flutter, the default way to provide object/services to widgets is through InheritedWidgets. If you want a widget or it's model to have access to a service, the widget has to be a child of the inherited widget. This causes unneccessary nesting.

That's where [get it](https://pub.dartlang.org/packages/get_it) comes in. An IoC that allows you to register your class types and request it from anywhere you have access to the container. Sounds better? Let's set it up.

## Implementation

In your pubspec add the dependency for get_it.

```yaml
  ...

  # dependency injection
  get_it: ^1.0.3

  ...
```

In your lib folder create a new file called service_locator.dart. Import get_it and create a new instance of getIt called locator. We'll use everything in the global scope so we can just import the file and have access to the locator.

Create a new function called setupLocator where we will register our services and models.

```dart
import 'package:get_it/get_it.dart';

GetIt locator = GetIt();

void setupLocator() {
}
```

In the main.dart file call `setupLocator` before we run the app.

```dart
import 'service_locator.dart';

void main() {
  setupLocator();
  runApp(MyApp());
}
```

### Setup

In the lib folder create a new folder called services. Under that folder create two new files, login_service.dart and user_service.dart

**Login Service**

```dart
class LoginService {
    String loginToken = "my_login_token";
}
```

**User Service**

```dart
class UserService {
    String userName = "filledstacks";
}
```

Using get_it, class types can be registered in two ways.

**Factory:** When you request an instance of the type from the service provider you'll get a new instance everytime. Good for registering ViewModels that need to run the same logic on start or that has to be new when the view is opened.

**Singleton:** Singletons can be registered in two ways. Provide an implementation upon registration or provide a lamda that will be invoked the first time your instance is requested (LazySingleton). The Locator keeps a single instance of your registered type and will always return you that instance.

### Registering types

Go to your service locator and import the two new services. We'll register the `UserService` as a singleton, and the `LoginService` as a Factory.

```dart
import './services/user_service.dart';
import './services/login_service.dart';

...

void setupLocator() {
  locator.registerSingleton(UserService());
  locator.registerFactory<LoginService>(() => LoginService());
}
```

Now wherever you need the service you'll import the service_locator.dart file and request the type like below.

```dart
import 'package:my_project/service_locator.dart';

...

var userService = locator<UserService>();

...

```

You don't need to wrap any widgets to inherit anything, or need the context anywhere. All you do is import the service_locator file and use the locator to resolve your type. This means that in places without the context you'll still be able to inject the correct services and values, even if the app's UI structure changes.

Checkout and subscribe to my [Youtube Channel](https://www.youtube.com/c/filledstacks?sub_confirmation=1). Follow me [on Instagram](https://www.instagram.com/filledstacks/) for snippets and day-to-day programming. Checkout all the [other snippets](/snippets) here. You might find some more Flutter magic.
