---
title: TestSweets Get started with Automation in Flutter
description: This tutorial covers the setup and automation capturing process using TestSweets.
authors:
  - en/dane-mackier
published: 2020-10-15
updated: 2020-10-15
postSlug: test-sweets-get-started-with-automation-in-flutter
ogImage: /assets/tutorials/082/082.png
ogVideo: https://www.youtube.com/embed/j24ctnLxi_o
featured: false
draft: false
tags:
  - test-sweets
  - automation
# friendlyId: tutorial-082
---

Hey there,

Welcome to the first official TestSweets tutorial. First of all thank you for your interest in this project, we believe end-to-end testing should be easy enough that it becomes a requirement in every client facing application code base.

# Introduction

Before we begin let me show you what TestSweets is so you can know what we're working towards. TestSweets is a tool that allows you to write end-to-end tests without writing any code. This is how it works.

1. You or a Dev adds TestSweets to a project
2. You run the app and tell TestSweets which parts are of interest to you
3. You give that Automation point a name
4. Then you go to the TestSweets application and write scripts targeting those Automation points
5. You run the tests using the new script and you've become an automation engineer!

It's that simple. This tutorial will go over step 1,2 and 3 to get you to the point where you can start writing the scripts.

# TestSweets Project Creation

We start by logging in to TestSweets with our account, if you don't have one, create one. Once you're logged in you'll see the `ProjectsView`

## Create a Project

There you will either see an empty list, or if you're like me you'll have a few there 😝. In the left bar panel we can tap on "Create New Project". You can enter the name and description. I'll call mine TestSweets Example. We'll use the TestSweets example application to follow with in case you don't have a project to add this too.

![01-project-landing.PNG](/assets/tutorials/082/01-project-landing.png)

