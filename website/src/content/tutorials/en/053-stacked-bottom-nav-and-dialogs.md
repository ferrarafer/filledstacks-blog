---
title: Bottom Navigation with Stacked Architecture
description: This tutorial goes over the implementation for a Bottom Navigation Bar using Stacked.
authors:
  - en/dane-mackier
published: 2020-07-12
updated: 2020-07-12
postSlug: bottom-navigation-with-stacked-architecture
ogImage: /assets/tutorials/053/053.jpg
ogVideo: https://www.youtube.com/embed/OBIrqm0LDaA
featured: false
draft: false
tags:
  - stacked
  - provider
  - dialog
# codeUrl: https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F053%2F053-starting.zip?alt=media&token=8b3aec95-dd63-43de-a59b-51bda4b67f64
# friendlyId: tutorial-053
---

A question I've been asked about a lot is how to setup bottom navigation using the Stacked architecture. This tutorial will go over the bottom nav setup that I use in production as well as handling certain types of behaviour that you'd like your view to abide by. I'll start off by saying if you know how a `BottomNavBar` works then it's basically the same.

1. On tap we'll update a value that tracks the selected index
2. We'll rebuild the UI and get the widget for the selected index
3. We'll show that widget using a transition

That's how it'll work in stacked as well. The extra things I've been asked about is things like how to only call onModelReady once, making sure the view that's being swapped is not disposed, re-using the same ViewModel to avoid re-loading everything. For this tutorial I wanted to avoid building any views functionality or UI so I've built three views that's in the app already that we will make use of. Download the [starting project](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F053%2F053-starting.zip?alt=media&token=8b3aec95-dd63-43de-a59b-51bda4b67f64) which contains a posts_example folder and a todo folder under the view folder. That will be the views we'll use as BottomNav pages.

## Bottom Nav Setup

Under the views folder there's a folder called home. Open up the home_view where we'll add our bottom navigation bar with two items. In addition to setting up the two items we will also assign the currentIndex from the model (which we still have to create) and the setTabIndex from the model (which we still have to create).

```dart

class HomeView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ViewModelBuilder<HomeViewModel>.reactive(
      builder: (context, model, child) => Scaffold(
        bottomNavigationBar: BottomNavigationBar(
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.grey[800],
          currentIndex: model.currentIndex,
          onTap: model.setIndex,
          items: [
            BottomNavigationBarItem(
              title: Text('Posts'),
              icon: Icon(Icons.art_track),
            ),
            BottomNavigationBarItem(
              title: Text('Todos'),
              icon: Icon(Icons.list),
            ),
          ],
        ),
      ),
      viewModelBuilder: () => HomeViewModel(),
    );
  }
}
```

Now open up the `HomeViewModel` where we will create our index tracking functionality. It's pretty simple. Extend from `IndexTrackingViewModel`. That's it.

```dart
class HomeViewModel extends IndexTrackingViewModel {}
```

Now to add the functionality to swap between views. Go to the `HomeView` where we'll add a function to construct our views and return them to use based on the index. We'll then use this function and set the body of the scaffold to the view returned for that index.

```dart
class HomeView extends StatelessWidget {
  const HomeView({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ViewModelBuilder<HomeViewModel>.reactive(
      builder: (context, model, child) => Scaffold(
        body: getViewForIndex(model.currentIndex),
        bottomNavigationBar: BottomNavigationBar(
          ...
        ),
      ),
      viewModelBuilder: () => HomeViewModel(),
    );
  }

  Widget getViewForIndex(int index) {
    switch (index) {
      case 0:
        return PostsView();
      case 1:
        return TodoView();
      default:
        return PostsView();
    }
  }
}

```

If you run the code now you'll see that you have a bottom navigation setup and you can swap between the pages. You'll notice a few things when swapping between the views.

1. The initialise logic is run every time we go back to a view
2. The view does not maintain state
3. There is no transition between views

Lets fix these up.

### Initialise logic runs every time view is shown

This is how things are intended to be. I wanted to keep stacked as close to the Flutter lifecycle as possible to avoid any confusion. When a view is inserted into the widget tree `initState` is fired. If the widget doesn't have a model it will create it and then run the initialise functionality (for specialty `ViewModels`). To avoid that there's a few things we have to do.

**1. Set `disposeViewModel` to false**
Open up the `PostsView` file and in the reactive / non-reactive constructor of the `ViewModelBuilder` set `disposeViewModel` to false. This tells Stacked not to dispose the ViewModel when the widget is removed from the widget tree.

