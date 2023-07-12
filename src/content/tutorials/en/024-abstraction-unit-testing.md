---
title: Better Unit Tests in Flutter using Abstraction
description: In this tutorial we go over how abstraction benefits unit testing and how to setup your tests for provider and get_it.
authors:
  - en/dane-mackier
published: 2019-08-25
updated: 2019-08-25
postSlug: better-unit-tests-in-flutter-using-abstraction
ogImage: /assets/tutorials/024/024.jpg
ogVideo: https://www.youtube.com/embed/oZW3Eb3J9s0
featured: false
draft: false
tags:
  - flutter
  - abstraction
  - architecture
  - unit-testing
  - provider
  - get-it
# codeUrl: https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F024%2F024-abstraction-unit-test.zip?alt=media&token=869ee765-bc73-4a30-906f-91447890d1cf
---

In this tutorial we will go over how abstraction helps makes your unit testing easier and how to set it up. [In part 1](/post/develop-faster-in-flutter-using-abstraction), I explain what abstraction is and the benefits of it. Read the article if you want to know more about abstraction and some practical use cases.

## Abstraction in Unit Testing ✅

This tutorial won't cover the importance of unit testing, at all, it will specifically cover how abstraction is used to improve the robustness and validity of your unit tests. Also how you can write actual unit tests and not integration tests. [Here you can find a starting project](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F024%2F024-abstraction-unit-test.zip?alt=media&token=869ee765-bc73-4a30-906f-91447890d1cf) where I've implemented some basic functionality without abstraction. We will try to write a basic test for it and see how far we get.

Download the code in the link and open up post_service.dart in the services folder. You'll see a familiar site in terms of locating the actual implementation when using something like get it, or passing it in using something like provider. This is perfectly fine in production, the fact that you have specialised services / objects that deal with specific code only means you're taking a step in the right direction. BUT, when it comes to unit testing, this will not work out so well. For get_it users there's one additional step to think of, Provider users don't need to worry about this step. You have to make sure your implementations are registered when the tests run, lets fix that first before we continue the tutorial. Head over to the postservice_test.dart file and run the test. You can do this in Visual Studio code by clicking on the Run option above the group, or the individual test.

The test is confirming that the PostService can be constructed and it's not equal to null. As you see that fails because there's no Api or LocalStorage service registered in the locator. To fix this we can simply call setupLocator before we run the test. Or use the `setupAll` function for the group which will run the registered function once for the entire group of tests.

```dart
void main() {
  group('PostService Test | ', () {
    setUpAll(() {
      setupLocator();
    });

    test('Constructing Service should find correct dependencies', () {
      var postService = PostService();
      expect(postService != null, true);
    });
  });
}
```

If you run your test again you should see it pass. If you run the same test for Provider it will pass because we're not depending on a service locator to retrieve our services. We're using dependency injection when we use Provider so we can pass null and it will still construct, passing the unit test.

Now that we have to get_it specific setup out of the way we can look at why the unit test will be better using abstraction.

## How does abstraction benefit unit tests?

First thing we have to look at is what can be considered a unit of work? A unit of work is the smallest amount of code that performs a function in the code base where:

1. It can fail
2. There are changes I can make that will make it fail again
3. It's something you can't assume is working
4. It's creating a new state in the class, function or overall architecture

When we look at the likePost function in the PostService there are multiple units of work happening. Once we've defined some of them the benefits of having abstraction will become clear. Lets make a list of some units of work that won't be testable without abstraction.

**Given a post Id likePost was called on the localStorageService**: We know that by looking at the bottom of the code that this is a crucial part to this function, if the localLike was successful and the api request to like the post has failed we have to revert the local like to make sure the user stays in sync with the cloud data. Therefore we need to be able to confirm with a unit test, that this is always happening.

If we were developing against an interface at this point for the localStorage we'll be able to pass in a Mock version that we can use to confirm if a function on it was called. Since the unit of work only depends on the function being called that's all that we want to confirm. The same goes for the likePost on the api so we won't cover that as a case now.

**If the Api call is successful return true:** When we have called both the localStorageService and the api like post functions, we want to confirm that if the api likePost call is successful the function returns true. This is a specific unit test that we want to ensure always runs the same, this means the call to likePost on both objects should **ALWAYS** return true. When we develop against the implementation this will not be the case, leaving you with a unit test that's not trustworthy. This means sometimes it'll pass, sometimes it won't. To make your unit test 100% reliable the only way to do that is to give yourself a way through code to provide an implementation that returns exactly what you want. The way that is done in code is by providing an abstract interface to develop against. This will decouple your implementation from the other service implementation details allowing you to supply Mock versions when you want to skip over the real implementation.

