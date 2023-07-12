---
title: SQLite in Flutter
description: A SQLite tutorial focused on Schema management.
authors:
  - en/dane-mackier
published: 2020-10-15
updated: 2020-10-15
postSlug: sq-lite-in-flutter
ogImage: /assets/tutorials/057/057.jpg
ogVideo: https://www.youtube.com/embed/yR37lWE6xO4
featured: false
draft: false
tags:
  - stacked
  - storage
  - sql
# codeUrl: https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F057%2F057-starting.zip?alt=media&token=9999a346-7a83-4bee-84e9-953feea6ef86
# friendlyId: tutorial-057
---

Local storage or the "Offline first" data approach is common in the modern mobile applications. This allows you to give a better experience to users in cases where the initial requests to get information might take some time. The most common approach is a SQL database. The most common run-time for SQL that works on nearly every device, including mobile, is SQLite. That is what we'll be using today through the [sqflite](https://pub.dev/packages/sqflite) package. We will be focussing on 3 main things in this tutorial.

1. Readable Schema Management
2. Basics of CRUD
3. Migration management (Falls into 1, but better demonstrated after 3)

## SQLite setup

Before we can move onto the 3 topics above we have to setup SQLite in the codebase. For this tutorial I created a little Todo starting application with some basic stacked architecture setup and some UI bits. to follow along with the tutorial I'd recommend you to [download it here](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F057%2F057-starting.zip?alt=media&token=9999a346-7a83-4bee-84e9-953feea6ef86). Open up the project and lets get started. Go to the pubspec.yaml file and add the sqflite package. (It's added in the project but if you don't have it, add it).

