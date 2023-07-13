---
title: Lottie Splash Screen intro in Flutter
description: This tutorial goes over how we can use Lottie to show a Splash screen animation on startup.
authors:
  - en/dane-mackier
published: 2020-08-30
updated: 2020-08-30
postSlug: lottie-splash-screen-intro-in-flutter
ogImage: /assets/tutorials/055/055.jpg
ogVideo: https://www.youtube.com/embed/YcUip0Y8CUg
featured: false
draft: false
tags:
  - stacked
  - lottie
# codeUrl: https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F055%2F055-starting.zip?alt=media&token=b52d3b2f-64fe-4c92-b425-d3b0854900c7
# friendlyId: tutorial-055
---

This tutorial will be building off the [Custom StartUp functionality](https://www.filledstacks.com/post/firebase-startup-logic-and-custom-user-profiles/#custom-startup-logic). This is logic that we show, usually while showing a view that looks exactly like the splash screen with a loading indicator on it. In this tutorial we will show an animated version of the splash screen that will loop until the initialisation logic is complete, or the animation is played from beginning to end.

## What is Lottie and why Lottie

[Lottie](https://airbnb.design/lottie/) is an animation tool / runtime designed by airbnb that allows you to export after effect animations as json to playback in any app. If you know me or my website you know that I use rive, previously known as flare for my animations given how easy it is to make the actual animations to use. In this case my client has provided me with animations that they would like to use in their app. Their animators use after effects so it's easier to export them as Lottie animations than have them rebuild their animations in rive just to please me. Even though they probably would ;)

## Setup

We'll start off by adding the [Lottie package](https://pub.dev/packages/lottie) into our pubspec.

```yaml
lottie: ^0.6.0
```

Then we will make use of the splash screen animations. Now I obviously can't give you the files that I'm using since they belong to the client, but below you can see a preview of the animation. To get your own file head over to [Loffiefiles](https://lottiefiles.com/) where you can get thousands of free lottie animations. Download 1 that's short and loopable and then you can get started.

![Lottie Splash screen animation](/assets/tutorials/055/055-splash-animation.gif)

When you have your file, create a new folder in root called assets with a folder inside called lottie. Place your file in there. For me the path to the file is `assets/lottie/login.json`. Then you can open the pubspec.yaml file again and add the asset path under the assets section.

```yaml
assets:
  - assets/lottie/login.json
```

That's all the setup required for the package and the animation. Onto the code.

## Usage

The usage of a Lottie animation is easy. This is all you need.

```dart
Lottie.asset('assets/lottie/login.json')
```

That will load the animation you have added and play it. Unfortunately we can't use that. The first reason is, the client wants the full intro animation to play whenever the app opens. And the second reason comes from us, we can't navigate away from the `StartUpView` until the initialisation logic is complete. If we do the app will be broken, that's where we get the user information, setup the database, register for push notifications etc. It never takes very long but in some cases, like where you need to fetch information, like language strings, it might take some time given network connectivity or size of the payload. So because of that we need to play this using an animation controller. Open up your startup view. it will probably look something like this.

```dart
class StartupView extends StatelessWidget {
  const StartupView({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ViewModelBuilder<StartupViewModel>.reactive(
      builder: (context, model, child) => Scaffold(
        backgroundColor: kcPrimaryColor,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              // Image
              Image.asset(
                'assets/images/logos/startup.png',
                height: screenHeightFraction(context, dividedBy: 4),
              ),
              verticalSpaceMedium,
              // Loading indicator
              CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation(Colors.white),
              )
            ],
          ),
        ),
      ),
      onModelReady: (model) => SchedulerBinding.instance
          .addPostFrameCallback((_) => model.initialise()),
      viewModelBuilder: () => StartupViewModel(),
    );
  }
}
```

Nothing special. Just an image with a loading indicator underneath it that spins until the initialise function is complete. What we need from the lottie animation is to know when it has completed it's first playback.

### Lottie with Animation Controller

to achieve that we'll need an animation controller. I prefer to use [flutter_hooks](https://pub.dev/packages/flutter_hooks) for animation because I don't have to convert to a stateful widget, keep track of the controller, dispose the controller and provide tickers etc. So you can add flutter_hooks to your pubspec and then change the StartupView to a `HookWidget`. You can also create a new final variable called animationController and use the `userAnimationController` function to get a new animation controller.

```dart
class StartupView extends HookWidget {
  const StartupView({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final animationController = useAnimationController();
    ...
  }
}
```

Then we can setup the Lottie widget to load the animation and then start playing it when ready. So instead of using the Lottie animation like shown above you'll still load it with the `asset` constructor but this time provide a controller an an onLoaded function.

```dart
// Inside build function. Refer to full source above
...
Scaffold(
    backgroundColor: kcPrimaryColor,
    body: Center(
      child: ,
    ),
  )
```

This will start the app, when the splash screen is removed it will play the Lottie animation in the centre of the screen. The next thing we need to do is make sure we know when the animation is complete. This is quite easy given we have the `animationController` at our disposal. We can listen to the status of that controller and call a function our `ViewModel` based on that. Add this code into the onLoaded function seen above.

```dart
...
onLoaded: (composition) {
  animationController.addStatusListener((status) {
    if (status == AnimationStatus.completed) {
      model.indicateAnimationComplete();
    }
  });

  // Configure the AnimationController with the duration of the
  // Lottie file and start the animation.
  animationController
    ..duration = composition.duration
    ..forward();
},
...
```

Then you can open up the `ViewModel` and add the function `indicateAnimationComplete`.

```dart
class StartupViewModel extends BaseViewModel {
  ...
  bool _animationComplete = false;
  ...

  void indicateAnimationComplete() {
    _animationComplete = true;
  }
}
```

### Delay the startup logic

If you look at the function that runs the startup logic in the full `ViewModel` code below.

```dart
class StartupViewModel extends BaseViewModel {
  final log = getLogger('StartupViewModel');
  final _sharedPreferencesService = locator<SharedPreferencesService>();
  final _navigationService = locator<NavigationService>();
  final _database = locator<DDDatabase>();
  final _driftChatService = locator<DriftChatService>();
  final _permissionsService = locator<PermissionsService>();
  final _userService = locator<UserService>();

  bool _animationComplete = false;

  Future initialise() async {
    await locator<RemoteConfigService>().initialise();
    await _driftChatService
        .setupDrift(FlavorConfig.instance.values.driftChatId);

    var hasUser = _sharedPreferencesService.hasUser;
    var isGuestUser = _sharedPreferencesService.guestMode;
    log.v('hasUser:$hasUser');

    if (hasUser || isGuestUser) {
      // Database initialised first because user service will insert the address
      // into the database
      await _database.initialise();
      await _userService.initialise();

      if (!isGuestUser) {
        await _driftChatService.registerUser(
          userId: _userService.currentUser.id.toString(),
          email: _userService.currentUser.email,
        );
      }

      if (_userService.currentAddress != null) {
        await _navigationService.replaceWith(Routes.homeView);
      } else {
        var hasPermission = await _permissionsService.hasLocationPermission;
        if (!hasPermission) {
          await _permissionsService.requestLocationPermission();
        }

        await _navigationService.replaceWith(
          Routes.addressSelectionView,
          arguments: AddressSelectionViewArguments(
            showDefaultUi: false,
            firstSignIn: true,
            localOnly: isGuestUser,
          ),
        );
      }
    } else {
      await _navigationService.replaceWith(Routes.welcomeView);
    }
  }

  void indicateAnimationComplete() {
    _animationComplete = true;
  }
}
```

You can see here that we have 3 possible places to navigate to and all of them make use of the `replaceWith` function on the `NavigationService`. This is the only call that we need to delay. There are a few ways to implement this but we'll choose a straight forward approach to keep the implementation short. We'll create a new function called `_replaceWith` that will take in the route to go to and arguments if any. It's basically a copy of the original replace with function but instead will store the route and arguments it was called with and will only navigate if the \_animationComplete value is true.

```dart
Future _replaceWith({String route, dynamic arguments}) async {
    var hasDestinationRoute = _destinationRoute != null;
    var hasDestinationArguments = _destinationArguments != null;

    // Set the route only if we don't have a route
    if (!hasDestinationRoute) {
      _destinationRoute = route;
    }

    // set the arguments only if we don't have arguments
    if (!hasDestinationArguments) {
      _destinationArguments = arguments;
    }

    // navigate only if the animation is complete
    if (_animationComplete && _destinationRoute != null) {
      await _navigationService.replaceWith(
        _destinationRoute,
        arguments: _destinationArguments,
      );
    }
  }
```

Now we can replace all the replaceWith calls on the `NavigationService` with this function above.

```dart
// replace home view navigation
await _replaceWith(route: Routes.homeView);
...

// replace address selection navigation
await _replaceWith(
  route: Routes.addressSelectionView,
  arguments: AddressSelectionViewArguments(
    showDefaultUi: false,
    firstSignIn: true,
    localOnly: isGuestUser,
  ),
);
...

// replace welcome view navigation
await _replaceWith(route: Routes.welcomeView);
```

The final thing to do is to update the `indicateAnimationComplete` function to return a Future and await the replaceWith call with no parameters.

```dart
Future indicateAnimationComplete() async {
  _animationComplete = true;
  await _replaceWith();
}
```

This is the logic that will be followed for the navigation delay until animation is complete and business logic is complete. Lets go over the 2 scenarios.

1. **Business logic completes first** (most likely in every scenario):

- Business logic completes and gets to navigation portion. This call sets the destinationRoute and destinationArguments.
- Animation completes, sets `_animationComplete` to true and calls replaceWith without arguments. This then uses destination arguments calls the replace with function on the navigation service

2. **Animation completes first**:

- Animation completes and sets `_animationComplete` to true. Calls `_replaceWith` but nothing happens because `hasDestinationRoute` is false.
- Business logic completes. calls `_replaceWith`, sets the destination arguments, sees that `_animationComplete` is true, navigates away.

That's it.