_For those confused about how this is a valid unit test, we're not testing the localStorageService. That will have it's own set of unit / integration tests. We're testing the PostService meaning we assume the Api and LocalStorageService works 100% as we expect so we're testing how the PostService responds. We want to make sure that given the correct results from the other services the PostService does it's job._

**If the Api call fails and localStorageService like was successful, unlike the post locally:** This is a very important piece of logic to test. If your Api call fails and the local like was a success then we have to revert that. This means we need to be able to control the localStorageService response to always be true, and the api service to always return true. At this point you can see, even with only the three unit tests at hand that we **NEED** abstraction to allow us to write real robust unit tests that will run the same on any environment.

I'll stop there with the examples and we'll start the process of abstracting the implementation details to allow us to Mock services for more robust unit testing.

## Writing a unit test with the implementations

In the spirit of Test Driven Development lets write the first unit test mentioned above and see if we can get it to pass. To to the postservice_test.dart file and in the "PostService Test |" group under the "Constructing test..." put the following test case. Here all we want to do is confirm that when we like a post on the postService the post is locally updated using the correct Id.

```dart
 test('Given postId 1, should call localStorageService with 1', () async {

    var localStorageService = LocalStorageService();
    locator.registerSingleton(localStorageService);

    var postService = PostService();
    await postService.likePost(1);
    // expect(localStorageService);
  });
```

This is as far as we can go because we can't even register a fake version against it to check if that function was called. The **ONLY** way to test this will be to re-implement the `LocalStorageService` to now track what id it was called with and expose that. Now you're adding code that's not required making it hard to decipher what code is for production and what's there for unit tests. So that test clearly fails (compilation errors also count as test failures in the TDD world), we'll get back to that test later on after the abstraction is in place.

## Abstracting the details away

This first thing we want to do is define the interfaces that we'd like to use for abstraction. The Api implementation name will have to change, and we'll use a more general name for the LocalStorageService. One thing that I find very useful when you have interfaces, with implementations and potentially many implementations of that interface is to group it under a folder with the same name as the interface. Under the services folder create two new folders, api and storage. In the api folder create a new file api.dart.

```dart
abstract class Api {
  Future<bool> likePost(int postId);
}
```

In the storage folder create a new file called storage_service.dart.

```dart
abstract class StorageService {
  Stream<int> get postUpdateStream;

  Future<bool> likePost(int postId, {bool unlike = false});

  void dispose();
}
```

These two interfaces will be what we use to develop against in our other services and view models. Now for some general clean up. We'll rename the current api.dart file with the implementation to http_api and the class to `HttpApi`. We'll also move it into the api folder under services.

```dart
import 'package:http/http.dart' as http;

class HttpApi {
  static const endpoint = 'https://myapi.com';
  ...
}
```

The `LocalStorageService` can stay the same, file name and class name, all we'll do is move it into the storage folder under services. Now comes the main parts. Make the `HttpApi` implement the `Api` interface and add override to the likePost function.

```dart
class HttpApi implements Api {
  static const endpoint = 'https://myapi.com';

  ...

  @override
  Future<bool> likePost(int postId) async {
    ...
  }
}

```

Do the same for the `LocalStorageService`, implement the `Api` and override the required functions / properties.

```dart
class LocalStorageService implements StorageService {
  ...
  @override
  Stream<int> get postUpdateStream => _postUpdated.stream;

  @override
  Future<bool> likePost(int postId, {bool unlike = false}) async {
    ...
  }

  @override
  void dispose() {
    ...
  }
}
```

For the next part you can either use get_it or provider depending on which implementation you chose to follow using the code. Now we have to swap out the references to the implementation everywhere in the code and only reference the interface, except for when constructing and passing the actual value we want.

### Get_it Register interface / implementation

We'll go over the get_it implementation first. Go to the locator.dart file and register the singleton implementation against the implemented interface.

```dart
void setupLocator() {
  locator.registerLazySingleton<Api>(() => HttpApi());
  locator.registerLazySingleton<StorageService>(() => LocalStorageService());
}
```

In the `PostService` instead of retrieving the `LocalStorageService` we'll retrieve the general storage service implementation.

```dart
class PostService {
  Api _api = locator<Api>();
  StorageService _localStorageService = locator<StorageService>();

  ...
}
```

### Provider Inject against interfaces

For the provider implementation we can head over to the providers_setup.dart file and register the providers against the interfaces they implement.

