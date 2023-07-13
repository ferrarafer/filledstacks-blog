---
title: Clean Navigation in Flutter Using Generated Routes
description: This tutorial will cover setting up a Router in Flutter to make navigation calls cleaner and less verbose.
authors:
  - en/dane-mackier
published: 2019-05-21
updated: 2019-05-21
postSlug: clean-navigation-in-flutter-using-generated-routes
ogImage: /assets/snippets/012/012.jpg
featured: false
draft: false
tags:
  - flutter
  - foundation
# friendlyId: snippet-012
---

Navigation in Flutter can be done in one of two ways. Named routes, or [pushing Routes explicitly](/post/flutter-navigation-cheatsheet-a-guide-to-the-navigator) by instantiating a PageRoute and passing it to the Navigator. Pushing routes can become quite explicit and sharing logic between them becomes difficult. Logic like checking if the user is authenticated for a specific view. In this post we'll setup a Router for Flutter and allow you to use named routes with parameters.

## Setup

We'll create two views to play with, you can add it all in the main.dart file.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(home: Scaffold(body: Home()));
  }
}

class Home extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(child: Text('Home')),
    );
  }
}

class Feed extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(child: Text('Feed')),
    );
  }
}
```

### Router / Routing Setup

The MaterialApp provides you with a property called `onGenerateRoute` where you can pass in a Function that returns a `Route<dynamic>` and takes in `RouteSettings`. This is what we'll use. To keep things neat we'll create a Router class. In it we'll create a static function with the signature mentioned above. Create a router.dart file.

```dart
class Router {
  Route<dynamic> generateRoute(RouteSettings settings) {

  }
}
```

The settings contains the route information of the requested route. It provides two key things to us. The name, and the arguments. We'll use the name to determine which view to return. Update the generate Function to look like this.

```dart
 static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/':
        return MaterialPageRoute(builder: (_) => Home());
      case '/feed':
        return MaterialPageRoute(builder: (_) => Feed());
      default:
        return MaterialPageRoute(
            builder: (_) => Scaffold(
                  body: Center(
                      child: Text('No route defined for ${settings.name}')),
                ));
    }
  }
```

What this means is when the name equals '/' then we'll show the home. When it's '/feed' we'll show the feed view. To avoid making any mistakes in our code we'll take these hardcoded values (Magic Values) and put them into a constants.dart file that can be used anywhere.

```dart
/// This file contains all the routing constants used within the app

const String homeRoute = '/';
const String feedRoute = 'feed';
```

Update your switch case statements to use the new variables

```dart
...
    switch (settings.name) {
      case homeRoute:
        return MaterialPageRoute(builder: (_) => Home());
      case feedRoute:
        return MaterialPageRoute(builder: (_) => Feed());
...
```

Now in your App, where you define your MaterialApp, you'll pass the generateRoute function to onGenerateRoute. To define the home view as the starting view, instead of setting the home property to a widget we'll use initialRoute instead.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      onGenerateRoute: Router.generateRoute,
      initialRoute: homeRoute,
    );
  }
}
```

### Navigation

Now when you want to navigate you'll just use

```dart
Navigator.pushNamed(context, feedRoute);
```

This will navigate you to the FeedView. If we want to pass parameters to the Feed view that'a just a small little change. Let's make our Feed view take in a String as a parameter.

```dart
class Feed extends StatelessWidget {

  final String data;

  Feed(this.data);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(child: Text('Feed: $data')),
    );
  }
}
```

Add floating action button into your homeView and onPressed we'll push the feed view and pass in some string data as an argument.

```dart
class Home extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton(onPressed: (){
        Navigator.pushNamed(context, feedRoute, arguments: 'Data from home');
      },),
      body: Center(child: Text('Home')),
    );
  }
}
```

Now in our Router we have to get this data passed out of the arguments property in the settings and pass it to our Feed.

```dart
 case feedRoute:
    var data = settings.arguments as String;
    return MaterialPageRoute(builder: (_) => Feed(data));
```

If you tap floating action button on the HomeView you'll navigate to the Feed and see that the data is there. You can pass ANY value in the arguments. Just make sure you cast to the type you want and pass it down to your view. Complex objects, or even other widgets 😉

Subscribe to my [Youtube Channel](https://www.youtube.com/c/filledstacks?sub_confirmation=1) for weekly in-depth tutorials. Follow me [on Instagram](https://www.instagram.com/filledstacks/) for snippets and day-to-day programming. Checkout all the [other snippets](/snippets) on the site. You might find some more Flutter magic.
