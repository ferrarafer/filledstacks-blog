---
title: Flutter Provider Architecture - Sharing Data Across your Models
description: A post and guide covering some community feedback as well as additional implementation details.
authors:
  - en/dane-mackier
published: 2019-05-31
updated: 2019-05-31
postSlug: flutter-provider-architecture-sharing-data-across-your-models
ogImage: /assets/tutorials/012/012.jpg
ogVideo: https://www.youtube.com/embed/dnW0NunWBTM
featured: false
draft: false
tags:
  - flutter
  - provider
  - architecture
relatedTutorials:
  - en/010-provider-architecture
  - en/013-dependency-injection
# codeUrl: "https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F012%2F1-start.zip?alt=media&token=bcdc51d8-79a2-421d-84e4-8b51d3343af2"
---

This architecture guide will be a continuation of the [first guide](/post/flutter-architecture-my-provider-implementation-guide). In the guide we setup the provider architecture (using it only for it's state management) and using get_it for dependency injection. Each view has it's own model, any widget with logic would have the same, we have a base view that provides a state enum to listen too and we use services to define all our business logic. We'll start with the "objections" and then move onto some implementation updates.

## Using get_it for dependency injection

There have been a few comments on the architecture, and all of the feedback has been extremely valuable. I had [a discussion with Remi](https://github.com/FilledStacks/flutter-tutorials/pull/2) (The creator of Provider) very informative and it showed me that with the coming updates and the ProxyProvider, all the dependency injection **can** be done with provider, but in my opinion, it's not going to be maintainable (For me. I'm not a fan of more code with no added benefits just to keep things "pure"). For example here's how you would inject the AuthenticationService into the LoginModel using a MultiProvider and the ProxyProvider.

```dart
Provider(
  builder: (_) => Api(),
  dispose: (_, api) => api.dispose(),
),
ProxyProvider<Api, AuthenticationService>(
  builder: (_, api, previous) =>
      (previous ?? AuthenticationService())..api = api,
  dispose: (_, auth) => auth.dispose(),
),
ProxyProvider<AuthenticationService, LoginModel>.custom(
  builder: (_, auth, previous) =>
      (previous ?? LoginModel())..authenticationService = auth,
  providerBuilder: (_, login, child) =>
      ChangeNotifierProvider<LoginModel>.value(
        notifier: login,
        child: child,
      ),
)
```

The Authentication Service depends on the Api so get that in there first. Then we use a proxy provider to get access to the Api and do property injection on the Authentication service when we register it. Then we use another ProxyProvider to get the AuthenticationService and inject it into the Login Model's property. If you know anything about my tutorials or the way I write code, I don't want a lot of code, I keep things simple. This is injection for one service only, I have services that are single purpose, so I use up to 5 in one model and in my manager classes. Imagine the setup and proxy providers required just for that. The other thing I don't like is when new properties are introduced that requires injection, instead of only modifying the file where the property is required I have to not only create a new ProxyProvider but also update the code where I inject the new service, every time. I don't like that.

Compare the above to

```dart
GetIt locator = GetIt();

locator.registerLazySingleton(() => Api());
locator.registerLazySingleton(() => AuthenticationService());
locator.registerLazySingleton(() => LoginModel());

// Usage
var api = locator<Api>()
```

Easy to read and easy to understand. When I inject a new service into a model or a service I don't have to change anything in the locator file. Just add the property and get it from the locator. This is why I use get_it for dependency injection and only use the StateManagement functionality from the Provider package, **for now**. I know Remi and the devs working on provider will be improving this so I'm excited to cut out a third party dependency and only use provider. Until then I'm keeping get_it in my architecture.

## Disposing

Don't add the dispose into the BaseView. Instead just override your dispose function in your ChangeNotifier, it will be called by provider when it goes out of scope.

## Sharing the same data between models

The architecture is setup, and presented by me, as an architecture that offloads all the logic into services. The models just make use of the services to reduce their state. With that being said, the way you'll share data between models is by keeping it in a service and having the model read the required values.

Let's take a look at an example, here's our spec. Each post on the HomeView has a like count next to the title. When we open a post and like it, the like count on the HomeView should increase as well.

To achieve this We need a central control point for all the posts. We'll create a posts_service that encapsulates all functionality and data regarding the posts in the app. Under the services folder create a new file called posts_service.dart. It will contain a list of all the current posts for a user. It will have access to the API to retrieve posts for a user and it will expose a function to incrementLikes given a postId, as well as get a post for a userId.

```dart
class PostsService {
  Api _api = locator<Api>();

  List<Post> _posts;
  List<Post> get posts => _posts;

  Future getPostsForUser(int userId) async {
    _posts = await _api.getPostsForUser(userId);
  }

  void incrementLikes(int postId){
    _posts.firstWhere((post) => post.id == postId).likes++;
  }
}
```

Head over to the locator and register the PostsService

```dart
locator.registerLazySingleton(() => PostsService());
```

Now in the HomeModel we can remove the Api and make use of the PostsService instead. Instead of tracking the posts in the HomeModel we will now index into the postsService and return that list through our posts property on the model. Additionally we'll update the getPosts function and call the getPostsForUser function where we won't expect any result, the postsService will get the latest result and keep it internally. We will still await to make sure we only set our state when the results have been fetched.

```dart
class HomeModel extends BaseModel {
  PostsService _postsService = locator<PostsService>();

  List<Post> get posts => _postsService.posts;

  Future getPosts(int userId) async {
    setState(ViewState.Busy);
    await _postsService.getPostsForUser(userId);
    setState(ViewState.Idle);
  }
}
```

We'll also add the like count to the Post model.

```dart
class Post {
  ...
  int likes;

  Post({this.userId, this.id, this.title, this.body, this.likes = 0});

  Post.fromJson(Map<String, dynamic> json) {
    ...
    likes = 0;
  }
}

```

Now in the postlist_item.dart we'll add the likes at the end of the title.

```dart
...
Text(
  '${post.title} - ${post.likes.toString()}',
  maxLines: 2,
  style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16.0),
),
Text(post.body, maxLines: 2, overflow: TextOverflow.ellipsis)
...
```

Now the last thing we want to do is create a LikeButton widget that will have it's own model and will increment the count of a post given a post Id. Under the widgets folder create a new file called like_button.dart. It'll be a stateless widget that takes in an integer postId. It will have it's own model called LikeButtonModel. The UI will be basic, just some text with a material button that has an icon in it. OnPressed we'll call increaseLikes on our model with the postId.

```dart
import 'package:flutter/material.dart';
import 'package:provider_architecutre/core/viewmodels/like_button_model.dart';
import 'package:provider_architecutre/ui/views/base_view.dart';

class LikeButton extends StatelessWidget {
  final int postId;

  LikeButton({
    @required this.postId,
  });

  @override
  Widget build(BuildContext context) {
    return BaseView<LikeButtonModel>(
      builder: (context, model, child) => Row(
            children: <Widget>[
              Text('Likes ${model.postLikes(postId)}'),
              MaterialButton(
                color: Colors.white,
                child: Icon(Icons.thumb_up),
                onPressed: () {
                  model.increaseLikes(postId);
                },
              )
            ],
          ));
  }
}

```

The LikeButtonModel will be as small as all the other models should be in this architecture. All it does is get the instance of the PostsService and exposes two functions to make use of that service. One to get the number of likes for a given postId and another to increase the likes for a given id and then call notifyListeners.

```dart
import 'package:provider_architecutre/core/services/posts_service.dart';
import 'package:provider_architecutre/locator.dart';

import 'base_model.dart';

class LikeButtonModel extends BaseModel {
  PostsService _postsService = locator<PostsService>();

  int postLikes(int postId) {
    return _postsService.posts
        .firstWhere((post) => post.id == postId)
        .likes;
  }

  void increaseLikes(int postId) {
    _postsService.incrementLikes(postId);
    notifyListeners();
  }
}

```

Register the LikeButtonModel with the locator.

```dart
  locator.registerSingleton(() => LikeButtonModel());
```

Now in the post_view we'll add the LikeButton widget under the body and that's it.

```dart
...
Text(post.body),
LikeButton(postId: post.id,),
Comments(post.id)
...
```

If you run this code now and tap the like button you'll see back on the home view the posts has the same number of likes. You'll use this pattern a lot, "lifting your state out of the models" into services where it can be shared between multiple models. One drawback of this is that if these two views are next to each other (on larger screens) the HomeView won't automatically update because there's nothing to call notifyListeners. There are a few ways to implement this (In order of preference for me personally):

1. **Callback from service**: Provide a way to set a callback on the service that will be called when anything on the service has been updated and needs a refresh.

2. **Built into the BaseModel**: have an internal messaging service that exposes streams for anyone to listen to. When the posts are updated broadcast it over this service. In the model, or the base model, listen for the messages and call notify listeners when anything arrives.

3. **Broadcast all posts again**: Expose a stream of posts on the PostsService that the models can subscribe to. When we change anything we broadcast the new posts.

We're not implementing any of this, but given the guidance you should be able to tackle it alone. If you need more help with it come over to the Slack I'm sure someone there can help you, if I'm available I'll help you with the implementation.

## "Sharing UI with views"

The example of this is a tab bar that persists over the views with their models. I don't know why this is a problem for people to implement but multiple people asked about it. There's no difference between the tab view an a normal widget, so you just create a DefaultTabController and place your views in there.

```dart
import 'package:flutter/material.dart';
import 'package:provider_architecutre/ui/views/home_view.dart';
import 'package:provider_architecutre/ui/views/post_view.dart';

import 'login_view.dart';

class TabContainer extends StatelessWidget {
  const TabContainer({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          bottom: TabBar(
            tabs: [
              Tab(icon: Icon(Icons.directions_car)),
              Tab(icon: Icon(Icons.directions_transit)),
            ],
          ),
          title: Text('Tabs Demo'),
        ),
        body: TabBarView(
          children: [
            LoginView(),
            HomeView(),
          ],
        ),
      ),
    );
  }
}
```

the in the router make your '/' router return the TabContainer. Obviously the Home view won't work because it needs an id to fetch the posts. The point is just to show you how to have your views in a tab controller. It's just normal widgets, our model logic is all hidden from the outside world so everything in the architecture can just be used as a normal widget. The locator and the services will take care of the data throughout the app.

```dart
...
  case '/':
    return MaterialPageRoute(builder: (_) => TabContainer());
...
```

These are the biggest parts of feedback that I got. If there's anything that you're struggling with please let me know. Don't be suprised if my answer is "Make a service and share the data from there" because it almost always is. Now you have an example of it, so you should be able to build any app in the world with models all less than 20 lines of code 😁 Maintenance heaven is what I like to call my architectures 🤣.

Thank you for reading, I appreciate your time. Checkout [the other tutorials](/).
