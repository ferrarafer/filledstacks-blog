---
title: How to Mock for Unit Testing
description: This tutorial goes over Mocking in Unit Tests.
authors:
  - en/dane-mackier
published: 2020-06-21
updated: 2020-06-21
postSlug: how-to-mock-for-unit-testing
ogImage: /assets/tutorials/052/052.jpg
ogVideo: https://www.youtube.com/embed/Kq-YMAE1ssA
featured: false
draft: false
tags:
  - stacked
  - provider
  - testing
# codeUrl: https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F052%2F052-starting.zip?alt=media&token=a3649942-6868-4d30-8cfd-b3fdbf55cebe
# friendlyId: tutorial-052
---

In this tutorial we will be looking at Mocking in Unit tests, why we need mocking, what problem is it solving and how to mock in Flutter. This is a video that is apart of an existing set of tutorials that go over the Stacked Architecture implementation that we use in production for clients. In the previous tutorial we covered How to Unit Test. In this video we'll go over some of the setup required to properly mock and write unit tests.

## What is Mocking

Mocking is the act of creating duplicates of a real class to simulate the required behaviour. It will be an exact copy of your public facing interface for a class but you can control what it returns, when it returns those values as well as how it returns those values.

## Why is Mocks Important

When writing unit tests, you want to only be testing the code that does the actual unit of work. This means that you cannot have non-deterministic behaviours. Things like calling DateTime.now is non deterministic because your test might fail depending on what time of the day it is on the system it's running. This allows you to do STRICT unit testing which is testing ONLY the unit of work or functionality at hand. Mocks are also important early on in the development because it allows you to develop your system / application without being concerned about the implementation details.

## How to Mock

All the theory in the world won't help with unit testing, it's one of those practices that has to be practiced. So lets move onto Mocking in Flutter. Before we start you can [download the starting code here](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F052%2F052-starting.zip?alt=media&token=a3649942-6868-4d30-8cfd-b3fdbf55cebe) which we'll use to setup the mocking as well write some tests in.

### Setup

The mocking library we'll use is called [Mockito](https://pub.dev/packages/mockito). This library allow you to create a Mock of any class and supply different values for functions being called. Open up the pubspec.yaml file and you'll see under dev dependencies we have mockito. If you're working in your own project then add it.

```yaml
dev_dependencies:
  flutter_test:
    sdk: flutter
  ...
  mockito:
```

### Using Mocks for Development

Lets go over what HAS to be mocked during unit testing. If you remember the rules for How to determine a unit test from the "How to Unit Test" tutorial. You might remember these few rules.

- **Testing an interaction**: When I call THIS function on my ViewModel does it call THIS function on my service. These seem silly but they serve an important role of documenting interaction between services.
- **Testing conditionals**: When calling this function, if the value is X call service Y with X+2 etc.
- **Testing error handling**: Given I call this function should throw exception with this value. Given I get an exception we should call show dialog and inform the user.
- **Testing how our code reacts to values from services**: This is where the mocks come in, given the api returns this result, check that the state is correct, or a function was called.

All 4 of these rules require you to create mocks in order to confirm the unit of work has been done as expected. Lets make use of mocks by developing with it. Open up the `StartupViewModel` where we will write the functionality to clone the logic in one of our Production apps. This process will illustrate to you how powerful mocks are during testing as well as outside of testing. We will develop all the business logic using Mocks only and unit tests. This is the business requirement for the application logic.

1. If there's no user on disk show the user the `WelcomeView`.
2. If there's a user on disk, get the current address from the Database.
3. If there's no Address in the database take the user to the `AddressSelectionView`. This happens when the user quits during the sign up flow, before they select an address.
4. If there's an address in the Database then navigate directly to the HomeView
5. Before the item above, we need to make sure the user has permissions.
6. If the app does not have permission to use location request the location permission

These are the business rules for the startup logic. Lets start writing tests for them. We'll use a TDD approach to iron out all the code required.

### Creating Tests and Using Mocks

Under the viewmodel_tests folder in the tests folder create a new file called startup_viewmodel_test.dart

```dart
import 'package:flutter_test/flutter_test.dart';

void main() {
 group('StartupViewmodelTest -', (){
   group('initialise -', () {

   });
 });
}
```

