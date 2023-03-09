---
title: Firebase Authentication in Flutter
description: This tutorial will cover the implementation and architecture for Firebase Authentication.
authors:
  - en/dane-mackier
published: 2020-01-12
updated: 2020-01-12
postSlug: firebase-authentication-in-flutter
ogImage: /assets/tutorials/038/038.jpg
ogVideo: https://www.youtube.com/embed/tKET5s_Vu-c
featured: false
draft: false
tags:
  - firebase
  - authentication
# codeUrl: https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F038%2Fauthentication_starting.zip?alt=media&token=369d0a6a-0124-482d-972b-086bc357efa2
---

Today we'll be going over the production practices I follow when implementing email authentication using Firebase in Flutter. This will be a complete free Firebase Flutter course so be sure to [subscribe on Youtube](https://www.youtube.com/filledstacks) to ensure you get notified when the new videos come out. We'll be building a social media app called compound. It's called compound because that's the middle word of the book in front of me on my desk. "The Compound Effect". Even if you don't want to build a social media app, I'll be teaching you the principles you need to apply to a firebase project to build literally any app you want.

## The Architecture

If you don't know, I use an [Mvvm Style architecture](https://youtu.be/kDEflMYTFlk) with Provider for my UI / Business logic separation and get_it as a service locator. I've found this to be the most consistent and easy to understand architecture that I've used in production. It keeps implementations short and specific. In short the architecture specifies that each view or basic widget can have it's own ViewModel that contains the logic specific to that piece of UI. The ViewModel will make use of services to achieve what the user is requesting through their interactions.

Services is where all the actual work happens. ViewModels make use of the services but doesn't contain any hard functionality outside of conditionals and calling services. So, to get to the task at hand. We'll have an Authentication service that we'll use to sign in or sign up with that will store an instance of the current firebase user for us to use when required. We will have two views, Login and SignUp view which will make of the two functions on the service. The entire backend of the application will be built using Firebase so make sure to go to your [console](https://console.firebase.google.com) and login with a gmail account.

## Setup Firebase Project

