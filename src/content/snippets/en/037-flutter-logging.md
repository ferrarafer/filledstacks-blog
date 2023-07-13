---
title: A Guide to setting up better Logging in Flutter
description: This article covers logging in Flutter to help with debugging.
authors:
  - en/dane-mackier
published: 2019-07-01
updated: 2019-07-01
postSlug: a-guide-to-setting-up-better-logging-in-flutter
ogImage: /assets/snippets/037/037.jpg
featured: false
draft: false
tags:
  - flutter
  - logging
  - foundation
# friendlyId: snippet-037
---

Today we'll look at one of the tasks that can tremendously reduce the amount of time spent debugging in your app. Once you get accustomed to logs running a certain way in your app you'll quickly be able to notice why something is not working. You can see the flow of your app and then more if you need to.

We'll be using the logger package for all of our logging.

## Setup

Add the logger package to your project

```yaml
logger: ^0.6.0
```

## Usage

To use a logger you create a new one in your class and log using one of the method calls.

```dart
final logger = Logger();

logger.v('You don\'t always want to see all of these');
logger.d('Logs a debug message');
logger.i('Public Function called');
logger.w('This might become a problem');
logger.e('Something has happened');
```

These calls will output the following logs by default.

![Default logging example](/assets/snippets/037/037-default.jpg)

This might not be to everyone's liking. I'm personally not a big fan of all the lines being printed, there's some things I'd like to be removed so lets supply a `PrettyPrinter` instance and customise it a little bit.

I'd like to remove the method count printed above, when an exception has a stack trace I'd like to see up to 5 methods in that trace. I want the lines surrounding the logs to decrease, I'd like to keep the colors for visual feedback. Emoji's are staying and I want to disable the timestamp.

```dart
final logger = Logger(
  printer: PrettyPrinter(
    methodCount: 0,
    errorMethodCount: 5,
    lineLength: 50,
    colors: true,
    printEmojis: true,
    printTime: false,
  )
);
```

This results in the following output

![Pretty logging adjustments](/assets/snippets/037/037-pretty.jpg)

## Custom Log Printer

In some cases even that might be too much for people. To be honest the only thing I like about this is the colors per log with the emoji in front. I like having visual queues that helps me debug faster. As I mentioned before, you start to understand the flow of logs in your app given a certain scenario and visual queues will help that even more. One thing that the logger is missing is the name of the class it's being printed from. I want that as the first bit of information.

Create a new file called log_printer.dart that prints out the message passed in. This is the most basic type of printer and will have nothing special to it.

```dart
import 'package:logger/logger.dart';

class SimpleLogPrinter extends LogPrinter {
  @override
  void log(Level level, message, error, StackTrace stackTrace) {
    println(message);
  }

}
```

Then we'll set the `SimpleLogPrinter` as our printer for our Logger.

```dart
  final logger = Logger(printer: SimpleLogPrinter());
```

The kind of logs that work well for me is having color and knowing which class is printing the logs. So the `SimpleLogPrinter` will take in a name to display, and will make use of the colors defined in `PrettyPrinter` to print out the log. We want the following format

```
[emoji] [ClassName] - [Message]

💡 LocationService - Request Location Update
```

Let's implement that quickly.

```dart
class SimpleLogPrinter extends LogPrinter {
  final String className;
  SimpleLogPrinter(this.className);

  @override
  void log(Level level, message, error, StackTrace stackTrace) {
    var color = PrettyPrinter.levelColors[level];
    var emoji = PrettyPrinter.levelEmojis[level];
    println(color('$emoji $className - $message'));
  }
}
```

And this is the output.

![Custom Log Printer result](/assets/snippets/037/037-custom.jpg)

I like that. Sometimes I'll add spacing around some levels. Info messages especially since it's usually the entry point for other logs that follow. Info I use to document public method calls, so it's easy to follow what your code is doing.

We'll leave it like that. You can customise it more to your liking. The code to create a logger currently looks like below, and that' a bit too much typing for me.

```dart
 final logger = Logger(printer: SimpleLogPrinter('PermissionService'));
```

I usually use top-level functions for something like this to create the logger for me. Create a new file called logger and add this in there.

```dart
import 'package:logger/logger.dart';
import 'log_printer.dart';

Logger getLogger(String className) {
  return Logger(printer: SimpleLogPrinter(className));
}
```

Now in your code all you do is this.

```dart
final log = getLogger('PostService');
```

Last thing to do is set the logging level so that you don't see all the logs all the time. In your main file set the level before the application runs.

```dart

void main() {
  Logger.level = Level.verbose;
  runApp(MyApp());
}
```

That's it for logging. Checkout some of the other [Snippets](/snippets) on the site for more Flutter tutorials.
