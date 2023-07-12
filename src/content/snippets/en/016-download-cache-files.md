---
title: Download and cache files in Flutter using Cache Manager
description: This tutorial covers how to download files in Flutter and keep it in a local cache using the Flutter Cache Manager.
authors:
  - en/dane-mackier
published: 2019-05-27
updated: 2019-05-27
postSlug: download-and-cache-files-in-flutter-using-cache-manager
ogImage: /assets/snippets/016/016.jpg
featured: false
draft: false
tags:
  - flutter
  - cache
# friendlyId: snippet-016
---

This guide will show you how to download and cache files using the Flutter Cache Manager.

## Install the package

Open your pubspec and add the `flutter_cache_manager` package.

```dart
flutter_cache_manager: ^0.3.2
```

In the main file we'll create a simple UI to display some feedback so we know what's happening. We'll have a meterial app and set set the home widget equal to our HomeView created underneath. The HomeView is statefull and has a String title as member variable and shows that title in the center of the screen.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(home: HomeView());
  }
}

class HomeView extends StatefulWidget {
  HomeView({Key key}) : super(key: key);

  _HomeViewState createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  String title = 'Waiting to download';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
      ),
      body: Center(child: Text(title)),
    );
  }
}
```

We also have a floating action button with an empty onPressed. That's it for the setup.

## Download and cache a file

The way the caching works is that it Downloads a file and returns the path to you, it also caches that file in the device's temp folder for a certain amount of time. If you request the file again while the file is still valid then it returns it immediately. If it has expired the file is downloaded again. In the on pressed we'll set the title to 'Downloading ...' and get a file. When the file is done we'll show the file's path on disk in the title.

```dart
// Add the url
 String url = 'https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/filledstacks_tutorials.pdf?alt=media&token=a5e671e7-5acd-4bc4-a167-8d8483954d2a';

 ...
 floatingActionButton: FloatingActionButton(
    onPressed: () async {
      setState(() => title = 'Downloading...');
      var fetchedFile = await DefaultCacheManager().getSingleFile(url);
      setState(() => title = 'File fetched: ${fetchedFile.path}');
    },
  ),
...
```

If you tap the button then the first time you'll see 'Downloading...' for a litle bit and then the 'File fetched: file/Path/' message. That's how easy it is. Now when you tap download again you'll see the file fetched show up almost instantly. This means it's been cached and can now be easily accessed just through a request.

If you are concerned about creating a new instance of DefaultCacheManager everytime you don't have to worry. It's implemented using a singleton pattern so it'll only create the object once and return that instance to you whenever you construct it.

```dart
// Package code
static DefaultCacheManager _instance;
 factory DefaultCacheManager() {
    if (_instance == null) {
      _instance = new DefaultCacheManager._();
    }
    return _instance;
  }
```

So no need to worry. Just keep using `DefaultCacheManager()`.

## Customise the cache manager

You might want some different settings for your caching. You might want to limit the number of objects your app can cache to save the user space, you might want to set a shorter cache duration (default 30 days) or even supply your own file handler. Lets take a look at how to do that.

The package provides you with `BaseCacheManager` that you can extend and implement in your own code. Create a new class CustomCacheManager that extends the BaseCacheManager. There's one required method `getFilePath` that returns the base path to the folder that will be used for caching. You also have to provide the super class with a cache key to identify your cache. This way you can have different caches pointing to different folders and that have unique keys. We'll store our key as a const and provide it to super.

```dart
...
import 'package:path/path.dart' as path;
import 'package:path_provider/path_provider.dart';

class CustomCacheManager extends BaseCacheManager {
  static const key = "pdfCache";

  CustomCacheManager() : super(key);

  @override
  Future<String> getFilePath() {
    return null;
  }
}
```

For the `getFilePath` function we'll return the path to the temp directory for the device we're running on and attach our key to the end so we can identify the cache on disk if we want to.

```dart
...
@override
Future<String> getFilePath() async {
  var directory = await getTemporaryDirectory();
  return path.join(directory.path, key);
}
...
```

That's all that is **required** for a custom cache, now we can add some additional settings. Let's say we only want 10 files to be cached maximum and each file should only be cached for 30 seconds. Here's how we would achieve that.

```dart
...
// Add const values at the top
static const int maxNumberOfFiles = 10;
static const Duration cacheTimeout = Duration(seconds: 30);

// pass values into super
CustomCacheManager()
    : super(
        key,
        maxNrOfCacheObjects: maxNumberOfFiles,
        maxAgeCacheObject: cacheTimeout
      );
...
```

We can swap the DefaultCacheManager out with our CustomCacheManager. We'll create an instance outside the build method so it's only created once.

```dart
// Create instance
CustomCacheManager cacheManager = CustomCacheManager();

...
// use in the floating action button on pressed
floatingActionButton: FloatingActionButton(
  onPressed: () async {
    setState(() => title = 'Downloading...');
    var fetchedFile = await cacheManager.getSingleFile(url);
    setState(() => title = 'File fetched: ${fetchedFile.path}');
  },
),
...

```

Tapping on the FAB will still give you the same result but now you'll see your cache's key is also in the path. This shows that it's going through your cache now. If you wait for 30 seconds and tap you'll see that it takes long again, and that's because the file has expired. Easy peasy.

You can also implement your own file fetcher by supplying a Future to the fileFetcher property that return a FileFetcherResponse object.

```dart

CustomCacheManager()
  : super(
      key,
      maxNrOfCacheObjects: maxNumberOfFiles,
      maxAgeCacheObject: cacheTimeout,
      fileFetcher: _customHttpGetter
    );

static Future<FileFetcherResponse> _customHttpGetter(String url, {Map<String, String> headers}) async {
  // Do things with headers, the url or whatever.
  return HttpFileFetcherResponse(...);
}
```

That's all there is to it. You should now be able to effectively handle caching in your Flutter app. I'd recommend implementing the same singleton pattern as I shows above with the DefaultCacheManager. This way you don't construct the same cache twice.

Checkout and subscribe to my [Youtube Channel](https://www.youtube.com/c/filledstacks?sub_confirmation=1) for weekly tutorials. Follow me [on Instagram](https://www.instagram.com/filledstacks/) for snippets and day-to-day programming. Checkout all the [other snippets](/snippets) here. You might find some more Flutter magic.
