---
title: Handle Users profile in Flutter
description: This tutorial shows you how to handle the users profile during Authentication flows in Fultter.
authors:
  - en/dane-mackier
published: 2021-04-25
updated: 2021-04-25
postSlug: handle-users-profile-in-flutter
ogImage: /assets/tutorials/071/071.png
ogVideo: https://www.youtube.com/embed/81XYs6lliB4
featured: false
draft: false
tags:
  - stacked
  - stacked-services
  - boxtout
# friendlyId: tutorial-071
---

In this episode of BoxtOut we will be setting up our Firebase Backend to manage our users and also setup the mobile application to handle that user.

## Backend

On the backend we know we need a `Users` collection. This is the collection that will keep the Users information. Since we're dealing with NoSql we don't have to know the entire schema up front. We can grow it and add what we need to over time.

## Client Code

### Setting up our models

In the customer we will start by creating our User model using Freezed and json_serializable. We'll add the required packages for both.

```yaml
dependencies:
	...
	# data models
  freezed_annotation: ^0.14.1
  json_annotation: ^4.0.1

dev_dependencies:
	...
	# data models
  freezed: ^0.14.1+2
	json_serializable: ^4.1.0
```

Then in the lib folder we'll create a new folder called `models` and inside a new file called `application_models.dart`

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'application_models.freezed.dart';
part 'application_models.g.dart';

@freezed
class User with _$User {
  factory User({
    required String id,
    String? email,
  }) = _User;

factory User.fromJson(Map<String, dynamic> json) =>
_$UserFromJson(json);
}
```

To create that model you can setup the [stacked snippets](https://gist.github.com/FilledStacks/b57b77da10fdcb2d4d95a28de4a4ced4) and type `frzjs` and press tab. That will generate everything for you and allow you to change the model name easily. That's it for our model. Before we start using that lets update our `app.dart` file to make use of the new `StackedLogger` functionality. Add a `StackedLogger` into the annotation.

```powershell
@StackedApp(
  ...
  logger: StackedLogger(),
)
```

When that's complete you can run `flutter pub run build_runner build --delete-conflicting-outputs`

### Using our models

Now that we have the model lets go over the plan of getting the user into our system from the code side. The first thing we need to do is create a user document for the user that was signed in. There's two ways to do this.

1. We create the user using a reactive function on firebase
2. We create the user on our side and create a new document on firebase

In this scenario I like the second option because we'll need the entire model locally. So we'll construct our model and then create a new document in the users collection from our side. Next we have to figure out where we're going to create the user and what's the logic behind creating a user. Lets go over the use cases:

- When we create a new account we want to create a new user using the userID returned from firebase
- When we login we will first check if there's a user document with that id.
  - If there's no document for that Id then we'll create one.
  - If there is a document we want to sync that info

Because both of the cases above have the same final outcome (a document will exist and be downloaded) we can write the logic in that way as well. We know after any authentication (login or sign up) we have to get the users profile document. So we'll add it into our `AuthenticationViewModel` flow. We'll wrap all this functionality into our `UserService`, but before we can create a `UserService` to manage all this for us, we need a way to communicate with the Firestore Database.

### Creating the FirestoreApi

Create a new folder `lib/api` and in that folder create a new file called `firestore_api.dart`. Based on the flow we described above we'll need to create 2 functions relating to the user.

- `createUser`: Creates a new user document in the database
- `getUser`: Returns a user from the usersCollection if the document with the id exists

That's the basic functionality that we're looking for in the `UserService` . We can create a class called `FirestoreApi` and we'll have the logger and a `CollectionReference` to the `users` collection.

```dart
/// Contains the functionality to interact with the Firestore database
class FirestoreApi {
  final log = getLogger('FirestoreApi');
  final CollectionReference usersCollection =
      FirebaseFirestore.instance.collection("users");

}
```

Add the firestore package into your pubspec

```yaml
cloud_firestore: ^1.0.6
```

Then we can write each of the functions. Before we do that I want to create an exception class that we'll use specifically for `FirestoreApiExceptions`. Create a new folder `lib/exceptions` and in that folder create a new file called `firestore_api_exception.dart`

```dart
class FirestoreApiException implements Exception {
  final String message;
  final String? devDetails;
  final String? prettyDetails;

