---
title: Flutter Infinite Scroll using Flutter only
description: This tutorial will show you how to build a list that tells you when the last item is created.
authors:
  - en/dane-mackier
published: 2019-09-29
updated: 2019-09-29
postSlug: flutter-infinite-scroll-using-flutter-only
ogImage: /assets/tutorials/028/028.jpg
ogVideo: https://www.youtube.com/embed/rr7d3SuhLiU
featured: false
draft: false
tags:
  - flutter
  - ui
# codeUrl: https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F028%2F01-start.zip?alt=media&token=c626ce1e-07f4-4baa-826c-c6cbc87ad261
---

In this tutorial we will go through the process of creating a list that will give you additional functionality to build and infinite scrolling list. It will have the [Provider architecture setup](https://www.filledstacks.com/post/flutter-provider-v3-architecture/) with a view and a model to manage the state and business logic of that view. I've created a basic project that we'll use to build the functionality in. I have a basic starting project with one view, one viewmodel, a list of items and a ListView widget setup. You can [download it here](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F028%2F01-start.zip?alt=media&token=c626ce1e-07f4-4baa-826c-c6cbc87ad261)

## The Problem

The problem I'm trying to solve is the ability to request more results when the user gets close to the bottom of the list. In addition to that I don't want it to depend on an arbitrary scroll position of the controller. That's different for every device, instead I'd like to request more data when a specific index is reached, or in our case, when a specific list item has been created.

## The Solution

We'll create a list item widget that will fire off a callback when it's been initialised. We'll use an index threshold to determine if we've reached the correct location in the list then based on that make a request using the model to get more data.

## Implementation

We'll start off with the UI so we can get that out of the way

### UI Implementation

Create a new folder called widgets, and it it a file called creation_aware_list_item.dart. To start off, we'll create a widget that fires off a callback function when it has been initialised. We'll pass in a function called itemCreated which we'll fire off when the item initialisation is complete. It will also take the child widget so we can supply the UI from the outside.

```dart
import 'package:flutter/material.dart';

class CreationAwareListItem extends StatefulWidget {
  final Function itemCreated;
  final Widget child;
  const CreationAwareListItem({
    Key key,
    this.itemCreated,
    this.child,
  }) : super(key: key);

  @override
  _CreationAwareListItemState createState() => _CreationAwareListItemState();
}

class _CreationAwareListItemState extends State<CreationAwareListItem> {
  @override
  void initState() {
    super.initState();
    if (widget.itemCreated != null) {
      widget.itemCreated();
    }
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
```

Then we can head over to the home_view and surround our `ListItem` with a `CreationAwareListItem`.

```dart
 Widget build(BuildContext context) {
    return Scaffold(
      body: ChangeNotifierProvider<HomeViewModel>(
        ...
        child: Consumer<HomeViewModel>(
          builder: (context, model, child) => ListView.builder(
              itemCount: model.items.length,
              itemBuilder: (context, index) => CreationAwareListItem(
                itemCreated: (){
                  print('Item created at $index');
                },
                child: ListItem(
                  title: model.items[index],
                ),
              ),
            ),
        ),
      ),
    );
  }
```

Reload the app and scroll to the bottom. Now you'll see

```
I/flutter (18843): Item created at 8
I/flutter (18843): Item created at 9
I/flutter (18843): Item created at 10
I/flutter (18843): Item created at 11
I/flutter (18843): Item created at 12
I/flutter (18843): Item created at 13
I/flutter (18843): Item created at 14
```

Now a question might come up, "Why didn't we just use the builder function for the itemBuilder to perform whatever logic we need?" . It's a good question, and a valid one. I think mixing responsibilities is dangerous for long term maintenance. The itemBuilder function is provided so that we can return a widget for the UI to show, not for use to calculate if we should be requesting new data. For that reason we created a widget that specifically allows you to notify it's parent that it has been initialised, through that functionality we can now make decisions "outside" of the functionality of the builder function.

Now that we have this functionality all we want to do is pass the index into the viewmodel. So we can replace

```dart
print('Item created at $index');
```

with

```dart
model.handleItemCreated(index);
```

### Logic Implementation

Open up the HomeViewModel and we'll add a new function that returns a `Future` called `handleItemCreated`. What we want to do in this function is firstly determine if we have to request new data, then we want to determine which page of results we're requesting, and lastly we want to ensure we don't request the same data twice. With the code below we ensure the items are requested when the last item in the list is constructed. With the additional check that sees if the pageToRequest is bigger than the current page we ensure that we won't do a request for something that's already been requested so no additional guards needed.

```dart
class HomeViewModel extends ChangeNotifier {
  static const int ItemRequestThreshold = 15;
  int _currentPage = 0;
  ...

  Future handleItemCreated(int index) {
    var itemPosition = index + 1;
    var requestMoreData =
        itemPosition % ItemRequestThreshold == 0 && itemPosition != 0;
    var pageToRequest = itemPosition ~/ ItemRequestThreshold;

    if (requestMoreData && pageToRequest > _currentPage) {
      _currentPage = pageToRequest;
      // TODO: Show loading indicator, Request more data and hide loading indicator
    }
  }
}
```

Lets handle the loading indicator before we continue.

### Loading indicator

What I like to do is show an additional list item at the bottom of the list while we're fetching more data. When the new data comes back I remove the item and show the additional data. The way we'll do that is by inserting an item into the list that specifically identifies it as a busy indicator. You can use anythting to uniquely identify your list item, since the list is made up of only strings I'll use something that would unlikely be one of the list items.

Create a new folder called constants and inside create a file called ui_constants.dart

```dart
const String LoadingIndicatorTitle = '^';
```

We'll use this value to show a busy indicator instead of the title. Head over to the list_item and for the child of the container check if it equals the `LoadingIndicatorTitle` and show a `CircularProgressIndicator` else we'll continue showing the title.

```dart
class ListItem extends StatelessWidget {
  ...
  Widget build(BuildContext context) {
    return Container(
     ...
      child: title == LoadingIndicatorTitle
          ? CircularProgressIndicator()
          : Text(title),
    );
  }
}
```

That takes care of the UI. Lets create the functions to add and remove this list item when we have to show it. In the `HomeViewModel` create two new functions `_showLoadingIndicator` and `_removeLoadingIndicator`.

```dart
   void _showLoadingIndicator() {
    _items.add(LoadingIndicatorTitle);
    notifyListeners();
  }

  void _removeLoadingIndicator() {
    _items.remove(LoadingIndicatorTitle);
    notifyListeners();
  }
```

This functions will insert/remove the `LoadingIndicatorTitle` and notify the view that the items are updated so it can re-render the list of items. Now we can go ahead and show the indicator, delay the function a bit, "fetch new data" by generating it, adding it in and then removing the loading indicator. Update the loading indicator and replace the todo with the following code.

```dart
 Future handleItemCreated(int index) async {
    ...
    if (requestMoreData && pageToRequest > _currentPage) {
      print('handleItemCreated | pageToRequest: $pageToRequest');

      _currentPage = pageToRequest;
      _showLoadingIndicator();

      await Future.delayed(Duration(seconds: 5));
      var newFetchedItems = List<String>.generate(
          15, (index) => 'Title page:$_currentPage item: $index');
      _items.addAll(newFetchedItems);

      _removeLoadingIndicator();
    }
  }
```

If you run the code now and scroll to the bottom you'll probably get this exception

```
setState() or markNeedsBuild() called during build.
```

This is because we are calling a rebuild while the item is still in the render process. We can use the `SchedulerBinding` to make sure the items are refreshed after the current frame that is being drawn. Change the call to handleItemCreated to in the HomeView

```dart
itemCreated: () {
    SchedulerBinding.instance.addPostFrameCallback(
        (duration) => model.handleItemCreated(index));
  },
```

If you run the code now you'll see the items requested, a loading indicator for 5 seconds and then new results with the page number on it that's added. In a real environment all you'll do is replace the generate call with an actual request to your api, passing in the page number and then add the results into the list. Additionally if you have a limit to the number of results you can indicate that from your api by letting the caller know if there's more results to be requested.

That's it for this tutorial. This is a solution with the least amount of guards, pageNumbers built in, it won't request multiple times or every frame as the controller solution does, I hope that helped you. Let me know if you have any questions [over on the Slack](https://join.slack.com/t/filledstacks/shared_invite/enQtNjY0NTQ3MTYwMzEwLWJlMzY1N2RlYzViOWI3MDM3ZGJmYjBjMTk1M2IyMGFkMzdlYjdjZTVkYzZlZjg0ZTBlMDliNjFjNTA1ZWM4MmE).
