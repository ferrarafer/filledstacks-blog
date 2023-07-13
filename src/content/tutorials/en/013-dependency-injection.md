---
title: Flutter Dependency Injection a Beginners Guide
description: Flutter Dependency injection Tutorial. We cover three forms of dependency injection.
authors:
  - en/dane-mackier
published: 2019-06-07
updated: 2019-06-07
postSlug: flutter-dependency-injection-a-beginners-guide
ogImage: /assets/tutorials/013/013.jpg
ogVideo: https://www.youtube.com/embed/vBT-FhgMaWM
featured: false
draft: false
tags:
  - flutter
  - architecture
  - dependency-injection
  - get-it
  - provider
relatedTutorials:
  - en/004-flutter-async
# codeUrl: "https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F013%2Fdependency_injection.zip?alt=media&token=b9500dc6-a72c-4187-a352-2524b3f372ac"
---

In this tutorial we will cover the three forms of the accepted dependency injection in Flutter. We'll look at `InheritedWidgets`, `get_it` and `provider` to get our objects where they are required. Before we do that lets define what dependency injection is, in plain English.

## Definition

Dependency injection is writing code that supplies your objects with other objects that they depend on. Let's look at an example of what a dependency is.

```dart
class LoginService {
  Api api;
}
```

Above you can see that the `LoginService` depends on the `Api` object. The `LoginService` is dependent on the `Api`. The usual way to get to a dependency into a class is through the constructor.

```dart
class LoginService {
  Api api;

  // Inject the api through the constructor
  LoginService(this.api)
}
```

The same idea here can be applied to a Widget. Let's look at this example in terms of a widget.

```dart

class HomeView extends StatelessWidget {

  // Home View has a dependency on the AppInfo
  AppInfo appInfo;

  HomeView({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
    );
  }
}
```

An easy way to supply this dependency is by passing it through the constructor.

```dart
AppInfo appInfo;

HomeView({Key key, this.appInfo}) : super(key: key);
```

So why all the fuss about dependency injection if we can just use the constructor?

## Motivation

Passing dependencies through a constructor is perfectly fine for accessing data one level down, maybe even two. What if you're four levels deep in the widget tree and you suddenly need the data from an object in your code? Imagine these are all widgets in separate files with their own logic.

HomeView

- MyCustomList
  - PostItem
    - PostMenu
      - PostActions
        - LikeButton

If you want to pass the AppInfo to the LikeButton to display the like count, you would have to create and add the constructor and keep the local member variable just to pass it down to the next widget constructor. Now what if you swap the LikeButton to be on a different parent widget. You'd have to remove all the unnecessary code and then add it to all the new parents of the widgets that require your data. Not a very pleasant development experience.

Instead of doing things the hard way, we'll use a technique called Dependency Injection. We'll make sure that if data is required, anywhere in the widget tree, by any widget, that we'll be able to retrieve it easily. We'll start with the method that Flutter is "built on" called InheritedWidget.

## Inherited Widget

In simple terms an inherited widget effectively allows you to provide access, through the `BuildContext`, to all it's properties, to every widget in it's subtree. It's common in Flutter and is used for the Theme, MediaQueries and everything else the base app provides. This is how an empty `InheritedWidget` looks.

```dart
import 'package:flutter/material.dart';

class InheritedInjection extends InheritedWidget {
  final Widget child;

  InheritedInjection({Key key, this.child}) : super(key: key, child: child);

  static InheritedInjection of(BuildContext context) {
    return (context.inheritFromWidgetOfExactType(InheritedInjection)as InheritedInjection);
  }

  @override
  bool updateShouldNotify( InheritedInjection oldWidget) {
    return true;
  }
}
```

This can be generated through the snippets in VS by typing `inheritedW` and pressing enter/tab on the option. We'll add our AppInfo as a property on the Widget. We'll keep a final instance that's long running and return that instance through a getter.

```dart

  final AppInfo _appInfo = AppInfo();
  final Widget child;

  InheritedInjection({Key key, this.child}) : super(key: key, child: child);

  AppInfo get appInfo => _appInfo;
```

### Usage

