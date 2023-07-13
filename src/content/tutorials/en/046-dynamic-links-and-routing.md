---
title: Dynamic Links in Flutter a Complete guide
description: In this tutorial we go over Dynamic Links and how to use it in your Flutter app.
authors:
  - en/dane-mackier
published: 2020-03-29
updated: 2020-03-29
postSlug: dynamic-links-in-flutter-a-complete-guide
ogImage: /assets/tutorials/046/046.jpg
ogVideo: https://www.youtube.com/embed/aBrRJqrQTpQ
featured: false
draft: false
tags:
  - firebase
# codeUrl: https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F46%2F046-starting.zip?alt=media&token=9711ba43-fb8d-4581-b877-976c04d5c222
# sponsorBanner: 'https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/stacked-800-200.jpg?alt=media&token=b085fcaf-45da-4e72-b726-5bd1b7203a55'
# sponsorUrl: 'https://stacked.filledstacks.com/'
---

In this tutorial we will go over dynamic link usage in Flutter. We'll cover what dynamic links are, why you would use them and how to use them in your Flutter code base. This is episode 9 of the [Firebase and Flutter series](https://www.youtube.com/playlist?list=PLdTodMosi-Bzj6RIC2wGIkAxKtXPxDtca). If you didn't follow along the series [you download the starting code](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F46%2F046-starting.zip?alt=media&token=9711ba43-fb8d-4581-b877-976c04d5c222) that we'll use for this tutorial.

## What is the problem we're trying to solve?

Lets say you can share a link to a post of something from your app. You share that link through what's app (iMessage for my USA friends and WeChat for the Chinese devs). When a user taps on that app wouldn't it be great if you could customise their experience. For instance:

1. Tapping the link in Android should open your app, if it's installed, navigate to that post and show it to the user.
2. Tapping the link and it's not installed should take the user to the store. After installing wouldn't it be great if you can still do 1.
3. If the user opens the link on Desktop you can open your website for them and take them to the post.

If you've implemented this or tried to implement it you know how difficult it is to keep track of something as simple as clicking a promo link, app is not installed so you go to the store, once the user has downloaded the app you need to figure out how to see which link they clicked to perform appropriate action in the app. It's quite a mission. This is what Dynamic links solve.

## What are Dynamic Links?

Dynamic links is a service provided by firebase that takes care of all of that for you. You can create your links in the console or programatically and share them with other users. They allow you to define the action to take per platform and tailor the experience exactly how you want it to be. Per platform, it also automatically tracks how many people clicked the link, the platform they were on and if they completed the intended action. In short, dynamic links is a smart link. It it handled different on each platform but you can choose how it's handled.

## Implementation

