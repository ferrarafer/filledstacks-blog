---
title: Complete Beginners Guide to Futures
description: A tutorial that covers the basics around creating and Handling Futures in Flutter.
authors:
  - en/dane-mackier
published: 2019-07-26
updated: 2019-07-26
postSlug: complete-beginners-guide-to-futures
ogImage: /assets/tutorials/020/020.jpg
ogVideo: https://www.youtube.com/embed/DAS0EQuM-oU
featured: false
draft: false
tags:
  - flutter
  - future
relatedTutorials:
  - en/026-stream-basics
  - en/018-bottom-sheet-guide
  - en/019-beginners-animation-guide
---

Long running tasks are common in mobile apps. The way this is handled in Flutter / Dart is by using a Future. A Future allows you to run work asynchronously to free up any other threads that should not be blocked. Like the UI thread.

## Define a Future

A future is defined exactly like a function in dart, but instead of void you use Future. If you want to return a value from the Future then you pass it a type.

```dart
Future myVoidFuture() {}

Future<bool> myTypedFuture() {}
```

## Using a Future

There are two ways to execute a Future and use the value it returns. If it returns any. The most common way is to await on the Future to return. For this to work your function that's calling the code HAS TO BE MARKED ASYNC.

```dart
FlatButton(
  child: Text('Run Future'),
  onPressed: () async {
    var value = await myTypedFuture();
  },
)
```

Sometimes you don't want to turn the function into a Future or mark it async, so the other way to handle a future is by using the .then function. It takes in a function that will be called with the value type of your Future. Similar to a Promise in javascript without the resolve, reject explicitness.

```dart
void runMyFuture() {
  myTypedFuture().then((value) {
    // Run the code here using the value
  });
}
```

## Error handling

Futures has its own way of handling errors. In the .then call, in addition to passing in your callback you can also pass in a function to onError that will be called with the error returned from your Future.

```dart

// ui code
FlatButton(
  child: Text('Run Future'),
  onPressed: () {
    runMyFuture();
  },
)

// Future
Future<bool> myTypedFuture() async {
  await Future.delayed(Duration(seconds: 1));
  return Future.error('Error from return');
}

// Function to call future
void runMyFuture() {
  myTypedFuture().then((value) {
    // Run extra code here
  }, onError: (error) {
    print(error);
  });
}
```

If you run the code above you'll see the 'Error from return' message printed out after 1 second. If you want to explicitly handle and catch errors from the Future you can also use a dedidcated function called catchError.

```dart
void runMyFuture() {
  myTypedFuture().then((value) {
    // Run extra code here
  })
  .catchError( (error) {
    print(error);
  });
}
```

When handling an error in your Future you don't need to always return the Future.error. Instead you can also just throw an excpetion and it'll arrive at the same .catchError or onError callback.

```dart
Future<bool> myTypedFuture() async {
    await Future.delayed(Duration(seconds: 1));
    throw Exception('Error from Exception');
  }
```

You can also mix await and .catchError. You can await a Future and use the .catchError call instead of wrapping it. This way the value returned is null but you have the opportunity to handle the error as well without wrapping it in try/catch.

```dart
Future runMyFuture() async {
    var value = await myTypedFuture()
    .catchError((error) {
      print(error);
    });
  }
```

## Managing multiple Futures at once

Lets take an example where you have a screen where you can tap to download various items out of a list. You want wait for all these futures to be complete before you continue with your code. Future has a handy .wait call. This call allows you to provide a list of Futures to it and it will run all of them and when the last one is complete will return context to your current future.

```dart
// ui to call futures
FlatButton(
  child: Text('Run Future'),
  onPressed: () async {
    await runMultipleFutures();
  },
)

// Future to run
Future<bool> myTypedFuture(int id, int duration) async {
  await Future.delayed(Duration(seconds: duration));
  print('Delay complete for Future $id');
  return true;
}

// Running multiple futures
Future runMultipleFutures() async {

  // Create list of multiple futures
  var futures = List<Future>();
  for(int i = 0; i < 10; i++) {
    futures.add(myTypedFuture(i, Random(i).nextInt(10)));
  }

  // Waif for all futures to complete
  await Future.wait(futures);

  // We're done with all futures execution
  print('All the futures has completed');
}
```

If you tap the flat button above we will kick of 10 futures all together and wait for all of them to complete. You should see a result similar to below. It's using a random generator so you'll see different orders of the ID's.

```
I/flutter (12116): Delay complete for Future 7
I/flutter (12116): Delay complete for Future 3
I/flutter (12116): Delay complete for Future 9
I/flutter (12116): Delay complete for Future 4
I/flutter (12116): Delay complete for Future 2
I/flutter (12116): Delay complete for Future 1
I/flutter (12116): Delay complete for Future 8
I/flutter (12116): Delay complete for Future 0
I/flutter (12116): Delay complete for Future 6
I/flutter (12116): Delay complete for Future 5
I/flutter (12116): All the futures has completed
```

## Timeouts

Sometimes we don't know exactly how long a future will run. It it's a process that the user has to expicitly wait for .i.e. there's a loading indicator on screen then you probably don't want it to run for too long. In case you have something like this you can timeout a future using the timeout call.

```dart
Future<bool> myTypedFuture(int id, int duration) async {
    await Future.delayed(Duration(seconds: duration));
    print('Delay complete for Future $id');
    return true;
  }

  Future runTimeout() async {
    await myTypedFuture(0, 10)
        .timeout(Duration(seconds: 2), onTimeout: (){
          print('0 timed out');
          return false;
        });
  }
```

If you run the code about. You'll see `0 timed out` and you'll never see `Delay complete for Future 0`. You can add additional logic into the onTimeout callback. That covers the basics of what you'd need to handle Futures in your code. There's also the function .asStream on a future that you can use to return the results into a stream. If you have a code base dominated by streams you can make use of this and merge it with your other streams easily if required.

Thanks for reading. Checkout the [other tutorials](/tutorials) on the site.