Open up the [firebase console](https://console.firebase.google.com) and click on "Add Project". Call it "compound", go next, select your account and then create. This will take a few seconds to setup. When it's complete click on continue and you'll land on the overview page.

Click on the Android Icon (or iOS) and add your package name, I'll set mine to com.filledstacks.compound. I'll set the nickname to "Compound". Register the app and then download the google-services.json file. If you have your own project or want to use my starting code, [which you can download here](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F038%2Fauthentication_starting.zip?alt=media&token=369d0a6a-0124-482d-972b-086bc357efa2), open up the code and place the google-service.json file in the android/app folder. Then open the build.gradle file in the android/app folder and change the applicationId to match the one you entered for your Firebase project.

### Setup in code

Open up the pubspec.yaml and add the firebase_auth plugin.

```yaml
firebase_auth: ^0.15.3
```

Then we have to enable the google services. Open the build.gradle file in the android folder and add the google services dependency.

```
    dependencies {
        // existing dependencies
        classpath 'com.android.tools.build:gradle:3.5.0'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"

        // Add the google services classpath
        classpath 'com.google.gms:google-services:4.3.0'
    }
```

Open up the android/app/build.gradle file and apply the google services plugin. Add the following line at the bottom of the file.

```
// ADD THIS AT THE BOTTOM
apply plugin: 'com.google.gms.google-services'
```

That's it for the Android setup. Lets continue with the Firebase project. Once you've created the app you can go next and skip the firebase comms check that they do. On the left hand side, click on the Authentication Icon. The third icon from top (might change). Click on the Setup sign in methods button and click on email / password and enable it. That's it for the project setup, we'll get back to the Firebase console in the next episode.

## Authentication Implementation

The starting code that I provided has a few things setup already.

1. It contains the provider_architecture package which we use for the MvvmStyle bindings.
2. It has an InputField widget which is styled how I want it.
3. It has the locator for get_it setup [like this](https://www.filledstacks.com/snippet/dependency-injection-in-flutter/)
4. It has a [Navigation Service](https://youtu.be/kopdISefbJc) so we can navigate from the ViewModels and other services
5. It has a [Dialog Service](https://youtu.be/IrFU_BrCWnE) for showing default dialogs
6. It has the login view as well as the sign up view created and styled.

This is to make sure we keep the app to the point and only show the firebase parts. We'll be creating the Authentication service and then using it in the viewmodels, which are completely empty.

### Authentication Service

The responsibility of the AuthenticationService in this case is to wrap the Firebase Authentication functionality for us. It will send the info we entered, and then tell us if it's successful or not. If it fails we return an error message to show the user. Under the services folder create a new file called authentication_service.dart.

```dart
import 'package:flutter/foundation.dart';

class AuthenticationService {
  Future loginWithEmail({@required String email, @required String password}) {
    // TODO: implement loginWithEmail
    return null;
  }

  Future signUpWithEmail({@required String email, @required String password}) {
    // TODO: implement signUpWithEmail
    return null;
  }
}
```

We'll start off keeping a reference to the `FirebaseAuth` instance locally. Then we'll perform `signInWithEmailAndPassword` and store the result in a variable called user. If there's no errors we'll check if the user is not null and return that value. If it fails we return the message from the error.

```dart
final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;

Future loginWithEmail({
    @required String email,
    @required String password,
}) async {
    try {
        var user = await _firebaseAuth.signInWithEmailAndPassword(
            email: email, password: password);
        return user != null;
    } catch (e) {
        return e.message;
    }
}
```

Sign up looks very similar. The only difference is that the result of the `createUserWithEmailAndPassword` function returns a `FirebaseAuth` object instead of the user like login.

```dart
Future signUpWithEmail({
    @required String email,
    @required String password,
}) async {
    try {
        var authResult = await _firebaseAuth.createUserWithEmailAndPassword(
            email: email, password: password);
        return authResult.user != null;
    } catch (e) {
        return e.message;
    }
}
```

That's it for the `AuthenticationService`. Open up the locator.dart file and register the service as a lazy singleton. All that means is that there will only ever be 1 authentication service in existence, and we'll lazily create it once it has been requested the first time.4

```dart
void setupLocator() {
  locator.registerLazySingleton(() => NavigationService());
  locator.registerLazySingleton(() => DialogService());
  locator.registerLazySingleton(() => AuthenticationService());
}
```

## Signup Logic

We'll start with sign up so that we can then perform a login afterwards. Open up the main.dart file and make sure home is set to `SignUpView`. Then open up the signup_view_model.dart file. We'll start by retrieving the `AuthenticationService`, `NavigationService` and `DialogService` from the locator. Then we'll create a function called SignUp that takes the email and password. In this function we'll set the view to busy before requesting, do the sign up. Then check the result, if it's a bool and it's true then we navigate to the HomeView. If it's false we'll show a general dialog, if it's a string we'll show the content as a dialog.

```dart
class SignUpViewModel extends BaseModel {
  final AuthenticationService _authenticationService =
      locator<AuthenticationService>();
  final DialogService _dialogService = locator<DialogService>();
  final NavigationService _navigationService = locator<NavigationService>();

  Future signUp({@required String email, @required String password}) async {
    setBusy(true);

    var result = await _authenticationService.signUpWithEmail(
        email: email, password: password);

    setBusy(false);
    if (result is bool) {
      if (result) {
        _navigationService.navigateTo(HomeViewRoute);
      } else {
        await _dialogService.showDialog(
          title: 'Sign Up Failure',
          description: 'General sign up failure. Please try again later',
        );

      }
    } else {
      await _dialogService.showDialog(
        title: 'Sign Up Failure',
        description: result,
      );
    }
  }
}
```

Open up the `SignUpView` file. Update the `BusyButton` to take in the busy property from the model and in the onPressed function call `model.signUp`.

```dart
 BusyButton(
    title: 'Sign Up',
    busy: model.busy,
    onPressed: () {
        model.signUp(
        email: emailController.text,
        password: passwordController.text,
        );
    },
)
```

If you run the app now, enter some details and login you'll see it navigate to the HomeView. If you want to see the error dialog enter a password with less than 6 characters and you'll see the dialog pop up. Also if you've already signed up you can try signing up with the same email again and you'll get a friendly error message :)

## Login Logic

The login logic logic is literally exactly the same as the sign up logic. Being able to refactor for shared code is a good skill to have, I'll leave it up to you as an exercise to do. For now we'll write non dry code by simple repeating the pattern. Open up the login_view_model.dart

```dart

class LoginViewModel extends BaseModel {
  final AuthenticationService _authenticationService =
      locator<AuthenticationService>();
  final DialogService _dialogService = locator<DialogService>();
  final NavigationService _navigationService = locator<NavigationService>();

  Future login({@required String email, @required String password}) async {
    setBusy(true);

    var result = await _authenticationService.loginWithEmail(
        email: email, password: password);

    setBusy(false);

    if (result is bool) {
      if (result) {
        _navigationService.navigateTo(HomeViewRoute);
      } else {
        await _dialogService.showDialog(
          title: 'Login Failure',
          description: 'Couldn\'t login at this moment. Please try again later',
        );
      }
    } else {
      await _dialogService.showDialog(
        title: 'Login Failure',
        description: result,
      );
    }
  }
}
```

Open the login view. Pass the busy value to the `BusyButton` and in the onPressed function call the login function.

```dart
 BusyButton(
    title: 'Login',
    busy: model.busy,
    onPressed: () {
        model.login(
            email: emailController.text,
            password: passwordController.text,
        );
    },
)
```

Open up the main.dart file and change home to `LoginView`. If you re-run the code now you'll land on the `LoginView`. Enter the details you entered, click login and you're done :) . This is just the start of the app, we'll add functionalities a normal app would have throughout the rest of the series. In the next tutorial we'll make sure once we're signed in we go straight to the `HomeView`. We'll also create a user profile, make sure it's always available when the app is open and add roles (for later use ;) ).

I decided to ask you guys to start sharing the tutorials more, I'm still seeing some unmaintainable code when new clients come to me. We have to spread the architecture and code quality love around and make that the core focus when building apps. Until next time, Dane Mackier.
