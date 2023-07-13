---
title: Flutter Web Advanced Navigation
description: In this tutorial we go over the navigation setup for web development.
authors:
  - en/dane-mackier
published: 2019-12-15
updated: 2019-12-15
postSlug: flutter-web-advanced-navigation
ogImage: /assets/tutorials/037/037.jpg
ogVideo: https://www.youtube.com/embed/q-n1Q98s92s
featured: false
draft: false
tags:
  - flutter-web
  - navigation
  - web-development
# codeUrl: https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F037%2F037-starting-code.zip?alt=media&token=30493036-e179-4f82-90b9-e83e41aac0a6
---

Today we'll go over URL navigation for Flutter web. Most of the navigation comes for free if your setup is correct. We want to cover the following things:

1. Navigate to a page in the web app using the url in the browser
2. Navigate to a page in the web app and use the parameters from the browser

What we want to achieve with the navigation is to make sure that the entire page is not swapped out, instead we only swap out the content of the page leaving the toolbar intact. To achieve that we'll make use of the builder property of the `MaterialApp`. This gives you the `BuildContext` as well as the child widget that the onGenerateRoute returns. We can use that child and place it in the content area that we define.

To avoid a lot of setup we will continue with the code from the previous part. You can [download it here](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F037%2F037-starting-code.zip?alt=media&token=30493036-e179-4f82-90b9-e83e41aac0a6). It has a basic [Named Routing setup](https://www.filledstacks.com/post/flutter-navigation-cheatsheet-a-guide-to-named-routing/).

## Browser Url Navigation

To kick off the navigation we'll change the route names and add a forward slash to all of them. On mobile this is not a good idea because of the deep linking behaviour. It actually navigates to '/' first and then the name you supply after it leaving two routes on your back stack with 1 navigation. That's beside the point. Open up the route_names.dart file and add a slash in front of all the names.

```dart
const String HomeRoute = '/home';
const String AboutRoute = '/about';
const String EpisodesRoute = '/episodes';
const String EpisodeDetailsRoute = '/episode';
```

Then we can update the `LayoutTemplate` widget by removing the `Navigator` and replacing it with a child `Widget` that we pass in through the constructor.

```dart
class LayoutTemplate extends StatelessWidget {
  final Widget child;
  const LayoutTemplate({Key key, this.child}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ResponsiveBuilder(
      builder: (context, sizingInformation) => Scaffold(
        drawer: sizingInformation.deviceScreenType == DeviceScreenType.Mobile
            ? NavigationDrawer()
            : null,
        backgroundColor: Colors.white,
        body: CenteredView(
          child: Column(
            children: <Widget>[
              NavigationBar(),
              Expanded(
                child: child,
              )
            ],
          ),
        ),
      ),
    );
  }
}
```

Whatever widget we pass in will be displayed full screen under the `NavigationBar` widget. What this means for us is we can make use of the builder property of the `MaterialApp` and pass the child into the `LayoutTemplate` that the route generates. We'll also supply the same values to the `MaterialApp` as we did to the `Navigator`.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      ...
      builder: (context, child) => LayoutTemplate(
        child: child,
      ),
      navigatorKey: locator<NavigationService>().navigatorKey,
      onGenerateRoute: generateRoute,
      initialRoute: HomeRoute,
    );
  }
}
```

If you run the code now you will see that the url in the browser is set to http://localhost:55865/#/home . Perfect, something easy to read and share. If you change home to episodes in the browser then you'll see the episodes view. This means we have direct navigation within the app using the browser url only. Click on the about view and then press the back button. As you see, that also works perfectly fine.

## Browser Url Parameters

Next up we will look at parsing url parameters from the entered string and passing that to your intended view. For our use case we will navigate to an episode and pass its id to the episode details view. We want to do this in two ways. Directly navigating to a page by typing in the url and internal navigation as well.

### Directly navigating to a page with URL parameters

Run the code and after your '#' symbol type /episode?id=1. You'll see that nothing happens because there's no such path defined for router. We'll use an extension on `String` to return an instance of `RoutingData`. Lets start with the `RoutingData` first. Create a new file under datamodels called routing_data.dart

```dart
class RoutingData {
  final String route;
  final Map<String, String> _queryParameters;

  RoutingData({
    this.route,
    Map<String, String> queryParameters,
  }) : _queryParameters = queryParameters;

