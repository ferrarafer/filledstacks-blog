---
title: A Responsive UI Architecture Solution with Provider
description: In this tutorial we add state management to our Responsive UI Architecture using Provider.
authors:
  - en/dane-mackier
published: 2019-10-27
updated: 2019-10-27
postSlug: a-responsive-ui-architecture-solution-with-provider
ogImage: /assets/tutorials/031/031.jpg
ogVideo: https://www.youtube.com/embed/HUSqk0OrR7I
featured: false
draft: false
tags:
  - flutter
  - ui
  - responsive-ui
  - provider
# codeUrl: https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F031%2F01-starting.zip?alt=media&token=bc808ba6-d83d-4bd0-bc9a-0936e29e967b
---

This is the final tutorial for creating a production level Responsive UI architecture. [Part 1](/post/the-best-flutter-responsive-ui-pattern/) covered the process of building a base widget that provides us with all the important information. [Part 2](/post/building-a-responsive-ui-architecture-in-flutter/) makes use of the `BaseWidget` information and builds the UI widgets required to provide layouts for different screen sizes as well as different orientations. **This tutorial** is the step where we add State Management to the Architecture to complete our architecture. For state management we'll use Provider as always to provide us with our UI State Management needs.

To follow along with this tutorial you can download the starting code from [here](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F031%2F01-starting.zip?alt=media&token=bc808ba6-d83d-4bd0-bc9a-0936e29e967b) or use the code you created from part 2.

