---
title: Build a User Feedback App in Flutter and Firebase
description: In this Flutter guide I show you how to connect your app to Firestore and display a list of data with real time updates.
authors:
  - en/dane-mackier
published: 2019-05-09
updated: 2019-05-09
postSlug: build-a-user-feedback-app-in-flutter-and-firebase
ogImage: /assets/tutorials/009/009.jpg
ogVideo: https://www.youtube.com/embed/g5-ZkfN2mvY
featured: false
draft: false
tags:
  - flutter
  - firebase
  - scoped-model
  - architecture
  - get-it
  - stream
---

In this guide I will show how you can connect a list of documents to your Flutter app, show an indication of unread documents and mark it as read when opened. This guide is a continuation of [Building a Realtime Stats monitor in Flutter](/post/building-a-realtime-stats-monitor-in-flutter).

Prerequisites:

- Have your firebase app setup and linked to your app
- Have a service in your app called FirebaseService

If you just want to follow along with the code. Clone [this repo](https://github.com/FilledStacks/flutter-tutorials.git) open 008 and open the final project in your IDE.

## Firestore setup

Lets look at the structure of the feedback collection in the firebase console. I have root collection called feedback with the following fields. details:String, note:String, open:bool, read:bool, title:string, type:number, userId:String.

![Firestore Feedback collection](/assets/tutorials/009/009-firestore-feedback.jpg)

## FirebaseService Implementation

There's two things to implement here. The listing of the feedback and the unread feedback count.

### Feedback

For the feedback data, I don't want all the feedback documents back from the service. I only want to see the open documents. So we'll do a query on the open field and we'll check if it's equal to true. We'll then get the QuerySnapshots using snapshots, and listen to the stream. We'll do that on consctruction of the FirebaseService. Add the following to your FirebaseSerivce class constructor

```dart
  Firestore.instance
        .collection('feedback')
        .where("open", isEqualTo: true)
        .snapshots()
        .listen(_feedbackAdded);
```

The data returned to the `_feedbackAdded` function is a `QuerySnapshot`. We want to convert that into a model our app can consume. For that we'll create a model called `UserFeedback`. In the models folder create a new file user_feedback.dart.

```dart
class UserFeedback {
  final String details;
  final String note;
  final bool open;
  final bool read;
  final String title;
  final int type;
  final String userId;

  UserFeedback(
      {this.details,
      this.note,
      this.open,
      this.read,
      this.title,
      this.type,
      this.userId});

  UserFeedback.fromData(Map<String, dynamic> data)
      : details = data['details'],
        note = data['note'],
        open = data['open'] ?? true,
        read = data['read'] ?? false,
        title = data['title'],
        type = data['type'] ?? 0,
        userId = data['userId'];
}

```

The `_feedbackAdded` function will be responsible for converting the list of Documents to UserFeedback an putting it on the publicly exposed Stream. Add a stream controller that will broadcast a List of UserFeedback items and expose it through a public getter, `feedback`. The \_feedbackAdded function will use another helper to convert all the documents to a UserFeedback list. We'll add the entire list onto the stream.

```dart
...

// Controller for our feedback data stream
final StreamController<List<UserFeedback>> _feedbackController =
      StreamController<List<UserFeedback>>();

...

// Public feedback stream to be consumed in the model
Stream<List<UserFeedback>> get feedback => _feedbackController.stream;

// Converts the snapshot into a list of UserFeedback items and places on stream
void _feedbackAdded(QuerySnapshot snapShot) {
  var feedback = _getFeedbackFromSnapshot(snapShot);
  _feedbackController.add(feedback);
}

// Helper function that Converts a QuerySnapshot into a List<UserFeedback>
List<UserFeedback> _getFeedbackFromSnapshot(QuerySnapshot snapShot) {
  var feedbackItems = List<UserFeedback>();
  var documents = snapShot.documents;
  var hasDocuments = documents.length > 0;

  if (hasDocuments) {
    for (var document in documents) {
      feedbackItems.add(UserFeedback.fromData(document.data));
    }
  }

  return feedbackItems;
}
```

Head over to the FeedbackViewModel, inject the firebaseService and create a userFeedback property. In the Constructor listen to the feedback stream. In \_onFeedbackUpdated function set the userFeedback to the feedback push emitted over the stream and then update the state using setState. Change your FeedbackModel to look like like below.

```dart
class FeedbackViewModel extends BaseModel {
  FirebaseService _firebaseService = locator<FirebaseService>();
  List<UserFeedback> userFeedback;

  FeedbackViewModel() {
    _firebaseService.feedback.listen(_onFeedbackUpdated);
  }

  void _onFeedbackUpdated(List<UserFeedback> feedback) {
    userFeedback = feedback;

    if (userFeedback == null) {
      setState(ViewState.Busy);
    } else {
      setState(userFeedback.length == 0
          ? ViewState.NoDataAvailable
          : ViewState.DataFetched);
    }
  }
}
```

The last part to connect is the FeebackView UI. It's still connected to the example code that AppSkeletons sets up. We just have to swap our list sources and the item used for data. The template item will use the FeedbackItem. Create a new file in the widgets folder called feedback_item.dart and copy the code below.

**FeedbackItem**

```dart
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:skeleton_watcher/models/user_feedback.dart';
import 'package:skeleton_watcher/ui/shared/app_colors.dart';

import 'feedback_label.dart';

class FeedbackItem extends StatefulWidget {
  final Function(String) onOpened;

  const FeedbackItem({
    @required this.feedbackItem,
    @required this.onOpened,
  });

  final UserFeedback feedbackItem;

  @override
  _FeedbackItemState createState() => _FeedbackItemState();
}

class _FeedbackItemState extends State<FeedbackItem> {
  double _height = 70.0;
  bool _showDetails = false;

  static const double descriptionPadding = 15.0;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: Duration(milliseconds: 200),
      curve: Curves.easeIn,
      width: double.infinity,
      height: _height,
      margin: EdgeInsets.symmetric(vertical: 5, horizontal: 10),
      padding: EdgeInsets.all(10.0),
      decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(5.0), color: darkGrey),
      child: Row(
        children: <Widget>[_detailsSection, _notificationSection],
      ),
    );
  }

  Widget get _detailsSection => Expanded(
          child: GestureDetector(
        onTap: () {
          setState(() {
            if (!_showDetails) {
              _height = 190;
            } else {
              _height = 70.0;
            }
          });

          Timer.periodic(Duration(milliseconds: 150), (timer) {
            timer.cancel();

            if(widget.onOpened != null) {
              widget.onOpened(widget.feedbackItem.id);
            }

            setState(() {
              _showDetails = !_showDetails;
            });
          });
        },
        child: Container(
          color: darkGrey,
          child: Column(
            mainAxisSize: MainAxisSize.max,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(widget.feedbackItem.title,
                  maxLines: 1, style: TextStyle(fontWeight: FontWeight.bold)),
              _showDetails
                  ? Padding(
                      padding: const EdgeInsets.symmetric(
                          vertical: descriptionPadding),
                      child: Text(widget.feedbackItem.details),
                    )
                  : Container(),
              Expanded(
                  child: Align(
                      child: FeedbackLabel(type: widget.feedbackItem.type),
                      alignment: Alignment.bottomLeft))
            ],
          ),
        ),
      ));

  Widget get _notificationSection => Container(
      width: 50.0,
      child: Column(children: <Widget>[
        !widget.feedbackItem.read
            ? Container(
                width: 20,
                height: 20,
                decoration:
                    ShapeDecoration(shape: CircleBorder(), color: primaryColor))
            : Container(),
        Expanded(
            child: Align(
                alignment: Alignment.bottomCenter,
                child: Text('Today',
                    style: TextStyle(
                        color: lightGrey,
                        fontWeight: FontWeight.bold,
                        fontSize: 9.0))))
      ]));
}
```

The above widget depends on another widget that will render the different label types for us. Create a file under widgets called feedback_label.dart and add the code below.

**Feedback Label**

```dart
import 'package:flutter/material.dart';

enum LabelType { Bug, Request, General }

class FeedbackLabel extends StatelessWidget {
  final int type;

  FeedbackLabel({@required this.type});

  @override
  Widget build(BuildContext context) {
    return Container(
        padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
        decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(3.0),
            color: _getLabelColor(_getTypeForType())),
        child: Text(_getLabelName()));
  }

  String _getLabelName() {
    return _getTypeForType().toString().split('.').last;
  }

  LabelType _getTypeForType() {
    switch (type) {
      case 0:
        return LabelType.Bug;
      case 1:
        return LabelType.Request;
      case 2:
        return LabelType.General;
    }

    return LabelType.Bug;
  }

  Color _getLabelColor(LabelType label) {
    switch (label) {
      case LabelType.Bug:
        return Color.fromARGB(255, 202, 9, 9);
      case LabelType.Request:
        return Color.fromARGB(255, 9, 71, 202);
      case LabelType.General:
        return Color.fromARGB(255, 202, 134, 9);
    }

    return null;
  }
}
```

Now in the FeedbackView we can change the \_getListUi to return a FeedbackItem from the builder and pass in the feedbackItem from the list.

```dart
  Widget _getListUi(FeedbackViewModel model) {
    return  ListView.builder(
        itemCount: model.userFeedback.length,
        itemBuilder: (context, itemIndex) {
          var feedbackItem = model.userFeedback[itemIndex];
          return FeedbackItem(feedbackItem: feedbackItem);
        });
  }
```

And with that change you should see your user feedback item listed. Everything updates in real time. If you change anything on the service it updates immediatly below I changed the read value to true and it took the indicator away.

![Screenshot Feedback unread message](/assets/tutorials/009/009-screenshot-2.jpg)

![Screenshot Feedback unread message](/assets/tutorials/009/009-screenshot-2a.jpg)

The last bit of UI update on the Feedback view is to add the WatcherToolbar. We'll change the body of our Scaffold to return a Column instead of a Container. The first child will be the toolbar and the second will be a container with a fixed height that sets the \_getBodyUi result as the child.

```dart
  @override
  Widget build(BuildContext context) {
    return BaseView<FeedbackViewModel>(
        builder: (context, childe, model) => Scaffold(
            backgroundColor: Theme.of(context).backgroundColor,
            body: Column(
              children: <Widget>[
                WatcherToolbar(title: 'FEEDBACK', showBackButton: true),
                Container(
                    height: screenHeight(context, decreasedBy: toolbarHeight),
                    child: _getBodyUi(context, model)),
              ],
            )));
  }
```

#### Bug smashing

If you navigate to the feedback view twice, you'll get a 'Stream already subscribed to' error message. Since we only have one feedback view in the app we'll handle this by making the FeedbackModel a singleton instance so the constructor is only called once. Go to the service locator and change your feedback model to a singleton instance.

```dart
locator.registerSingleton(FeedbackViewModel());
```

That should take care of that little bug.

### Unread count

On the home view we have an indicator button that we want to use to show a count of the feedback. We don't want to have the count of the total feedback, instead just the ones that were not read yet. We'll use the `read` value on the UserFeedback model to get our unread count. In the firebase service add a stream controller that will broadcast the unread count. Expose the stream publicly using a getter.

```dart

 final StreamController<int> _unreadController = StreamController<int>();
 ...

 Stream<int> get unreadCount => _unreadController.stream;

```

We'll create a new function called `_emitUnreadCount` that will take in the list of open userFeedback, filter on the `read` property and add the length of the filtered list onto the `_unreadController`. We'll call this function at the of the `_feedbackAdded` function.

```dart
void _feedbackAdded(QuerySnapshot snapShot) {
  var userFeedback = _getFeedbackFromSnapshot(snapShot);
  _feedbackController.add(userFeedback);
  _emitUnreadCount(userFeedback);
}

void _emitUnreadCount(List<UserFeedback> userFeedback) {
  var unreadCount = userFeedback.where((feedbackItem) => !feedbackItem.read).length;
  _unreadController.add(unreadCount);
}
```

In the HomeViewModel create a new int property called unreadCount. Subscribe to the unreadCount stream in the constructor and set the unreadCount to the value from the stream. Then call setState to indicate a state change.

```dart
// In the HomeViewModel constructor
_firebaseService.unreadCount.listen(_onUnreadCountUpdated);

void _onUnreadCountUpdated(int count) {
  unreadCount = count;
  setState(ViewState.DataFetched);
}
```

In the HomeView pass the unreadCount to the indicationCount parameter on the IndicatorButton.

```dart
IndicatorButton(
      title: 'FEEDBACK',
      onTap: () {
        Navigator.push(context,
            MaterialPageRoute(builder: (context) => FeedbackView()));
      },
      indicationCount: model.unreadCount,
    ))
```

And that's it. Now if we change the read value of some of the documents you'll see it update in real time the count on the button. See below.

![HomeView with no unread feedback](/assets/tutorials/009/009-feedback-read.jpg)

![HomeView with unread feedback](/assets/tutorials/009/009-feedback-unread.jpg)

#### Mark feedback as read

Next we'll add the logic to set an item to read once it has been opened. The way feedback is currently viewed is by expanding the item container and then showing the details. I updated the feedback_item.dart file with the new functionality so copy the code below and replace all the current code in feedback_item.dart. All it does is use an animated container to expand the item's height to a fixed height and then fires the onOpened callback when complete. Thats where we'll be adding our logic.

```dart
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:skeleton_watcher/models/user_feedback.dart';
import 'package:skeleton_watcher/ui/shared/app_colors.dart';

import 'feedback_label.dart';

class FeedbackItem extends StatefulWidget {
  final Function(String) onOpened;

  const FeedbackItem({
    @required this.feedbackItem,
    @required this.onOpened,
  });

  final UserFeedback feedbackItem;

  @override
  _FeedbackItemState createState() => _FeedbackItemState();
}

class _FeedbackItemState extends State<FeedbackItem> {
  double _height = 70.0;
  bool _showDetails = false;

  static const double descriptionPadding = 15.0;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: Duration(milliseconds: 200),
      curve: Curves.easeIn,
      width: double.infinity,
      height: _height,
      margin: EdgeInsets.symmetric(vertical: 5, horizontal: 10),
      padding: EdgeInsets.all(10.0),
      decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(5.0), color: darkGrey),
      child: Row(
        children: <Widget>[_detailsSection, _notificationSection],
      ),
    );
  }

  Widget get _detailsSection => Expanded(
          child: GestureDetector(
        onTap: () {
          setState(() {
            if (!_showDetails) {
              _height = 190;
            } else {
              _height = 70.0;
            }
          });

          Timer.periodic(Duration(milliseconds: 150), (timer) {
            timer.cancel();

            if(widget.onOpened != null) {
              widget.onOpened(widget.feedbackItem.id);
            }

            setState(() {
              _showDetails = !_showDetails;
            });
          });
        },
        child: Container(
          color: darkGrey,
          child: Column(
            mainAxisSize: MainAxisSize.max,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(widget.feedbackItem.title,
                  maxLines: 1, style: TextStyle(fontWeight: FontWeight.bold)),
              _showDetails
                  ? Padding(
                      padding: const EdgeInsets.symmetric(
                          vertical: descriptionPadding),
                      child: Text(widget.feedbackItem.details),
                    )
                  : Container(),
              Expanded(
                  child: Align(
                      child: FeedbackLabel(type: widget.feedbackItem.type),
                      alignment: Alignment.bottomLeft))
            ],
          ),
        ),
      ));

  Widget get _notificationSection => Container(
      width: 50.0,
      child: Column(children: <Widget>[
        !widget.feedbackItem.read
            ? Container(
                width: 20,
                height: 20,
                decoration:
                    ShapeDecoration(shape: CircleBorder(), color: primaryColor))
            : Container(),
        Expanded(
            child: Align(
                alignment: Alignment.bottomCenter,
                child: Text('Today',
                    style: TextStyle(
                        color: lightGrey,
                        fontWeight: FontWeight.bold,
                        fontSize: 9.0))))
      ]));
}
```

Go to the FirebaseService and add the function to update the document in the Database. To perform the update we need the documentId so we'll update our `_getFeedbackFromSnapshot` function and add the id into our data list before passing it to the UserFeedback model.

```dart
    var documentData = document.data;
    documentData['id'] = document.documentID;
    feedbackItems.add(UserFeedback.fromData(documentData));
```

Then in the UserFeedback model we need to get the id from the static map.

```dart
UserFeedback.fromData(Map<String, dynamic> data)
      : ...
        id = data['id']
```

Now that we have this we can add a function that takes in a UserFeedback id and sets the document read value to true.

```dart
 void markFeedbackAsRead({String feedbackId}){
     Firestore.instance
        .collection('feedback')
        .document(feedbackId)
        .updateData({
          "read" : true
        });
  }
```

In the FeedbackModel add a function to call the `markFeedbackAsRead` function with the id from the userItem that has been clicked.

```dart
void markFeedbackAsRead({String feedbackId}) {
  _firebaseService.markFeedbackAsRead(feedbackId: feedbackId);
}
```

In the FeedbackView update the FeedbackItem in the ListView.builder and pass in the onOpened callback where we'll call the model to update our feedback.

```dart
...
 return FeedbackItem(
  feedbackItem: feedbackItem,
  onOpened: (feedbackId) {
    model.updateReadForFeedback(feedbackId: feedbackId);
  },
);
```

With that change when a feedback item is unread we'll see the indication dot, and when opened the service will be notified. See screenshots below.

![Feedback view all items unread](/assets/tutorials/009/009-feedback-items-unread.jpg)

![Feedback view one item expanded and read](/assets/tutorials/009/009-feedback-items-read.jpg)

Thanks for following along, pleae come back for more. [See part 1 here](post/building-a-realtime-stats-monitor-in-flutter), and other [cool tutorials here](/)