  FirestoreApiException({
    required this.message,
    this.devDetails,
    this.prettyDetails,
  });

  @override
  String toString() {
    return 'FirestoreApiException: $message ${devDetails != null ? '- $devDetails' : ''}';
  }
}
```

This class takes in a message (general message), `devDetails` which will be used to give any insights into why this happened and `prettyDetails` which is a message pretty enough to show to the user if it gets that high up. Now we can implement the first function in the `FirestoreApi`.

**Create User**

```dart
/// Creates a new user document in the [usersCollection]
  Future<void> createUser({required User user}) async {
    log.i('user:$user');

    try {
      final userDocument = usersCollection.doc(user.id);
      await userDocument.set(user.toJson());
      log.v('UserCreated at ${userDocument.path} ...');
    } catch (error) {
      throw FirestoreApiException(
        message: 'Failed to create new user',
        devDetails: '$error',
      );
    }
  }
```

Quite simple as you can see, we first log out the `user` then we create a `DocumentReference` using the user's id (from firestore) as the document name. Once we have that we call set on the document and pass in the user map. If anything goes wrong we catch the error then throw our own `FirestoreApiException` we'll provide a message and then the stack trace as the `devDetails`. This will be more detailed when we start to experience different exceptions.

**Get User**

```dart
/// Returns a [User] from the [usersCollection] if the document exists
Future<User?> getUser({
  required String userId,
}) async {
  log.i('userId:$userId');

  if (userId.isNotEmpty) {
    final userDoc = await usersCollection.doc(userId).get();
    if (!userDoc.exists) {
      log.v('We have no user with id :$userId in our database');
      return null;
    }

    final userData = userDoc.data();
    log.v('User found.\nData:\n$userData');

    return User.fromJson(userData!);
  } else {
    throw FirestoreApiException(
        message:
            'Your userId passed in is empty. Please pass in a valid user id from your firestore database');
  }
}
```

With this function we simply get the userDoc directly using the `userId` passed in. If it doesn't exist then we throw an exception, else we serialise that user into the `User` model and then return that data. That's all we need to start building our `UserService`.

### Setting up a User Service

This class is dedicated to handling anything involving the user. This class will track the `currentUser`, it will sync the user from the api if it's not set yet and will decide to create or sync a user profile when we go through our auth flow. Create a new file called `user_service.dart` in the `lib/services` folder.

```dart
/// Provides all the functionality relating to the user logged in
class UserService {
  final log = getLogger('UserService');

  final _firestoreApi = locator<FirestoreApi>();
	final _firebaseAuthenticationService =
	      locator<FirebaseAuthenticationService>();

}
```

We'll import both the firebase services and setup the logger. then we can add two properties we'll be using.

```dart
User? _currentUser;

