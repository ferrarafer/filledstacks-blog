---
title: Dependency injection in Flutter using ProxyProvider
description: A tutorial on how to perform dependency injection using Proxy Provider.
authors:
  - en/dane-mackier
published: 2019-06-10
updated: 2019-06-10
postSlug: dependency-injection-in-flutter-using-proxy-provider
ogImage: /assets/snippets/024/024.jpg
featured: false
draft: false
tags:
  - flutter
  - dependency-injection
  - provider
# friendlyId: snippet-024
---

Provider has taken the Flutter world by storm and the latest v3 update is no different. In my current development stack [I use get_it as my service locator](/snippet/dependency-injection-in-flutter) to get my objects and services into places where the context is not available. The only con I had with provider is providing objects where the BuildContext is not available was difficult and required a lot of boilerplate code. In V3 of the update the `ProxyProvider` was introduced. `ProxyProvider` is a provider that builds a value based on other providers.

This means you can now inject providers into other provided values.

## Implementation

Starting off we have to add the new shiny provider v3 to our pubspec

```yaml
provider: ^3.0.0
```

Then to demonstrate the new functionality we'll create two classes. Api and HomeModel. The HomeModel will depend on the API and we'll do constructor injection on the homeModel.

```dart
// api.dart
class Api {
  String get loggedIn => 'I am logged in';
}

// home_model.dart
class HomeModel extends ChangeNotifier {
  final Api api;
  HomeModel({this.api});
}

```

In the main file we'll wrap our `MaterialApp` with a `MultiProvider`.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [],
      child: MaterialApp(
        theme: ThemeData(primaryColor: Colors.red),
        home: Scaffold(
          body: Center(child: Text('ProxyProvider example')),
        ),
      ),
    );
  }
}

```

The `MultiProvider` takes in multiple providers and exposes it to it's subtree (which is the entire material app). The first provider we'll give will be the Api

```dart
  ...
  providers: [
    Provider.value(value: Api()),
  ]
  ...
```

Now lets look at the newly added provider `ProxyProvider`. The provider is generic and expects two or more types. The first type is the type your new provided value depends on, and the second type is the type for the provider you want to return. We will construct using the Api and the HomeModel. Add this provider underneath the Api Provider.

```dart
ProxyProvider<Api, HomeModel>(
  builder: (context, api, homeModel) => HomeModel(api: api),
)
```

What we're doing here is saying we want to provide a HomeModel but we also want the Api when we're building our model. In the builder we then get the `Api` as well as the initial `HomeModel`. The initial homeModel is always null, unless you supply the `initialBuilder` with a value.

## Usage

Just to show that it works we'll Wrap the Center widget with a `Consumer` and use the value from the Api. You build function should look something like this.

```dart
 @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider.value(
          value: Api(),
        ),
        ProxyProvider<Api, HomeModel>(
          // Dependency injection
          builder: (context, api, homeModel) => HomeModel(api: api),
        )
      ],
      child: MaterialApp(
        theme: ThemeData(primaryColor: Colors.red),
        home: Scaffold(
          body: Consumer<HomeModel>(
            builder: (context, model, child) => Center(
                  child: Text(model.api.loggedIn),
                ),
          ),
        ),
      ),
    );
  }
```

Now at this point you'll see an error like this. It's telling you what the value changes from the API will not automatically cause rebuilds in the HomeModel. Which is exactly what wee want.

![Provider value type error](/assets/snippets/024/024-screenshot.jpg)

To fix this we have to tell Provider not to shows us this message during debug. Update your main function and set the check to null.

```dart
void main() {
  Provider.debugCheckInvalidValueType = null;
  runApp(MyApp());
}
```

If you run this now you should see your message on the screen. That's the basics of dependency injection using ProxyProvider. I'm working on a new tutorial that covers this in depth so [subscribe on youtube](https://www.youtube.com/c/filledstacks?sub_confirmation=1) to get that video when it comes out. Check out the rest of the [Snippets](/snippets) to get some more flutter magic.
