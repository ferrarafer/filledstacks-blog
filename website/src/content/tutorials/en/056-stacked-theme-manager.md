---
title: Multiple Themes in Flutter | Dark and Light Theme Flutter Stacked
description: This tutorial covers the way we handle multiple themes in Flutter using stacked architecture.
authors:
  - en/dane-mackier
published: 2020-09-13
updated: 2020-09-13
postSlug: multiple-themes-in-flutter-dark-and-light-theme-flutter-stacked
ogImage: /assets/tutorials/056/056.jpg
ogVideo: https://www.youtube.com/embed/F4vLO6wjgoo
featured: false
draft: false
tags:
  - stacked
  - themes
# codeUrl: https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F056%2F056-starting.zip?alt=media&token=7b4ea964-dc93-43aa-95c2-f0f6f19f1dc0
# friendlyId: tutorial-056
---

This tutorial will go over how to implement multiple themes in the stacked architecture. It is an implementation of the Theme Manager Snippet that makes use of pure provider as a theme manager. We’re using the exact same principles shown in that tutorial. If you want to build a theme manager using provider only then you can take a look at that. To follow along [download the starting code here](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F056%2F056-starting.zip?alt=media&token=7b4ea964-dc93-43aa-95c2-f0f6f19f1dc0) that will be used in this guide.

## Setup and Stacked Themes

We’ll start by adding the stacked_themes package to the pubspec.yaml file

```yaml
dependencies: ...
  stacked_themes:
```

This package provides some basic classes to make theme management easier when building your application with stacked. stacked_themes provides you with the basic functionality of swapping out the ThemeData provided to your app, which can be accessed using `Theme.of(context)`. In addition to that it also provides you with an helper function where you can change your status bar color. Lets take a look at the code.

## Usage

The package makes use of a `ThemeManager` to manage all the theme functionalities. To start off we have to call the initialise function of the `ThemeManager` before the app is started. Change your main function to return a `Future` and, make it async and await the initialise static function call on `ThemeManager`.

```dart
Future main() async {
  await ThemeManager.initialise();
  runApp(MyApp());
}
```

### Theme Builder

We start by wrapping our `MaterialApp` or any other `App` with our `ThemeBuilder`. The builder function returns a context, regularTheme, darkTheme and a themeMode. We supply this to the `MaterialApp`.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ThemeBuilder(
      builder: (context, regularTheme, darkTheme, themeMode) => MaterialApp(
        title: 'Flutter Demo',
        theme: regularTheme,
        darkTheme: darkTheme,
        themeMode: themeMode,
        ...
      ),
    );
  }
}
```

This will rebuild your app and pass a new theme through the context for you to use within your application.

### Supply Multiple Themes

The `ThemeBuilder` has a property called themes where you can supply a list of `ThemeData`. This is usually only 2 or 3, light, dark, neutral but we’re keeping it a list so you can have as many as you’d like. To keep things clean we will return the list of themes from a function created in a different file. Create a new file called `theme_setup.dart` . You can place it in the UI folders root location or leave it in root of lib. I haven’t decided where it’s the best yet so it's up to you

```dart
List<ThemeData> getThemes() {
  return [
    ThemeData(backgroundColor: Colors.blue, accentColor: Colors.yellow),
    ThemeData(backgroundColor: Colors.white, accentColor: Colors.green),
    ThemeData(backgroundColor: Colors.purple, accentColor: Colors.green),
    ThemeData(backgroundColor: Colors.black, accentColor: Colors.red),
    ThemeData(backgroundColor: Colors.red, accentColor: Colors.blue),
  ];
}
```

This is a pretty simple function but can start to look quite busy given how many of the theme properties you will use in your Themes. Which is why I recommend you keep it in a separate file. Go back to your main.dart file and supply the `getThemes()` value to the `themes` property of the `ThemeBuilder`.

```dart
Widget build(BuildContext context) {
  return ThemeBuilder(
    themes: getThemes(),
    builder: (context, regularTheme, darkTheme, themeMode) => MaterialApp(
      title: 'Flutter Demo',
      theme: regularTheme,
      darkTheme: darkTheme,
      themeMode: themeMode,
      ...
    ),
  );
}
```

The way we swap between themes is by setting the index of the theme we want to use. It will start off with the first theme in the list. To update the theme to any other theme all you have to do in the UI is call `getThemeManager(context)` to get the `ThemeManager` and then call `selectThemeAtIndex(1)` on it. This is the code to select the second theme in the list of themes supplied.

```dart
getThemeManager(context)
  .selectThemeAtIndex(1);