**NOTE**: You can use the SQLite implementation outside of the stacked architecture, but this project uses the [stacked architecture](https://pub.dev/packages/stacked) but you can still use the service we'll be building in any other state management solution you'd like to use. If you want to learn more about stacked check out this [architecture series on YouTube](https://www.youtube.com/playlist?list=PLdTodMosi-BwM4XkagNwe4KADOMWQS5X-).

```yaml
dependencies:
  ...
  sqflite: ^1.3.1+1
```

Then we'll create a new service. Under `lib/services` create a new filed called `database_service.dart`. Inside create a class called `DatabaseService` which will contain an field called `_database` and an initialisation function to open a connection to that database.

```dart
import 'package:sqflite/sqflite.dart';

const String DB_NAME = 'todo_database.sqlite';

class DatabaseService {
  Database _database;

  Future initialise() async {
    _database = await openDatabase(DB_NAME, version: 1);
  }
}
```

That is all we need to create / open our database. We can go ahead and register this service with our locator. In this project we will simply go to the `locator.dart` file and register it as a lazySingleton.

```dart
void setupLocator() {
  locator.registerLazySingleton(() => NavigationService());
  locator.registerLazySingleton(() => DatabaseService());
}
```

Once that's registered we will go to the `StartupViewModel` and call initialise on the `DatabaseService`. The `StartupViewModel` initialise function will complete before sending the user to the first actual view of the app, so this is where all the setup is done. You can see more about it [here](https://youtu.be/d6FaV7cp_YE). Open the `StartupViewModel` and get the `DatabaseService` and call initialise before we navigate to the todo view.

```dart
class StartupViewModel extends BaseViewModel {
  final _navigationService = locator<NavigationService>();
  final _databaseService = locator<DatabaseService>();

  Future initialise() async {
    await _databaseService.initialise();
    await _navigationService.navigateTo(Router.todo);
  }
}
```

That's all the setup to get the database ready for the next step. Readable schema management.

## Readable Schema Management

One thing I did not like about scheme management in Flutter is that it was all written using string constants and then supplied to the database. It was definitely not readable and actually confusing to someone like me that always seems to struggle with SQL in general. For that reason I also created a package called [sqflite migration service](https://pub.dev/packages/sqflite_migration_service). This is a package that wraps up a solution that we've now successfully used in two production applications to take away the headache of schema management and migration management that we experienced before the development of this package. What this package does is it allows you to write your SQL queries in SQL files and name it with a version number. The `MigrationService` will then look at this number and automatically run your database through schema updates if the current version of the database is lower than the one on the schema file. Add the package to your pubspec file.

```yaml
dependencies:
  ...
  sqflite_migration_service: ^1.0.1
```

All the SQL files will be stored in the assets folder inside the root folder of you project. Create a new folder called assets in the root folder of your project and inside another folder called sql. This is where you'll add your schema and migration files. To ensure all the files you add here are in the bundle we'll add it into the assets section of the pubspec. Scroll down to the commented out assets section and add the sql folder.

```yaml
assets:
  - assets/sql/
```

To complete the setup all we have to do is register the MigrationService then use it in the `DatabaseService`. Open up the locator.dart file and register the `DatabaseMigrationService` as a lazySingleton.

```dart
import 'package:sqflite_migration_service/sqflite_migration_service.dart';
...
void setupLocator() {
  locator.registerLazySingleton(() => NavigationService());
  locator.registerLazySingleton(() => DatabaseService());
  locator.registerLazySingleton(() => DatabaseMigrationService());
}
```

Now, lets create our schema. In the `assets/sql` folder create a new file called `1_create_schema.sql` inside we'll add the following SQL.

```sql
CREATE TABLE todos(
  id INTEGER PRIMARY KEY,
  title TEXT,
  complete INT
);
```

Single queries should be separated by a semi-colon. To add more queries you start another query after the semi colon, new lines are ignored so you can format your SQL however you like. This would be how multiple queries would look.

```sql
CREATE TABLE todos(
  id INTEGER PRIMARY KEY,
  title TEXT,
  complete INT
);

CREATE TABLE items(
  id INTEGER PRIMARY KEY,
  name TEXT,
  rating INT
);
```

Now that you have the "migration" which is from 0->1 you can open up the `DatabaseService` and inside the initialise function supply the file name to the `DatabaseMigrationService`.

```dart
class DatabaseService {
  final _migrationService = locator<DatabaseMigrationService>();
  Database _database;

  Future initialise() async {
    _database = await openDatabase(DB_NAME, version: 1);

    // Apply migration on every start
    await _migrationService.runMigration(
      _database,
      migrationFiles: [
        '1_create_schema.sql',
      ],
      verbose: true,
    );
  }
}
```

That's it. The `MigrationService` will at start check the current database version, compare it with the number that the file starts with and then if that number is higher than the current database version on your device, it will run the migration then set the version number to the migration that it just ran. If you run the app now it will start up and create your migration service. You should see some logs printed out about what's happening in the `MigrationService`. If you want to turn that off remove the `verbose: true` statement in the function call.

## Basics of CRUD

This will be the least focused on part of this tutorial because there are 100's of them out there. I'll just walk you through the super basics of create a function to manipulate the db or get data from it. Lets start with reading all the posts in a table. In the `DatabaseService` create a new function called `getTodos` that returns a `List<Todo>`.

```dart

const String TodoTableName = 'todos';

class DatabaseService {

  ...

  Future<List<Todo>> getTodos() async {
    // Gets all the data in the TodoTableName
    List<Map> todoResults = await _database.query(TodoTableName);
    // Maps it to a Todo object and returns it
    return todoResults.map((todo) => Todo.fromJson(todo)).toList();
  }
}
```

Quite simple. This will get all the data in the `todos` table, then return that as Typed `Todo` objects. That's it. Lets look at adding a todo. This function `addTodo` will take in a title. Internally it will call the insert function, pass in the `TodoTableName` then construct a new todo object and call .toJson() on it. That's it.

```dart
  /// Adds a new todo into the database
  Future addTodo({String title}) async {
    try {
      await _database.insert(
          TodoTableName,
          Todo(
            title: title,
          ).toJson());
    } catch (e) {
      print('Could not insert the todo: $e');
    }
  }
```

Lets look at updating a todo completed value based on the id. We'll take in the id of the todo item and the bool completed value. We'll then call the `update` function and update `where` id matches the id passed in. Lets see how that looks in code.

```dart
  /// Updates todo completed value
  Future updateCompleteForTodo({int id, bool complete}) async {
    try {
      await _database.update(
          TodoTableName,
          // We only pass in the data that we want to update. The field used here
          // has to already exist in the schema.
          {
            'complete': complete ? 1 : 0,
          },
          where: 'id = ?',
          whereArgs: [id]);
    } catch (e) {
      print('Could not update the todo: $e');
    }
  }
```

Now lets use this throughout the application. Open up the `TodoViewModel` where we'll display and add the Todo's. We'll start by getting the `DatabaseService`. Then we'll use that in the futureToRun which will simply `getTodos`.

```dart
class TodoViewModel extends FutureViewModel<List<Todo>> {
  final _databaseService = locator<DatabaseService>();

  ...

  @override
  Future<List<Todo>> futureToRun() => _databaseService.getTodos();
}
```

Whenever this view is shown it will get the todos and show it in the UI. Let move onto the add function. In this function we'll simply call `addTodo` and await that. When it completes we'll await the `initialise` call again. Which will rerun the `futureToRun` function and store the results triggering a rebuild of the UI with the new data.

```dart
  Future addTodo(String title) async {
    await _databaseService.addTodo(title: title);

    // Initialise will rerun the initial FutureViewModel logic which will
    // 1. Run the Future provided to futureToRun()
    // 2. Store the value returned from that future in the data property
    await initialise();
  }
```

We'll do the same for the `setCompleteForItem` function.

```dart
Future setCompleteForItem(int index, bool value) async {
    await _databaseService.updateCompleteForTodo(id: data[index].id, complete: value);

    // Initialise will rerun the initial FutureViewModel logic which will
    // 1. Run the Future provided to futureToRun()
    // 2. Store the value returned from that future in the data property
    await initialise();
  }
```

If you run the app now you'll see that you can add todo items and then mark it as complete, etc. Not very exciting, super basic stuff. The power of my setup comes in when you want to perform migrations.

## Migration management

Lets say we want to add a description property into the todo item in the DB. There's a few things to do.

1. Add description property into the freezed `Todo` model and generate the new code. Open up todo.dart and update the model by adding a new `String descrtiption`.

```dart
@freezed
abstract class Todo with _$Todo {
  Todo._();

  factory Todo({
    int id,
    @required String title,
    // Add new description property
    String description,
    @Default(0) int complete,
  }) = _Todo;

  factory Todo.fromJson(Map<String, dynamic> json) => _$TodoFromJson(json);

  bool get isComplete => complete == 1 ? true : false;
}
```

Then run

```
flutter pub run build_runner build --delete-conflicting-outputs
```

2. Add a new sql file to update the todo table to include description. Under `assets/sql` create a new migration file called `2_add_description.sql`. We'll add 1 simple alter query to modify the table and add a new Text called description into the todo table.

```sql
ALTER TABLE todos ADD description TEXT;
```

3. Add that migration to the `runMigration` function

```dart
await _migrationService.runMigration(
    _database,
    migrationFiles: [
      '1_create_schema.sql',
      '2_add_description.sql', // Add new migration file
    ],
    verbose: true,
  );
```

4. Add an use the description property on the datbase service. The first function we'll update is `addTodo` to take in a description as well.

```dart
  Future addTodo({String title, String description}) async {
    try {
      await _database.insert(
          TodoTableName,
          Todo(
            title: title,
            description: description,
          ).toJson());
    } catch (e) {
      print('Could not insert the todo: $e');
    }
  }
```

Then we'll update the `TodoViewModel` addTodo to take in a description as well. In the `TodoViewModel` update the function to look like this.

```dart
Future addTodo(String title, String description) async {
  await _databaseService.addTodo(title: title, description: description);
  ...
  await initialise();
}
```

Then lastly in the `TodoView` we want to add the text field to take in the description, and the code to display it. We'll start by adding a new description controller under the `todoController`. We will pass that to the addTodo function call and also clear the descriptionController.

```dart
@override
Widget build(BuildContext context) {
  var todoController = useTextEditingController();
  // Creates a new description controller to use in the field.
  var descriptionController = useTextEditingController();

   return ViewModelBuilder<TodoViewModel>.reactive(
      builder: (context, model, child) => Scaffold(
        floatingActionButton: FloatingActionButton(
          onPressed: () async {
            // Passes in the description controller
            model.addTodo(todoController.text, descriptionController.text);
            todoController.clear();
            // clears the description controller when data has been added
            descriptionController.clear();
          },
          child: !model.isBusy
              ? Icon(Icons.add)
              : CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation(Colors.white),
                ),
        ),
      body: ...
      ),
   );
}
```

Then we'll add the `TextField` to type the description text and the text in the UI to display it. Duplicate the TextField with the padding that is there for the todo and change it to use the description controller and update the hint text to say description.

```dart
...
 Padding(
  padding: const EdgeInsets.symmetric(horizontal: 25),
  child: TextField(
    controller: todoController,
    decoration: InputDecoration(hintText: 'Add a todo'),
  ),
),
// Adds new description TextField
Padding(
  padding: const EdgeInsets.symmetric(horizontal: 25),
  child: TextField(
    controller: descriptionController,
    decoration: InputDecoration(hintText: 'Add a description'),
  ),
),
...
```

And lastly in the `ListView.builder` function we'll add the description under the title `Text` widget.

```dart
...
 Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Text(model.data[index].title),
    // Add new description Text here
    Text(
      model.data[index].description ?? '',
      style: TextStyle(color: Colors.grey),
    ),
  ],
),
Checkbox(
  value: model.data[index].isComplete,
  onChanged: (value) =>
      model.setCompleteForItem(index, value),
)
...
```

If you run the code now you'll see the following printed out.

```
I/flutter ( 5363): databaseService:1
I/flutter ( 5363): Run migration for 2_add_description.sql. This will take us from 1 to 2
I/flutter ( 5363): Run migration query: ALTER TABLE todos ADD description TEXT
I/flutter ( 5363): Migration complete from 1 to 2... update databaseService to 2
```

This indicates a successful migration. If you add a new todo now with a description it'll show up with the list item and the ones that don't have it won't show any. And that's it. The main focus for me is the Schema management and the migration management. Using the solution it's easy to read, easy to manage and always easy to track at a glance what Schema is applicable to the code you're working on at the moment :) Thanks for reading.

<br>
<br>

Dane Mackier
