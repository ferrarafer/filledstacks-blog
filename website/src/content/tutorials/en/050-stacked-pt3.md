---
title: Services in Code and how to use them in Flutter
description: This tutorial will try to shed light on services and how to use them in Flutter when using the Stacked architecture.
authors:
  - en/dane-mackier
published: 2020-05-24
updated: 2020-05-24
postSlug: services-in-code-and-how-to-use-them-in-flutter
ogImage: /assets/tutorials/050/050.jpg
ogVideo: https://www.youtube.com/embed/UoZQS1bkNTw
featured: false
draft: false
tags:
  - architecture
  - stacked
  - provider
  - services
# codeUrl: https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F050%2F050-starting.zip?alt=media&token=094bd36d-2138-492f-940e-8f956180d6e2
# friendlyId: tutorial-050
---

## What Are Services

Services. It's just a class. I actually don't know why it's called services, because it sounds big. But it's not. It's a class created to perform a service for your user. That service can be to open the camera, share information, create a post, keep track of posts, cache your results, etc. Basically anything that has to DO something will be a service class. View's take in the users input and shows them things. The view then goes to the `ViewModel` and says, "Could you please do this thing for the user". The `ViewModel` then goes to the service and says "Can you please do this thing for me and let me know when you're done". The service then does the actual thing and then returns the results to the user. Lets look at how you define "Doing a thing" and when to create services.

<br>

_NOTE:I'll swap between service and service class when referring to a service_

## When To Create a Service

There are specific scenarios in which a service is always created when using the Stacked architecture. Keep in mind a service class does not have to end in the work service if it doesn't make sense. When creating an api I often call it Api, but it's a service class that provides api functionality to the rest of the app. So, down to the main question, "when do I create a service"?

1. When you want to abstract third party packages from your code base
2. When you have a set of features that can be grouped together (S from the SOLID principles)
3. When you want to share functionality between ViewModels

Those are the main reasons to create a service class, in no specific order. Lets dive into each of them and see how it looks in code and why we do it.

### Abstract Third Party Packages Through a Service

This is the process of removing dependencies on third party packages from your code. Lets look at an example of using the Flutter image picker directly from the `ViewModel`. [Download the starting project here](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F050%2F050-starting.zip?alt=media&token=094bd36d-2138-492f-940e-8f956180d6e2) and open up the `ImagePickerViewModel` in there you'll see this code.

```dart
class ImagePickerViewModel extends BaseViewModel {
  File _selectedImage;

  bool get hasSelectedImage => _selectedImage != null;

  File get selectedIamge => _selectedImage;

  Future selectImage({@required bool fromGallery}) async {
    _selectedImage = await runBusyFuture(ImagePicker.pickImage(
        source: fromGallery ? ImageSource.gallery : ImageSource.camera));
  }
}
```

Probably normal code for you to see. How you should look at it is "My business logic has a hard dependency on this package". That's not a good thing, the business logic should be pure for multiple reasons but 2 ones that I think are important are.

1. So that you can UNIT test it
2. To ensure even when the package is swapped out you're not concerned about side effects in your business logic.

So how do you remove the dependency from your code? This is described best by the dependency inversion principle. This principle states, in my own words, which is how I finally fully grasped the principle. "Classes that perform actions or functionality should not depend on the Classes doing the work, it SHOULD DEPEND on an abstraction of that class". Sounds a lot like they're saying make a service class and call that instead 😆. This is not a tutorial about testing but let me show you how quickly a UNIT test will fail for this class. Lets look at the following unit test.

```dart
  test(
      'When selectImage is called with fromGallery true, should request image with fromGallery true',
      () async {
    var model = ImagePickerViewModel();
    await model.selectImage(fromGallery: true);
    // verify(Image picker was called )
  });
```

Now this test obviously won't pass or even run because the ViewModel (your business logic) is dependent on Flutter running and the plugins being registered. To remove this dependency from your code we'll create a `MediaService` that interacts with the library for us. Under the services folder create a new file called media_service.

```dart
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'package:injectable/injectable.dart';

@lazySingleton
class MediaService {
  Future<File> getImage({bool fromGallery}) {
    return ImagePicker.pickImage(
        source: fromGallery ? ImageSource.gallery : ImageSource.camera);
  }
}
```