```dart
List<SingleChildCloneableWidget> providers = [
  Provider<StorageService>.value(value: LocalStorageService()),
  Provider<Api>.value(value: HttpApi())
];
```

In the `PostService` instead of injecting the implementations through the constructor we pass in the Interfaces instead.

```dart
class PostService {
  final Api _api;
  final StorageService _storageService;

  PostService({
    Api api,
    StorageService storageService,
  })  : _api = api,
        _storageService = storageService;

  ...
}
```

Now our code is completely swapped out and will allow us to write unit test with 100% confidence that it's testing the actual logic we want to test. Lets get back to that test we wanted to write above. Since the `PostService` is now only expecting an object that implements our interface we can supply a mock version of our interface that we can use to assert our test.

## Let the mocking begin

We'll start with adding Mockito as a dev dependency.

```yaml
dev_dependencies:
  flutter_test:
    sdk: flutter

  mockito: ^4.1.0
```

Then we can create a Mock implementation of our Storage service that we can use.

```dart
class MockStorageService extends Mock implements StorageService {}
```

Now we can update that test to use the `MockStorageService` instead of the real one. Get it has an additional step that provider doesn't require. We have to tell the locator that we want to allow reassignment meaning if there's a service registered against an interface already we want to be able to register a different one (our Mock one). In the setupAll function we can now set allowReassignment=true

```dart
 setUpAll(() {
  setupLocator();
  locator.allowReassignment = true;
});
```

Then we can update the test and register a MockService before we verify the functionality.

```dart
 test('Given postId 1, should call localStorageService with 1', () async {
    var mockStorageService = MockStorageService();
    locator.registerSingleton<StorageService>(mockStorageService);

    var postService = PostService();
    await postService.likePost(1);
    verify(mockStorageService.likePost(1));
  });
```

We got a bit further than the original attempt. We are now able to register a MockService, execute the code then verify the correct function has been called. The test still doesn't pass, it doesn't fail, but it doesn't pass. That's because the Api is still using the real version so the network request is not going through. Let's mock that and try the test again.

We'll create a `MockApi` class.

```dart
class MockApi extends Mock implements Api {}
```

Then we can register that with the locator. We'll provide a stub method that will return true when the likePost function is called.

```dart
   test('Given postId 1, should call localStorageService with 1', () async {
      var mockStorageService = MockStorageService();
      locator.registerSingleton<StorageService>(mockStorageService);

      var mockApi = MockApi();
      when(mockApi.likePost(1)).thenAnswer((_) => Future.value(true));
      locator.registerSingleton<Api>(mockApi);

      var postService = PostService();
      await postService.likePost(1);
      verify(mockStorageService.likePost(1));
    });
```

This test will now run and pass and it's 100% reliable. This means on whichever server it runs, if there's network or not, if it has a local disk to store anything on, it will always pass if the logic of the `likePost` function stays the same. That means that this is testing that specific unit of work and always will. If that code changes and we fail to call the likePost on the storage service then this unit test will fail, letting us know things broke.

To finish up lets do the same test with Provider. Everything will be the same as above, there's just no additional setup or registration with the locator so it's a bit more compact.

```dart
 test('Given postId 1, should call localStorageService with 1', () async {
    var storageService = MockStorageService();

    var mockApi = MockApi();
    when(mockApi.likePost(1)).thenAnswer((_) => Future.value(true));

    var postService =
        PostService(api: mockApi, storageService: storageService);
    await postService.likePost(1);
    verify(storageService.likePost(1));
  });
```

_Get it can be used as a dependency injection tool as well if you follow the same constructor injection pattern. You'll be able to locate and inject your registered services the same way we do with Provider then your unit tests will look the same as the Provider unit test above_

That's it for this tutorial. This tutorial is not about unit testing, it's about the practical benefits of abstraction when it comes to unit testing so we won't go into more detail around unit testing best practice.

If you'd like to see content or a video on unit testing best practices please let me know in the comments or come over [to the Slack](https://join.slack.com/t/filledstacks/shared_invite/enQtNjY0NTQ3MTYwMzEwLTJjZmU0ODRhOTA5ZGE3MTUxOTUzODdlNzFjMDg0ZGU4ZDQzMzVlMDQ0MzYxZWNhOWViOGI1NjZiZDE1YTQ3NGM) and let me know. If you want to see more content like this please subscribe to my [YouTube](https://www.youtube.com/c/filledstacks?sub_confirmation=1) for weekly in depth architecture and Flutter videos.