Then we'll start with a test to handle functionality in point number 1. To test this functionality there's two unit tests involved. The first one is we need to check if there's a user on disk. Then if there is a user we should navigate to the HomeView. We'll start by writing the test.

```dart
test('When called should check hasUser on sharedPreferencesService', () async {
  var model = StartupViewModel();
  await model.initialise();
  verify(sharedPreferences.hasUser);
});
```

This test above won't even compile so lets create our first mock. Open up the test_helpers.dart file or create one under test/setup folder. This is where we'll create our Mocks. We want to Mock out the `SharedPreferencesService`. So lets create a mock. It's only 1 line of code so get ready.

```dart
import 'package:mockito/mockito.dart';
import 'package:my_app/services/shared_preferences_service.dart';

class SharedPreferencesServiceMock extends Mock
    implements SharedPreferencesService {}
```

This now gives you a mock that you can use to return any value that you want it to return. You can also use it to check if any of the public facing api was called during it's lifecycle. So back to the test. Now we'll instantiate a mock and then verify that hasUser has been called on it.

```dart
test('When called should check hasUser on sharedPreferencesService',
    () async {
  var sharedPreferences = SharedPreferencesServiceMock();
  var model = StartupViewModel();
  await model.initialise();
  verify(sharedPreferences.hasUser);
});
```

Now the test will compile, but it will fail. So lets go write the code to make this pass. Open up the `StartupViewModel`. Then we'll get the sharedPreferences from the locator and get the value .hasUser.

```dart
class StartupViewModel extends BaseViewModel {
  final _sharedPreferencesService = locator<SharedPreferencesService>();

  Future initialise() async {
    var hasUser = _sharedPreferencesService.hasUser;
  }
}
```

You should re-run the test again. And it still fails, well, now it's failing because it can't find the `SharedPreferencesService` in the locator. Easy peasy, we just register it before we construct the model.

```dart
test('When called should check hasUser on sharedPreferencesService',
    () async {
  var sharedPreferences = SharedPreferencesServiceMock();
  locator.registerSingleton<SharedPreferencesService>(sharedPreferences);
  var model = StartupViewModel();
  await model.initialise();
  verify(sharedPreferences.hasUser);
});
```

If you run this test now. It'll give a satisfying green check mark telling you that you've written some great code. Lets move onto the other test. For this test we want to check that if the sharedPreferences service return true for hasUser we navigate to the `HomeView`. First thing we can see is that we won't want to create the instance and register it with the locator everytime we write a test. As you can imaging, this would require about 15 tests and I don't like duplicated code. So in the test_helpers.dart class we'll create a function that constructs, registers and returns to us a mock to use.

```dart
SharedPreferencesService getAndRegisterSharedPreferencesMock() {
  var service = SharedPreferencesServiceMock();
  locator.registerSingleton<SharedPreferencesService>(service);
  return service;
}
```

Now we can use that in our test above as well.

```dart
test('When called should check hasUser on sharedPreferencesService',
    () async {
  var sharedPreferences = getAndRegisterSharedPreferencesMock();
  var model = StartupViewModel();
  await model.initialise();
  verify(sharedPreferences.hasUser);
});
```

Lets move onto the next test to complete number 1. When hasUser is true we should navigate to the `HomeView`. Lets write the test for that first.

```dart
  test(
      'When called and hasUser returns true, should call replaceWith Routes.homeViewRoute',
      () async {
    var navigationService = getAndRegisterNavigationServiceMock();
    var model = StartupViewModel();
    await model.initialise();
    verify(navigationService.replaceWith(Routes.homeViewRoute));
  });
```

Open up your test_runner.dart file and add the `Mock` and the getAndRegister for the `NavigationService`.

```dart
NavigationService getAndRegisterNavigationServiceMock() {
  var service = NavigationServiceMock();
  locator.registerSingleton<NavigationService>(service);
  return service;
}
```

When running this test you'll get a failure do to the SharedPreferencesService not being registered. We obviously want to avoid HAVING to register a service in every test, we know some ViewModels, like the 1 we're building now will use multiple services. This is where setup and tear down comes in.

