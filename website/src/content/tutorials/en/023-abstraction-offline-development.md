---
title: Develop faster in Flutter using Abstraction
description: This tutorial goes over what abstraction is, how to use it in Flutter and practical examples of the benefits of Abstraction.
authors:
  - en/dane-mackier
published: 2019-08-19
updated: 2019-08-19
postSlug: develop-faster-in-flutter-using-abstraction
ogImage: /assets/tutorials/023/023.jpg
ogVideo: https://www.youtube.com/embed/n2yGl7vJJGM
featured: false
draft: false
tags:
  - flutter
  - architecture
  - provider
  - get-it
---

This is a series of tutorials that will cover the use cases for Abstraction in a non theoretical, practical way that brings real value to your project and development experience. Make sure to follow me if you want to be updated, I'll be releasing the videos on [Youtube](https://www.youtube.com/filledstacks) so subscribe if you're interested.

Before we start, the tutorials are very basic since abstraction is a "small" concept but very powerful once you grasp the importance of it. This series of tutorials will aim to show the benefit of developing against an abstract interface in a practical manner that will help you deliver applications faster and also keep your clients very happy during demos 😆

## What is abstraction?

Abstraction is the act of dealing with "ideas" or higher level functionality without knowing what the implementation will be. In programming this is commonly done by providing a public facing interface that your code interacts with. This hides implementation details and leaves your code only "knowing" about the function itself and what's expected from it.

Abstraction is very important for architecture (software engineering) speak as well. As you develop your architecture you have to abstract your implementation into higher level concepts or ideas and give them a structure in your head as well as everyone else in your team. As an example of such talk lets look at the [Provider architecture](/post/flutter-architecture-my-provider-implementation-guide) that I use. If I spoke to you about this abstractly I would say:

The system will be split into Services, ViewModels and Views. A view will be rebuilt from the ViewModel when the state has changed. A view will ONLY interact with it's ViewModel and only ViewModels and bridging objects (like UI managers) can interact with a service directly. There should be NO UI code in a ViewModel and there should be no state management in a view. All state should be kept in the ViewModel itself.

Now me saying that, as an experienced mobile app developer I can implement that without knowing the details. If there's no guideline I'll probably do it differently every time, but the overall idea will stay exactly the same. Multiple implementations but the abstract idea stays the same. So how does this help you?

## Why do we need abstraction

Abstraction is required when you want to decouple your implementation details from your application. Why would you want to decouple your application code from implementation details? Well there are multiple reasons for that.

- **Long term maintenance is easier**: Since your business logic is written against your interfaces not the implementation, as long as the interfaces returns the expected values you can change your implementations multiple times without having to worry about system-wide refactors.

- **Easier to understand**: Using abstraction is considered a declaritive approach to programming. This means we take a high-level approach to telling the compiler what to do and leave the implementation details out. When you read declaritive code you're reading what the code is doing, not how it's being done. This makes it easier to consume for any level of developer. You can focus on business logic and only go to the implementation details if it's required.

- **Easier to test**: One way to make sure your implementation change didn't bring in any bugs is by running your unit tests that confirm what's supposed to happen given a request on an interface. If you have a level of abstraction that allows you to supply Mock versions or fake data versions you can write more robust unit tests that cover a wider range of functionality.

- **You can swap out implementations anytime**: This is something that I use to hear and argue against. Mostly because of the examples that were used. It was always the Database example. "Well if you code against an interface for a database service you can swap out the underlying database with whatever you want and the rest of your code won't know". Sure I can, but I probably wont in the next year.

The example I like to use is for practical development improvements. This can speed up your bug fixing, testing as well as the overall development process. You can get to a demoable product faster, and you can have more robust demo builds to give to clients that will inspire more confidence. I'm talking about swapping a dependent service, like an API, with an implementation that returns exactly what you require for a specific scenario in your app. You can leave the original implementation, create another implementation of your Api abstraction that returns a user with 500 posts, 10 comments, and errors when liking a post. This will allow you to instantly test and develop for that scenario without having to make the actual request. More on this later.