The way inherited widgets are used is by wrapping the tree you want in the inherited widget. we want this widget to be supplied to our entire app so we'll wrap the MaterialApp with the InheritedInjection widget.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return InheritedInjection(
      child: MaterialApp(
          title: 'Flutter Demo',
          theme: ThemeData(
            primarySwatch: Colors.blue,
          ),
          home: HomeView()),
    );
  }
}
```

The way we access the inherited widget in our code is by using the .of call and passing the context. We can now update our HomeView and remove the AppInfo passed through the constructor as well as the class variable we kept. We can now make our HomeView look like this.

```dart
class HomeView extends StatelessWidget {
  HomeView({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var appInfo = InheritedInjection.of(context).appInfo;
    return Scaffold(
      body: Center(
        child: Text(appInfo.welcomeMessage),
      ),
    );
  }
}
```

Now anywhere in the app where you want to use your `AppInfo` object all you'll do is.

```dart
var appInfo = InheritedInjection.of(context).appInfo;
```

No need to pass anything down through 5 constructors just to access the data. Lets move onto a more traditional form of dependency injection. `get_it`.

### Pros

- This is how everything in Flutter is built.
- Forces one directional data flow.

### Cons

- Boilerplate around instance tracking. Meaning when you want a new instance everytime you request the type you have to set that up. The same with if you want a singleton.
- Injecting into objects where the context is not available is almost impossible. You have to clutter up the InheritedWidget itself with all the setup and manually inject objects where the context is not available.
- Very verbose

## get_it

Get it is what is known as a simple service locator. Traditionally you register your your types against an interface and provide the concrete implementation to it. This way you benefit from developing against an interface which also makes unit testing easier because you can provide test specific implementations. Today we won't be doing that. This is just about dependency injection. Let's get to the code.

Add get_it to the pubspec

```yaml
get_it: ^1.0.3
```

Then we'll setup our service locator. We'll create a file in root, next to main.dart called locator.dart. Inside it we'll keep an instance of `GetIt` globally that we can access wherever we import the file. We'll also create a function called setupLocator where we will register all of our types we want access to.

```dart
import 'package:get_it/get_it.dart';

GetIt locator = GetIt();

void setupLocator() {
}
```

The types have to be registered before the App starts. So in the `main` file we'll call setupLocator before the app is kicked off.

```dart
import 'service_locator.dart';

void main() {
  setupLocator();
  runApp(MyApp());
}
```

Now we can register our AppInfo. Using get_it, class types can be registered in two ways.

**Factory:** When you request an instance of the type from the service provider you'll get a **new instance every time**. Good for registering ViewModels that need to run the same logic on start or that has to be new when the view is opened.

**Singleton:** Singletons can be registered in two ways. Provide an implementation upon registration or provide a lamda that will be invoked the first time your instance is requested (LazySingleton). The Locator keeps a single instance of your registered type and will **always return you that instance**.

We'll register our AppInfo as a singleton so that there's only ever one instance of it while the app is running.

```dart
void setupLocator() {
  locator.registerFactory(() => AppInfo());
}
```

This completes all the setup for get it. Now we can remove the `InheritedInjection` widget from the main file.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: Scaffold(),
    );
  }
}
```

In the HomeView where we want access we can get the `AppInfo` from our locator.

```dart
  @override
  Widget build(BuildContext context) {
    // Request the AppInfo from the locator
    var appInfo = locator<AppInfo>();
    return Scaffold(
      body: Center(
        child: Text(appInfo.welcomeMessage),
      ),
    );
  }
```

### Pros

- Can request type anywhere using the global locator
- Instance tracking is automatically taken care of by registering types as Factories or Singleton
- Can register types against interfaces and abstract your architecture from the implementation details
- Compact setup code with minimal boiler plate

### Cons

- Disposing is not a top priority in the framework
- Loose coding guidelines that can lead to badly written software
- Global object usage which is the start of multi-directional data flow which is the opposite of what Flutter promotes

The last method is using a package called Provider.

## Provider

Provider is basically InheritedWidget on steroids. It has specialised provider types like StreamProvider, ChangeNotifierProvider, ListenableProvider that can be used to architect your entire app. Today we're just looking at how it can be used for dependency injection into widgets.

First we have to add it to the pubspec

```yaml
provider: ^2.0.1
```

Then similarly to the InheritedWidget, the Provider injected value is only available in it's subtree. To get the value everywhere We will wrap our entire app in a provider.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Provider(
      builder: (context) => AppInfo(),
      child: MaterialApp(
        title: 'Flutter Demo',
        theme: ThemeData(
          primarySwatch: Colors.blue,
        ),
        home: Scaffold(),
      ),
    );
  }
}
```

Now in the HomeView when you want to access the value from the provider all you have to do it.

```dart
 @override
  Widget build(BuildContext context) {
    var appInfo = Provider.of<AppInfo>(context);
    return Scaffold(
      body: Center(
        child: Text(appInfo.welcomeMessage),
      ),
    );
  }
```

Easy peasy.

### Pros

- Great for StateManagement, my number one choice
- Forces one directional data flow
- The SpecialtyProviders removes loooots of boilerplate code
- Using the Consumers for your providers is neat and clean
- Supplies a way to dispose all provider objects

### Cons

- Injecting into objects that doesn't have a BuildContext requires lots of ProxyProvider stringing

To see an in depth article on how to combine these methods for the most maintainable architecture using provider for state management look at [this article](/post/flutter-architecture-my-provider-implementation-guide).
