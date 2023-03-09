---
title: Flutter Basics - Going from setState to Architecture
description: In this tutorial I will be going over how to handle a common async situation in Flutter, without throwing architectures at the problem.
authors:
  - en/dane-mackier
published: 2019-03-30
updated: 2019-03-30
postSlug: flutter-basics-going-from-set-state-to-architecture
ogImage: /assets/tutorials/004/004.jpg
ogVideo: https://www.youtube.com/embed/TZkGT8WkjdA
featured: false
draft: false
tags:
  - flutter
  - architecture
  - foundation
relatedTutorials:
  - en/010-provider-architecture
  - en/014-provider-v3-architecture
  - en/007-scopedmodel-guide
---

In this tutorial I will be going over how to handle a common async situation in Flutter, without throwing architectures at the problem.

You’ll learn how things can be done for simplicity and how to evolve that into something maintainable and sophisticated … over time … **IF** it needs to evolve.

I’ve seen some questions about the depth of what Flutter has to offer simply because most tutorials focus on Building UI’s and making things look pretty. This is definitely the case and I do it too. It’s fun, and coming from native development it’s very exciting to work with something like Flutter. But I have become a bit worried about what’s being taught to developers first, especially beginners.

I see questions on StackOverflow from people using BloC or Redux and they don’t even know the basics of a stream, or that they have to subscribe, or why setState is used or the concept of an inherited widget. You’ll see them building a viewModel, calling setState in there and then dispatching setState’s in an action because their UI is not updating. It’s a bit concerning.