- **Easy to architect and faster development**: You and your team can sit down in a room, define your architecture, define all the services that will be required for your feature to be complete, how they will interact, what methods / properties they expose and who will make use of it. Then your lead architect can sit down, define the interfaces and setup the basic interactions between them. When that's done you can hand out interfaces and each dev can go off an implement the functionality. You supply rules on how to handle errors internally and what you expect on the calling side and they implement and write the unit tests for that service and slot it in whenever you're ready. In the meantime you can use fake implementations that return the expected results for you to flesh out the architecture.

- **Fake Data is king**: This is the same as the three options above it but it hammers down the reason those three are great. You can setup and supply a fake data implementation of all your services (that are dependent on outside forces). You can take a few hours to setup services to return data for you and then you can start developing. I've actually used this many many times especially when a new feature or development has to be done on the backend but I want to show the functionality to the clients before that's even complete. You can use this to build robust demo's and when it's time to implement you don't throw any real code away. You can even start developing your app before the Api is complete and help define the responses the app requires to function. Only with having that abstraction in place can you truly enjoy these benefits, and they are very great during development, especially when bug fixing.

## Practical Example

As I mentioned above, I find abstraction particularly useful to improve my development experience. Using abstraction to supply fake data or more importantly the exact data that you require means you're not going to be stopped by network issues, offline problems, server outages or anything of that nature. If it shows up you switch to fake data and continue developing. This means your client side development can start immediately, before your backend service API is complete, before the tech lead has decided which Database to use, before any real implementation details are decided you can start building your app and writing the code that will actually be used. Lets take the example of the API and run with that.

### Define an interface or abstraction

Given your backend Api spec you can predefine some functions that you'll need. Lets keep ours simple. Create a folder called services under lib, under it create a folder called api and in there a new file called api.dart

```dart
abstract class Api {
  Future<LoginResponse> login({String username, String password});

  Future<User> getUser(int userId);

  Future<List<Post>> getPostsForUser(int userId);

  Future<List<Comment>> getCommentsForPost(int postId);
}
```

We'll also create another folder under lib called datamodels and in there we'll add an api_models.dart file.

```dart
class Post {}

class Comment {}

class User {
  final String name;
  final String phoneNumber;

  User({
    this.name,
    this.phoneNumber,
  });
}

class LoginResponse {
  final bool success;
  final int userId;
  final String message;

  LoginResponse({
    this.success = true,
    this.userId,
    this.message,
  });
}
```

Just so you can see how I usually setup my Api class. It doesn't return the web response, it does the serializing and returns the data I expect. Null if something went wrong. I don't need to return error messages to show in dialogs because I setup a [Dialog Manager and Service](/post/manager-your-flutter-dialogs-with-a-dialog-manager) that I use to show dialogs for errors directly from the api. If I require the message to show in the UI I return that using a Response object that encapsulates the data I need as well as a message property. With those created we can now go ahead and create two implementations. In the api folder create a new file called fake_api.dart and http_api.dart (you can potentiall create dio_api or which ever library you prefer). Each class will use the implements directive and implement the `Api` interface we just defined. This is how it looks when it's all implemented. The same for the HttpApi

```dart
class FakeApi implements Api {
  @override
  Future<List<Comment>> getCommentsForPost(int postId) {
    return null;
  }

  @override
  Future<List<Post>> getPostsForUser(int userId) {
    return null;
  }

  @override
  Future<User> getUser(int userId) {
    return null;
  }

  @override
  Future<LoginResponse> login({String username, String password}) {
    return null;
  }
}
```

### Supplying an implementation

I'll cover the setup with Provider as well as get_it. We'll use a `const` bool at the top of the file to switch between our implementations, this way we can turn them on and off during development. Create a file called locator.dart in the lib folder. We check the `const`, then register a different implementation with the locator. That's all we need.

#### get_it

```dart
import 'package:abstraction_api/services/api/api.dart';
import 'package:abstraction_api/services/api/fake_api.dart';
import 'package:abstraction_api/services/api/http_api.dart';
import 'package:get_it/get_it.dart';

GetIt locator = GetIt();

const bool USE_FAKE_IMPLEMENTATION = true;

void setupLocator() {
  locator.registerLazySingleton<Api>(
      () => USE_FAKE_IMPLEMENTATION ? FakeApi() : HttpApi());
}

```

