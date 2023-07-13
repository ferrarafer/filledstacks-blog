---
title: Easy Custom Loading Indicators in Flutter with FlutterSpinKit
description: Better load indicators using the flutter_spinkit package.
authors:
  - en/dane-mackier
published: 2019-06-04
updated: 2019-06-04
postSlug: easy-custom-loading-indicators-in-flutter-with-flutter-spin-kit
ogImage: /assets/snippets/021/021.jpg
featured: false
draft: false
tags:
  - flutter
  - ui
# friendlyId: snippet-021
---

In most of my tutorials I use a Circular progress indicator when I want to show any kind of busy state. It's not bad, at all, but you might want something more appealing or that matches your design. Something like below.

![Android SpinKit examples](/assets/snippets/021/loaders.gif)

Well you're in Luck. Flutter SpinKit does just that.

## Installation

To get started add the package to your pubspec

```yaml
flutter_spinkit: ^3.1.0
```

## Usage

There are many indicators to be used so I won't go over them all. This post should serve as a CheatSheet for all the widgets your can use. Setup your UI like below and test it out.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        backgroundColor: Colors.grey[800],
          body: Center(
        child: SpinKitWave(color: Colors.white, type: SpinKitWaveType.start),
      )),
    );
  }
}

```

Here is a list of all the widgets for you to use. To experiment you can replace the child of Center with any of the following and refresh your UI to see it working.

```dart
SpinKitRotatingCircle(color: Colors.white)
SpinKitRotatingPlain(color: Colors.white)
SpinKitChasingDots(color: Colors.white)
SpinKitPumpingHeart(color: Colors.white)
SpinKitPulse(color: Colors.white)
SpinKitDoubleBounce(color: Colors.white)
SpinKitWave(color: Colors.white, type: SpinKitWaveType.start)
SpinKitWave(color: Colors.white, type: SpinKitWaveType.center)
SpinKitWave(color: Colors.white, type: SpinKitWaveType.end)
SpinKitThreeBounce(color: Colors.white)
SpinKitWanderingCubes(color: Colors.white)
SpinKitWanderingCubes(color: Colors.white, shape: BoxShape.circle)
SpinKitCircle(color: Colors.white)
SpinKitFadingFour(color: Colors.white)
SpinKitFadingFour(color: Colors.white, shape: BoxShape.rectangle)
SpinKitFadingCube(color: Colors.white)
SpinKitCubeGrid(size: 51.0, color: Colors.white)
SpinKitFoldingCube(color: Colors.white)
SpinKitRing(color: Colors.white)
SpinKitDualRing(color: Colors.white)
SpinKitRipple(color: Colors.white)
SpinKitFadingGrid(color: Colors.white)
SpinKitFadingGrid(color: Colors.white, shape: BoxShape.rectangle)
SpinKitHourGlass(color: Colors.white)
SpinKitSpinningCircle(color: Colors.white)
SpinKitSpinningCircle(color: Colors.white, shape: BoxShape.rectangle)
SpinKitFadingCircle(color: Colors.white)
SpinKitPouringHourglass(color: Colors.white)
```

Follow me on [YouTube](https://www.youtube.com/c/filledstacks?sub_confirmation=1) for Weekly videos, and Check out some of my [other snippets](/snippets)