I am an enthusiast of well written apps and trying to write the best code possible, for the problem at hand. I don’t throw architectures in everywhere. Sometimes it’s not needed, **and I mean that**. As always. If you want to follow along, download the code for this [tutorial here](https://github.com/FilledStacks/flutter-tutorials). Drag the start folder in your Visual Code and Let’s go.

## Getting State in our App

We’ll start by changing the Home widget into a stateful widget from stateless. Then we’ll add the Future that we’ll call in the initState override. The Future will wait 1 second then return the data.

```dart
// Return a list of data after 1 second to emulate network request
Future<List<String>> _getListData() async {
  await Future.delayed(Duration(seconds: 1));
  return List<String>.generate(10, (index) => '$index title');
}
```

So what’s the most basic way of handling this? We’ll store a list of values in the state locally and call setState when we get the new values.

```dart
List<String> _pageData = List<String>();

@override
void initState() {
  _getListData().then((data) =>
      setState(() {
        _pageData = data;
      }));
  super.initState();
}
```

Lets add some UI to display the list so that we can see the data. Change your build function to this.

```dart
@override
Widget build(BuildContext context) {
  return Scaffold(
    body: ListView.builder(
      itemCount: _pageData.length,
      itemBuilder: (buildContext, index) => Container(
        margin: EdgeInsets.all(5.0),
        height: 50.0,
        color: Colors.grey[700],
        child: Text(_pageData[index]),
      ),
    ),
  );
}
```

At this point you’ll a list of results on the screen. I’m gonna add a little bit of styling to make things easier to look at then we can continue. Move the ListItemUi out of the builder method into it’s own function. Set the scaffold background color to grey[900] and use the code below for your \_getListItemUi.

```dart

@override
Widget build(BuildContext context) {
  return Scaffold(
    backgroundColor: Colors.grey[900],
    body: ListView.builder(
      itemCount: _pageData.length,
      itemBuilder: (buildContext, index) =>_getListItemUi(index)
  ));
}

Widget _getListItemUi(int index) {
  return  Container(
        margin: EdgeInsets.all(5.0),
        height: 50.0,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(5.0),
          color: Colors.grey[600]
        ),
        child: Center(
          child: Text(_pageData[index], style: TextStyle(color: Colors.white,),
      ),
        ),
    );
}
```

Now back to the actual tutorial. We’ll tackle state feedback while the setup is simple. So what states do we have?

**Busy**: We have to tell the user when we’re busy with something. While we’re fetching the data we’ll show a progress indicator.

**DataRetrieved**(already taken care of): Show the data to the user when it arrives.

**ErrorOccurred**: Show a message when something went wrong

**NoData**: Indicate to the user that the request was successful but they have no data to display yet.

Let’s tackle busy first. We’ll increase the time delay to 2 seconds so we can see the UI in action. We can determine state using a private property that checks if the data is null. Based on this value return a loading indicator or the list view. We have to make sure the data is null when we start, so remove the initialisation code and leave it null.

```dart
List<String> _pageData;

 bool get _fetchingData => _pageData == null;

...

@override
Widget build(BuildContext context) {
  return Scaffold(
    backgroundColor: Colors.grey[900],
    body: _fetchingData
    ? Center(child: CircularProgressIndicator())
    : ListView.builder(
      itemCount: _pageData.length,
      itemBuilder: (buildContext, index) =>_getListItemUi(index)
  ));
}
```

After these changes when you restart your app you should see a busy indication for 2 seconds then the results pop in. Nice. Onto the next state. Let’s do the Error state. We’re limited with this approach, but we’ll make it work. When there’s an error we’ll populate with one item that has the error message in it. We’ll catch the error after the .then call. We’ll also have to update the future to return an error. We’ll do that first.

```dart
Future<List<String>> _getListData({bool hasError = false}) async {
  await Future.delayed(Duration(seconds: 2));

  if(hasError) {
    return Future.error('An error occurred while fetching the data. Please try again later.');
  }

  return List<String>.generate(10, (index) => '$index title');
}
```

Then we can pass in true in the initFunction call and catch the error.

```dart
@override
void initState() {
  _getListData(hasError: true).then((data) =>
      setState(() {
        _pageData = data;
      }))
      .catchError((error) =>
      setState((){
        _pageData = [error];
      }));
  super.initState();
}
```

Awesome. When you restart the app now you should see a little bit of loading and then the error popping up. Last state is when there’s no info returned. We’ll update the Future again to take in another additional boolean that will return an empty list for us.

```dart
Future<List<String>> _getListData({
  bool hasError = false,
  bool hasData = true}) async {
  await Future.delayed(Duration(seconds: 2));

  if(hasError) {
    return Future.error('An error occurred while fetching the data. Please try again later.');
  }

  if(!hasData) {
    return List<String>();
  }

  return List<String>.generate(10, (index) => '$index title');
}
```

If there’s no items in the data returned we’ll add one with a message in it. Add this logic where we get the data back.

```dart
_getListData(hasError: true).then((data) =>
    setState(() {
      if(data.length == 0) {
        data.add('No data found for your account. Add something and check back.');
      }
      _pageData = data;
    }))
    .catchError((error) =>
    setState((){
      _pageData = [error];
    }));
```

Look at that. Using only setState and getting a bullet proof implementation for async behaviour. No packages or architectures needed for something this simple. That’s why it exists. So what’s the limitation of this approach?

**We have to always call setState to make sure the state updates**. This is not a reactive implementation, Meaning ,we have to write the code to update the UI in setState. This means more code, more things to keep track of and extending or adding new pieces of logic would require more setStates all over the place.

Flutter provides a great way for us to handle all of this without needing to use a stateful widget and set state. All of the code above can be replaced by one widget.

## FutureBuilder

The FutureBuilder widget is a widget that takes in a Future and allows you to return UI based on that Future’s state or information. You can provide it with a builder where you’ll receive a snapshot (information about the Future’s state) and based on that snapshot you can return the appropriate UI.

We’ll start by changing the Home widget back to a stateless widget and remove the initState call. We will also move all of the UI logic into the builder method of the future.

Move the code from the body into a function called \_getDataUi() so we don’t lose it. Change the widget back to a stateless widget and from the build method return a FutureBuilder in the body of the scaffold. Update the view to look like this.

```dart
class Home extends StatelessWidget {
  ...
  ...

 @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[900],
      body: FutureBuilder()
    );
  }

 Widget _getDataUi() {
  return _fetchingData
      ? Center(child: CircularProgressIndicator())
      : ListView.builder(
          itemCount: _pageData.length,
          itemBuilder: (buildContext, index) => _getListItemUi(index));
  }
  ...
}
```

Let’s Pass in the future to the FutureBuilder and supply it with an empty builder. Like so.

```dart
 @override
Widget build(BuildContext context) {
  return Scaffold(backgroundColor: Colors.grey[900], body: FutureBuilder(
    future: _getListData(),
    builder: (buildContext, snapshot) {

    },
  ));
}
```

Now we’re in business! We can return the UI’s we want and determine state locally in the future builder. We’ll start with 2 basic states, busy and dataFetched. Cut the code from the \_getDataUI function and return it from the builder function.

When there’s no data return the busy state, when there’s data return the ListView builder. Use the snapshot.data instead of the \_pageData variable so you also have to pass that into the \_getListItemUi function.

```dart
@override
Widget build(BuildContext context) {
  return Scaffold(backgroundColor: Colors.grey[900], body: FutureBuilder(
    future: _getListData(),
    builder: (buildContext, snapshot) {
      if(!snapshot.hasData) {
        return Center(child: CircularProgressIndicator());
      }

       var listItems = snapshot.data;
            return ListView.builder(
                itemCount: listItems.length,
                itemBuilder: (buildContext, index) => _getListItemUi(index, listItems));
    },
  ));
}

// Add listItems as a parameter and pass it in.
Widget _getListItemUi(int index, List<String> listItems) {
  return Container(
    margin: EdgeInsets.all(5.0),
    height: 50.0,
    decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(5.0), color: Colors.grey[600]),
    child: Center(
      child: Text(
        listItems[index],
        style: TextStyle(
          color: Colors.white,
        ),
      ),
    ),
  );
}
```

Now we can handle error and empty data. Add the error handling right at the top and the empty check just before list view is returned. Both of these will have the same styling so create a method called \_getInformationMessage(). This functions takes in some text and displays that.

```dart
Widget _getInformationMessage(String message) {
  return Center(
      child: Text(
    message,
    textAlign: TextAlign.center,
    style: TextStyle(fontWeight: FontWeight.w900, color: Colors.grey[500]),
  ));
}
```

Then Change the FutureBuilder to look like this.

```dart
FutureBuilder(
  future: _getListData(),
  builder: (buildContext, snapshot) {

    // error ui
    if(snapshot.hasError) {
      return _getInformationMessage(snapshot.error);
    }

    // Busy fetchind data
    if (!snapshot.hasData) {
      return Center(child: CircularProgressIndicator());
    }

    var listItems = snapshot.data;

    // When empty data is returned
    if(listItems.length == 0) {
      return _getInformationMessage('No data found for your account. Add something and check back.');
    }

    // Build list if we have data
    return ListView.builder(
        itemCount: listItems.length,
        itemBuilder: (buildContext, index) => _getListItemUi(index, listItems));
  }
));
```

With that you should have all the same functionality without using setState. Pretty cool right. You can test out the states by passing in different values to the \_getListData function. pass in hasError: true and restart the app and you’ll see the error message, the same with the hasData: false. There’s still some limitations to using it this way.

You can’t re-run the future builder and go through all the states again. Let me show you what I mean. Say for instance we got the data but realised that it’s old so we want to update it. Very common scenario. We’ll add a FloatingActionButton to the scaffold and when tapped fire off the Future to show the limitation.

Above the backgroundColor in the scaffold add a floatingActionButton.

```dart
...
floatingActionButton: FloatingActionButton(onPressed: () {
    // We want to refresh, but this actually does nothing. Which is the limitation
    _getListData();
  }),
backgroundColor:
...
```

That’s a pointless button there, but it’s just to prove a point. If we wanted to re-run the future to do a refresh then we wouldn’t be able to. Not with this approach. To get something like this we need the UI to respond to state changes consistently based on state values we pass it. For that we can use a Stream and a StreamBuilder.

## StreamBuilder

This widget allows you to return a UI based on the values you send to it using a stream. The way this will benefit us is that we can send the state values whenever we want and the widget will display the UI we defined for that state. This means we can set it back to busy, fetch new data then tell the stream we’re done and show updated data.

To start off we’ll use an enum to represent the states. Create one at the top of the home file, outside the class, called HomeViewState. Leave out Error because the stream controller allows you to add an error to the stream.

```dart
enum HomeViewState { Busy, DataRetrieved, NoData }
```

The way to add values onto a Stream is using StreamController. Create a Stream Controller, change the FutureBuilder to a StreamBuilder and change the future parameter to stream.

```dart
// Top of the file
import 'dart:async';

....
// Above build method
final StreamController<HomeViewState> stateController = StreamController<HomeViewState>();

// Change the FutureBuilder to StreamBuilder
 body: StreamBuilder(
    stream: stateController.stream,
 ...
```

As you can see the builder can still be used with the same UI. The only difference will be that instead of using the data to make decisions we’ll be looking at the enum values. Leave error handling as is and just update the rest.

```dart
 builder: (buildContext, snapshot) {

  if(snapshot.hasError) {
    return _getInformationMessage(snapshot.error);
  }

  // Use busy indicator if there's no state yet, and when it's busy
  if (!snapshot.hasData || snapshot.data ==HomeViewState.Busy) {
    return Center(child: CircularProgressIndicator());
  }

  // use explicit state instead of checking the lenght
  if(snapshot.data ==HomeViewState.NoData) {
    return _getInformationMessage('No data found for your account. Add something and check back.');
  }

  var listItems = snapshot.data;
  return ListView.builder(
      itemCount: listItems.length,
      itemBuilder: (buildContext, index) => _getListItemUi(index, listItems));
}
```

Now there’s still some things left.

1. We have to get the listItems for the ListView builder from a different place, it’s not in the snapshot anymore.
2. We have to emit the stream values
3. We have to run the future when we land on the page. For this we’ll need to go back to a stateful widget and use the init function.

If you have the Flutter + Dart extensions installed in VS Code then it should be quick. Ctrl + Shift + R on the StatelessWidget class type and select convert to stateless . Option + Shift + R on Mac. Now that you have a stateful Home widget we can continue.

We’ll start by adding the list of items back into the class and calling \_getListData in the init function. We’ll also emit the correct values over the stream from the \_getListDataFuture.

```dart
final StreamController<HomeViewState> stateController = StreamController<HomeViewState>();
// Add our listItems at the top
List<String> listItems;

// Call our _getListData in the initState function
@override
void initState() {
  _getListData();
  super.initState();
}

// Update our future
Future _getListData({bool hasError = false, bool hasData = true}) async {
  stateController.add(HomeViewState.Busy);
  await Future.delayed(Duration(seconds: 2));

  if (hasError) {
    return stateController.addError(
        'An error occurred while fetching the data. Please try again later.');
  }

  if (!hasData) {
    return stateController.add(HomeViewState.NoData);
  }

  listItems = List<String>.generate(10, (index) => '$index title');
  stateController.add(HomeViewState.DataRetrieved);
}
```

Remember to remove the local listItems value from the builder function in the StreamBuilder.

The part we want to focus on now is what happens when our Future is called. At the beginning we broadcast the busy state. If there’s an error we add that to the stream, if we have noData we broadcast that and at the end we tell let the stream the data is fecthed. At this point, even though our business logic code is still in the same file as the UI, it’s already decoupled.

If you run the code now everything should still be the same, with one addition. If you tap the FloatingActionButton the view will refresh :) . Now that it’s all decoupled and in a stream we can create an “architecture”, and by that I mean split your files up.

