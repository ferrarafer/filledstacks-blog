---
title: Navigate Without BuildContext in Flutter using a Navigation Service
description: This tutorial will go over how we can build a navigation service that allows us to navigate without requiring the context.
authors:
  - en/dane-mackier
published: 2019-09-01
updated: 2019-09-01
postSlug: navigate-without-build-context-in-flutter-using-a-navigation-service
ogImage: /assets/tutorials/025/025.jpg
ogVideo: https://www.youtube.com/embed/kopdISefbJc
featured: false
draft: false
tags:
  - flutter
  - navigation
relatedTutorials:
  - en/021-flutter-completer-dialogs
# codeUrl: https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F025%2F01-start.zip?alt=media&token=b6d7cd7e-3cb7-46fd-b728-85a69fd8afb9
---

In this tutorial we will go over the process of implementing a navigation service that will allow you to navigate without the BuildContext. The only time this will be applicable is if you have separated your UI code from your business logic, similar to [this architecture](https://www.filledstacks.com/post/flutter-architecture-my-provider-implementation-guide). By having the navigation in the service you can navigate at the same place where you're making your actual business logic decisions and don't have to direct back to your UI code where the context is available. This is the same reason you would want to build yourself a [Dialog Manager like this](https://www.filledstacks.com/post/manager-your-flutter-dialogs-with-a-dialog-manager) where you can show and get input from dialogs right where your business logic requires it.

This is another step in the direction of making sure your view file only shows UI and the rest is managed somewhere else.

The idea we'll use to achieve this is the following. Have a service that contains a `GlobalKey` of type `NavigatorState`. Expose a function to push a named route and pass in optional arguments if required. I ALWAYS say services should never be **used** from within a view file, and that's still true, but by the word **use** I mean calling functions that change state or perform business logic. All we're doing here is setting a value that is required by the state to make sure we can link our service to the UI.

I have setup a basic app using to the provider-get_it architecture that has the navigation in the UI so that I can also cover why you'd want to move the functionality into your model. [Download the code](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F025%2F01-start.zip?alt=media&token=b6d7cd7e-3cb7-46fd-b728-85a69fd8afb9) and open up the project in your IDE of choice.

## Starting Project Setup

The code in the project has two views with their viewmodels associated with it. Login and Home. Both have a button on screen, on Login is a login button and on Home is a logout button. The views will call a function on the model to perform some kind of business logic and then return to the UI to perform a conditional navigation. That's what we want to avoid. We want ALL logic in the model, that includes checking if something is a success and performing a navigation depending on the outcome.

## Implementing The Service

If you go to the Home view you'll see the following code in the `onTap` function for the `GestureDetector`.

```dart
 onTap: () async {
    var success = await model.login(success: true);
    if (success) {
      Navigator.of(context).pushNamed(routes.HomeRoute);
    }
  },
```

This is typically how you would navigate, mostly because you don't have the `BuildContext` available in your model. As you can see from this code there's logic relating to the functionality. This means that as the application features expand we are likely to add more logic in here. That's something we definitely want to avoid doing when working in a view file that's "supposed" to be UI only. The model should handle all logic, the view should only call functions on the model and then rebuild itself using the new state when required.

To adhere to that principle we'll move the Navigation functionality into a service that we can call from the model classes. Create a new folder under lib called services and in there create a new file called navigation_service.dart

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

Open up the locator.dart file and register the navigation service

```dart
GetIt locator = GetIt.instance;

void setupLocator() {
  locator.registerLazySingleton(() => NavigationService());
}
```

The way we link our NavigationService with the application is be supplying the key from the service to the `MaterialApp`. Go to the main.dart file and set your `navigatorKey`.

```dart
class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      ...
      navigatorKey: locator<NavigationService>().navigatorKey,
      onGenerateRoute: router.generateRoute,
      initialRoute: routes.LoginRoute,
    );
  }
}
```

## Using The Service

Now that the service is setup and implemented we can go places it's being used and move that logic into the viewmodel. Head over to the LoginView and update the onTap function for the `GestureDetector` to remove all the login an await functionality.

```dart
 GestureDetector(
    onTap: () {
      model.login(success: true);
    },
    child: ...
  )
```

Open the LoginViewModel and import the route_paths file as routes. Then we'll retrieve the `NavigationService` as a private final field and when success we will call the navigation service to navigate to the HomeRoute.

```dart
import 'package:nav_service/constants/route_paths.dart' as routes;
import 'package:nav_service/services/navigation_service.dart';
...

class LoginViewModel extends BaseModel {

  final NavigationService _navigationService = locator<NavigationService>();

  Future login({bool success = true}) async {
    setBusy(true);
    await Future.delayed(Duration(seconds: 1));

    if (!success) {
      setErrorMessage('Error has occured with the login');
    } else {
      _navigationService.navigateTo(routes.HomeRoute);
      setErrorMessage(null);
    }

    setBusy(false);
  }
}
```

That's it. Now the responsibility of the View file is taken back to Showing UI and passing user actions to the model, instead of Showing UI, passing user actions to model and navigating. The `HomeView` is exactly the same as `LoginView` so all we'll do is update the onTap function and remove the conditional back navigation.

```dart
GestureDetector(
  onTap: () {
    model.logout();
  },
  child: ...
)
```

Then we update the `HomeViewModel` to perform the back navigation through the `NavigationService`.

```dart
import 'package:nav_service/services/navigation_service.dart';

class HomeViewModel extends BaseModel {
  final NavigationService _navigationService = locator<NavigationService>();

  Future logout({bool success = true}) async {
    setBusy(true);
    await Future.delayed(Duration(seconds: 1));

    if (!success) {
      setErrorMessage('Error has occured during sign out');
    } else {
      _navigationService.goBack();
    }
  }
}

```

The benefits of this is as the navigation logic expands your UI will stay the same and the model will carry all the logic / state management. This coupled with the [Dialog Manager tutorial](https://www.filledstacks.com/post/manager-your-flutter-dialogs-with-a-dialog-manager) should get all your "Widget showing" functionality out of your views and into your business logic where they belong.

## Navigation Arguments

Having navigation arguments is a common task so we'll add it into the navigation service. _If you want a more in depth walk through of the Navigation in Flutter [look at this tutorial](https://www.filledstacks.com/post/flutter-navigation-cheatsheet-a-guide-to-named-routing)_.

We'll start by adding an optional dynamic parameter to the `navigateTo` function in the `NavigationService` and passing that to our pushNamed call.

```dart
Future<dynamic> navigateTo(String routeName, {dynamic arguments}) {
  return navigatorKey.currentState.pushNamed(routeName, arguments: arguments);
}
```

Now in the `LoginViewModel` where we navigate we'll pass in a argument of type String to show in the HomeView on the Button.

```dart
_navigationService.navigateTo(routes.HomeRoute, arguments: '\nFilledStacks');
```

Now head over to the router.dart and under the `HomeRoute` case we'll extract the arguments from the settings and pass it to the HomeView.

```dart
...
  case routes.HomeRoute:
    var userName = settings.arguments as String;
    return MaterialPageRoute(
        builder: (context) => HomeView(userName: userName));
...
```

Then lastly. In the `HomeView` we can add the userName parameter to the constructor and set that to the field userName. To show the username we'll append it to the 'Logout' text.

```dart
class HomeView extends StatelessWidget {
  final String userName;
  const HomeView({Key key, this.userName}) : super(key: key);

   @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      ...
      Text('Logout' + userName,
      style: TextStyle(
          fontWeight: FontWeight.w800,
          color: Colors.white,
          fontSize: 30))
    );
  }
}
```

And that's all you need. Now you can go ahead and move all your navigation into your models, out of your views and keep all your business logic together.
