---
title: New Setup for Flutter Stacked State Management
description: This tutorial goes over the new setup to get started with stacked.
authors:
  - en/dane-mackier
published: 2021-02-23
updated: 2021-02-23
postSlug: new-setup-for-flutter-stacked-state-management
ogImage: /assets/tutorials/064/064.jpg
ogVideo: https://www.youtube.com/embed/1WW8xHhZvyA
featured: false
draft: false
tags:
  - stacked
  - stacked-services
# friendlyId: tutorial-064
---

Lets go over the new setup for a Stacked Application! To follow along you can either run `flutter create` and create a new flutter app, or you can clone the [boxtout repo](https://github.com/FilledStacks/boxtout) and use the `clients/customer` project which we'll be using.

We start by removing all the comments as well as the `HomePage` from the main file. Then you can open up the `pubspec.yaml` file where we'll add the stacked packages

```yaml
dependencies: ...
stacked: ^1.9.1
stacked_services: ^0.7.1
```

And if you want the new Stacked setup functionality we'll also add the following packages to the dev_dependencies.

```dart
dev_dependencies:
	...
	stacked_generator: ^0.1.2
	build_runner:
```

Stacked is the package used to implement our general state management solution with newly added abilities to generate the other parts of the required system to effectively develop a production application.

There are 3 important things required for a maintainable production application, at least for us in our development:

1. **State management**: Stacked provides us with a very basic MVVM style system where we have a View and a ViewModel. The View displays the UI to the User based on the ViewModels state. The ViewModel maintains all the state and interacts with services.
2. **Navigation abstraction**: This is required so that we can look at navigation as a service. In most cases the navigation actually forms part of the business logic, think of navigating to the Address Selection View when you realise the user has no address associated with their account. That decision should be made in the business logic / viewmodel where we have access tot he user model and all its information fresh from an api request. That sort of navigation doesn't belong in the UI files, it should happen with the business logic. So we need this navigation abstraction.
3. **Dependency Inversion**: We want to depend on our own abstractions of functionality, features or third-party libraries. This makes our code less prone to "forced refactors" when a package owner decides to update the api. It also gives us a hard guide to stick to the Single Responsibility principle.

Stacked v1.9.0 has introduced along with the `stacked_generator` the ability to easily generate the code required mentioned above. With that said lets look at how to start with a stacked application in a brand new flutter project (or slightly new 😆)

## State Management

Stacked provides you with some basic widgets to implement the View-ViewModel. Lets look at how to do that. Under the lib folder create a new folder called ui and under that a new folder called startup. Inside that folder create a new file called `startup_view.dart` and `startup_viewmodel.dart`.

`startup_viewmodel.dart`

```dart
class StartUpViewModel extends BaseViewModel {
  String title = '';

  void doSomething() {
		title += 'updated ';
		// this will call the builder defined in the view file and rebuild the ui using
    // the update version of the model.
		notifyListeners();
  }
}
```

`startup_view.dart`

```dart
class StartUpView extends StatelessWidget {
  const StartUpView({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ViewModelBuilder<StartUpViewModel>.reactive(
      builder: (context, model, child) => Scaffold(
        floatingActionButton: FloatingActionButton(
          onPressed: model.doSomething,
        ),
        body: Center(
          child: Text(model.title),
        ),
      ),
      viewModelBuilder: () => StartUpViewModel(),
    );
  }
}
```

This tutorial won't cover the complete deep dive into stacked state management. That can be seen in the [Stacked State Management Deepdive tutorial](https://www.filledstacks.com/post/flutter-state-management-with-stacked/). Lets move on to the new generating functionality for number 2 and 3 above.

## Stacked Application Setup

Stacked now provides you with the functionality for Navigation generation as well as dependency registration. This makes the setup much faster to start your development with the stacked package.

### Navigation

Before the v1.9.0 update in the stacked package and the introduction of the `stacked_generator` package we were using `auto_route` package to generate our navigation code. We have now moved that functionality into the stacked package because `auto_route` v1 will not be compatible with stacked navigation. To use this we have to define a `StackedApp`. Create a new folder `lib/app` and inside create a new file called `app.dart`

```dart
@StackedApp()
class AppSetup {
  /** Serves no purpose besides having an annotation attached to it */
}
```

Here we create a class that serves no purpose other than to add an annotation on it. The `StackedApp` annotation is where all the new functionality comes in. To setup the navigation you can pass in a list of `routes`. This list can take a `MaterialRoute`, `CupertinoRoute` or a `CustomRoute`. All of them require a page value which is the `Type` for the view. Copy and past the `startup` folder and change everything inside it to `SecondView` and `SecondViewModel`. This is what we'll use for the navigation setup. Then pass the two routes to the `StackedApp`.

```dart
@StackedApp(
  routes: [
    MaterialRoute(page: StartUpView, initial: true),
    CupertinoRoute(page: SecondView),
  ],
)
class AppSetup {
  /** Serves no purpose besides having an annotation attached to it */
}
```

When you run `flutter pub run build_runner build --delete-conflicting-outputs` it will generate a new file in the `lib/app` folder called `app.router.dart`. This file contains all the code required for our routing. You can then open up `main.dart` and we'll update the MaterialApp to take in our Navigator key from the `StackedServices` and we'll also set our onGenerateRoute function.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      navigatorKey: StackedService.navigatorKey,
      onGenerateRoute: StackedRouter().onGenerateRoute,
    );
  }
}
```

Make sure to import the router and that's the setup complete. This allows you to now perform navigations using the `NavigationService` if it's been registered as a dependency on your locator. more on that in the next section. Lets quickly look over passing parameters during view navigation.

### Navigation Arguments

View argument serialisation is automatic when using the generated router. Create a new file under the ui folder called `details_view.dart`.

```dart
class DetailsView extends StatelessWidget {
  final String name;

