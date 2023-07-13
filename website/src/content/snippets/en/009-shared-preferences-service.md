---
title: Shared Preferences Service in Flutter for Code Maintainability
description: Store/Cache values locally in Flutter. Use a service to make code more readable and easier to maintain.
authors:
  - en/dane-mackier
published: 2019-05-15
updated: 2019-05-15
postSlug: shared-preferences-service-in-flutter-for-code-maintainability
ogImage: /assets/snippets/009/009.jpg
featured: false
draft: false
tags:
  - flutter
  - foundation
# friendlyId: snippet-009
---

## Context

Storing/Caching values on disk is a very common task in Mobile App Development. The way this is done in Flutter is typically using the [shared_preferences](https://pub.dev/packages/shared_preferences) package. Values are stored in here to keep track of a user has logged in, user profiles, api tokens that are long lived, deviceId's from a service etc. I've used it a few times and always wrap it in a service that exposes typed properties to make it easier to use in code.

This is typical usage of the shared preferences.

```dart
var preferences = await SharedPreferences.getInstance();

// Save a value
preferences.setString('value_key', 'hello preferences');

// Retrieve value later
var savedValue = preferences.getString('value_key');
```

I don't like this because of the following reasons:

1. Keys can easily be typed wrong causing unnecessary debugging. Solution: Store key in constants
2. I don't know exactly what I'm saving. Relying only on keys to determine what's being saved is not a good form of documentation.
3. If I wanted to know what data was saved in my session there's no single place to log everything being saved.

We'll create a service to wrap this functionality so it's easier to use and maintain and transferable between projects.

## Setting Up

In your services folder (You should have one 😉) create new file called localstorage_service.dart and define a new class `LocalStorageService`.

This service will use the Singleton pattern and instances will be retrieved through a getInstance() static function. We'll keep a static instance of the `SharedPreferences` as well as the instance for our service.

```dart
class LocalStorageService {
  static LocalStorageService _instance;
  static SharedPreferences _preferences;

  static Future<LocalStorageService> getInstance() async {
    if (_instance == null) {
      _instance = LocalStorageService();
    }

    if (_preferences == null) {
      _preferences = await SharedPreferences.getInstance();
    }

    return _instance;
  }
}

```

Let's get all the setup done before we continue. Register the service with your locator as a singleton. If you don't have dependency injection setup, I [highly recommend setting it up](/snippet/dependency-injection-in-flutter). It's only 10 lines of code (I think.). Once setup, register your service as a singleton.

```dart
Future setupLocator() async {
  var instance = await LocalStorageService.getInstance();
  locator.registerSingleton<LocalStorageService>(instance);
}
```

## Implementation

We'll cover saving a complex object and primitive types. We'll cover the verbose object saving first, then the easier short hand primitive type saving.

A common use case for shared_preferences is to know if the user has logged in or not, that way we can show either the login screen or the home screen. We'll save a User model and then also some booleans to simulate a settings preferences (another common use case). First create the user model.

```dart
class User {
  final String name;
  final String surname;
  final int age;

  User({this.name, this.surname, this.age});

  User.fromJson(Map<String, dynamic> json)
      : name = json['name'],
        surname = json['surname'],
        age = json['age'];

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['name'] = this.name;
    data['surname'] = this.surname;
    data['age'] = this.age;
    return data;
  }
}

```

Having the toJson and fromJson values is important. You can use [this site](https://javiercbk.github.io/json_to_dart/) to generate models from complex json. I usually type my model as json then just generate and save. It's easier and faster than typing the code out. We'll add a getter and a setter onto our service of type User. The way this will be handled is by converting the model into json and then saving the json to disk as is. When retrieving we'll serialize back into the model.

```dart

static const String UserKey = 'user';

...

User get user {
  var userJson = _getFromDisk(UserKey);
  if (userJson == null) {
    return null;
  }

  return User.fromJson(json.decode(userJson));
}

set user(User userToSave) {
    saveStringToDisk(UserKey, json.encode(userToSave.toJson()));
}

dynamic _getFromDisk(String key) {
  var value  = _preferences.get(key);
  print('(TRACE) LocalStorageService:_getFromDisk. key: $key value: $value');
  return value;
}

void saveStringToDisk(String key, String content){
  print('(TRACE) LocalStorageService:_saveStringToDisk. key: $key value: $content');
  _preferences.setString(UserKey, content);
}
```

With this we now have named constants at the top so we avoid making mistakes when retyping the values. We have named properties that tells us exactly what we're setting or saving. We can treat it as a property in our code so the readability is great .i.e. `localStorage.user = retrievedUser`. Aaaand, if our trace logging is enabled we will be able to see what's being saved and retrieved throughout our session. _The saveStringToDisk function will be updated below to handle all types. You won't have to type it, you can just copy and paste 👨‍💻 _

The way you'll use it in your app is by getting your instance from the locator and use the property as a normal property.

```dart
import '../service_locator.dart';

...

var storageService = locator<LocalStorageService>();
var mySavedUser = storageService.user;

```

There's a little boiler plate associated with adding new properties, but I guarantee you it's worth the effort. As your application grows and you get some old data/caching bugs associated with your shared_preferences you'll be very happy you can trace through everything and check what code sets or reads these values. Let's add two more values just to see the steps involved and call it a day.

We'll add the keys.

```dart
static const String AppLanguagesKey = 'languages';
static const String DarkModeKey = 'darkmode';
```

Add the properties that we want to expose the values through.

```dart
...
bool get darkMode => _getFromDisk(DarkModeKey) ?? false;
set darkMode(bool value) => _saveToDisk(DarkModeKey, value);

List<String> get languages => _getFromDisk(AppLanguagesKey) ?? List<String>();
set languages(List<String> appLanguages) => _saveToDisk(AppLanguagesKey, appLanguages);

// updated _saveToDisk function that handles all types
void _saveToDisk<T>(String key, T content){
  print('(TRACE) LocalStorageService:_saveToDisk. key: $key value: $content');

  if(content is String) {
    _preferences.setString(key, content);
  }
  if(content is bool) {
    _preferences.setBool(key, content);
  }
  if(content is int) {
    _preferences.setInt(key, content);
  }
  if(content is double) {
    _preferences.setDouble(key, content);
  }
  if(content is List<String>) {
    _preferences.setStringList(key, content);
  }
}

...

```

And that's it. Now when using the Shared preferences to store local values you don't have to force async functions just to instantiate the instance and your code readability and health gets a boost for long term maintenance.

## Get it Setup

If you're using get it then read below. Since the service singleton is created using a Future, you have to make sure you wait for it to complete before running the app. Change your main method to look like this.

```dart
Future<void> main() async {
  try {
    await setupLocator();
    runApp(MyApp());
  } catch(error) {
    print('Locator setup has failed');
  }
}
```

Checkout and subscribe to my [Youtube Channel](https://www.youtube.com/c/filledstacks?sub_confirmation=1). Follow me [on Instagram](https://www.instagram.com/filledstacks/) for snippets and day-to-day programming. Checkout all the [other snippets](/snippets) here. You might find some more Flutter magic.
