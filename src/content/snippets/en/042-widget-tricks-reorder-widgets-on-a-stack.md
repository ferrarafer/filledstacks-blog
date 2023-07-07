---
title: Widget tricks - Reorder widgets on a stack
description: A tutorial that shows you to re-order widgets in a stack
authors:
  - en/dane-mackier
published: 2019-07-09
updated: 2019-07-09
postSlug: widget-tricks-reorder-widgets-on-a-stack
ogImage: /assets/snippets/042/042.jpg
featured: false
draft: false
tags:
  - flutter
  - ui
---

In this snippet I want to show you how to re-order widgets in a stack using some basic dart code. The re-order functionality can be anything you'd like it to be. We will simply put the last item first on every "shuffle".

![Flutter Stack Widgets reorder](/assets/blog/snippets/042/reorder-example.gif)

We'll start with a simple HomeView and make it a stateful widget. We'll also put a list of integers which we'll use as our widget Id's. This way you can easily transform the code to use a list from your model.

```dart
class HomeView extends StatefulWidget {
  @override
  _HomeViewState createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  List<int> widgetIds = [0, 1, 2];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(),
    );
  }
}
```

Then we'll create a widget that we'll show in the `Stack` called StackItem. Since the widget will be in a `Stack` we'll make the root of the widget a `Positioned` widget. We'll set the left and top to a third of the screen size \* id value and we'll use the id to generate a colour with some random values. We'll also pass in a boolean that tells us if the item is currently at the top. If it is we give it a drop shadow to stand out a bit more.

```dart
class StackItem extends StatelessWidget {
  final int id;
  final bool isTop;

  StackItem({this.id, this.isTop});

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: id * (MediaQuery.of(context).size.width / 3),
      top: id * (MediaQuery.of(context).size.height / 3),
      child: Container(
        height: 300,
        width: 300,
        decoration: BoxDecoration(
            color: Color.fromARGB(255, id * 40, id * (id * 10), 150 + (id * 3)),
            boxShadow: [
              if (isTop)
                BoxShadow(color: Color.fromARGB(125, 0, 0, 0), blurRadius: 16)
            ]),
      ),
    );
  }
}
```

Now we can use the widgetId's and the map function to produce a list of children for the Stack.

```dart
return Scaffold(
  body: Stack(
    children: widgetIds.reversed
        .map((id) => StackItem(
              id: id,
              isTop: id == widgetIds.first,
            ))
        .toList(),
  ),
);
```

This should give you three blocks drawn on the screen like below.

![Screenshot of Stack widgets](/assets/blog/snippets/042/screenshot.jpg)

## Reordering

To re-order the widgets you might have guessed already. All we'll do is change the order of the widgetId's in setState and it will re-render the widget tree with the new order. We'll do that in a floating action button.

```dart
 return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          setState(() {
            widgetIds = [widgetIds.last, ...widgetIds.getRange(0, 2)];
          });
        },
      ),
      body: ...
 );
```

If you like these tutorials check out the rest of the [Snippets](/snippets).