_If you're like me and can discern an implementation just from source code [here's the final result](https://github.com/FilledStacks/flutter-tutorials/tree/master/031-responsive-architecture-provider/02-final-state-implementation). Then also, I have separate tutorials for my [complete Provider Architecture](/post/flutter-architecture-my-provider-implementation-guide/) so I won't go over it in detail or add any business logic._

## The goal

There are a few things we'd like to achieve with the state management solution for this architecture. The first thing is to keep the responsive UI friendly setup but avoid repeating code, specifically for passing data or a viewmodel to **ALL** the different layouts one responsive widget might have, 6 in total. Secondly I want the ease of my traditional Provider architecture in terms of the onModelReady call as well as the UI rebuilding when a ViewModel's state has changed. Aaaaand I think I have come up with a pretty solid implementation.

## The implementation

Before we start with the code we have to add `Provider` to the project. Go to the pubspec file and add provider

```yaml
provider:
```

Then we can cover the traditional Provider setup. We'll create a `BaseWidget` with a minor adjustment. Instead of using a `Consumer` as the child of the `ChangeNotifierProvider` we'll execute the builder function and pass the resulting widget to the child property. Everything else will stay the same as the original setup. Create a new file under the widgets folder called base_widget.dart.

```dart
class BaseWidget<T extends ChangeNotifier> extends StatefulWidget {
  final Widget Function(BuildContext) builder;
  final Function(T) onModelReady;
  final T viewModel;

  BaseWidget({
    Key key,
    this.builder,
    this.onModelReady,
    this.viewModel,
  }) : super(key: key);

  @override
  _BaseWidgetState<T> createState() => _BaseWidgetState<T>();
}

class _BaseWidgetState<T extends ChangeNotifier> extends State<BaseWidget<T>> {
  T _model;

  @override
  void initState() {
    super.initState();
    _model = widget.viewModel;

    if (widget.onModelReady != null) {
      widget.onModelReady(_model);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      builder: (context) => _model,
      child: widget.builder(context),
    );
  }
}
```

This will handle passing the ViewModel down to the resulting UI and giving us the onModelReady callback for initialisation before the UI is rendered. Now, with the responsive architecture as shown in [Part 2](/post/building-a-responsive-ui-architecture-in-flutter/) we create completely separate widgets for each of the combinations of `DeviceScreenType` and `Orientation`. This means that if we have a viewmodel or plain data model that we want to access in all of these views, we would like to not have to call `Provider.of<Model>(context)` in every view. That's the second Base file we'll build.

What we'll build is a `BaseModelWidget` that returns to us our view model or data model in the build method 😎😍😎😍😎😍 I'm so excited about that haha. You'll see what difference this makes, I'm actually thinking of using it in my traditional non responsive architecture as well. We'll talk about that in a later tutorial. In the widgets folder create a new file called base_model_widget.dart. It will extend the Widget class and and make use of a custom element that calls `Provider.of<Model>(context)` for us.

```dart
abstract class BaseModelWidget<T> extends Widget {

  // Define that we want to get back a type of T when building
  // Make it abstract so that we have to override, like a stateless or stateful widget.
  @protected
  Widget build(BuildContext context, T model);

  @override
  _DataProviderElement<T> createElement() => _DataProviderElement<T>(this);
}

class _DataProviderElement<T> extends ComponentElement {
  _DataProviderElement(BaseModelWidget widget) : super(widget);

  @override
  BaseModelWidget get widget => super.widget;

  // When executing the above build method, we pass back the model we get from Provider.
  @override
  Widget build() => widget.build(this, Provider.of<T>(this));
}
```

The comments explain what I'm going to type here. We created an abstract class with one method to implement. The build method. This build method will provide us with the `BuildContext` as well as the type `T` or `Model` to be more specific. The `_DataProviderElement` will request the type passed in from provider by doing the `Provider.of` call for us. That's all the architectural parts setup, now we can go ahead and use this functionality.

## Architecture Usage

The first thing I'd like to apply it to is the way we pass down information to the drawer option layouts. We'll start by creating a data model to represent the drawer option. Create a new folder called datamodels and under it a new file called drawer_item_data.dart.

```dart
class DrawerItemData {
  final String title;
  final IconData iconData;

  DrawerItemData({
    this.title,
    this.iconData,
  });
}
```

Then we can head over to the drawer_option.dart file. We'll remove all the data passing down to the layout files and instead surround the `ScreenTypeLayout` with a `Provider.value` widget that takes in a new `DrawerItemData` constructed with the passed in properties to the `DrawerOption` widget.

```dart
class DrawerOption extends StatelessWidget {
  final String title;
  final IconData iconData;
  const DrawerOption({
    Key key,
    this.title,
    this.iconData,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Provider.value(
      value: DrawerItemData(title: title, iconData: iconData),
      child: ScreenTypeLayout(
        mobile: OrientationLayout(
          landscape: (context) => DrawerOptionMobileLandscape(),
          portrait: (context) => DrawerOptionMobilePortrait(),
        ),
        tablet: OrientationLayout(
          portrait: (context) => DrawerOptionTabletPortrait(),
          landscape: (context) => DrawerOptionMobilePortrait(),
        ),
      ),
    );
  }
}
```

As you can see the `OrientationLayout` has some errors and that's because I had to change the implementation because of some weird widget state that came up when swapping orientations with the drawer open. The new OrientationLayout looks like this.

```dart
class OrientationLayout extends StatelessWidget {
  final Widget Function(BuildContext) landscape;
  final Widget Function(BuildContext) portrait;
  const OrientationLayout({
    Key key,
    this.landscape,
    this.portrait,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, boxConstraints) {
        var orientation = MediaQuery.of(context).orientation;
        if (orientation == Orientation.landscape) {
          if (landscape != null) {
            return landscape(context);
          }
        }

        return portrait(context);
      },
    );
  }
}
```

We use a LayoutBuilder to always get a Fresh Context from the created element and then execute our builders for landscape and portrait to get and return the resulting widget. Not a major difference but it does remove the state error that gave me a red screen. Next up is the big update. Open up the drawer_option_mobile.dart file and remove all the constructor and property code at the top. Then instead of extending from the `StatelessWidget` we will extend from the `BaseModelWidget` with a type `DrawerItemData`. Then we'll receive our model that we provided through `Provider.value` in the build function!

```dart
class DrawerOptionMobilePortrait extends BaseModelWidget<DrawerItemData> {
  @override
  Widget build(BuildContext context, DrawerItemData data) {
    return Container(
      padding: const EdgeInsets.only(left: 25),
      height: 80,
      child: Row(
        children: <Widget>[
          Icon(
            data.iconData,
            size: 25,
          ),
          SizedBox(
            width: 25,
          ),
          Text(
            data.title,
            style: TextStyle(fontSize: 21),
          )
        ],
      ),
    );
  }
}
```

You can do the same for the landscape widget.

```dart
class DrawerOptionMobileLandscape extends BaseModelWidget<DrawerItemData> {
  @override
  Widget build(BuildContext context, DrawerItemData data) {
    return Container(
      height: 70,
      alignment: Alignment.center,
      child: Icon(data.iconData),
    );
  }
}
```

And the tablet widget as well.

```dart
class DrawerOptionTabletPortrait extends BaseModelWidget<DrawerItemData> {
  @override
  Widget build(BuildContext context, DrawerItemData data) {
    return Container(
      width: 152,
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(
            data.iconData,
            size: 45,
          ),
          Text(data.title, style: TextStyle(fontSize: 20)),
        ],
      ),
    );
  }
}
```

That's basically the update for passing down data through provider, easily to all of the widgets that requires it. Having it in the build function itself takes away the amount of boilerplate required although with any architecture, we always have some. That makes it predictable and easy to follow down the line.

Next up let's go over how we'll bind a view to a viewmodel through using a `ChangeNotifier`. We'll start by creating a simple `ViewModel` for the home view that will display a string that we'll update, just to show the binding working. If you want an in depth architecture guide you can look at [this tutorial](/post/flutter-architecture-my-provider-implementation-guide/). Create a new folder called viewmodels and inside a new file called home_viewmodel.dart

```dart
class HomeViewModel extends ChangeNotifier {
  String title = 'default';

  void initialise() {
    title = 'initialised';
    notifyListeners();
  }

  int counter = 0;
  void updateTitle() {
    counter++;
    title = '$counter';
    notifyListeners();
  }
}

```

I know, very basic, but the point is to show that it works the same as my usual architecture, so the ins and outs of that can be picked up from that video series. Then we can go do some familiar work over in home_view.dart. We'll surround the `ScreenTypeLayout` with a BaseWidget of type `HomeViewModel` and return the current widget UI to the builder. For the `viewModel` property we will pass in a new instance of the `HomeViewModel`, and `onModelReady` we will call `model.initialise`.

```dart
 class HomeView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BaseWidget<HomeViewModel>(
      viewModel: HomeViewModel(),
      onModelReady: (model) => model.initialise(),
      builder: (context) => ScreenTypeLayout(
        mobile: OrientationLayout(
          portrait: (context) => HomeMobilePortrait(),
          landscape: (context) => HomeMobileLandscape(),
        ),
        tablet: HomeViewTablet(),
      ),
    );
  }
}
```

And last but definitely not least we will make use of our `BaseModelWidget` to get our model through the build function. I'll only update the HomeMobilePortrait file under home_view_mobile.dart and you can do the other three widgets. We also add a floating action button that calls the updateTitle function on the model to show that it's still reactive and bound to those values.

```dart
class HomeMobilePortrait extends BaseModelWidget<HomeViewModel> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context, HomeViewModel model) {
    return Scaffold(
      key: _scaffoldKey,
      drawer: AppDrawer(),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          model.updateTitle();
        },
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.all(16),
            child: IconButton(
              icon: Icon(Icons.menu, size: 30),
              onPressed: () {
                _scaffoldKey?.currentState?.openDrawer();
              },
            ),
          ),
          Expanded(
            child: Center(
              child: Text(model.title),
            ),
          )
        ],
      ),
    );
  }
}
```

That's the end of my responsive UI series. This will be the architecture that I'll be using for a potential client that wants a multi platform system to run on Mobile, Tablet and Web and potentially Desktop in the future. I've really enjoyed setting this up. You can find the [final code here](https://github.com/FilledStacks/flutter-tutorials/tree/master/031-responsive-architecture-provider/02-final-state-implementation).

Thank you for reading, this was a fun series of problems to solve for a production and scalable solution. Please leave any feedback, I'd love to hear what you think about it or ways to improve it.
