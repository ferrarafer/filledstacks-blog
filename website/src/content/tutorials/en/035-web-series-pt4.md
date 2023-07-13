---
title: Flutter API integration
description: In this tutorial we add our Provider state management solution and do some api integration.
authors:
  - en/dane-mackier
published: 2019-11-27
updated: 2019-11-27
postSlug: flutter-api-integration
ogImage: /assets/tutorials/035/035.jpg
ogVideo: https://www.youtube.com/embed/qailF0Ut_c0
featured: false
draft: false
tags:
  - flutter-web
  - provider
  - api
  - web-development
# codeUrl: https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F035%2F00-starting.zip?alt=media&token=80496df5-47b6-49d8-a5ed-2e270261905b
---

In this tutorial we will add our simple state management functionality using [my defined Provider Architecture](https://youtu.be/kDEflMYTFlk) and the new provider_architecture package. We will also be adding API integration for our backend which will return our episodes list to us. The goal of this tutorial is the API integration and not the state management. We'll still cover the setup for the MvvM style architecture but not in depth. Download the [starting code here](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F035%2F00-starting.zip?alt=media&token=80496df5-47b6-49d8-a5ed-2e270261905b) and open it in your editor of choice.

In the starting project I have already created the EpisodeListItems as well as the Episode List. I have created the datamodels for the `NavBarItem`, `EpisodeItem` and `SeasonDetails` . The entire setup and development of the package and the architecture for the [ResponsiveUI + StateManagement setup is in this video.](https://youtu.be/Kl69yxukBdw) I will not be going over it in depth again, I will just be using it to complete the goal of api integration.

## Provider Architecture setup

Add the provider_architecture package to your pubspec.yaml file as well as provider itself.

```yaml
provider: ^3.1.0
provider_architecture: ^1.0.0
```

### Removing Duplicate constructor code

Something that I showed off in [the final tutorial of the responsive UI series](https://www.filledstacks.com/post/a-responsive-ui-architecture-solution-with-provider/) was an easy way to get the same data to multiple different Layouts using Provider. This allowed us to remove duplicate constructor code per widget.

### Navigation Bar Item

We can start by updating the navbar_item to remove all the duplicate code for passing the model down to the different `ScreenTypeLayout`'s. Head over to the `NavBarItem` and wrap the child of the `GestureDetector` in a `Provider.value` call and pass down an instance of the `NavBarItemModel`. You can remove all the arguments passed into the constructors of the different responsive layouts as well.

```dart
class NavBarItem extends StatelessWidget {
  final String title;
  final String navigationPath;
  final IconData icon;
  const NavBarItem(this.title, this.navigationPath, {this.icon});

  @override
  Widget build(BuildContext context) {
    var model =  NavBarItemModel(
          title: title,
          navigationPath: navigationPath,
          iconData: icon,
        );
    return GestureDetector(
      ...
      child: Provider.value(
        value: model,
        child: ScreenTypeLayout(
          tablet: NavBarItemTabletDesktop(),
          mobile: NavBarItemMobile(),
        ),
      ),
    );
  }
}
```

Open up navbar_item_desktop.dart and remove the constructor completely as well as all the final properties. Instead of inheriting from a `StatelessWidget` we will inherit from a `ProviderWidget` of type `NavBarItemModel`. Using the `ProviderWidget` from the provider_architecture package we get a build function that returns our provided value as a argument of the build function. This reduces our navbar_item_desktop code to the following.

```dart
class NavBarItemTabletDesktop extends ProviderWidget<NavBarItemModel> {
  @override
  Widget build(BuildContext context, NavBarItemModel model) {
    return Text(
      model.title,
      style: TextStyle(fontSize: 18),
    );
  }
}
```

We can do the same for the navbar_item_mobile.dart. Remove the constructor, extend from `ProviderWidget<NavBarItemModel>` instead of Stateless widget and update the build function to accept another argument of type `NavBarItemModel`.

```dart
class NavBarItemMobile extends ProviderWidget<NavBarItemModel> {
  @override
  Widget build(BuildContext context, NavBarItemModel model) {
    return Padding(
      padding: const EdgeInsets.only(left: 30, top: 60),
      child: Row(
        children: <Widget>[
          Icon(model.iconData),
          SizedBox(
            width: 30,
          ),
          Text(
            model.title,
            style: TextStyle(fontSize: 18),
          )
        ],
      ),
    );
  }
}
```

When it comes to responsive layouts and passing data down to up to 4 different widgets this is the the way I prefer to do it. This allows me to reduce constructor boilerplate for arguments and helps me avoid the same `Provider.of` call in every build function.

### Season Details

Open up the season_details widget. You'll see that we have the same pattern of repeating the constructors to get the data to the different layout types. Wrap the `ScreenTypeLayout` with a `Provider.value` call and pass the details as the value. You can also remove all the details being passed through the constructor.

```dart
class SeasonDetails extends StatelessWidget {
  final SeasonDetailsModel details;
  const SeasonDetails({Key key, this.details}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Provider.value(
      value: details,
      child: ScreenTypeLayout(
        desktop: SeasonDetailsDesktop(),
        mobile: SeasonDetailsMobile(),
      ),
    );
  }
}
```

Then you can open the `SeasonDetailsDesktop` widget and inherit from a `ProviderWidget` of type `SeasonDetailsModel`. Remove the constructor code and add a parameter named details to the build function.

```dart
class SeasonDetailsDesktop extends ProviderWidget<SeasonDetailsModel> {
  @override
  Widget build(BuildContext context, SeasonDetailsModel details) {
    return ResponsiveBuilder(
      builder: (context, sizingInformation) => Row(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: <Widget>[
          Text(
            details.title,
            style: titleTextStyle(sizingInformation.deviceScreenType),
          ),
          SizedBox(
            width: 50,
          ),
          Expanded(
            child: Text(
              details.description,
              style: descriptionTextStyle(sizingInformation.deviceScreenType),
            ),
          )
        ],
      ),
    );
  }
}
```

You can do the same for the mobile layout.

```dart
class SeasonDetailsMobile extends ProviderWidget<SeasonDetailsModel> {
  @override
  Widget build(BuildContext context, SeasonDetailsModel details) {
    return ResponsiveBuilder(
      builder: (context, sizingInformation) => Column(
        children: <Widget>[
          Text(
            details.title,
            style: titleTextStyle(sizingInformation.deviceScreenType),
          ),
          SizedBox(
            height: 50,
          ),
          Text(
            details.description,
            style: descriptionTextStyle(sizingInformation.deviceScreenType),
          ),
        ],
      ),
    );
  }
}
```

That's it for removing all the duplicate code. Now we can go ahead and implement ViewModel-View bindings using the provider_architecture package.

## View-ViewModel implementation

We can start by creating the ViewModel that will be linked to the view. The only view we'll have any logic currently will be the `EpisodesView`. Create a new folder called viewmodels, inside create a file called `EpisodesViewModel`. We'll move the episodes hardcoded data from the `EpisodesList` into the viewModel.

```dart
class EpisodesViewModel extends ChangeNotifier {
  final episodes = [
    EpisodeItemModel(
      title: 'Setup, Build and Deploy',
      duration: 14.07,
      imageUrl:
          'https://www.filledstacks.com/assets/static/32.81b85c1.ebb7a1a.jpg',
    ),
    EpisodeItemModel(
        title: 'Adding a Responsive UI',
        duration: 18.54,
        imageUrl:
            'https://www.filledstacks.com/assets/static/033.81b85c1.ebdf16d.jpg'),
    EpisodeItemModel(
        title: 'Layout Templates',
        duration: 14.55,
        imageUrl:
            'https://www.filledstacks.com/assets/static/034.81b85c1.52d0785.jpg'),
    EpisodeItemModel(
        title: 'State Management and Api integration',
        duration: 14.55,
        imageUrl:
            'https://www.filledstacks.com/assets/static/034.81b85c1.52d0785.jpg'),
  ];
}
```

In the episodes_view.dart file we'll wrap the `SingleChildScrollView` in a `ViewModelProvider` with a consumer by using the .withConsumer constructor. We'll construct and provider an `EpisodesViewModel` instance as the ViewModel. We'll also pass in the episodes from the model to the `EpisodesList`.

```dart
class EpisodesView extends StatelessWidget {
  const EpisodesView({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ViewModelProvider.withConsumer(
      viewModel: EpisodesViewModel(),
      builder: (context, [model, child]) => SingleChildScrollView(
            child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.max,
          children: <Widget>[
            ...
            EpisodesList(episodes: model.episodes),
          ],
        ),
      ),
    );
  }
}
```

Then we'll update the episodes_list to take in the episodes through the constructor which we'll pass in from the ViewModel.

```dart
class EpisodesList extends StatelessWidget {
  final List<EpisodeItemModel> episodes;
  EpisodesList({@required this.episodes});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 30,
      runSpacing: 30,
      children: <Widget>[
        ...episodes.map(
          (episode) => EpisodeItem(model: episode),
        )
      ],
    );
  }
}
```

That's it for the viewmodel binding. Now we can add some basic business logic to the view and get our data from the API.

## Business Logic and Api integration

The `EpisodesView` will on initialisation request the episodes data from an api endpoint. While it's fetching that data we will show a busy indicator, when the data is back we'll show the data. The api we're using will be a cloud function that returns a fixed set of json. Open up the `EpisodesViewModel` and add a function that returns a `Future` that fetches our data. We'll make use of the `Api` class to get the data. We'll also add a busy boolean and a property that exposes the episodes.

```dart
class EpisodesViewModel extends ChangeNotifier {
  final _api = locator<Api>();

  List<EpisodeItemModel> _episodes;
  List<EpisodeItemModel> get episodes => _episodes;

  bool _busy;
  bool get busy => _busy;

  String _errorMessage;
  String get errorMessage => _errorMessage;

  Future getEpisodes() async {
    _setBusy(true);
    var episodesResuls = await _api.getEpisodes();

    if (episodesResuls is String) {
      _errorMessage = episodesResuls;
    } else {
      _episodes = episodesResuls;
    }

    _setBusy(false);
  }

  void _setBusy(bool value) {
    _busy = value;
    notifyListeners();
  }
}
```

In the `EpisodesView` add a onModelReady callback to the ViewModelProvider and call the `getEpisodes` function.

```dart
class EpisodesView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ViewModelProvider.withConsumer(
        viewModel: EpisodesViewModel(),
        onModelReady: (model) => model.getEpisodes(),
        ...
        );
  }
}
```

In the services folder create a new file called api.dart. We'll use the http package to make a get request and then serialise the data if it's successful. Otherwise we'll return an error message.

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'package:the_basics/datamodels/episode_item.model.dart';

class Api {
  static const String _apiEndpoint =
      'https://us-central1-thebasics-2f123.cloudfunctions.net/thebasics';

  Future getEpisodes() async {
    var response = await http.get('$_apiEndpoint/courseEpisodes');

    if (response.statusCode == 200) {
      var episodes = (json.decode(response.body) as List)
          .map((e) => EpisodeItemModel.fromJson(e))
          .toList();
      return episodes;
    }

    return 'Could not fetch episodes at this time';
  }
}
```

Then we can go ahead and add the http package to the pubspec and we should be able to run the app.

```yaml
http: ^0.12.0+2
```

That's basically it. Any and every "API integration" is done with simple http requests. My api class usually follows the structure of the API class above. I request the data, serialise it, and either return the result or an error message to display. Thanks for reading, you can watch the series [from the beginning here](https://www.youtube.com/playlist?list=PLdTodMosi-Bxf___3xPh3_NS-on4dc0sJ). The next episode we'll be looking at some UI basics in Flutter web.