Run the `flutter pub run build_runner build` command to generate your `MediaService` get_it registration or register it with the locator in the locator.dart file under app.

```dart
locator.registerLazySingleton(() =>  MediaService());
```

Then in the `ImagePickerViewModel` we can now make use of the `MediaService`. Update the `ImagePickerViewModel` to look like this.

```dart
class ImagePickerViewModel extends BaseViewModel {
  final _mediaService = locator<MediaService>();
  ...
  Future selectImage({@required bool fromGallery}) async {
    _selectedImage =
        await runBusyFuture(_mediaService.getImage(fromGallery: fromGallery));
  }
}
```

Now we can expand the range of unit tests and you have a service you can inject into any `ViewModel` that has to request an image. You can now use Mockito to mock out the `MediaService` which means you can verify calls on it, you can return data you want to return and you can see how your ViewModel responds. If you happen to swap out the image picker package you wont have to change any of your business logic or unit tests and the behaviour will stay the same. Onto the next reason to make a service class.

### Group together features using Services and Single Responsibility

When it comes to coding principles you must have picked up by now that the one I like the most is Single Responsibility. I think it suits me so well because that's how I solve problems, that's how I live my goal oriented life and that's how I handle things in real life. The principle states "Keep the code together that will change for the same reasons, separate the code that won't". This (kind of) makes it easy to define responsibilities, at least for me it does. Lets look at an obvious example. Say you have three ViewModels making API requests it might look something like this.

```dart
class UserViewModel extends FutureViewModel<User> {
  final int userId;
  UserViewModel(this.userId);

  @override
  Future<User> futureToRun() async {
    var response =
        await http.get('https://jsonplaceholder.typicode.com/users/$userId');
    return User.fromJson(json.decode(response.body));
  }
}

class PostsViewModel extends FutureViewModel<List<Post>> {
  final int userId;
  PostsViewModel(this.userId);

  @override
  Future<List<Post>> futureToRun() async {
    var posts = List<Post>();
    var response = await http
        .get('https://jsonplaceholder.typicode.com/posts?userId=$userId');
    var parsed = json.decode(response.body) as List<dynamic>;
    for (var post in parsed) {
      posts.add(Post.fromJson(post));
    }

    return posts;
  }
}

class CommentsViewModel extends FutureViewModel<List<Comment>> {
  final int postId;
  CommentsViewModel(this.postId);

  @override
  Future<List<Comment>> futureToRun() async {
    var comments = List<Comment>();
    var response = await http
        .get('https://jsonplaceholder.typicode.com/comments?postId=$postId');
    var parsed = json.decode(response.body) as List<dynamic>;
    for (var comment in parsed) {
      comments.add(Comment.fromJson(comment));
    }
    return comments;
  }
}
```

So they're all making a request using the same base url with different endpoints, they're all in different files where they belong. All good, what if I told you that now each request has to send in a default header. You can go to all three of these places and go update the default header, ok fine. You did that. Now I tell you that when a response comes back with status code 444 you have to show an Force update dialog, when the response comes back with a 404 you have to refresh the Auth token, when you get a 420 you have to show a login dialog. You're probably not going to copy paste the exact same code everywhere and then continue with that madness. You need to group it all. What do we group it in, A service class 😄 Create a new file under services called api.dart. In there we'll move all that functionality and share some of the details.

```dart
import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:injectable/injectable.dart';
import 'package:my_app/datamodels/comment.dart';
import 'package:my_app/datamodels/post.dart';
import 'package:my_app/datamodels/user.dart';

/// The service responsible for networking requests
@lazySingleton
class Api {
  static const endpoint = 'https://jsonplaceholder.typicode.com';

  var client = new http.Client();

  Future<User> getUserProfile(int userId) async {
    var response = await client.get('$endpoint/users/$userId');
    return User.fromJson(json.decode(response.body));
  }

  Future<List<Post>> getPostsForUser(int userId) async {
    var posts = List<Post>();
    var response = await client.get('$endpoint/posts?userId=$userId');
    var parsed = json.decode(response.body) as List<dynamic>;
    for (var post in parsed) {
      posts.add(Post.fromJson(post));
    }

    return posts;
  }

  Future<List<Comment>> getCommentsForPost(int postId) async {
    var comments = List<Comment>();
    var response = await client.get('$endpoint/comments?postId=$postId');
    var parsed = json.decode(response.body) as List<dynamic>;
    for (var comment in parsed) {
      comments.add(Comment.fromJson(comment));
    }
    return comments;
  }
}
```