The project we are using already has the firebase project setup for communication for the Android project. No firebase project setup will be done in this tutorial. [Episode one covers that](https://youtu.be/tKET5s_Vu-c) if you still have to setup your project. In this tutorial we will cover the following things.

1. Creating a dynamic link in the console
2. Handling it in the application
3. Checking the deeplink url and perform navigations
4. Create a dynamic link programatically
5. Debug deeplink and behaviour tips

Lets get started.

### Create a dynamic link in the console

Navigate to the [Firebase Console](https://console.firebase.google.com/), open up your project. In the left navigation bar scroll down to the complete bottom and click on Dynamic links. Click on get started and press next with the default values until you see the following screen.

![Empty Dynamic Links UI](/assets/tutorials/046/046-empty-links.png)

You will be given a default prefix or you can enter your own based on your project name. Click on the "New Dynamic Link" button. You will be presented with 5 steps.

1. **Supply your short url**: Enter "create-first-post" and check to see your Link preview looks like this https://filledstacks.page.link/create-first-post . With your prefix ofcourse. Go next.
2. **Supply your dynamic link url:** This has to be a valid url that the browser can navigate to. It's also the link that will be retrieved in your app, this is what you'll use to pass params that you'll need for deeplinking. I'll set mine to the following. https://www.compound.com/post?title=This+is+my+first+post .We will extract the title query param in the code to perform our deep link. I'll set the Dynamic Link Name to "Create First Post"
3. **iOS Behavior:** Select "Open deep link Url in Browser". This is the link from 2.
4. **Android Behaviour:** Select "Open the deep link in your Android App". Select your current firebase app. I'll select com.filledstacks.compound. THIS HAS TO MATCH YOUR APP ID. This is how we tell firebase which app to link the deeplink info to.
   4a. **What happens if app is not installed:** Select "Google Play page for your app". If your app is on the store with a matching Id it will open the store for installation. To avoid having to put an app into the store for testing I will skip the testing of this part in this tutorial. There are more advanced settings that you can cover in your own time if you require them.
5. **Campaign tracking:** We won't enter any details here. This is where you'd track which links you're sending and which campaigns they belong to.

Create the link. When it's completed you should see something like below when you go to hover over the URL link.

![Dynamic Link Copy Action](/assets/tutorials/046/046-link-created.png)

That is the link that will be used when sharing the link anywhere. On the right side there are three dots that you can press for additional options. You can view the details and edit them, we'll checkout the link preview later.

### Handle dynamic links in the app

Lets move onto the actual implementation. To implement dynamic links in Flutter we'll make use of the [firebase_dynamic_links](https://pub.dev/packages/firebase_dynamic_links) package. Open your pubspec.yaml file and add it as a dependency.

```yaml
firebase_dynamic_links: ^0.5.0+11
```

Under the services folder create a new file called dynamic_link_service.dart. We'll create a Future called handleDynamicLinks. This is where we'll check if there's an initialLink that the app has been opened with and handle it and we'll register the onLink function with a success and error callback function. These functions will ONLY be fired if the app is opened from the background or suspended state using the deeplink. The register call can be split from the handleDynamicLinks call but for this example I'm leaving it in one function since it's not that much code.

```dart
class DynamicLinkService {
    Future handleDynamicLinks() async {
    // 1. Get the initial dynamic link if the app is opened with a dynamic link
    final PendingDynamicLinkData data =
        await FirebaseDynamicLinks.instance.getInitialLink();

    // 2. handle link that has been retrieved
    _handleDeepLink(data);

    // 3. Register a link callback to fire if the app is opened up from the background
    // using a dynamic link.
    FirebaseDynamicLinks.instance.onLink(
        onSuccess: (PendingDynamicLinkData dynamicLink) async {
      // 3a. handle link that has been retrieved
      _handleDeepLink(dynamicLink);
    }, onError: (OnLinkErrorException e) async {
      print('Link Failed: ${e.message}');
    });
  }

  void _handleDeepLink(PendingDynamicLinkData data) {
    final Uri deepLink = data?.link;
    if (deepLink != null) {

      print('_handleDeepLink | deeplink: $deepLink');
    }
  }
}
```

Then we'll register the `DynamicLinkService`. Go to the locator.dart file and register the service as a singleton instance.

```dart
locator.registerLazySingleton(() => DynamicLinkService());
```

And the last step for the setup is to go to the `StartupViewModel` and call the handleDynamicLinks function.

```dart
class StartUpViewModel extends BaseModel {
  ...
  // get the dynamic link service
  final DynamicLinkService _dynamicLinkService = locator<DynamicLinkService>();

  Future handleStartUpLogic() async {
    // call handle dynamic links
    await _dynamicLinkService.handleDynamicLinks();
    await _pushNotificationService.initialise();
    ...
  }
}
```

At this point you can run the app. Once the app has installed and opened up you can click on [My Firebase dynamic link](https://filledstacks.page.link/create-first-post) on the same device you installed the app. It will open the webview for a second or two, then close it down and open your app. When the app is opened and you're still connected to the debug logs you'll see the message below.

```
_handleDeepLink | deeplink: https://www.compound.com/post?title=This+is+my+first+post
```

This means everything is working fine and we're ready to perform a deeplink operation.

### Checking deeplink url and navigating

Now we can add the functionality to the \_handleDeepLink function to perform the actions we want to in the app. We want the app to navigate to the `CreatePostView` and fill in the title we added into the link. To do that we'll have to get the `NavigationService` from the locator and then do some basic url string checks.

```dart
class DynamicLinkService {
  final NavigationService _navigationService = locator<NavigationService>();

  ...

  void _handleDeepLink(PendingDynamicLinkData data) {
    final Uri deepLink = data?.link;
    if (deepLink != null) {
      print('_handleDeepLink | deeplink: $deepLink');

      // Check if we want to make a post
      var isPost = deepLink.pathSegments.contains('post');

      if (isPost) {
        // get the title of the post
        var title = deepLink.queryParameters['title'];

        if (title != null) {
          // if we have a post navigate to the CreatePostViewRoute and pass in the title as the arguments.
          _navigationService.navigateTo(CreatePostViewRoute, arguments: title);
        }
      }
    }
  }
}
```

That's all there is for the service. The way you'll handle more going forward is simply by adding more checks. To close down this implementation you could establish a convention and allow the links to navigate to any of your views in the app without you having the change the code. If you pass a route query parameter you can do something like below.

```dart
void _handleDeepLink(PendingDynamicLinkData data) {
  final Uri deepLink = data?.link;
  if (deepLink != null) {
    print('_handleDeepLink | deeplink: $deepLink');

    var navigationRoute = deepLink.queryParameters['route'];

    var params = deepLink.queryParameters['params'];
    if (params != null) {
      _navigationService.navigateTo(navigationRoute, arguments: params);
    }
  }
}
```

Once you and your team establish a convention for the links and what data you'd expect to pass in then you can set it up so you never touch this service again. The last past of this implementation is to make the `CreatePostView` aware that we'll be sending it a title to show. Open up the router.dart file and update the `CreatePostViewRoute` case to the following.

```dart
 case CreatePostViewRoute:
    String postTitle;
    Post postToEdit;

    // if it's a string we set postTitle
    if (settings.arguments is String) {
      postTitle = settings.arguments;
    }
    // if it's a post we set post to edit
    else if (settings.arguments is Post) {
      postToEdit = settings.arguments as Post;
    }

    return _getPageRoute(
      routeName: settings.name,
      viewToShow: CreatePostView(
        edittingPost: postToEdit,
        postTitle: postTitle,
      ),
    );
```

We check what type the arguments are and then set those values. We pass both to the `CreatePostView` through the constructor. Open up the `CreatePostView` class. We'll update the constructor to take in a new String postTitle. We'll

```dart
class CreatePostView extends StatelessWidget {
  ...
  final Post edittingPost;
  final String postTitle;
  CreatePostView({
    Key key,
    this.edittingPost,
    this.postTitle,
  }) : super(key: key);


  @override
  Widget build(BuildContext context) {
    return ViewModelProvider<CreatePostViewModel>.withConsumer(
      viewModel: CreatePostViewModel(),
      onModelReady: (model) {
        // If we have a post to edit, run edit logic
        if (edittingPost != null) {
          titleController.text = edittingPost?.title ?? '';

          model.setEdittingPost(edittingPost);
        }
        // if we have a title then set the title equal to the value passed in
        else if (postTitle != null) {
          titleController.text = postTitle;
        }
      },
    ...);
  }
}
```

And that's it. If you run the app now, close the app and [open the dynamic link](https://filledstacks.page.link/create-first-post) you'll navigate straight to the `CreatePostView` with the link title entered.

### Create a dynamic link progrmatically

This is also quite a straight forward task. Remember those 5 things you had to to when creating a dynamic link in the console, you do that but in code. In the `DynamicLinkService` create a new function that returns a future called `createFirstPostLink` that takes in a String title to share. In this function we will define all the dynamic link parameters and return the `Uri.toString()` as the result to the caller

```dart
Future<String> createFirstPostLink(String title) async {
    final DynamicLinkParameters parameters = DynamicLinkParameters(
      uriPrefix: 'https://filledstacks.page.link',
      link: Uri.parse('https://www.compound.com/post?title=$title'),
      androidParameters: AndroidParameters(
        packageName: 'com.filledstacks.compound',
      ),
      // NOT ALL ARE REQUIRED ===== HERE AS AN EXAMPLE =====
      iosParameters: IosParameters(
        bundleId: 'com.example.ios',
        minimumVersion: '1.0.1',
        appStoreId: '123456789',
      ),
      googleAnalyticsParameters: GoogleAnalyticsParameters(
        campaign: 'example-promo',
        medium: 'social',
        source: 'orkut',
      ),
      itunesConnectAnalyticsParameters: ItunesConnectAnalyticsParameters(
        providerToken: '123456',
        campaignToken: 'example-promo',
      ),
      socialMetaTagParameters: SocialMetaTagParameters(
        title: 'Example of a Dynamic Link',
        description: 'This link works whether app is installed or not!',
      ),
    );

    final Uri dynamicUrl = await parameters.buildUrl();

    return dynamicUrl.toString();
}
```

That's about it. When you want to add a feature where you can share it with a friend for them to make a first post you can add UI to type a title and then share the link with them with a title that you put in for the post.

### Debug Deeplink and behaviour tips

If you're having trouble figuring out what your dynamic link will be doing in certain scenarios you can open up the firebase console, go to the link. On the far right side there's 3 dots where you can get a context menu and click on "Link Preview Debug". This will show you a visual of how your link will behave per platform like below.

![Firebase Dynamic Link Preview](/assets/tutorials/046/046-dynamic-link-preview.png)

Here you can see what it's doing. You'll also have warnings at the top of your link that will give tips for production use and pointers as to what features might be disabled based on your configuration. It will also provide you with clickable links at the end of each navigation path that you can checkout before launching the dynamic link into the wild.

That's basically it. Using the deep link technique you can get to anywhere in your app with the correct parameters and provide the user with the best experience possible when they click your links.

Until next time,

- Dane Mackier