When you request the `Api` in your code you don't request the `FakeApi` or the `HttpApi`, instead you request the `Api` abstract class.

```dart
Api _api = locator<Api>();
```

That's all you need to "Develop against and abstraction instead of implementation". Lets go over the same setup with provider.

### provider

We'll use the same setup. We'll use a bool constant to switch which implementation we're using.

```dart
import 'package:abstraction_api/services/api/api.dart';
import 'package:abstraction_api/services/api/fake_api.dart';
import 'package:abstraction_api/services/api/http_api.dart';
import 'package:provider/provider.dart';

const bool USE_FAKE_IMPLEMENTATION = true;

List<SingleChildCloneableWidget> providers = [
  ...independentServices,
  ...dependentServices,
  ...uiConsumableProviders,
];

List<SingleChildCloneableWidget> independentServices = [
  Provider<Api>.value(value: USE_FAKE_IMPLEMENTATION ? FakeApi() : HttpApi()),
];

List<SingleChildCloneableWidget> dependentServices = [];

List<SingleChildCloneableWidget> uiConsumableProviders = [];
```

When you ask for the Api from the provider you use the abstract class not the implementation.

```dart
var api = Provider.of<Api>(context);
```

## How and why to Fake

There's nothing special about supplying FakeData, you'll basically be hardcoding everything you need. The process I take is by starting with the perfect scenario. Login with "dane" and I'll get a full User Profile, with multiple posts, and comments, it has likes, etc. The perfect flow, the Demo Flow 😎. Then as you develop and you finish your core functionality you can start moving onto the a new profile that has less. Always add new cases instead of modifying the old one. Maybe leave out a few user profile details, less posts, some have no comments, some posts have no image, etc. Then you can flesh out the entire app to cover every scenario, without relying on the actual API.

Eventually you move on to have a user profile that throws an exception at every single call it makes. This will allow you to handle every wrong turn in your app. True integration is obviously still important, but you can get very very far using the fake implementation and that's all because of the level of abstraction you supply to the app. Here is a small example of how the FakeApi would look with two profiles.

```dart
class FakeApi implements Api {
  @override
  Future<List<Comment>> getCommentsForPost(int postId) async {
    await Future.delayed(Duration(seconds: 1));

    if (postId == 1) {
      return List<Comment>.generate(10, (index) => Comment());
    }

    return null;
  }

  @override
  Future<List<Post>> getPostsForUser(int userId) async {
    await Future.delayed(Duration(seconds: 1));

    if (userId == 1) {
      return List<Post>.generate(10, (index) => Post());
    }

    if (userId == 2) {
      return List<Post>();
    }

    return null;
  }

  @override
  Future<User> getUser(int userId) async {
    await Future.delayed(Duration(seconds: 1));

    if (userId == 1) {
      return User(name: 'dane', phoneNumber: '999-999-00');
    }

    if (userId == 2) {
      return User(name: 'Flutter', phoneNumber: '737-000-93');
    }

    return null;
  }

  @override
  Future<LoginResponse> login({String username, String password}) async {
    await Future.delayed(Duration(seconds: 1));

    if (username == 'dane') {
      return LoginResponse(userId: 1);
    }

    if (username == 'flutter') {
      return LoginResponse(userId: 2);
    }

    return LoginResponse(success: false, message: 'Username not found');
  }
}

```

The one thing that this allows you to do is to progressively start adding data sets in there that you can test with. As you discover bugs or tricky situations you can add data to recreate every scenario exactly as you want it. You can throw exceptions, return nulls unexpectedly, take forever to return so you can test your timeout logic, everything. It's honestly a big lifesaver when you start development. And when you get those pesky bugs that need 5 steps to reproduce you'll have the exact data to get that sorted.

That's it for speeding up development using Abstractions and FakeData. The next tutorial will cover unit testing in Flutter and why abstraction can give you better confidence in your unit tests.
