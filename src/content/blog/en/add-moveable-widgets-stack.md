---
title: Widget tricks - Create movable Stack widgets
description: A Stack tutorial for creating movable widgets
published: 2019-07-10
updated: 2019-07-10
postSlug: widget-tricks-create-movable-stack-widgets
ogImage: /assets/blog/snippets/043/043.jpg
featured: false
draft: false
tags:
  - flutter
  - ui
categories:
  - snippet
lang: en
---

One of my super secret Flutter projects for the Desktop and Web makes use of a canvas and a draggable node interface. This tutorial will show how I used a stack to accomplish draggable functionality using widgets. Not drag and Drop. Draggable, like below.

![Draggable widgets example flutter](/assets/blog/snippets/043/draggable.gif)

We'll be adding items onto the stack dynamically and to distinguish them I will be using a RandomColor genrerator. So we have to add that package.

```yaml
random_color:
```

Then we can create our HomeView that will contain our stack

```dart
class HomeView extends StatefulWidget {
  @override
  _HomeViewState createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  List<Widget> movableItems = [];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Stack(
          children: movableItems,
        ));
  }
}
```

The functionality is quite simple. We'll have a `MoveableStackItem` widget that's stateful. It keeps track of its own position and color. The color is set on initialise and the position is updated through a `GestureDetector`.

```dart
class _MoveableStackItemState extends State<MoveableStackItem> {
  double xPosition = 0;
  double yPosition = 0;
  Color color;

  @override
  void initState() {
    color = RandomColor().randomColor();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: yPosition,
      left: xPosition,
      child: GestureDetector(
        onPanUpdate: (tapInfo) {
          setState(() {
            xPosition += tapInfo.delta.dx;
            yPosition += tapInfo.delta.dy;
          });
        },
        child: Container(
          width: 150,
          height: 150,
          color: color,
        ),
      ),
    );
  }
}

```

Last thing to do is to add a new `MoveableStackItem` to the view. We'll do that through a floating action button in the HomeView.

```dart
 return Scaffold(
  floatingActionButton: FloatingActionButton(
    onPressed: () {
      setState(() {
        movableItems.add(MoveableStackItem());
      });
    },
  ),
  body: Stack(
    children: movableItems,
  ));
```

And that's it. Now you have a moveable stack item on your view. Check out the other [snippets](/snippets) or last weeks [Stack trick](/snippet/widget-tricks-reorder-widgets-on-a-stack) if you liked this one.