**2. Make the ViewModel a singleton**
Register your ViewModel with the get_it locator and request it from the locator where we current construct it. A singleton means whenever you request the type from the locator you will get the same instance back for as long as the app is running. If you're using injectable add this.

```dart
@singleton // Add decoration
class PostsViewModel extends FutureViewModel<List<Post>> {
...
}
```

And then generate the code for the injection `flutter pub run build_runner build --delete-conflicting-outputs`. If you're using get_it without injectable then register it as follows.

```dart
locator.registerLazySingleton(() => PostsViewModel());
// or
locator.registerSingleton(PostsViewModel());
```

In the `PostsView` get the ViewModel from the locator.

```dart
class PostsView extends StatelessWidget {
  const PostsView({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ViewModelBuilder<PostsViewModel>.reactive(
      disposeViewModel: false,
      builder: (context, model, child) => Scaffold(
        ...
      ),
      // Get the viewmodel from the locator to get the singleton instance
      viewModelBuilder: () => locator<PostsViewModel>(),
    );
  }
}
```

**3. Set `initialiseSpecialViewModelsOnce` to true**
In the reactive / non-reactive constructor set `initialiseSpecialViewModelsOnce` to true to tell the `ViewModelBuilder` you only want the initialisation for a specialty view model to fire once.

```dart
class PostsView extends StatelessWidget {
  const PostsView({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ViewModelBuilder<PostsViewModel>.reactive(
      disposeViewModel: false,
      // Inidicate that we only want to initialise a specialty viewmodel once
      initialiseSpecialViewModelsOnce: true,
      builder: (context, model, child) => Scaffold(
        ...
      ),
      viewModelBuilder: () => locator<PostsViewModel>(),
    );
  }
}
```

If you run the code now, navigate to the todo's tab then back to posts you'll see there's no loading of the posts. You can also see in the debug console that Fetch posts is not being printed out. The same can be done for the onModelReady call. If you want it to fire only once follow steps 1 and 2 and then for 3 set `fireOnModelReadyOnce: true` instead of `initialiseSpecialViewModelsOnce: true`.

### The view does not maintain state

If you swap between the views. Even though the viewmodel maintains its state. The View does not, we can see this from the scroll being reset. go to posts, scroll to the bottom, swap to Todos controller, go back. See that the posts is not on the same place. That is not good, lets fix that. Open up the `PostsView` and for the `ListView.separated` constructor set the key to `PageStorageKey('storage-key')`.

```dart
ListView.separated(
  key: PageStorageKey('storage-key'),
  ...
)
```

That's it. Now your list will maintain it's position as it's inserted and removed from the widget tree. Onto the last thing.

### There is no transition between views

Currently when we swap between views we get a instant hot swap of the widgets that doesn't look very nice. To fix that we should add a transition between the widgets being shown. For that we'll use the awesome [animations](https://pub.dev/packages/animations) package built by the flutter dev team. Open up the pubspec.yaml file and add the animations package.

```yaml
dependencies:
  ...
  animations: ^1.1.1
```

Then, in the `HomeView`, we can wrap the `getViewForIndex` function call in a `PageTransitionSwitcher` provided by the animations package. We'll set the duration to 300 milliseconds and also set the reverse property equal to the reverse property on our model.

```dart
class HomeView extends StatelessWidget {
  const HomeView({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ViewModelBuilder<HomeViewModel>.reactive(
      builder: (context, model, child) => Scaffold(
        body: PageTransitionSwitcher(
          duration: const Duration(milliseconds: 300),
          reverse: model.reverse,
          transitionBuilder: (
            Widget child,
            Animation<double> animation,
            Animation<double> secondaryAnimation,
          ) {
            return SharedAxisTransition(
              child: child,
              animation: animation,
              secondaryAnimation: secondaryAnimation,
              transitionType: SharedAxisTransitionType.horizontal,
            );
          },
          child: getViewForIndex(model.currentIndex),
        ),
        ...
    );
  }
}
```

And that should do it. If the reverse property is not set, the transition will go in the same direction for every tab swap. We calculate the reverse value for you so that we can either play the transition forward or backward depending on what direction you're going. Run the app, swap tabs and you'll see how the animation plays out :). As a bonus I have left the Todo's view to reset when swapped but you can follow this tutorial again and do the same for the Todo view. This should make the information stick for a bit longer.

Thanks for reading I will be back next week.
Dane
