---
title: A Complete Guide to Flutter Streams
description: In this tutorial we cover the basics of Streams and how to manage them.
authors:
  - en/dane-mackier
published: 2019-09-08
updated: 2019-09-08
postSlug: a-complete-guide-to-flutter-streams
ogImage: /assets/tutorials/026/026.jpg
ogVideo: https://www.youtube.com/embed/53jIxLiCv2E
featured: false
draft: false
tags:
  - flutter
  - stream
relatedTutorials:
  - en/020-future-basics
  - en/018-bottom-sheet-guide
  - en/019-beginners-animation-guide
---

In this guide we will cover the basics of a Steam in Dart, how to use it, manage it and create one.

## What is a Stream

There are many comparisons of how to visualise a Stream so I'll use a common one. A stream is like a pipe, you put a value on the one end and if there's a listener on the other end that listener will receive that value. A Stream can have multiple listeners and all of those listeners will receive the same value when it's put in the pipeline. The way you put values on a stream is by using a StreamController.

## How to create a Stream

If you want to create a stream where you can put a value on you start with a StreamController.

```dart
StreamController<double> controller = StreamController<double>();
```

This will construct a controller that you can then use to manipulate the stream the controller manages. The controllers stream can be accessed through the `stream` property

```dart
Stream stream = controller.stream;
```

## How to use a stream

The next thing to do is to be able to get the values from a stream. This is commonly referred to as subscribing or listening to a stream. When you subscribe to a stream you will only get the values that are emitted (put onto the stream) after the subscription. You subscribe to the stream by calling the `listen` function and supplying it with a Function to call back to when there's a new value available, commonly referred to as a callback function, or just a callback.

```dart
stream.listen((value) {
  print('Value from controller: $value');
});
```

## Emit / Add a value onto the stream

When you have subscriptions to the stream it means that there's a function waiting to be executed somewhere. The way you emit a value over a stream is by calling `add` on the streams controller.

```dart
controller.add(12);
```

When you call that function, the callback supplied in the section above will execute. Which will print out

```
Value from controller: 12
```

That's all the basics of a stream in terms of using it. Now lets go on to managing the stream.

## Managing the stream

The listen call returns a `StreamSubscription` of the type of your stream. This can be used to manage the stream subscription. The most common usage of the subscription is cancelling the listening when you're no longer required to receive the data. Basically making sure there are no memory leaks. A subscription to a stream will stay active until the entire memory is destroyed, usually the entire lifecycle of your app. This is perfectly fine in some cases and not fine in others.

When you subscribe to a Stream and you have to cancel it afterwards you can store it in a `SteamSubscription`

```dart
StreamSubscription<double> streamSubscription = stream.listen((value) {
  print('Value from controller: $value');
});
```

This will give you the subscription object for the registered callback.

## Cancel a stream

Lets go over when you want to do this. In flutter, streams are usually used with the `StreamBuilder` which manages and unsubscribes from a stream for you internally once the widget is destroyed. A good rule to follow is when you subscribe to a stream, keep the Subscription and write the code in the dispose method to call cancel. If your stream needs to be alive for the entire duration of the application then you don't have to cancel the stream on dispose or when it's not needed.

```dart
streamSubscription.cancel();
```

# Common Stream Errors

One thing that's very common to see when devs use Streams in dart is the "Stream already subscribed to" message. A lot of people think that this is because there's an active subscription and cancelling that would get rid of the error, but that's not true. Lets look at how we can create this exception ourselves, then we'll figure out how to fix it.

```dart
stream.listen((value) {
  print('1st Sub: $value');
});
stream.listen((value) {
  print('2nd Sub: $value');
});
```

This will throw the error "Bad state: Stream has already been listened to". Now even if you cancel the first subscription and subscribe again you'll still get this error and that is by design.

```dart
 streamSubscription = stream.listen((value) {
     print('1st Sub: $value');
  });

  await streamSubscription.cancel();

  stream.listen((value) {
    print('2nd Sub: $value');
  });
```

The code above will still throw the "Bad state" stream error. The reason for that is because there are two types of Streams:

**Single Subscription Stream**: For use with a sequence of events that are parts of a larger whole. Things like reading a file or a web request. To ensure the subscriber that subscribed first gets all the correct information in the correct order there's a limitation allowing you to only subscribe once for the lifecycle of the streams existence.

**Broadcast Stream**: This kind of stream is for use with individual emissions that can be handled one at a time without the context or knowledge of the previous events.

You can use both for individual events, like I do, but just be weary of the subscription policy on the first one. When using a `StreamBuilder` in Flutter you'll most likely always get the exception because the Stream will be subscribed to multiple times during build function calls (which happen a lot).

### Fixing the Bad State stream error

To fix this you'll have to specifically create a broadcast StreamController so that the underlying stream is constructed and managed as a Broadcast stream that allows multiple subscriptions.

```dart
StreamController<double> controller = StreamController<double>.broadcast();
```

**IMPORTANT NOTE** - Using either of these stream types does not mean you don't have to manage your subscription. If you manually subscribe to a stream you HAVE to clean it up (cancel) if there's a change that you might subscribe to it again. Multiple subscriptions cause memory leaks, make sure when your code goes out of scope or out of view you dispose, then re-subscribe if you have to.

## Manual Streams

Another way and also a common method of creating streams is through an `async *` function. This is a Function that will run asynchronously and return (yield) a value whenever there's a new one, but it won't stop the execution of that function. To make more sense lets look at it like this. Below is a Future that will return a random value after waiting 1 second.

```dart
Future<double> getRandomValue() async {
  var random = Random(2);
  await Future.delayed(Duration(seconds: 1));
  return random.nextDouble();
}
```

This code can be used and you'll get a random value back once off and the function will be finished executing. This means if you want another random value you'll have to call and await the function again. Like below.

```dart
var value1 = await getRandomValue();
var value2 = await getRandomValue();
```

What if you wanted to call the function once and continuously get random values from that function without stopping it's execution? That's where `async*` and yield comes in. Lets make a function that returns a stream and every second will emit a new random value.

```dart
Stream<double> getRandomValues() async* {
    var random = Random(2);

    while (true) {
      await Future.delayed(Duration(seconds: 1));
      yield random.nextDouble();
    }
  }
```

This is called a generator function. It looks similar to the previous one, but lets look at the differences.

- The first thing to notice is that we now return a Stream and not a Future. That means instead of awaiting on the value we'll have to subscribe to the stream.
- The second difference is that `async*` instead of `async`. This tells the runtime that this code should be run asynchronously but execution will continue even after "returning" a value.
- The last difference is the replacement of `return` with `yield`. This is basically a return function but it doesn't exit the function. Instead it continues executing the rest of the code after yield.

So how do you use this Stream (Generator Function)? The same as above.

```dart
getRandomValues().listen((value) {
    print('1st: $value');
  });
```

This will print out something like below where each line is printed after every second of delay.

```
1st: 0.000783592309359204
1st: 0.232325923093592045
1st: 0.456078359230935920
1st: 0.565783592309359204
```

Streams created in this manner are broadcast by default and allows for multiple subscriptions. In terms of basics for usage that's all you have to know about streams. In terms of basics that's all you have to know about streams, how to use them and effectively manage them without causing bugs in your code. Once you understand Streams and how they work and require more functionality you can look at [RxDart](https://pub.dev/packages/rxdart).