  const DetailsView({Key key, this.name}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Text(name),
    );
  }
}
```

Then you can add that route into your `StackedApp`.

```dart
@StackedApp(
  routes: [
    MaterialRoute(page: StartUpView, initial: true),
    CupertinoRoute(page: SecondView),
    CupertinoRoute(page: DetailsView),
  ],
)
class AppSetup {
  /** Serves no purpose besides having an annotation attached to it */
}

```

When running the `build` command on the `build_runner` package this view will generate a class called `DetailsViewArguments`.

```dart
class DetailsViewArguments {
  final Key key;
  final String name;
  DetailsViewArguments({this.key, this.name});
}

```

When you navigate to the `DetailsView` using the `NavigationService` then you can pass in the `DetailsViewArguments` class as your arguments.

```dart
_navigationService.navigateTo(
  Routes.detailsView,
  arguments: DetailsViewArguments(name: 'FilledStacks'),
);

```

These arguments can be passed into any of the navigation calls that takes in the route name. They will be generated for any view that has arguments in it and for all types, including custom classes created in your code.

_Note_: When your view arguments change you have to run the code generation command again.

That reduces the amount of maintenance code around passing parameters around the views when navigating.

### Dependency Registration

The other major piece of boilerplate that was required was setting up get_it and making use of it on its own. This is still a very valid approach but with this new changes I wanted to introduce a quicker way of setting all that up and remove the boilerplate. This is also done using the `StackedApp` annotation. The class takes in a list of `DependencyRegistration`'s into a property called `dependencies`.

```dart
@StackedApp(
...
dependencies: [
    LazySingleton(classType: NavigationService),
  ],
)

```

There are (at the point of writing **21 February 2021**) 4 dependency types that can be registered as a dependency.

- **Factory**: When this dependency is requested from get_it it will return a new instance of the class given as the `classType`
- **Singleton**: This will **construct** and register a single instance of the class. When that `classType` is requested it will always return the instance that was created
- **LazySingleton**: This will **only construct the type when requested** and for every request after that return the same instance that was first constructed
- **Presolve**: This is a type that requires the instance to be initialised or resolved before being able to register it. Your have to supply `presolveUsing` and it has to be a static function that returns a Future of the type defined in `classType`.

Once you've defined your dependencies then you can run

```powershell
flutter pub run build_runner build --delete-conflicting-outputs
```

This will create a new file called app.locator.dart which contains a `setupLocator` function. That function should be called before the runApp function call in `main.dart` like below.

```dart
void main() {
  setupLocator();
  runApp(MyApp());
}

```

If you have any dependency registered that needs to be preSolved then you have to change your main function into a Future and await the setupLocator call.

```dart
Future main() async {
  await setupLocator();
  runApp(MyApp());
}

```

After that you can start using the locator or your service location. Open up the `startup_viewmodel.dart` file and we'll add in a navigation to test everything out.

```dart
class StartUpViewModel extends BaseViewModel {
  final _nagivationService = locator<NavigationService>();

  String title = '';

  void doSomething() {
    _nagivationService.navigateTo(Routes.secondView);
  }
}
```

Now when you run the app and you tap on the floating action button it should navigate you to the `SecondView` using the Cupertino transition from the iOS design library. And that's it. If you experience problems running the Android version of the app from boxtout checkout this [stackoverflow answer](https://stackoverflow.com/questions/56639529/duplicate-class-com-google-common-util-concurrent-listenablefuture-found-in-modu/60492942#60492942). If you want some cool snippets to help with stacked checkout this [snippets gist](https://gist.github.com/FilledStacks/b57b77da10fdcb2d4d95a28de4a4ced4).

Until next time,

Dane
