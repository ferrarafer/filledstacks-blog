---
title: Manager your Flutter Dialogs with a Dialog Manager
description: This tutorial will cover the basics of a completer and how to use it to manage your dialogs better.
authors:
  - en/dane-mackier
published: 2019-08-02
updated: 2019-08-02
postSlug: manager-your-flutter-dialogs-with-a-dialog-manager
ogImage: /assets/tutorials/021/021.jpg
ogVideo: https://www.youtube.com/embed/IrFU_BrCWnE
featured: false
draft: false
tags:
  - flutter
  - dialog
  - ui
relatedTutorials:
  - en/018-bottom-sheet-guide
  - en/022-lifecycle-management
  - en/025-navigate-without-context
# codeUrl: https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F021%2F021-completer.zip?alt=media&token=60180dbd-44af-42a0-bb37-0202c46064e7
---

Today we'll look at how to use a completer to manage your dialogs from your business logic and keep your UI clean. This will not be a comprehensive guide on completers or using dialogs instead we'll focus more on how to use it to compose a well separated architecture for managing your dialogs at a "global level".

_To see a guide on the dialogs and the code used for it look at [this tutorial](/snippet/quick-and-easy-dialogs-in-flutter-with-rf-flutter)_

To start things off we'll go over a what a completer is. After we'll use it to implement the architecture around our dialogs.

## What is a completer and how do we use it

A completer is a way to produce a Future and complete it whenever you choose to. You construct a new completer, return the future of it and when you're ready you call `.complete` on it and return the value you want. The calling code will await like a normal future until you call complete, this means we can wait for user input to be complete, like interacting with a dialog ;) .

```dart
Completer _myCompleter = Completer();

Future startSomething() {
  // show a user dialog or an image picker or kick off a polling function
  return _myCompleter.future;
}

void endSomething() {
  _myCompleter.complete();
}

```

In the above code we construct a completer. When we call startSomething we return the future of that completer. In the calling code like below

```dart
var myValue = await startSomething();
print('Something completed');
```

The print statement will only be hit when we call the endSomething function. That's the basics you need to know about the completer to implement the dialog managing setup we'll do now.

## The problem

Currently the practice in and around the Flutter community is to clutter your UI files with dialog code and handle it specifically per view, per situation. This means if you have any kind of separation between your business logic and your UI then you can't use dialogs in your business logic (where the context is not available).

This tutorial is a guide to setting up a maintainable and scalable solution for showing all kinds of dialogs in your applications and getting user input from them if required.

## The Architecture / Code setup

There are 2 main parts to this setup:

- **DialogManager**: This class will be the link between the DialogService and the UI to display the dialogs that are required. It's responsibility is to listen for instructions from the service, execute them and let the service know when those instructions are performed. It will additionally send the information back to the service if it has collected any from the interaction.

- **DialogService**: This class will be the object that takes the instructions from the model and relays them to the `DialogManager`. Additionally it will halt the execution of the calling thread until the `DialogManager` has indicated that the action has been completed. It will achieve this by using the Completer functionality as shown above.

## Implementation

To stick to the main implementation only I have setup some basic code to get us started. I use [provider](/post/flutter-architecture-my-provider-implementation-guide) for my state management and get_it for my [service location](/snippet/dependency-injection-in-flutter). You can [download the code here](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F021%2F021-completer.zip?alt=media&token=60180dbd-44af-42a0-bb37-0202c46064e7) to get started. It contains the following.

- **locator**: Using get_it for service location
- **HomeView**: A stateless widget that has a Provider and Consumer as it's root widgets and calls doThings on it's model
- **HomeViewModel:** A class extending ChangeNotifier that will act as our ViewModel for the HomeView. It will interact with the DialogService mentioned above.
- **packages:** I have added provider v3, rflutter_alert (our dialog package) and get_it for service location.

### Dialog Service

We'll start off by creating the `DialogService` that will be used by the models and the `DialogManager`. It will have a basic API. A function to register a callback function for the manager (registerDialogListener). A function that returns a Future to show the dialog (showDialog) and a function to complete a dialog and continue the `Future`'s execution (dialogComplete).

```dart
import 'dart:async';

class DialogService {
  Function _showDialogListener;
  Completer _dialogCompleter;

  /// Registers a callback function. Typically to show the dialog
  void registerDialogListener(Function showDialogListener) {
    _showDialogListener = showDialogListener;
  }

  /// Calls the dialog listener and returns a Future that will wait for dialogComplete.
  Future showDialog() {
    _dialogCompleter = Completer();
    _showDialogListener();
    return _dialogCompleter.future;
  }

  /// Completes the _dialogCompleter to resume the Future's execution call
  void dialogComplete() {
    _dialogCompleter.complete();
    _dialogCompleter = null;
  }
}
```

