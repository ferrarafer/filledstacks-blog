---
title: Navigate Like Your On The Web with Flutter and Fluro
description: This Flutter Fluro tutorial will show you how to setup and use the Fluro package in Flutter for routing.
authors:
  - en/dane-mackier
published: 2019-05-30
updated: 2019-05-30
postSlug: navigate-like-your-on-the-web-with-flutter-and-fluro
ogImage: /assets/snippets/019/019.jpg
featured: false
draft: false
tags:
  - flutter
  - navigation
  - fluro
# friendlyId: snippet-019
---

[Fluro](https://pub.dev/packages/fluro) is a routing library that takes care of some of the basics for us and also gives us some web-like routing capabilities. In this tutorial I'll show you how to setup Fluro, use built in transitions and make use of web-like routing.

## Setup

We'll start by adding Fluro to our project.

```yaml
fluro: 1.4.0
```

Then in the same fashion as our [named routing tutorial](/snippet/clean-navigation-in-flutter-using-generated-routes) we'll create a new file, this time called fluro_router.dart.

```dart
import 'package:fluro/fluro.dart';

class FluroRouter {
  static Router router = Router();
}
```

Fluro provides you with a router where you can define your path names and variables that it takes in, similar to routing in some web frameworks. We'll create a static method that we can call from main before the app starts running.

```dart
// In fluro_router.dart class
static void setupRouter() {
}


// in main.dart
void main() {
  FluroRouter.setupRouter();
  runApp(MyApp());
}
```

Now we can define our handlers. To define a route you have to provide a Handler. A handler has a optional type and a handlerFunc. The handlerFunc takes in a context and a Map<String, List<String>> of parameters and returns a Widget. The widget returned is what will be shown by the router. We'll create two views to show the navigation.

```dart

class LoginView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.yellow[400],
      floatingActionButton: FloatingActionButton(
        onPressed: () {

        },
      ),
      body: Center(
          child: Text(
        this.runtimeType.toString(),
        style: TextStyle(fontSize: 23.0, fontWeight: FontWeight.bold),
      )),
    );
  }
}

class HomeView extends StatelessWidget {
  final String data;
  HomeView(this.data);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.blue[400],
      body: Center(
          child: Text(
            data,
            style: TextStyle(fontSize: 23.0, fontWeight: FontWeight.bold),
      )),
    );
  }
}

```

Home view takes in a string and login has a Floating action button where we'll add our navigation call. Before we can navigate we have to define our routes with Fluro and provide it with the handlers. Login first.

```dart
static Handler _loginHandler = Handler(
    handlerFunc: (BuildContext context, Map<String, dynamic> params) =>
        LoginView());
```

The login is a static Handler variable with a handlerFunc that returns a LoginView. Pretty straight forward, we still have to register the handler with the router. To do that we use define.

```dart
static void setupRouter() {
    router.define("login", handler: _loginHandler);
}
```

Here we're telling the router that when the namedRoute login is pushed then call the \_loginHandler I defined above. One thing left to do and we'll be done with all the setup to show one view. Go to the main.dart file and supply the onGenerateRoute with the generator from the Fluro router. We'll also set the initial route to login

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        initialRoute: 'login',
        onGenerateRoute: FluroRouter.router.generator);
  }
}
```

If you run this now your app will start on login and you're using the Fluro Router 😁

## Navigating Like You're on the Web

Fluro navigation is tied into the Flutter Navigator so navigation is still the same. You pushNamedRoute and it'll go through Fluro's defined routes to determine what widget you expect for the route. The one cool thing with Fluro is that you can navigate and pass in query parameters. We'll define a route for our HomeView as an example.

```dart
// Define the home view handler
static Handler _homeViewHandler = Handler(
    handlerFunc: (BuildContext context, Map<String, dynamic> params) =>
        HomeView(params['userId'][0]));

static void setupRouter() {
  ...
  // define the route
  router.define("home/:userId", handler: _homeViewHandler);
}
```

The handler is pretty much the same, except for indexing in the params value using userId and passing the first item in there. This user id is defined in the setupRouter function using the path 'home/:userId'. The ':' tells Fluro that you'll be passing in a parameter to the path and that they should extract it into the params map for you to use. Lastly we have to do the actual navigation to the home view. Go to the login view and in the onPressed function add the navigation call.

```dart
...
floatingActionButton: FloatingActionButton(
    onPressed: () {
      Navigator.pushNamed(context, 'home/90');
    },
  ),
...
```

We'll use the Navigator and push a named route passing in 90 as the user id. If you run this and push the button you'll navigate to Home with the value 90 showing on screen.

## Transitions

Fluro has some built in transitions, the following to be exact.

```dart
enum TransitionType {
  native,
  nativeModal,
  inFromLeft,
  inFromRight,
  inFromBottom,
  fadeIn,
  custom, // if using custom then you must also provide a transition
}
```

You can define a transition per route, we'll just use the fadeIn to keep things simple and show off the functionaly. You should play around with the values and check them all out. In the router file where we define our route, add a new property at the end and pass in the transition you want.

```dart
static void setupRouter() {
  router.define("login",
      handler: _loginHandler, transitionType: TransitionType.fadeIn);
  router.define("home/:userId",
      handler: _homeViewHandler, transitionType: TransitionType.fadeIn);
}
```

## Multiple Parameters

If you want to pass multiple parameter values you don't have to define any of them in the path. You just navigate using the Navigator and pass it like a normal url query parameter would be passed. This will make it available in your parameters function in the Handler. For example, you can deeplink the login path.

```dart
// Example push
Navigator.pushNamed('login?name=FilledStacks&account=2');


// Handler
static Handler _loginHandler =
    Handler(handlerFunc: (BuildContext context, Map<String, dynamic> params) {
  var name = params['name']?.first;
  var account = params['account']?.first;

  // Use name and account values
  return LoginView();
});

```

It's a very convenient way of setting up routing if you're not passing complex objects around. Checkout all the [other snippets](/snippets) here. There's more Fluttering to be done.