  operator [](String key) => _queryParameters[key];
}
```

It will store the route (which will match the route name), queryParameters as a `Map` and we'll override the [] operator to index into that map using the query key. Next up lets create the extensions method. In the extensions folder create a new file called string_extensions.dart. We'll call it StringExtension and add it onto the `String` class.

```dart
import 'package:the_basics/datamodels/routing_data.dart';

extension StringExtension on String {
  RoutingData get getRoutingData {
    var uriData = Uri.parse(this);
    print('queryParameters: ${uriData.queryParameters} path: ${uriData.path}');
    return RoutingData(
      queryParameters: uriData.queryParameters,
      route: uriData.path,
    );
  }
}
```

Now we can head over to the router.dart file and do our modifications. We'll start by getting our routingData at the start of the function call. Then we'll use the route property on the routingData to switch on. The last thing in this function will be to get the id when the case matches the `EpisodeDetailsRoute`. We'll then use that id and pass it into the EpisodeDetails view.

```dart
Route<dynamic> generateRoute(RouteSettings settings) {
  var routingData = settings.name.getRoutingData; // Get the routing Data
  switch (routingData.route) { // Switch on the path from the data
    case HomeRoute:
      return _getPageRoute(HomeView(), settings);
    case AboutRoute:
      return _getPageRoute(AboutView(), settings);
    case EpisodesRoute:
      return _getPageRoute(EpisodesView(), settings);
    case EpisodeDetailsRoute:
      var id = int.tryParse(routingData['id']); // Get the id from the data.
      return _getPageRoute(EpisodeDetails(id: id), settings);
    default:
      return _getPageRoute(HomeView(), settings);
  }
}
```

If you run the code and navigate to /episode?id=1 again you should see a loading indicator and then the episode data listed. The UI simply shows the thumbnail along with the title.

### Navigate to url internally

We want to make sure that when navigating to the EpisodeDetails internally the url matches. Therefore we'll update the `NavigationService` to take in queryParameters. This way we can append our page route passed in and add the query parameter into the uri. Open the `NavigationService` and update the `navigateTo` function.

```dart
  Future<dynamic> navigateTo(String routeName,
      {Map<String, String> queryParams}) {
    if (queryParams != null) {
      routeName = Uri(path: routeName, queryParameters: queryParams).toString();
    }
    return navigatorKey.currentState.pushNamed(routeName);
  }
```

When the queryParams is not null we construct a new URI using the path and set that as the routeName. Then we can go ahead an update the `EpisodeList` to add a `GestureDetector` widget so we can handle the onTap functionality. Since we required the index to navigate to the `EpisodeDetails` we have to use the episodes passed in as a map so we get an index item in the map function as well. Update the episode_list.dart file to the following.

```dart
class EpisodesList extends StatelessWidget {
  ...
  @override
  Widget build(BuildContext context) {
    return ViewModelProvider<EpisodeListViewModel>.withConsumer(
      viewModel: EpisodeListViewModel(),
      builder: (context, model, child) => Wrap(
        spacing: 30,
        runSpacing: 30,
        children: <Widget>[
          ...episodes
              .asMap()
              .map((index, episode) => MapEntry(
                    index,
                    GestureDetector(
                      child: EpisodeItem(model: episode),
                      onTap: () => model.navigateToEpisode(index),
                    ),
                  ))
              .values
              .toList()
        ],
      ),
    );
  }
}
```

Here we simply map the episodes to a `MapEntry`. We supply the index and the Widget we want to show as the value. Then we display the values of the mapping result as the children. The last thing we have to do it update the episode_list_view_model.dart file to add the `navigateToEpisode` function. Open up the file, add the `NavigationService` and the function previously mentioned.

```dart
class EpisodeListViewModel extends ChangeNotifier {
  final NavigationService _navigationService = locator<NavigationService>();

  void navigateToEpisode(int index) {
    _navigationService
        .navigateTo(EpisodeDetailsRoute, queryParams: {'id': index.toString()});
  }
}
```

If you run the code now, navigate to episodes and select an episode you'll see the episode details with the matching url as we created earlier. That's it for the web navigation. You can now use this to provide parameters at the router level and pass that to your views to use in the viewmodel for retrieving the required information. Thanks for reading, if you have any suggestions for more web basics please let me know and I'll add it to the list.