/// Returns the [User] account for the user currently logged in
User get currentUser => _currentUser!;
```

These properties are what we'll use to check what we need to to make our decisions later on. Then we'll add a function to get the users account and set it to the `_currentUser`.

**Syncing the Users Account**

```dart
Future<void> syncUserAccount() async {
  final firebaseUserId =
      _firebaseAuthenticationService.firebaseAuth.currentUser!.uid;

  log.v('Sync user $firebaseUserId');

  final userAccount = await _firestoreApi.getUser(userId: firebaseUserId);

  if (userAccount != null) {
    log.v('User account exists. Save as _currentUser');
    _currentUser = userAccount;
  }
}
```

We get the uid from the current logged in user. Then we get that account from the database and if it exists we'll save it in memory to use during our session.

**Sync or Create User Account**

This function will perform a sync of the user's data. If there's nothing it will create the account and then save it to `_currentUser` after creating it.

```dart
/// Syncs the user account if we have one, if we don't we create it
Future<void> syncOrCreateUserAccount({required User user}) async {
  log.i('user:$user');

  await syncUserAccount();

  if (_currentUser == null) {
    log.v('We have no user account. Create a new user ...');
    await _firestoreApi.createUser(user: user);
    _currentUser = user;
    log.v('_currentUser has been saved');
  }
}
```

If the user is still null after performing a sync then we can assume that there's no user profile for that account and that we have to create one.

### Handle User Account during Authentication Flow

Now that we have all the tools needed to build out this authentication flow we can add it into our `AuthenticationViewModel`. We'll update the `_handleAuthenticationResponse` to return a `Future<void>` then before we navigate away to our success route we should `syncOrCreateUserAccount`. This way we know 100% that we'll have a user account when we navigate away from this view. We'll start by simply adding a logger to the `ViewModel` and getting the `userService` from the locator

```dart
abstract class AuthenticationViewModel extends FormViewModel {
	final log = getLogger('AuthenticationViewModel');
  final userService = locator<UserService>();

  ...
}
```

Then we'll update the `saveData` function to log out the values of the form map and also throw an exception if the busy future fails with an exception. Because it'll now not swallow that exception and fire `onError` in the ViewModel we have to catch that exception ourselves and set the validation message.

```dart
Future saveData() async {
  log.i('values:$formValueMap');

  try {
    final result = await runBusyFuture(
      runAuthentication(),
      throwException: true,
    );

    await _handleAuthenticationResponse(result);
  } on FirestoreApiException catch (e) {
    log.e(e.toString());
    setValidationMessage(e.toString());
  }
}
```

And as you can see above the `_handleAuthenticationResponse` function is now a Future so we can update that.

```dart
/// Checks if the result has an error. If it doesn't we navigate to the success view
  /// else we show the friendly validation message.
  Future<void> _handleAuthenticationResponse(
      FirebaseAuthenticationResult authResult) async {
    log.v('authResult.hasError:${authResult.hasError}');

    if (!authResult.hasError && authResult.user != null) {
      final user = authResult.user!;

      await userService.syncOrCreateUserAccount(
        user: User(
          id: user.uid,
          email: user.email,
        ),
      );
      // navigate to success route
      navigationService.replaceWith(successRoute);
    } else {
      if (!authResult.hasError && authResult.user == null) {
        log.wtf(
            'We have no error but the user is null. This should not be happening');
      }

      log.w('Authentication Failed; ${authResult.errorMessage}');

      setValidationMessage(authResult.errorMessage);
      notifyListeners();
    }
  }
```

I've added some additional logs that might come in handy if there's any bugs on the firebase side. We should assume that when a login result has no error that the user is not null, BUT, you never know what can happen. So in that case I want a very important wtf log that will tell me something is terribly wrong. In addition to that I also wanted to log a warning to indicate that the authentication has failed. This is not an error because the user can retry and get back to where we want them to be, but we'd want to know what the issues are with login so we can maybe improve that down the line. The last thing is to make sure that everywhere we use `_handleAuthenticationResponse` we should add `await infront of it.

```dart
Future<void> useGoogleAuthentication() async {
  final result = await firebaseAuthenticationService.signInWithGoogle();
  await _handleAuthenticationResponse(result);
}

Future<void> useAppleAuthentication() async {
  final result = await firebaseAuthenticationService.signInWithApple(
    appleClientId: '',
    appleRedirectUri:
        'https://boxtout-production.firebaseapp.com/__/auth/handler',
  );
  await _handleAuthenticationResponse(result);
}
```

### Register New Services

We created two new service classes in this tutorial so we have to register them with the `StackedLocator` and run our `build_runner` again. Update your `app.dart` file to look like this.

