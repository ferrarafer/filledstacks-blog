---
title: Build a Theme Manager in Flutter
description: This tutorial shows you how to Build a Theme manager that changes the status bar color in Flutter and more.
authors:
  - en/dane-mackier
published: 2019-06-17
updated: 2019-06-17
postSlug: build-a-theme-manager-in-flutter
ogImage: /assets/snippets/028/028.jpg
featured: false
draft: false
tags:
  - flutter
  - theme
  - ui
  - foundation
# friendlyId: snippet-028
---

In this tutorial we'll build a simple theme manager to do something like this

![Theme swap animation](/assets/snippets/028/theme-swap.gif)

We'll cover changing the status bar color as well as the overall theme using `flutter_statusbarcolor` and `provider`. We'll start by installing the packages.

```yaml
flutter_statusbarcolor: any
provider: ^3.0.0
```

Then we can create a HomeView that will display our theme changes for us.

```dart
class HomeView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: Theme.of(context).backgroundColor,
        floatingActionButton: FloatingActionButton(
          onPressed: () {

          },
        ));
  }
}
```

## Theme Manager

As you know from my other tutorials I recommend keeping the responsibilities of objects clear and having the aim to make your code show that as well. In our case the responsibility of changing the theme will be in a `ThemeManager`. The UI will just be using the theme and setting it without having any knowledge of it changing. Our Theme manager will have a predefined list of `availableThemes` as well as a controller where we will emit the new theme that has been set. We'll also expose the stream of the controller through a public property.

```dart
class ThemeManager {
   StreamController<ThemeData> _themeController = StreamController<ThemeData>();

   List<ThemeData> _availableThemes = [
    ThemeData(backgroundColor: Colors.red, accentColor: Colors.blue),
    ThemeData(backgroundColor: Colors.green, accentColor: Colors.yellow),
    ThemeData(backgroundColor: Colors.purple, accentColor: Colors.pink),
    ThemeData(backgroundColor: Colors.blue, accentColor: Colors.red),
  ];

  Stream<ThemeData> get theme => _themeController.stream;
}
```

### Update StatusBar Color

The theme swap will involve an update of the status bar color so we'll implement that as a separate function that we'll call when swapping our theme.

```dart
Future _updateStatusBarColor(ThemeData themeToApply) async {
  // Set status bar color
  await FlutterStatusbarcolor.setStatusBarColor(themeToApply.accentColor);

  // Check the constrast between the colors and set the status bar icons colors to white or dark
  if (useWhiteForeground(themeToApply.accentColor)) {
    FlutterStatusbarcolor.setStatusBarWhiteForeground(true);
  } else {
    FlutterStatusbarcolor.setStatusBarWhiteForeground(false);
  }
}
```

Here we are setting the StatusBarColor to the accentColor of the theme. Additionally we are making sure that the status bar Icons are still visible so we check the contrast using `useWhiteForeground` and set the icons to either white or black.

### Updating theme

To swap the theme we'll simply keep track of the currentTheme index and increment that in a function. We'll then use the new index to get the theme and then add it onto the controller.

```dart
int _currentTheme = 0;

...

Future changeTheme() async {
  _currentTheme++;
  if (_currentTheme >= _availableThemes.length) {
    _currentTheme = 0;
  }

  // Get the theme to apply
  var themeToApply = _availableThemes[_currentTheme];

  // Update status bar color
  await _updateStatusBarColor(themeToApply);
  // Broadcast new theme
  _themeController.add(themeToApply);
}
```

## Supply the Theme

To get the theme to the app and make it automatically update we'll use Provider. We'll start by wrapping our `MaterialApp` in a `MultiProvider` and supplying the ThemeManager as a provider and then the `Theme` as a `StreamProvider`.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
        providers: [
          Provider.value(value: ThemeManager()),
          StreamProvider<ThemeData>(
              builder: (context) =>
                  Provider.of<ThemeManager>(context, listen: false).theme)
        ],
        child: MaterialApp(
          title: 'Theme Manager Demo',
          home: HomeView(),
        ));
  }
}
```

Here we are registering the `ThemeManager` as a provider. Then we're requesting the `ThemeManager` from Provider in the builder of the `StreamProvider` and returning the `ThemeData` stream. We are also telling the StreamProvider not to listen for updates from the ThemeManager. If you're using a [get_it setup](/snippet/dependency-injection-in-flutter) for dependency injection then it'll look like this.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
        providers: [
          StreamProvider<ThemeData>(builder: (context) => locator<ThemeManager>().theme)
        ],
        child: MaterialApp(
          title: 'Theme Manager Demo',
          home: HomeView(),
        ));
  }
}
```

Next up we have to make sure that when ThemeData changes we update our `MaterialApp` with the new theme. For that we will wrap our `MaterialApp` in a Consumer of type `ThemeData` and pass the theme to our theme property on the app.

```dart
Widget build(BuildContext context) {
  return MultiProvider(
    ...
    child: Consumer<ThemeData>(
        builder: (context, theme, child) => MaterialApp(
          title: 'Theme Manager Demo',
          theme: theme,
          home: HomeView(),
        )),
  );
}
```

And the last thing we have to do is call the `changeTheme` function on our manager when the `floatingActionButton` is pressed in the `HomeView`.

```dart

class HomeView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).backgroundColor,
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Provider.of<ThemeManager>(context).changeTheme();
        },
      ),
    );
  }
}
```

And that should do it. You should aim as much as possible to keep your responsibilities separate and clearly defined. When it comes to the UI the scaffold only shows the color provided by the Theme. The ThemeManager is reponsible for updating to the new theme, doing all the calculations (not much in this example) and then broadcasting the new theme. The rest should be handled by the architecture, in this case, provider will update the theme by calling all consumers that depend on the ThemeData and rebuilding them.

If you enjoyed this check out some of my other [snippets](/snippets).