We've gone over how the completer works above so I won't cover that again. Last thing with the service is to register it with the locator.dart

```dart
void setupLocator() {
  locator.registerLazySingleton(() => DialogService());
}
```

### Dialog Manager

The dialog manager will be the bridge between the service and the models. It will show the dialog, translate / keep any values from the user interactions and pass it back to the service that can then give it to the model. It will be a Stateful Widget that has no UI. We want this widget to be alive throughout the entire lifetime of the app and also have the correct context throughout navigation / replacements of the home widget in the `MaterialApp`.

This cannot be wrapped over a `MaterialApp` because we need the Navigator and it cannot be wrapped around the widget supplied to home because a pushReplacement will remove it from the element tree and dispose it's context, so where do we put it? We'll cover that in a bit. Lets create the Manager first.

Create a new folder called Managers, in that folder create a new file dialog_manager.dart

```dart
import 'package:dialog_manager/locator.dart';
import 'package:dialog_manager/services/dialog_service.dart';
import 'package:flutter/material.dart';
import 'package:rflutter_alert/rflutter_alert.dart';

class DialogManager extends StatefulWidget {
  final Widget child;
  DialogManager({Key key, this.child}) : super(key: key);

  _DialogManagerState createState() => _DialogManagerState();
}

class _DialogManagerState extends State<DialogManager> {
  DialogService _dialogService = locator<DialogService>();

  @override
  void initState() {
    super.initState();
    _dialogService.registerDialogListener(_showDialog);
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }

  void _showDialog() {
    Alert(
        context: context,
        title: "FilledStacks",
        desc: "My tutorials show realworld structures.",
        closeFunction: () => _dialogService.dialogComplete(),
        buttons: [
          DialogButton(
            child: Text('Ok'),
            onPressed: () {
              _dialogService.dialogComplete();
              Navigator.of(context).pop();
            },
          )
        ]).show();
  }
}
```

This widget will take in a widget and display it directly. It will make use of the `DialogService` to register a listener on initState. The listener it will use the Alert widget from rflutter_alert to show a basic dialog with a button. onClosed we want to notify the service that the dialog has been closed and when the button is pressed as well.

### Always alive Managers

Above I mentioned that there's no real place to put the DialogManager in the traditional tree that would keep it alive and available to execute our dialog commands. For that reason I use the builder function provided by `MaterialApp` to place it above the Navigator of the App. Which means we also give it it's own navigator to dismiss and show alerts on.

In the main file we'll do the following.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      builder: (context, widget) => Navigator(
        onGenerateRoute: (settings) => MaterialPageRoute(
          builder: (context) => DialogManager(
            child: widget,
          ),
        ),
      ),
      title: 'Dialog Manager Setup',
      home: HomeView(),
    );
  }
}
```

The builder of the material app provides whatever widget is being displayed through the widget parameter in the builder. This means we can wrap it in our `DialogManager` and always display that and we'll have the dialog manager alive and ready to consume. If you're confused by this then do the following to see why I have it the way it is above.

**No context for navigation:** If you do it this way the app will break when you try to show an alert because `Navigator.of(context)` will fail in the dialog `Alert` widget.

_But Dane, we can wrap that DialogManager in a Navigator on the outside and it'll work the same:_ You're right and you can do it that way. I like the above way because it makes it clear that the root of the application is a MaterialApp with some extra bits ontop of it. It's all preference at this point.

```dart
 Widget build(BuildContext context) {
    return DialogManager(
          child: MaterialApp(
        title: 'Dialog Manager Setup',
        home: HomeView(),
      ),
    );
  }
```

**Replaced on navigation:** If you wrap your home view with the DialogManager and you call pushReplacement removing the home widget from the tree your DialogManager is disposed and your context will be null. This is never good for trying to use the context.

```dart
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dialog Manager Setup',
      home: DialogManager(
        child: HomeView(),
      ),
    );
  }
```

I usually have a `CoreManager` to manage all my managers 😅 so that would be the root of the Navigator route and all managers will be constructed inside it in a nesting manner.

### Using the Dialog Service

All the setup is done and we can now move onto using this awesome setup. Hopefully you see the benefit of it right away. In your `HomeViewModel` we'll add the following code.

```dart
DialogService _dialogService = locator<DialogService>();