```dart
@StackedApp(
  routes: [
    MaterialRoute(page: StartUpView),
    CupertinoRoute(page: AddressSelectionView),
    CupertinoRoute(page: CreateAccountView),
    CupertinoRoute(page: LoginView, initial: true),
  ],
  dependencies: [
    LazySingleton(classType: NavigationService),
    LazySingleton(classType: UserService),
    LazySingleton(classType: FirestoreApi),
    Singleton(classType: FirebaseAuthenticationService),
  ],
  logger: StackedLogger(),
)
class AppSetup {
  /** Serves no purpose besides having an annotation attached to it */
}
```

Now run

```powershell
flutter pub run build_runner build --delete-conflicting-outputs
```

And that's all the code done for updating our Authentication flow. To wrap up the implementation we need to.

### Enable the firestore API before running anything

Go to your `Firebase Project` in console and create the firestore DB. I'm choosing Europe west because I'm in South Africa and we'll start the DB in TestMode and then we'll add and write security rules in one of the upcoming episodes.

Now you can go ahead and run the code.

## Result

### Creating a new Account

When creating a new account the code creates that account, then syncs, sees that we have no user and then creates an account. The logs (if you added the same level of logging) should look something like this.

```powershell
I/flutter (28380): 💡  AuthenticationViewModel | saveData  - values:{fullName: BoxtOut Account, email: account@boxtout.com, password: password123}
I/flutter (28380):  AuthenticationViewModel | _handleAuthenticationResponse  - authResult.hasError:false
I/flutter (28380): 💡  UserService | syncOrCreateUserAccount  - user:User(id: 6WKwecwhL2gHr8fUTCikJaL9nRw2, email: account@boxtout.com, defaultAddress: null)
I/flutter (28380):  UserService | syncUserAccount  - Sync user 6WKwecwhL2gHr8fUTCikJaL9nRw2
I/flutter (28380): 💡  FirestoreApi | getUser  - userId:6WKwecwhL2gHr8fUTCikJaL9nRw2
I/flutter (28380):  FirestoreApi | getUser  - We have no user with id :6WKwecwhL2gHr8fUTCikJaL9nRw2 in our database
I/flutter (28380):  UserService | syncOrCreateUserAccount  - We have no user account. Create a new user ...
I/flutter (28380): 💡  FirestoreApi | createUser  - user:User(id: 6WKwecwhL2gHr8fUTCikJaL9nRw2, email: account@boxtout.com, defaultAddress: null)
I/flutter (28380):  FirestoreApi | createUser  - UserCreated at users/6WKwecwhL2gHr8fUTCikJaL9nRw2 ...
I/flutter (28380):  UserService | syncOrCreateUserAccount  - _currentUser has been saved
```

So we know for a fact we have the user account after that. You can check in the database as well if it all lines up using those details

### Logging in with Existing Account

When logging in with the details above we see the following logs.

```powershell
I/flutter (28510): 💡  AuthenticationViewModel | saveData  - values:{email: account@boxtout.com, password: password123}
I/flutter (28510):  AuthenticationViewModel | _handleAuthenticationResponse  - authResult.hasError:false
I/flutter (28510): 💡  UserService | syncOrCreateUserAccount  - user:User(id: 6WKwecwhL2gHr8fUTCikJaL9nRw2, email: account@boxtout.com, defaultAddress: null)
I/flutter (28510):  UserService | syncUserAccount  - Sync user 6WKwecwhL2gHr8fUTCikJaL9nRw2
I/flutter (28510): 💡  FirestoreApi | getUser  - userId:6WKwecwhL2gHr8fUTCikJaL9nRw2
I/flutter (28510):  FirestoreApi | getUser  - User found.
I/flutter (28510): Data:
I/flutter (28510): {id: 6WKwecwhL2gHr8fUTCikJaL9nRw2, email: account@boxtout.com, defaultAddress: null}
I/flutter (28510):  UserService | syncUserAccount  - User account exists. Save as _currentUser
```

We perform the login durnig `saveData` and then we sync the account. We see that the account exists, get the data and then we save that user in memory to `_currentUser`. With the above results we can confirm that with every auth flow we have the `_currentUser` is set to data matching what we have in the firestore Database so that's done and handled.
