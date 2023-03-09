---
title: Flutter Animated Splash screen with Flare
description: In this tutorial we use Flare in Flutter to to produce a nice animated intro for your app.
authors:
  - en/dane-mackier
published: 2019-06-21
updated: 2019-06-21
postSlug: flutter-animated-splash-screen-with-flare
ogImage: /assets/tutorials/015/015.jpg
ogVideo: https://www.youtube.com/embed/4PgdFYcQpuc
featured: false
draft: false
tags:
  - flutter
  - flare
  - animation
  - ui
---

A good first impression (at least to me) is a good looking splash screen followed by a nice intro. Whether that's a simple fade in, a slide in, or anything in between. In this tutorial we'll use an animation created in Flare to show after our SplashScreen has been shown. Something like this

![Splash animation gif](/assets/tutorials/015/splash-gif.gif)

To do this we'll do three things.

1. Build the splash animation (first half of the video)
2. [Setup a normal splash screen](https://www.filledstacks.com/snippet/setting-up-your-splash-screen-in-flutter/)
3. Show the intro Flare animation

Number 1 will be covered in the video because it's easier and will save on a lot of writing / screenshot taking time. Number 2 will follow exactly [this tutorial](snippet/setting-up-your-splash-screen-in-flutter) of mine. So we'll just show the code for number 3.

[Download Flare animation assets here](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F015%2Fflare-assets.zip?alt=media&token=5ee74694-d601-477e-81e0-984398d3ca36)

## Show the intro Flare animation

To do this we'll install a package called `flare_splash_screen`. Add the latest version into your pubspec.

```yaml
flare_splash_screen: ^2.0.1+2
```

Then we want to add the splash.flr asset file into our app and the pubspec as well. Create an assets folder in the root of the project and put your splash.flr file in there. Then in the pubspec add the asset as an entry.

```yaml
# To add assets to your application, add an assets section, like this:
assets:
  - splash.flr
```

Clean up your main.dart file and remove all the additional code for the HomeScreen and just make an empty HomeView like below.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flare Welcome',
      home: Container()
    );
  }
}

class HomeView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Text('Home View'),
      ),
    );
  }
}
```

### Adding the (After) Splash Intro

We'll import the SplashScreen package then return our SplashScreen as the home widget. This widget has a lot of options, but we'll cover the ones required for our functionality. We give it the path to the file, then we'll give it the view we want it to navigate to afterwards, the name of the animation to play and the background color.

```dart
import 'package:flare_splash_screen/flare_splash_screen.dart';

...

return MaterialApp(
  title: 'Flare Welcome',
  home: SplashScreen(
    'assets/splash.flr',
    HomeView(),
    startAnimation: 'intro',
    backgroundColor: Color(0xff181818),
  ),
);

```

That's all there is to it. Check out the other [tutorials](/tutorials) as well. I create a video tutorial every week.