## Splitting your files, logically

At this point the code for the UI is completely separate from the business logic. The next logical step, for those that do think about architecture and code maintenance, is to split up our file.

We’ll split our file into a Model and a view. Create a new file called home_model.dart and move the following code in there.

```dart
import 'dart:async';

enum HomeViewState { Busy, DataRetrieved, NoData }

class HomeModel {

  // Controller for the stream
  final StreamController<HomeViewState> _stateController = StreamController<HomeViewState>();

  // Items that are retrieved
  List<String> listItems;

  // Stream that broadcasts the home state
  Stream<HomeViewState> get homeState => _stateController.stream;

  // Actual business logic
  Future getListData({bool hasError = false, bool hasData = true}) async {
    _stateController.add(HomeViewState.Busy);
    await Future.delayed(Duration(seconds: 2));

    if (hasError) {
     return _stateController.addError(
          'An error occurred while fetching the data. Please try again later.');
    }

    if (!hasData) {
      return _stateController.add(HomeViewState.NoData);
    }

    listItems = List<String>.generate(10, (index) => '$index title');
    _stateController.add(HomeViewState.DataRetrieved);
  }
}
```

In the home file you can now remove all the member variables and replace it with one model instance. Then replace the calls to \_getListData with model.getListData and the stream with model.homeState. And there you have it, a reactive-“architecture” for a simple app. There’s no name for this architecture. But the app is architected. That’s all that I wanted to show.