### Test Setup and Teardown

This is a common pattern followed that allows you to write some code that will run before every test or before every group of tests. In our setup function we want to register all services. This is to mimic how it happens in the app. All services are registered before the app even runs as you'll see in the `setupLocator` function in main. Open up the test_helpers.dart file and we'll create a `registerServices` function.

```dart
void registerServices() {
  getAndRegisterSharedPreferencesMock();
  getAndRegisterNavigationServiceMock();
}
```

We'll also create a function to unregister services

```dart
void unregisterServices() {
  locator.unregister<SharedPreferencesService>();
  locator.unregister<NavigationService>();
}
```

Then we'll call this in a setUp and tear down function in the body of the main group.

```dart
group('StartupViewmodelTest -', () {

    setUp(() => registerServices());

    tearDown(() => unregisterServices());

    group('initialise -', () {
      ...
    });
  });
```

If you run the test now you'll see that you get a "Type is already registered" message for navigation service. This is because the setUp now registers the navigation service already. To fix this we'll create a helper function that we'll call as the first thing in all of our `getAndRegister` helper functions. This function will check if the type is registered. If it is registered it will unregister it from the locator.

```dart
void _removeRegistrationIfExists<T>() {
  if (locator.isRegistered<T>()) {
    locator.unregister<T>();
  }
}
```

Now you can update your `getAndRegister` functions and add this line as the first line.

```dart
SharedPreferencesService getAndRegisterSharedPreferencesMock() {
  _removeRegistrationIfExists<SharedPreferencesService>();
  ...
}

NavigationService getAndRegisterNavigationServiceMock() {
  _removeRegistrationIfExists<NavigationService>();
  ...
}
```

If you run the test now you'll get the actual failure. There's no calls to the `NavigationService`. Lets add the code for the ViewModel.

```dart
class StartupViewModel extends BaseViewModel {
  final _sharedPreferencesService = locator<SharedPreferencesService>();
  final _navigationService = locator<NavigationService>();

  Future initialise() async {
    var hasUser = _sharedPreferencesService.hasUser;

    if (hasUser) {
      await _navigationService.replaceWith(Routes.homeViewRoute);
    }
  }
}
```

Aaaaaand, if you run the test now it still fails. Haha, TDD is not for everyone. It's saying that a boolean expression can't be null. hasUser is returning null from the sharedPreferences. Lets fix that by stubbing the mock. Go to the `getAndRegisterSharedPreferencesMock` function in test_helpers. then we'll add the code that says. When calling hasUser, return true. We want this code to be configurable so we'll add an optional property to the function that allows us to change the outcome of this property getter at any time.

```dart
SharedPreferencesService getAndRegisterSharedPreferencesMock({
  bool hasUser = true,
}) {
  _removeRegistrationIfExists<SharedPreferencesService>();
  var service = SharedPreferencesServiceMock();

  when(service.hasUser).thenReturn(hasUser);

  locator.registerSingleton<SharedPreferencesService>(service);
  return service;
}
```

The default value will be true so that we have to explicitly set it to false when it should be. Finally, if you run this test now then your test will pass and you have 1 business requirement met, and all your unit testing setup complete.

### Why the hell would I put in all that effort for two lines of code?

All of this upfront effort will allow you to rapidly develop functionality and test it without having to run the app once. No compiling, no building, instant feedback. And if you didn't notice, we're developing against the interfaces. There's no implementation details yet, there's actually no implementation yet. We can delay that for a long time or someone else can fill in the empty implementations while you're busy. We won't need implementations to develop any of the business logic. Don't take that fact for granted. This is a space for rapid development to take place. You can develop all of the business logic and hand off the service classes to the other team members to fill in the implementation details. You can work at the same time because of the basic abstraction put into place and the fact that you're "running" the app through unit tests so you don't need whole building and compiling functionality.

### Additional examples

Lets write tests for the second business requirement as well as the third one, after that it'll be pretty boring repeating all that so I will leave it to you to write the rest on your own and compare to the tests I have in the main repo. Lets go with the next one. When there's a user on disk we have to get the currentAddress from the database.

