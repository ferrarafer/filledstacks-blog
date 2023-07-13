---
title: Flutter Navigation Cheatsheet - A Guide to Named Routing
description: A simple guide that covers the setup and all navigation scenarios using named routing.
authors:
  - en/dane-mackier
published: 2019-06-28
updated: 2019-06-28
postSlug: flutter-navigation-cheatsheet-a-guide-to-named-routing
ogImage: /assets/tutorials/016/016.jpg
ogVideo: https://www.youtube.com/embed/YXDFlpdpp3g
featured: false
draft: false
tags:
  - flutter
  - navigation
---

This tutorial should serve as a cheat sheet for named route navigation, anything from setup to waiting for results. Most of the code will be similar to the [Navigator direct routing tutorial](/post/flutter-navigation-cheatsheet-a-guide-to-the-navigator) the only difference being that we'll be using named routing instead.

Here are the points that we’ll cover.

1. Setup a router that handles navigation
2. Handle undefined routes
3. Navigate to a View
4. Pass parameters to a view
5. Navigate back programatically
6. Get a result after a view is closed
7. Override the back button n a view

The final code can be found here. Generate a new project called named_routing and you can follow along with me.

## Setup a router for named routing

a `MaterialApp` widget provides us with a property called `onGenerateRoute` where we can supply a `Function` that takes in a `RouteSettings` parameter and returns a `Route<dynamic>`. This is the function that we will use to perform all our routing. We'll start by cleaning the main.dart file and setting our `onGenerateRoute` function to our static method in the router.

It's mentioned in the Flutter docs that we shouldn't use classes just for namespace sake. Another way of looking at it is having a class that's never instantiated. Those are considered codeSmells in dart so we'll use a topLevel function. Coming from C# that makes me uncomfortable but it's allowed in a language like dart. We'll import with an alias instead so that it's still clear in the code.

```dart
import 'package:named_routing/router.dart' as router;
...
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Named Routing',
      onGenerateRoute: router.generateRoute
    );
  }
}
```

Then we will create a file in the lib folder called router.dart

```dart
import 'package:flutter/material.dart';

Route<dynamic> generateRoute(RouteSettings settings) {
  // Here we'll handle all the routing
}

```

Whenever we request a navigation from the Navigator this function will be called and it will expect a Route back to the requested path. Next up we'll create some views to navigate to we'll go with the very creative names `HomeView` and `LoginView` like I always do :)

```dart
class HomeView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(child: Text('Home'),),
    );
  }
}

class LoginView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(child: Text('Login'),),
    );
  }
}
```

Now, finally, we can get to the navigation. The parameter passed into the `generateRoute` function is of type `RouteSettings`. This type contains the name requested route as well as the arguments passed to that parameter call. We'll use the name to setup a switch statement that returns our home or our login based on the name.

**Note:** When you map a route to '/' and you use a path like '/login' the Navigator will push the HomeView and then the LoginView because of the deep linking functionality. Keep that in mind when doing routing.

Update the generateRoute function with a switch statement that returns a `MaterialPageRoute` for each of the views. You can use a `CupertinoPageRoute` as well if you're on iOS and want those default transitions.

```dart
Route<dynamic> generateRoute(RouteSettings settings) {
  switch (settings.name) {
    case '/':
      return MaterialPageRoute(builder: (context) => HomeView());
    case 'login':
      return MaterialPageRoute(builder: (context) => LoginView());
    default:
      return MaterialPageRoute(builder: (context) => HomeView());
  }
}

```

The code here is very straight forward. If the name matches the case defined then we return a route that returns that widget for the view. For now we'll return the `HomeView` when there's no defined route / matching name. I'll cover two ways of handling an undefined path later in this article.

Last thing to do is to make sure we never make a typing mistake so we'll store our route names in a separate file called routing_constants.dart

```dart
const String HomeViewRoute = '/';
const String LoginViewRoute = 'login';
```

Then we can replace the hardcoded cases with those parameters.

```dart
  switch (settings.name) {
    case HomeViewRoute:
      ...
    case LoginViewRoute:
      ...
  }
```

