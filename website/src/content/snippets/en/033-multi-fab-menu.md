---
title: Multi Fab menu in Flutter with unicorndial
description: A short tutorial showing how to use the unicorndial for a multi-fab menu.
authors:
  - en/dane-mackier
published: 2019-06-24
updated: 2019-06-24
postSlug: multi-fab-menu-in-flutter-with-unicorndial
ogImage: /assets/snippets/033/033.jpg
featured: false
draft: false
tags:
  - flutter
  - ui
# friendlyId: snippet-033
---

This tutorial we'll use the unicorndial to create a profile menu like below. It'll show your user icon and animate out some options for logout, settings and home.

![Multi Fab example](/assets/snippets/033/fab-example.gif)

To start off we'll add the package to pubspec

```yaml
unicorndial: ^1.1.5
```

## Usage

The `UnicornDialer` will be used in place of the floatingActionButton and we'll supply it with multiple FAB's as it's children. We'll start by creating the children that we want. We'll create a function that returns a `List<UnicornButton>` that will populate a list type `UnicornButton` for us.

```dart
 List<UnicornButton> _getProfileMenu() {
    List<UnicornButton> children = [];

    // Add Children here

    return children;
 }
```

We also know that we want all our buttons to be the same so we can make a function called `_profileOption` that returns a UnicornButton with our option styling. This function will take in the icon we want to show as well as an onPressed function.

```dart
Widget _profileOption({IconData iconData, Function onPressed}) {
  return UnicornButton(
      currentButton: FloatingActionButton(
    backgroundColor: Colors.grey[500],
    mini: true,
    child: Icon(iconData),
    onPressed: onPressed,
  ));
}
```

Let's add three options to our children in the `_getProfileMenu` function.

```dart
List<UnicornButton> _getProfileMenu() {
  List<UnicornButton> children = [];

  // Add Children here
  children.add(_profileOption(iconData: Icons.account_balance, onPressed:() {}));
  children.add(_profileOption(iconData: Icons.settings, onPressed: (){}));
  children.add(_profileOption(iconData: Icons.subdirectory_arrow_left, onPressed: () {}));

  return children;
}
```

Then we can add the `UnicornDialer` as the FloatingActionButton and supply it with our children.

```dart

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: UnicornDialer(
        parentButtonBackground: Colors.grey[700],
        orientation: UnicornOrientation.HORIZONTAL,
        parentButton: Icon(Icons.person),
        childButtons: _getProfileMenu(),
      ),
      body: Center(child: Text('User Profile'),),
    );
  }
```

I hope you found this useful. Checkout some of the other [Snippets](/snippets) for more flutter knowledge.