Now we can update our ViewModels and remove all that nasty implementation details.

```dart
// user_viewmodel.dart
class UserViewModel extends FutureViewModel<User> {
  final int userId;
  UserViewModel(this.userId);

  @override
  Future<User> futureToRun() => locator<Api>().getUserProfile(userId);
}

// posts_viewmodel.dart
class PostsViewModel extends FutureViewModel<List<Post>> {
  final int userId;
  PostsViewModel(this.userId);

  @override
  Future<List<Post>> futureToRun() => locator<Api>().getPostsForUser(userId);
}

// comments_viewmodel.dart
class CommentsViewModel extends FutureViewModel<List<Comment>> {
  final int postId;
  CommentsViewModel(this.postId);

  @override
  Future<List<Comment>> futureToRun() =>
      locator<Api>().getCommentsForPost(postId);
}

```

And that's it. You've now grouped code together that will change for the same reason and created an Api service class for every other viewmodel or service to use.

### Share State / Functionality between ViewModels using Services

On thing that's common is sharing state across multiple ViewModels. Lets say you have a `PostsView` that fetches posts and shows it to the user. The `PostsViewModel` will look something like this.

```dart
class PostsViewModel extends FutureViewModel<List<Post>> {
  final _api = locator<Api>();

  @override
  Future<List<Post>> futureToRun() => _api.getPostsForUser(3);
}
```

First off, how sweet is that for business logic haha. 2 lines of code to:

1. Get your data
2. Set your Viewmodel to busy while running
3. Store it for you to access
4. Handle the error if any is thrown
5. Provides you with override onError callbacks to handle errors in a custom way
6. ... You get the point :) Enough bragging about stacked

Now the `ViewModel` above is perfectly fine, but what if you want to show the count of posts you have locally on another widget. Maybe on the HomeView. You'll need access to the `ViewModel` right? NO, not right. ViewModels shouldn't know about each other, each of them live to serve their View's they are attached too. Nothing else, they take orders from the user and manages their state, for that view. To share the data with another viewmodel you **Create a service class** for it. You can create a posts service which can then be accessed by your ViewModels the same as any other service. A posts service would look like this

```dart
@lazySingleton
class PostsService {
  final _api = locator<Api>();

  List<Post> _posts;
  List<Post> get posts => _posts;

  bool get hasPosts => _posts != null && _posts.isNotEmpty;

  Future<List<Post>> getPostsForUser(int userId) async {
    _posts = await _api.getPostsForUser(userId);
    return _posts;
  }
}
```

So in the ViewModel instead of using the API you can now use the post and in the PostCountViewModel you can access the posts that were fetched in this view and show the count from the cached posts.

```dart
// posts_viewmodel.dart
class PostsViewModel extends FutureViewModel<List<Post>> {
  final _postsService = locator<PostsService>();

  @override
  Future<List<Post>> futureToRun() => _postsService.getPostsForUser(3);
}

// posts_count_viewmodel.dart
class PostsCountViewModel extends BaseViewModel {
  int get postsCount => locator<PostsService>().posts.length;
}
```

Now the point of grouping functionality into Service classes that has to be shared has a couple of benefits.

1. One point of contact: You know anything relating to posts will be in the Posts Service, any updates / changes will happen in that class.
2. DRY code: It keeps your code lean and dry if you have shared functionality easily accessible through service classes

## Conclusion And Final words

Service is a fancy name for a Class that hides implementation details, or a class that does actual work. It is used in every single architecture, some call it modules, some don't name it, we call it services. It keeps your code looking like you wrote no code 🤣 and makes everything very readable. One side effect that Services has is it creates an app specific domain language through your services's API's. It makes your viewmodels readable and the viewmodels make your interaction from View to Viewmodel readable. Once you master the idea of creating services every single implementation becomes, get the package, create a service, use it where it's needed. It's very eye opening to how simple some functionality can become when you follow this approach. This can be used with any architecture, and is one of those techniques you can teach without any architecture present and you'll still create a great code base.

<br>

Thanks for reading, I'll be back with unit tests next :)
Dane