_[You can download the testsweets example project here](https://github.com/FilledStacks/testsweets-example)_

## Get Project Id

When the project is created you can open it up by clicking on it. In the navigation bar on the left you can now see a "Project Settings" option. Click on that and you should see the project settings view.

In here you'll see the project ID, which is what we need to connect our app to this project. You can copy that and save it for later.

![02-project-settings.PNG](/assets/tutorials/082/02-project-settings.png)

# Code Setup

Next up we have to link the project we just created to our code for our app. If you don't have access to this ask the developer to follow these few simple steps. It's only a maximum of 6 lines of code.

## Adding the Package

TestSweets comes with its own Flutter package that allows all the magic to happen. Open up your `pubspec.yaml` file and add the testsweets package.

```yaml
dependencies:
	...
	testsweets:
```

Before we write any code I'm going to run the app and we'll note down what our main goal is. We always want to start with our main flow and get that done, then add additional test cases as we go onto the road of 100% test coverage.

In this app you'll see we have a login screen (faked). Enter any email and a password longer than 6 characters and login. That takes us to a main view that has a bottom nav bar. On the first tab there we have 2 scroll views, horizontal and vertical. we want to scroll both by 300px. Then we go to the second tab where we'll press the floating action button 3 times and check if `Todo 2` is on screen. That's the goal, so lets write an automation script for that.

## Initialise TestSweets

After adding the package above we will do an internal TestSweets initialise. We do this by calling the `setupTestSweets` function before we run the app. If your main function is not async then you can make it async so we can call the setup function and `await`. In the example project, change the `main.dart` file `main` function to look like this.

```dart
Future<void> main() async {
  setupLocator();
  await setupTestSweets();
  runApp(MyApp());
}
```

## Using TestSweets Overlay UI

The Material and Cupertino app has a builder property you can supply. This a function that fires every time a new route is built in the app. The child in this function is the new route that flutter will display. All we'll do is wrap that child with our `TestSweetsOverlayView`. We'll set the `projectId` to the value from our project we created and enable capture mode. In the `main.dart` file update your `MaterialApp` and add the builder function as shown below.

```dart
return MaterialApp(
  title: 'Flutter Demo',
	// Add TestSweetsOverlayView to wrap the child below
  builder: (context, child) => TestSweetsOverlayView(
    projectId: 'EEBojwAB65X5OgHRqwPT', // <==== Use your ProjectId here
    child: child!,
    captureWidgets: true,
  ),
  theme: Theme.of(context).copyWith(
    textTheme: Theme.of(context).textTheme.apply(
          bodyColor: Colors.white,
          displayColor: Colors.white,
        ),
  ),
  initialRoute: Routes.loginView,
  navigatorKey: StackedService.navigatorKey,
  onGenerateRoute: StackedRouter().onGenerateRoute,
);
```

## Tracking the routes

The next thing we want to do is make sure TestSweets knows what view we are currently on. To do that we can add the `TestSweetsNavigatorObserver` to the `navigatorObservers`.

```dart
return MaterialApp(
  builder: (context, child) => TestSweetsOverlayView(
    projectId: 'EEBojwAB65X5OgHRqwPT',
    child: child!,
    captureWidgets: true,
  ),
  ...
  navigatorObservers: [
    TestSweetsNavigatorObserver.instance,
  ],
);
```

## Tracking Bottom Bar Navigations

This last part is optional, but if you have a bottom navigation setup that means that you're not doing full navigations when tapping on that bottom nav item. This means that your view won't change when swapping tabs. But we still want `TestSweets` to treat it as different views. To achieve that all we have to do is tell `TestSweets` when the tab has changes and pass in the index number.

In the `getViewForIndex` in `main_view.dart` function we will call `setBottomNavIndex` . This means as soon as we land on the view with the bottom navigation it'll set the current view for the bottom nav.

```dart
Widget getViewForIndex(int index) {
		// TestSweets bottom nav tracker
		TestSweetsNavigatorObserver.instance.setBottomNavIndex(
		  viewName: Routes.mainView,
		  index: index,
		);
		switch (index) {
		  case 0:
		    return PostView();
		  case 1:
		    return TodoView();
		  default:
		    return PostView();
		}
}
```

And with that we are 100% ready to start automating. 6 lines of code, and now your end-to-end testing can be done without writing any code additional code.

# Capture Automation Data

Now that it's all setup you can run the application. You should see an overlay on top of the UI that looks like this.

![03-overlay-ui.png](/assets/tutorials/082/03-overlay-ui.png)

The box at the bottom is our TestSweets tools that will allow us to capture the automation data that we need. We'll start with the "Start Capture" button. This going to be the most important part of the TestSweets UI.

## Capture Automation Data

Tap on the "Start Capture" button and the UI will go into Capture mode which looks something like this

![04-capture-active.png](/assets/tutorials/082/04-capture-active.png)

The button on the left is to Add a new `Automation Point` to the screen. When you tap this button you will see three types of Automation Points you can add.

![05-automation-points.png](/assets/tutorials/082/05-automation-points.png)

1. **Touchable:** This point should be used for any item on screen that you can tap. This usually used for Buttons, list items or linked text
2. **Input**: This type is used specifically with input text fields. Anywhere you can enter information
3. **Scrollable:** This type is used with any scrollable area

Tap on the `Input` item type and you'll see a Automation Point added to the center of the screen

![06-input-added.png](/assets/tutorials/082/06-input-added.png)

You can click on it and drag it to be directly over the "Enter your Email" text. Tap on the "Widget Name" input field and type the name `loginEmailTextField` .

![07-loginEmail-capture.png](/assets/tutorials/082/07-loginEmail-capture.png)

Now before we save let my go through the UI on screen.

- In the far left you see a "Switch Position" button, when you tap this the UI container will move to the top of the screen. This is used when the UI is covering anything at the bottom that you want to automate
- In the middle top of the container you see the words `initialView`. That's the name of the view that's being displayed and where the widgets will be captured on. _More on this later_
- To the right of that we have a "Close" button. When tapped it'll close this UI and bring up the Automation types again.
- Then we have the input field where we name our widget using camel case naming. This means, no spaces, each new word starts with a capital letter. For example the name "forgot password link" in camel case is `forgotPasswordLink`.
- And the last button is the "Save Widget" button which will write your data to your TestSweets project.

And now that we've gone through that we can save the widget. This will send it to the TestSweets backend and bring back up the capture UI. We will do the same thing for the password field and then also use a `Touchable` type for the Login button.

## Inspect Captured Data

Once we've captured all the automation points as shown above we can close the capture widget and then click on "Exit Capture". To make sure we've added everything where we expected to add it we can tap on the "Inspect View" button. This will show all of the Automation Points that have been captured.

![08-inspect-view-1.png](/assets/tutorials/082/08-inspect-view-1.png)

If you tap on any of the Automation Points you'll get a dialog at the bottom that tells you the information of that point.

![09-inspect-view-2.png](/assets/tutorials/082/09-inspect-view-2.png)

There you will see the view's name, name of the automation point as you will reference it in TestSweets, the type of the widget as well as its position. When you tap on the edit button, you will see the same UI as the ui when capturing the point. You can then move around the automation point, change the name and update the widget. In addition to that you can also simply delete the automation point using the Delete button.

Before we continue, exit the inspection mode and login using any email and any password that's longer than 6 characters. This will navigate you to the next view. The bottom navigation view.

## Nested Capturing

Earlier we setup some code for the bottom navigation tracking. Since the navigation stack doesn't actually change we track the tab index changes so we can know which tab is showing. If you land on a view with a bottom navigation, you should see your current route look something like below.

![10-nested-navigation.png](/assets/tutorials/082/10-nested-navigation.png)

What you see here is `mainView` which is the view that contains the bottom navigation items. And `mainView0` indicates that the first tab is selected in the bottom navigation. Currently the `mainView0` is bold, which means if you capture any automation points, it will be assigned to `mainView0` (the first navigation index) and not to the `mainView`. Now the only thing here you want to do different is, when you capture the automation points for the bottom nav tab icons you should swap to the `mainView` first. This way the bottom nav items is on the parent view and the rest of the tabbed views will contain its own automation points.

To swap view we'll simply tap on the mainView route name and it'll select that as the current view. Once selected we'll start capture, and add two touchable automation points.

1. We'll call `firstBottomTab`
2. We'll call `secondBottomTab`

If you have an application that has names for these tabs, it would be better to use those names instead of the names I'm using here 😆

## Capture the Rest

Instead of painfully making you read me do exactly what I did above here's a rundown of the points to add before you follow the next tutorial.

- A scroll point for each scroll list on the view for the first tab. Place the point in the middle of the list
- A touchable point to the floating action button on the second tab

We'll use that to script an automated end-to-end test using TestSweets in the next tutorial. That covers everything for the Getting Started and setting up.

Make sure to watch or read the follow up tutorial that shows you how to write an automation script using the data that you've just captured. Thank you for following along, I really appreciate it. If you have any questions or feedback, we are very open to understanding what would make this tool better for you. You can [join our Slack](https://join.slack.com/t/filledstacks/shared_invite/zt-mcw04u5t-dTeyH0lPONuzd9i0osk9Gw) or you can email us at automation@filledstacks.com and ask us anything or provide any type of feedback.

Until next time,

Dane