Please leave some claps if you gained any insight from this, I would really appreciate it. Youtube video coming out next week, a subscription would be appreciated. I’ll be doing more Flutter Foundation series posts so follow me to get them in your feed. If you have something you can’t wrap your head around or struggle with let me know and I’ll add that to the list of Foundation articles I want to write.

This is the end of the tutorial but I’d like to mention some things you can do (as a young architect) to get on your own journey to building well written, easy to maintain mobile apps using Flutter. Without forcing certain architectures onto your apps.

---

**Put your files in folders**: Keep things neat by grouping your files, no need for a deep structure just basic. views, viewmodels, models, services, etc.

**Decide on a naming convention and stick to it**: Here we called our model a model, but that might clash with the data models we’ll use to represent our information. You’ll have to come up with a convention to easily identify the following things in your code.

- **View files** (The file representing one page/view in your app, not the separate components)
- **View State Models** (The file that performs the business logic and provides state, view-model is a common name, BLoC is being thrown around now too, Controller is popular as well or just Model)
- **Data Models** (The file that represents the structured data in your project). You have to think about this because lets say you have an app where you can file Reports. You might name your view report.dart, and when you make your model you want the simplest name so you call your model for report report.dart also. This obviously won’t work. But you can name your view report_view.dart, and leave the model as the simple one, or vice versa. But you have to stick to it.
  The rest of the architecture rules you can establish as you go along. Things like, only the model can add to stream through actions (BLoC), no two-way binding. Or, have two-way binding, or instead of having multiple models we’ll have one that represents our App State and we’ll send messages to it through a stream using actions.

Whatever you decide, make sure it solves your problem first. Then look at long term enjoyment of using that code base. If your code is separated well from the beginning you can quickly change architectures and move your logic around so don’t worry too much about choosing the perfect one at the beginning.
