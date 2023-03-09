---
title: Using Shimmer for Loading indication in Flutter
description: In this Flutter tutorial I go over using the Shimmer package to indicate loading in your app.
authors:
  - en/dane-mackier
published: 2019-05-22
updated: 2019-05-22
postSlug: using-shimmer-for-loading-indication-in-flutter
ogImage: /assets/snippets/014/014.jpg
featured: false
draft: false
tags:
  - flutter
  - ui
# friendlyId: snippet-014
---

Any app that makes requests over a network, or basic read/write operations will be busy at some point. You always want to give the user feedback on what's happening, or reduce the feeling of waiting, while they're waiting. For the past few months I've been using the circular progress indicator as well as some custom loaders to show busy states. Today I want to show you how to render your app UI as a skeleton and using the [shimmer package](https://pub.dev/packages/shimmer) instead.

Please don't mind the styling, this is just to give you an idea of what you can do. In this app I'll show a list of items and when loading I'll use fake versions of those items with the shimmer effect over it. If you're confused by that term, check out [shimmer package's](https://pub.dev/packages/shimmer) page for an example.

## Implementation

We'll start by adding the shimmer package into our pubspec file.

```yaml
shimmer: ^1.0.0
```

Then we'll create a simple UI. Some large text at the top, with an expanded widget that contains a list view. The list view will show the ListItem widget which is a very basic widget. The only special piece of logic is that when the index equals -1 we show a container instead of the column of text.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(),
      home: Scaffold(
        body: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              SizedBox(
                height: 60,
              ),
              Text(
                'My Awesome List',
                style: TextStyle(fontSize: 40),
              ),
              Expanded(
                  child: ListView.builder(
                itemCount: 10,
                itemBuilder: (context, index) => ListItem(index: index),
              ))
            ]),
      ),
    );
  }
}

class ListItem extends StatelessWidget {
  final int index;
  const ListItem({Key key, this.index});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 60,
      margin: EdgeInsets.symmetric(vertical: 10.0, horizontal: 5.0),
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(10.0)),
      child: Row(
        children: <Widget>[
          Container(
            width: 50.0,
            height: 50.0,
            margin: EdgeInsets.only(right: 15.0),
            color: Colors.blue,
          ),
          index != -1
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      'This is title $index',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Text('This is more details'),
                    Text('One more detail'),
                  ],
                )
              : Expanded(
                  child: Container(
                    color: Colors.grey,
                  ),
                )
        ],
      ),
    );
  }
}
```

Skeleton screens were popularised by Facebook (mostly) and is a good way of reducing the appearance of waiting. To simulate this we'll use a Future with a delay so and show our skeleton while we're waiting. Create a future that returns a list of integers after a 3 second delay.

```dart
Future<List<int>> _getResults() async {
    await Future.delayed(Duration(seconds: 3));
    return List<int>.generate(10, (index) => index);
  }
```

Then we'll replace our current list with a Future builder that return the list if there's data available. When there's no data we want to show the same list, with fake data and wrap the item in a shimmer effect. Replace the following

```dart
// old list code
 Expanded(
      child: ListView.builder(
    itemCount: 10,
    itemBuilder: (context, index) => ListItem(index: index),
  ))
```

with

```dart
 Expanded(
    child: FutureBuilder<List<int>>(
        // perform the future delay to simulate request
        future: _getResults(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return ListView.builder(
              itemCount: 10,
              // Important code
              itemBuilder: (context, index) => Shimmer.fromColors(
                  baseColor: Colors.grey[400],
                  highlightColor: Colors.white,
                  child: ListItem(index: -1)),
            );
          }

          return ListView.builder(
            itemCount: snapshot.data.length,
            itemBuilder: (context, index) => ListItem(index: index),
          );
        }),
  )
```

All we're doing above is telling the code that, when there's no data in the snapShot yet `if (!snapshot.hasData)` then we want to show a list of 10 items. The list item being the ListItem widget, but instead of passing the actual data we pass -1 as the index. This will replace the text with our container so it appears like a skeleton. See screenshot below.

![Flutter Skeleton View with Shimmer](/assets/snippets/014/014-screenshot1.jpg)

Checkout and subscribe to my [Youtube Channel](https://www.youtube.com/c/filledstacks?sub_confirmation=1) for weekly tutorials. Follow me [on Instagram](https://www.instagram.com/filledstacks/) for snippets and day-to-day programming. Checkout all the [other snippets](/snippets) here. You might find some more Flutter magic.
