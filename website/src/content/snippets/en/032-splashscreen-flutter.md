---
title: Setting up your SplashScreen in Flutter
description: In this tutorial we cover the steps to take to setup a splash screen in flutter.
authors:
  - en/dane-mackier
published: 2019-06-21
updated: 2019-06-21
postSlug: setting-up-your-splash-screen-in-flutter
ogImage: /assets/snippets/032/032.jpg
featured: false
draft: false
tags:
  - flutter
  - splash-screen
  - ui
  - foundation
# friendlyId: snippet-032
---

Today we'll cover how to setup your splash screen in Flutter. If you've done it for a native project then it's all the same so you can skip this tutorials :) We'll make the splash look like this.

![Splash Screen Preview](/assets/snippets/032/032-screenshot.jpg)

Each platform has to be setup individually. If you don't have assets to test with you can download the ones I used [here](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/splash-filled.zip?alt=media&token=52e8d3a6-87eb-474f-9081-85517b927d09). Lets start with Android.

## Android

First we'll get the background color what we want it to be. Go to the values folder under android/app/src/main/res/ and create a new file called colors.xml.

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="background">#181818</color>
</resources>
```

Then go to the launch_background.xml under android/app/src/main/res/drawable and change

```xml
<item android:drawable="@android:color/white" />
```

to

```xml
<item android:drawable="@color/background" />
```

Now copy your splash Icon into the mipmap folders with it's respective sizes. Mine is called filledstacks.png. Uncomment the lines where it says "You can insert your own image assets here" and set your `android:src` value to @mipmap/filledstacks. Your final xml should look like this.

```xml
<?xml version="1.0" encoding="utf-8"?>
<!-- Modify this file to customize your launch splash screen -->
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/background" />

    <!-- You can insert your own image assets here -->
    <item>
        <bitmap android:gravity="center" android:src="@mipmap/filledstacks" />
    </item>
</layer-list>
```

## iOS

Open up the Runner workspace in xcode. Go to the `Assets.xcassets` folder in the left panel. Under AppIcon and LaunchImage right-click and select "New Image Set", name it SplashIcon and add your images in the respective sizes.

![Splash Screen Preview](/assets/snippets/032/032-imageSet.jpg)

Open up `LaunchScreen.storyboard` and add a new Image. Set the image to the `SplashIcon` just created. Also make sure to remove the LaunchImage that's already added to the view.

![Splash Screen Preview](/assets/snippets/032/032-imageProperties.jpg)

Set your constraints to the sizes that you want and centre it horizontally and vertically.

![Splash Screen Preview](/assets/snippets/032/032-constraints.jpg)

Set your background of the `View` to custom color and set the hex value to `181818` and that's it.

Check out some of the other [Snippets](/snippets)
