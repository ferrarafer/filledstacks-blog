---
title: 6 Tips to make your flutter website feel premium
description: 6 Tips to make your Flutter Website feel more Premium.
authors:
  - en/dane-mackier
published: 2023-03-20
updated: 2023-03-20
postSlug: 6-tips-to-make-your-flutter-website-feel-premium
ogImage: /assets/tutorials/086/thumbnail.jpeg
# ogVideo: https://www.youtube.com/embed/j24ctnLxi_o
featured: false
draft: false
tags:
  - flutter-web
# friendlyId: flutter-web-part-3
---

This post will show you 6 tips that will take you from this terrible, boring and mediocre first impression to this awesome splash screen loader and smooth transition into your website. It will only take a few minutes.

### #1: Make sure your splash screen color match your Flutter app color

Flutter apps start out as completely white. We want a dark app so we’ll change the background color to match.

Open the `index.html` file and above your `script` tag in body add a new `style` tag. In there we’ll set the `background-color` to #0A0A0A. Make sure your scaffold in the first view is also set to the same color.

```html
<style>
  body {
    background-color: #0a0a0a;
  }
</style>
```

### #2: Add an image to your html

When you create a flutter app and run it on web you see this [Show white screen with a cricket sound and a boop when it pops in]. So let's give the users something to look at by adding an image to the center.

- Add the image into your `web` folder
- Open up your index.html and Under the script tag in your body add a div with a class `main-content` and inside an image with the source set to the path of the image you just added.

```html
<body>
  <style>
    body {
      background-color: #0a0a0a;
    }
  </style>
  <script>
    ...
  </script>
  <div class="main-content">
    <img src="main-icon.png" alt="My App Logo" />
  </div>
</body>
```

- To center the image we’ll set the body width to 100vw and the body height to 100vh.
  - Then add a new css class .main-content where we set 100% width and height. And to center, we’ll use a flex display and we’ll align-items: center and justify-content: center.

```html
<style>
  body {
    background-color: #0a0a0a;
    height: 100vh;
    width: 100vw;
  }

  .main-content {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
```

### #3: Remove the UI Jump going from HTML to the Flutter canvas

Default Flutter projects do this [Show jump] when the app is loaded. It’s a small jump but first impressions last, this feels low quality. Luckily for us, the fix is easy.

In your `index.html` set the `margin: 0px` on the `body` class to remove this jump.

```css
body {
  background-color: #0a0a0a;
  height: 100vh;
  width: 100vw;
  margin: 0px;
}
```

The next 3 tips is what solidifies that premium feel of your website. Before we go through them, if you’re enjoying this web series. We have a full course [buy it here](https://masterflutterweb.carrd.co).

### #4: Smooth your transition from html to Flutter Canvas

When you load up your app you’ll see the html pops out of view and the flutter app just pops in. This does not feel premium. This one is a little more complex than the others but only requires a few steps.

First: Add a the `transition` property to the `.main-content` class. We want opacity to transition out for .4s using ease-out curve. This tells css to animate our change in the opacity value.

```css
transition: opacity 0.4s ease-out;
```

Second thing we’ll do is give the div with main-content an id called `loader-content`

```html
<div class="main-content" id="loader-content">
  <img src="main-icon.png" alt="My App Logo" />
</div>
```

Now onto a bit more complex things, The `_flutter.loader` gives us callbacks for 2 key events. After the entry point is loaded with the serviceWorker and after the Flutter engine is initialised. This is where we’ll apply our css animation magic.

This is our plan. When the engine is initialised we fade out our logo, wait for 400ms then run the flutter app.

We start off by creating a delay function helper. This can go directly in the body of the script tag

```css
function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

window.addEventListener('load', function (ev) {
	...
});
```

then we get the loaderContent using the querySelector on the document.

```css
var loaderContent = document.querySelector('#loader-content');
```

Once we have that we can execute our plan. We’ll set the opacity to 0, wait for 400ms and then run the app.

```css
engineInitializer.initializeEngine().then(async function (appRunner) {
  loaderContent.style.opacity = "0";
  await delay(400);
  await appRunner.runApp();
});
```

Refresh … Look at that. Now the image nicely fades out before the Flutter app crashes through the door with a Jarring Pop. Which takes us to our next tip.

### #5 Smooth Introduction of the Flutter app

The Flutter app still jumps in. Lets fix that by using mr GSkinners awesome flutter animate package. Run `flutter pub add flutter_animate` then in the `main` file we will fade in the entire `MaterialApp` using .animate .fadeIn

```css
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const MyHomePage(),
    ).animate().fadeIn(
          duration: 400.ms,
        );
  }
}
```

Much better. Things are already looking much better. Now lets make the wait feel shorter.

### #6 Making the wait feel shorter

This can be done using a pure CSS loader that gives off a nice effect. Since this is not a css tutorial I’ve linked the code to the css below for you to copy. it’s only a few classes.

Copy the css below and paste it under your `.main-content` class.

```css
/* ===== Loader CSS 👇 =====*/
img {
  width: 100px;
  height: 100px;
  position: absolute;
}

.loader {
  position: relative;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background: linear-gradient(#f07e6e, #84cdfa, #5ad1cd);
  animation: animate 1.2s linear infinite;
}

@keyframes animate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.loader span {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 60%;
  background: linear-gradient(#f07e6e, #84cdfa, #5ad1cd);
}

.loader span:nth-child(1) {
  filter: blur(5px);
}

.loader span:nth-child(2) {
  filter: blur(10px);
}

.loader span:nth-child(3) {
  filter: blur(25px);
}

.loader span:nth-child(4) {
  filter: blur(50px);
}

.loader:after {
  content: "";
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  background: #191919;
  border-radius: 50%;
}
```

Then inside `main-content` div put the loader.

```css
<div class="loader">
  <span></span>
  <span></span>
  <span></span>
  <span></span>
</div>
```

Whoooooooooooooo .. That looks dope! I hope you enjoyed.