Last thing to do is to tell the app which view to start on and then the setup is done.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Named Routing',
      onGenerateRoute: router.generateRoute,
      initialRoute: HomeViewRoute,
    );
  }
}
```

## Handle Undefined Routes

There's two ways to handle Undefined routes.

1. Returning your UndefinedView as the default route in `generateRoute`
2. Returning your UndefinedView from the `onUnknownRoute`

We'll start by creating our `UndefinedView`. Create a new filed called undefined_view.dart

```dart
class UndefinedView extends StatelessWidget {
  final String name;
  const UndefinedView({Key key, this.name}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Text('Route for $name is not defined'),
      ),
    );
  }
}
```

### 1. Return Undefined Routes from generateRoute

I prefer to use this method. Even though Flutter provides you with a way to defined a route for undefined paths I like to keep all my routing code together. This way makes that easy to do. Let's return the `UndefinedView` as the default value and pass the name of the unknown route to display.

```dart
switch (settings.name) {
  ...
  default:
    return MaterialPageRoute(builder: (context) => UndefinedView(name: settings.name,));
}
```

### 2. Return Undefined Routes from onUnknownRoute

With this method we'll use the same code but we'll set it on the `MaterialApp`.

```dart
return MaterialApp(
  title: 'Named Routing',
  onGenerateRoute: router.generateRoute,
  onUnknownRoute: (settings) => MaterialPageRoute(
      builder: (context) => UndefinedView(
            name: settings.name,
          )),
  initialRoute: HomeViewRoute,
);
```

## Navigating to a View

Now lets make use of the navigation. On the `HomeView` create a `FloatingActionButton` and we'll navigate in the `onPressed` function. We'll navigate to the `LoginView`.

```dart
// Perform navigation to LoginView
Navigator.pushNamed(context, LoginViewRoute);
```

Tapping that button now should take you to the login view with the above code.

## Pass parameters to a View

To pass a parameter to the view you use the arguments property on the navigation call. This takes in any object so you can pass custom classes or basic primitive types. We'll pass in a string and display it on the login view. Update your `pushNamed` call and give it a value for the arguments.

```dart
Navigator.pushNamed(context, LoginViewRoute, arguments: 'Data Passed in');
```

The `LoginView` doesn't take in any values yet so lets update that first.

```dart
class LoginView extends StatelessWidget {
  final String argument;
  const LoginView({Key key, this.argument}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        Navigator.pop(context, 'fromLogin');
        return false;
      },
      child: Scaffold(
        floatingActionButton: FloatingActionButton(
          onPressed: () {
            Navigator.pop(context, 'fromLogin');
          },
        ),
        body: Center(
          child: Text('Login $argument'),
        ),
      ),
    );
  }
}
```

Then we can extract these arguments and pass it into the `LoginView` in the `router`.

```dart
switch (settings.name) {
  ...
 case LoginViewRoute:
      var loginArgument = settings.arguments;
      return MaterialPageRoute(builder: (context) => LoginView(argument: loginArgument));
}
```

That's all there is to passing in arguments and extracting them.

## Navigate back programatically

This remains the same through all forms of navigation. When you want to navigate back you use the `pop` call on the navigator. In the login view add a floating action button and call the following code in the `onPressed` call.

```dart
Navigator.pop(context);
```

This will take you back to the home view.

## Get a result after a page is closed

Navigation calls Flutter are `Futures<dynamic>`, which means we can expect a return to our calling code when the operation is complete. What that means for us is that we can await the navigation call and expect a result if we return one. Change the onPressed in the `HomeView` to this.

```dart

// Navigate to LoginView and wait for a result to come back
var result = await Navigator.pushNamed(context, LoginViewRoute);

// If the result matches show a dialog
if (result == 'fromLogin') {
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
          title: Text('From Login'),
        ));
}
```

Here we're waiting for a result that matched 'fromLogin' and if it does we show a dialog. If you press back normally then this won't show a dialog. You have to return a value from your route, and the way you do that is through the `pop` call. Add an additional parameter to your `pop` call like this.

```dart
Navigator.pop(context, 'fromLogin');
```

Now when you navigate back you'll see the alert dialog come up. The additional value is dynamic, so you can pass anything you want to.

## Override the back button on a page

If you don’t want the back button to navigate away from your current view you can use a widget called WillPopScope. Surround your scaffold widget with it, and return a false value to the onWillPop call. False tells the system they don’t have to handle the scope pop call.

**Note**: _You should not surround your entire app with this. You should be using this per page widget that you want the functionality to run on. **Surround your Scaffold for your page.**_

```dart
@override
Widget build(BuildContext context) {
  return WillPopScope(
    onWillPop: () => Future.value(false),
    child: Scaffold(
      ...
    ),
  );
}
```

If you to still want to return a custom value when the app navigates back you can perform the pop call before you return false.

```dart
WillPopScope(
  onWillPop: () async {
      Navigator.pop(context, 'fromLogin');
      return false;
    },
    ...
);
```

This will now return your fromLogin result to your calling page as you navigate back. That's everything for navigation in Flutter. Checkout some of the other [tutorials](/tutorials) here.