```dart
test(
    'When called and hasUser returns true, should get currentAddress from disk',
    () async {
  var database = getAndRegisterAppDatabaseMock();
  var model = StartupViewModel();
  await model.initialise();
  verify(database.getCurrentAddress());
});
```

You can then create the database mock and register function, AND DON'T FORGET to add it to the `registerServices` and `unregisterServices` functions.

```dart
class AppDatabaseMock extends Mock implements AppDatabase {}

AppDatabaseMock getAndRegisterAppDatabaseMock() {
  _removeRegistrationIfExists<AppDatabase>();
  var database = AppDatabaseMock();
  locator.registerSingleton<AppDatabase>(database);
  return database;
}

void registerServices() {
  ...
  getAndRegisterAppDatabaseMock();
}

void unregisterServices() {
  ...
  locator.unregister<AppDatabase>();
}
```

A good habbit to pick up is to always run the test when you're completed the tests code.So to avoid me typing "Now run the test" after changes, you should be running your tests all the time. I like the test to fail before I write the code. That's just a preference and you don't have to do it that way. Now we can write the code to make the test pass.

```dart
class StartupViewModel extends BaseViewModel {
  final _sharedPreferencesService = locator<SharedPreferencesService>();
  final _navigationService = locator<NavigationService>();
  final _database = locator<AppDatabase>();

  Future initialise() async {
    var hasUser = _sharedPreferencesService.hasUser;

    if (hasUser) {
      var currentAddress = await _database.getCurrentAddress();

      await _navigationService.replaceWith(Routes.homeViewRoute);
    }
  }
}
```

To test that everything is still working with all the tests run flutter test command and you should see all the tests passing. Next up we'll check if there's no address on disk then we should navigate to the `AddressSelectionView`. We'll have to update our getDatabaseMock function to allow us to return an address or null. We'll add an optional value `returnAddress` that has a default value of true to the setup function. If true we return an instance of Address, if not we return null.

```dart
AppDatabaseMock getAndRegisterAppDatabaseMock({bool returnAddress = true}) {
  _removeRegistrationIfExists<AppDatabase>();
  var database = AppDatabaseMock();

  when(database.getCurrentAddress()).thenAnswer((realInvocation) {
    if (returnAddress) return Future.value(Address());
    return null;
  });

  locator.registerSingleton<AppDatabase>(database);
  return database;
}
```

Now we can write another test. If the getCurrentAddress returns null we should navigate to the `AddressSelectionView`.

```dart
test(
    'When hasUser is true and getCurrentAddress returns null, should navigate to addressSelectionViewRoute',
    () async {
  getAndRegisterAppDatabaseMock(returnAddress: false);
  var navigation = getAndRegisterNavigationServiceMock();
  var model = StartupViewModel();
  await model.initialise();
  verify(navigation.replaceWith(Routes.addressSelectionViewRoute));
});
```

Take note in the test above we're telling the DatabaseMock that there should be no address returned when calling `getCurrentAddress`. Now we can add the new code to the initialise function

```dart
Future initialise() async {
  var hasUser = _sharedPreferencesService.hasUser;

  if (hasUser) {
    var currentAddress = await _database.getCurrentAddress();
    if (currentAddress == null) {
      await _navigationService.replaceWith(Routes.addressSelectionViewRoute);
    } else {
      await _navigationService.replaceWith(Routes.homeViewRoute);
    }
  }
}
```

If you run the `flutter run` command now you'll see all tests still passing, so the old functionality still works. And you can guarantee that before even running the app. With this code we complete number 4 as well so now there's just number 5 and 6 left. I have created the services with their public properties/functions to write the rest of the code. I'd recommend you write the tests for #5 and #6. It's only 2 additional tests, which you can [checkout here in the full example](https://github.com/FilledStacks/stacked-example/tree/master/test/viewmodel_tests). That's it for mocking and a slight peek into TDD development. That's how I write all my business logic at this point. I skipped unit testing for a while because I was focused on creating a readable approach to app building in Flutter, now that that's done I'm adding back all my other process parts to guarantee my quality and speed of delivery.

Let me know what you'd like to see next over on the Slack. Link in the below footer. Chat soon.
Dane Mackier
