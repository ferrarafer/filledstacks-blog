---
title: Navigate without context in Flutter with a Navigation Service
description: This tutorial shows you how to navigate without the context so navigation can move into business logic.
authors:
  - en/dane-mackier
published: 2019-06-18
updated: 2019-06-18
postSlug: navigate-without-context-in-flutter-with-a-navigation-service
ogImage: /assets/snippets/029/029.jpg
featured: false
draft: false
tags:
  - flutter
  - navigation
  - foundation
# friendlyId: snippet-029
---

This tutorial covers how to setup a navigation service to allow you to navigate from your business logic, where the context is not available. To achieve this functionality we'll be using a navigation key to access the navigator state in our `NavigationService`.

_Note: Services functionality are to be used only from your business logic like [this example](/post/flutter-architecture-my-provider-implementation-guide), not directly from a view. Outside of initialisation. This tutorial won't do that so I can stay on topic_

Today we'll provide our navigation service using get_it. Setting up get_it is covered [here](/snippet/dependency-injection-in-flutter) it's about 6 lines of code so do that quickly.

## Implementation

In Flutter GlobalKeys can be used to access the state of a `StatefulWidget` and that's what we'll use to access the NavigatorState outside of the build context. We'll create a `NavigationService` that contains the global key, we'll set that key on initialisation and we'll expose a function on the service to navigate given a name. Let's start with the `NavigationService`.

```dart
class NavigationService {
  final GlobalKey<NavigatorState> navigatorKey =
      new GlobalKey<NavigatorState>();

  Future<dynamic> navigateTo(String routeName) {
    return navigatorKey.currentState.pushNamed(routeName);
  }

  bool goBack() {
    return navigatorKey.currentState.pop();
  }
}
```

We'll just cover pushing a named route. You can setup functions for replace or add more additional logic in here like checking for Authentication and then showing a login view instead of the intended view etc.

Then we register out `NavigationService` with the locator.

```dart
void setupLocator() {
  locator.registerLazySingleton(() => NavigationService());
}
```

In the main file we then pass our GlobalKey as the NavigatorKey to our `MaterialApp`.

```dart
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        title: 'Flutter Demo',
        theme: ThemeData(
          primarySwatch: Colors.blue,
        ),
        navigatorKey: locator<NavigationService>().navigatorKey,
        home: HomeView());
  }
```

We'll have two basic views just to show the navigation.

```dart
class HomeView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Text('HomeView'),
      ),
    );
  }
}

class LoginView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Text('LoginView'),
      ),
    );
  }
}
```

Since we're using named routes we have to setup our routing. We'll use onGenerateRoute. _[See this tutorial for a clean named routing approach](/snippet/clean-navigation-in-flutter-using-generated-routes)_

```dart
Widget build(BuildContext context) {
 return MaterialApp(
    title: 'Flutter Demo',
    theme: ThemeData(
      primarySwatch: Colors.blue,
    ),
    navigatorKey: navigationService.navigatorKey,
    onGenerateRoute: (routeSettings) {
      switch (routeSettings.name) {
        case 'login':
          return MaterialPageRoute(builder: (context) => LoginView());
        default:
          return MaterialPageRoute(builder: (context) => HomeView());
      }
    },
    home: HomeView());
}
```

And then finally we can go ahead and navigate using the `NavigationService` in the `FloatingActionButton` on the HomeView.

```dart
class HomeView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          locator<NavigationService>().navigateTo('login');
        },
      ),
      body: Center(
        child: Text('HomeView'),
      ),
    );
  }
}
```

That's it. This service can now be used in your models to navigate so your navigation logic can be out of your UI and shared with the business logic. This addition to an [architecture like this](/post/flutter-architecture-my-provider-implementation-guide) will now take any logic around navigation out of your UI files as well.

If you enjoyed this check out the [other snippets](/snippets) for more Flutter code.