```

### Light and Dark

If you only want to use Light and Dark themes then you can supply that to the `ThemeBuilder` instead of supplying multiple themes. When supplying Light and Dark mode you can also supply a defaultThemeMode, which is `ThemeMode.system` by default. When you leave is a `system` you're telling the `ThemeManager` that you want the system to determine if you're using light or dark mode. This is how you would supply your dark and light theme.

```dart
Widget build(BuildContext context) {
  return ThemeBuilder(
    defaultThemeMode: ThemeMode.light,
    darkTheme: ThemeData(
      brightness: Brightness.dark,
      backgroundColor: Colors.blue[700],
      accentColor: Colors.yellow[700],
    ),
    lightTheme: ThemeData(
      brightness: Brightness.light,
      backgroundColor: Colors.blue[300],
      accentColor: Colors.yellow[300],
    ),
    builder: (context, regularTheme, darkTheme, themeMode) => MaterialApp(
      title: 'Flutter Demo',
      theme: regularTheme,
      darkTheme: darkTheme,
      themeMode: themeMode,
      ...
    ),
  );
}
```

When the `defaultThemeMode` is not system, as in the example above, then you can use the `toggleDarkLightTheme` function to swap between the light and dark theme.

```dart
getThemeManager(context)
  .toggleDarkLightTheme();
```

### Changing status bar color

Sometimes you want to status bar color to change as well when you have a specific theme. Most apps leave this transparent to make use of the backgrounds color. If your app requires you to change the status bar color there’s functionality for that as well. The `ThemeBuilder` has a property `statusBarColorBuilder` which is a function that expects you to return a `Color`. It provides you with the theme to be selected and you can use that to return the color you’d like to show for your status bar.

```dart
Widget build(BuildContext context) {
  return ThemeBuilder(
    statusBarColorBuilder: (theme) => theme.accentColor,
    lightTheme: ThemeData(...),
    darkTheme: ThemeData(...),
    ...
  );
}
```

In the case above we return the accentColor of the theme for the statusbar color. This functionality will automatically check if the status text is visible and will change the text from either white to black depending on the backgrounds value intensity (how close it is to white / black).

### Theme Persistence

If any of the themes are changed by the user during the lifetime of the app the theme that was last selected will automatically be applied when the app starts up again. This functionality is created through using the [shared_preferences](https://pub.dev/packages/shared_preferences) package.

## Using a Theme

Now that you’ve setup all your theme functionality lets look at how to use it in your UI. The first thing to know is you can access your theme data the normal way.

```dart
var theme = Theme.of(context);
```

This means the rest of your Flutter code still stays the same.

### Access in Business Logic

As you know. One of the rules I stick too is that there should be no UI related code or classes making use of the UI directly in any of your business logic. For that reason there is also a `ThemeService` which will allow you to call the same functions required to change between themes. This service should be used as any of the other stacked_services that you’ve used in the past. First we register it with the locator.

```dart
locator.registerSingleton(ThemeService.getInstance());

// or add it to your third_party_services_module if you’re using injectable
```

Then use it in the `ViewModel` or other services by getting it from the `locator`. And that’s it. That’s all the functionality required. If you’d like to talk more about this please checkout the slack and ask your questions there. If you want to request some additional features or changes don’t hesitate to file an issue on the [stacked repo](https://github.com/FilledStacks/stacked).