Future doThings() async {
  print('dialog called');
  var dialogResult = await _dialogService.showDialog();
  print('dialog closed');
}
```

This will print out when we call this function, and when that future returns from the showDialog function. You should run this code now and click that middle button. You'll see the dialog pop up, notice in the debug console that you don't see the "dialog closed" log until you close the dialog 😁. There are three big wins with this in terms of architecture.

1. **ALL YOUR DIALOG CODE IS MANAGED IN ONE PLACE**: Sorry for screaming but I myself have struggled with dialog code all over the place, which leads me to 2.
2. **Dialog logic can be managed from your business logic:** This is a big thing for me as well. Being able to show dialogs based on failures, success, needing input, all where those values are "naturally available" in the model. EVEN FROM OTHER SERVICES. This will save you so much time with your User feedback on errors, taking input that you'll definitely come back and thank me.
3. **Await on dialog interaction naturally:** We can get user input, text and confirmations directly using the service and this allows you to write less boilerplate for passing data from your UI to your model to consume.

## Customise the titles

You probably don't want to display the same dialog title / message all the time. Lets implement the functionality to supply a title and a message to the dialog being displayed. We also want to return some data from the dialog. We'll create two plain objects that we'll use for the request and the information sent back.

Create a new folder in the lib folder called datamodels, in that folder create a new folder called alert. In there we'll create two files, alert_request.dart

```dart
import 'package:flutter/widgets.dart';

class AlertRequest {
  final String title;
  final String description;
  final String buttonTitle;

  AlertRequest({
    @required this.title,
    @required this.description,
    @required this.buttonTitle,
  });
}

```

and another file alert_response.dart. We'll cater this for single text input dialogs for a login form that only asks for the password. We'll cater for dual passwords like a full login dialog then we'll do one boolean value for confirmation.

```dart
class AlertResponse {
  final String fieldOne;
  final String fieldTwo;
  final bool confirmed;

  AlertResponse({
    this.fieldOne,
    this.fieldTwo,
    this.confirmed,
  });
}
```

To use the functionality we'll update the DialogService and provide the types where necessary and add the required parameters. We'll start by making sure the \_showDialogListener function expects an `AlertRequest` as a parameter. We'll also give the Completer a type `AlertResponse` to return from the future.

```dart
class DialogService {
  Function(AlertRequest) _showDialogListener;
  Completer<AlertResponse> _dialogCompleter;

  /// Registers a callback function. Typically to show the dialog
  void registerDialogListener(Function(AlertRequest) showDialogListener) {
    _showDialogListener = showDialogListener;
  }

  /// Calls the dialog listener and returns a Future that will wait for dialogComplete.
  Future<AlertResponse> showDialog({
    String title,
    String description,
    String buttonTitle = 'Ok',
  }) {
    _dialogCompleter = Completer<AlertResponse>();
    _showDialogListener(AlertRequest(
      title: title,
      description: description,
      buttonTitle: buttonTitle,
    ));
    return _dialogCompleter.future;
  }

  /// Completes the _dialogCompleter to resume the Future's execution call
  void dialogComplete(AlertResponse response) {
    _dialogCompleter.complete(response);
    _dialogCompleter = null;
  }
}
```

Then we can go ahead and update the `DialogManager`. We'll update the \_showDialog function to take in an `AlertRequest` and use the title, description and the button title from the request in the dialog.

```dart
void _showDialog(AlertRequest request) {
  Alert(
    context: context,
    title: request.title,
    desc: request.description,
    closeFunction: () =>
        _dialogService.dialogComplete(AlertResponse(confirmed: false)),
    buttons: [
      DialogButton(
        child: Text(request.buttonTitle),
        onPressed: () {
          _dialogService.dialogComplete(AlertResponse(confirmed: true));
          Navigator.of(context).pop();
        },
      )
    ]).show();
}
```

When the button is clicked we return confirmed true and when it's closed outside of the button we indicate that it's not confirmed. Now to finally use the functionality we can head over the the HomeViewModel and update the doThings function to pass in a title and description. We'll also check the result to see if it's confirmed.

```dart
 Future doThings() async {
    print('dialog called');
    var dialogResult = await _dialogService.showDialog(
      title: 'Custom Title',
      description: 'FilledStacks architecture rocks',
    );
    if (dialogResult.confirmed) {
      print('User has confirmed');
    } else {
      print('User cancelled the dialog');
    }
  }
```

And that's it. If you want to see how to build a Login dialog that takes in text you can look at [this tutorial on Rflutter_alert](/snippet/quick-and-easy-dialogs-in-flutter-with-rf-flutter). To pass back the values use a controller like normal and send it in the dialogResult then you can use it in your model :)

Thanks for reading. If you like this kind of tutorial please consider [joining the FilledStacks Slack](https://join.slack.com/t/filledstacks/shared_invite/enQtNjY0NTQ3MTYwMzEwLTJjZmU0ODRhOTA5ZGE3MTUxOTUzODdlNzFjMDg0ZGU4ZDQzMzVlMDQ0MzYxZWNhOWViOGI1NjZiZDE1YTQ3NGM) we discuss architecture setups like this, how to improve them and much more.
