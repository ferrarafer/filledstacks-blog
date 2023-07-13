---
title: Show Dialogs Without Context
description: This tutorial goes over the usage of a dialog service to show dialogs where you don't have the context.
authors:
  - en/dane-mackier
published: 2020-07-26
updated: 2020-07-26
postSlug: show-dialogs-without-context
ogImage: /assets/tutorials/054/054.jpg
ogVideo: https://www.youtube.com/embed/uuyJHCxxMEY
featured: false
draft: false
tags:
  - stacked
  - dialog
# codeUrl: https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F054%2F054-starting.zip?alt=media&token=b9836e2d-bbb6-434d-b0a3-8ca76d061416
# friendlyId: tutorial-054
---

In this tutorial we're covering the use of the `DialogService` to show dialogs from your business logic. It's common that the `BuildContext` is not available where you business logic is, whether you're using BLoC, pure provider, redux, get_it only, get, etc. It's easier in terms of writing code to be able to show your dialogs from where your failures / success are happening, which is why the `DialogService` was born. Lets dive into it.

## Setup

To get access to the `DialogService` you can add the `stacked_services` package into your project. If you want a project that's already setup with stacked and has the ViewModel setup then you can [download the starting code](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F054%2F054-starting.zip?alt=media&token=b9836e2d-bbb6-434d-b0a3-8ca76d061416) here. Open up the pubspec.yaml file and add the stacked_services (if it's not added).

```yaml
stacked_services:
```

### About Stacked Service

The stacked services package provides you with 3 foundational services to be used with the stacked mvvm style architecture. `NavigationService`, `DialogService`, `SnackbarService`. All of these are thin wrappers ontop of the `get` package which provides a great context-less setup already. For any of the functionality of any of these services to work `Get` requires a navigation key to be set. This key can be set using any of the 3 provided services and does not have to be set for any of the other. Traditionally it's set using the key from the `NavigationService` but if you're not using the `NavigationService` and you're only using the `DialogService` you can use the key on the `DialogService`.

### Register services with get_it

Services should be retrieved through a service locator. We use get_it for our service location needs. To register a service with get it you can do the following.

```dart
locator.registerLazySingleton(() => DialogService());
```

If you're using injectable, then you can register the services through a module. Create a new file in your services folder called thirdparty_services_module.dart. This assumes you know how get_it is setup using injectable. If not you can [watch part 1](https://youtu.be/DO8le1W_HqQ) of this series of videos.

```dart
import 'package:injectable/injectable.dart';
import 'package:stacked_services/stacked_services.dart';

@module
abstract class ThirdPartyServicesModule {
  @lazySingleton
  NavigationService get navigationService;
  @lazySingleton
  DialogService get dialogService;
  @lazySingleton
  SnackbarService get snackbarService;
}
```

Then run `flutter pub run build_runner build --delete-conflicting-outputs` to generate your service registrations.

## Using the Dialog Service

Now that that's complete you can run the application and it should start on the `DialogExampleView` which already has its viewmodel setup. The view has 3 buttons, "Show Basic Dialog", "Show Confirmation Dialog" and "Show Custom Dialog". The buttons are hooked up to empty function calls on the model with the same function names. So lets get to using it. Now that we have the dialog setup we can set the key that we spoke about earlier. If you don't have the key set through the `NavigationService` then update your main file to look as follows.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      home: DialogExampleView(),
      onGenerateRoute: Router().onGenerateRoute,
      // Set the navigatorKey
      navigatorKey: locator<DialogService>().navigatorKey,
    );
  }
}
```

### Showing a Basic Dialog

To show a dialog we first have to get our `DialogService` into the `ViewModel` through our get_it locator and then we call `showDialog` on the service. We'll add this code into the `showBasicDialog` function.

```dart
class DialogExampleViewModel extends BaseViewModel {
  final _dialogService = locator<DialogService>();

  Future showBasicDialog() async {
    await _dialogService.showDialog(
      title: 'The Basic Dialog',
      description:
          'This is the description for the dialog that shows up under the title',
      buttonTitle: 'This is the main button title',
      dialogPlatform: DialogPlatform.Cupertino, // DialogPlatform.Material
    );
  }
}
```

Basic Dialog should be used for showing information to the user. It takes in a title, a description and a buttonTitle. Additionally you can set the `dialogPlatform`. If you leave out the `dialogPlatform` parameter it will use the dialog for the platform you're on. Material on Android, Cupertino on iOS. When the main button is clicked it will close the dialog. You can also pass it a `cancelTitle` which will be shown in a different styling. You can store the result of any showDialog request which will only be returned after the dialog closes and will return to you a `DialogResponse`. You can update the `showBasicDialog` to this.

```dart
  Future showBasicDialog() async {
    DialogResponse response = await _dialogService.showDialog(
      title: 'The Basic Dialog',
      description:
          'This is the description for the dialog that shows up under the title',
      buttonTitle: 'This is the main button title',
      dialogPlatform: DialogPlatform.Material,
      cancelTitle: 'Cancel',
    );

    print('DialogResponse: ${response?.confirmed}');
  }
```

Now when you press the cancel button you'll see the DialogResponse: false text in the console and true if you press the other button. You can also pass in `barrierDismissable: true`, which will also complete the dialog with the response being set to null.

### Basic Confirmation Dialog

Then we have the confirmation dialog. This is the same code as the basicDialog but with better naming to make it clearer in code. You don't have to use this, it's mostly there to ensure when this function call is used we always use the result to perform an action in the code. It also removes the `barrierDismissible` parameter to ensure the user always uses one of the buttons to dismiss the dialog. Update the `showConfirmationDialog` function in the `ViewModel` to the following.

```dart
  Future showConfirmationDialog() async {
    var response = await _dialogService.showConfirmationDialog(
      title: 'The Confirmation Dialog',
      description: 'Do you want to update Confirmation state in the UI?',
      confirmationTitle: 'Yes',
      dialogPlatform: DialogPlatform.Material,
      cancelTitle: 'No',
    );

    _confirmationResult = response?.confirmed;

    notifyListeners();
  }
```

When you run the app now and select show confirmation dialog you'll see the dialog with the cancel title you passed in. It'll be set to cancel if you pass in nothing. And when you select one of the options the value under the button will reflect which one you selected. You can see how to use this in production? if true do something, else do something else.

### Custom Dialog

The `DialogService` also allows you to show a custom dialog and return the same dialog response model to the called. To setup a custom dialog we first register the UI we want to show. To do this you can create a new file called `setup_dialog_ui.dart` in the ui folder. In that file we'll create a function called `setupDialogUi`. This will be called before we run the mainApp.

```dart
void setupDialogUi() {
  var dialogService = locator<DialogService>();

   dialogService.registerCustomDialogUi((context, dialogRequest) => Dialog(
     child:  Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Text(
                dialogRequest.title,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 23),
              ),
              SizedBox(
                height: 10,
              ),
              Text(
                dialogRequest.description,
                style: TextStyle(
                  fontSize: 18,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(
                height: 20,
              ),
              GestureDetector(
                // Complete the dialog when you're done with it to return some data
                onTap: () => dialogService.completeDialog(DialogResponse(confirmed: true)),
                child: Container(
                  child: dialogRequest.showIconInMainButton
                      ? Icon(Icons.check_circle)
                      : Text(dialogRequest.mainButtonTitle),
                  alignment: Alignment.center,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.redAccent,
                    borderRadius: BorderRadius.circular(5),
                  ),
                ),
              )
            ],
          ),
        ),
   ));
}
```

Then call `registerCustomDialogUi` before starting the app in main.dart

```dart
void main() {
  setupLocator();
  setupDialogUi();
  runApp(MyApp());
}
```

We'll start the function by getting the `DialogService` and calling the `registerCustomDialogUi` on it. in the `registerCustomDialogUi` function you pass in a Function that accepts the `BuildContext` and a `DialogRequest` and returns a Widget. The parameters passed to the dialog request comes from calling the `showCustomDialog` function on the `DialogService` and passing in the values you want. This `dialogRequest` object is what you use to build your UI. There is a `customData` property which is of type dynamic. You can use this to pass an enum to your builder which will allow you to create different dialogs. Now open up the `DialogExampleViewModel` and call `showCustomDialog` in the showCustomDialog function

```dart
  Future showCustomDialog() async {
    var response = await _dialogService.showCustomDialog(
      title: 'My custom dialog',
      description: 'This is my dialog description',
      mainButtonTitle: 'Confirm',
    );
  }
```

If you run the code now you can can tap on the `showCustomDialog` button and you'll see the UI. You'll see the UI according to the styling of the dialog. If you look closely you'll see pieces of code like this `dialogService.completeDialog(DialogResponse(confirmed: true))`. This is what you should use to return a `dialogResponse` to your caller. The dialogResponse also takes in `responseData` which is a list of dynamic values that you can pass back to the caller. To drive home the custom dialog functionality we'll create an enum and switch on that to return a dialog that takes in text as well. We'll start by making a new folder called enums and create a file in there called dialog_type.dart

```dart
enum DialogType {
  Basic,
  Form
}
```

Then we'll move the BasicConfirmationDialog its own widget, still in the setup_dialog_ui.dart file.

```dart
class _BasicCustomDialog extends StatelessWidget {
  final DialogRequest dialogRequest;
  final Function(DialogResponse) onDialogTap;
  const _BasicCustomDialog({
    Key key,
    this.dialogRequest,
    this.onDialogTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Text(
            dialogRequest.title,
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 23),
          ),
          SizedBox(
            height: 10,
          ),
          Text(
            dialogRequest.description,
            style: TextStyle(
              fontSize: 18,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(
            height: 20,
          ),
          GestureDetector(
            // Complete the dialog when you're done with it to return some data
            onTap: () => onDialogTap(DialogResponse(confirmed: true)),
            child: Container(
              child: dialogRequest.showIconInMainButton
                  ? Icon(Icons.check_circle)
                  : Text(dialogRequest.mainButtonTitle),
              alignment: Alignment.center,
              padding: const EdgeInsets.symmetric(vertical: 10),
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.redAccent,
                borderRadius: BorderRadius.circular(5),
              ),
            ),
          )
        ],
      ),
    );
  }
}
```

Now that we have that done we'll create a function that takes in the `dialogRequest` and returns a widget based on the `customData` passed in.

```dart
Widget _customDialogUi(
  DialogRequest dialogRequest,
  Function(DialogResponse) onDialogTap,
) {
  var dialogType = dialogRequest.customData as DialogType;
  switch (dialogType) {
    case DialogType.Basic:
    default:
      return _BasicCustomDialog(
        dialogRequest: dialogRequest,
        onDialogTap: onDialogTap,
      );
  }
}
```

Then we can update the `setupDialogUi` function to use the new `_customDialogUI` function.

```dart
void setupDialogUi() {
  var dialogService = locator<DialogService>();

  dialogService.registerCustomDialogUi((context, dialogRequest) => Dialog(
        child: _customDialogUi(
          dialogRequest,
          (dialogResponse) => dialogService.completeDialog(dialogResponse),
        ),
      ));
}
```

Now to create the form dialog widget. To keep things simple we'll copy the `_BasicFormWidget` and just add a text field in it. We'll use flutter hooks to avoid using a stateful widget and get our controller from the useTextEdittingController hook.

```dart
class _FormCustomDialog extends HookWidget {
  final DialogRequest dialogRequest;
  final Function(DialogResponse) onDialogTap;
  const _FormCustomDialog({
    Key key,
    this.dialogRequest,
    this.onDialogTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var controller = useTextEditingController();
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Text(
            dialogRequest.title,
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 23),
          ),
          SizedBox(
            height: 20,
          ),
          TextField(
            controller: controller,
          ),
          SizedBox(
            height: 20,
          ),
          GestureDetector(
            // Complete the dialog when you're done with it to return some data
            onTap: () =>
                onDialogTap(DialogResponse(responseData: [controller.text])),
            child: Container(
              child: dialogRequest.showIconInMainButton
                  ? Icon(Icons.check_circle)
                  : Text(dialogRequest.mainButtonTitle),
              alignment: Alignment.center,
              padding: const EdgeInsets.symmetric(vertical: 10),
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.redAccent,
                borderRadius: BorderRadius.circular(5),
              ),
            ),
          )
        ],
      ),
    );
  }
}
```

Take note of the onTap where we construct the DialogResponse with the text from the controller. `DialogResponse(responseData: [controller.text])`. Now we can update the `_customDialog` function to add another case for the `Form` type.

```dart
Widget _customDialogUi(
  DialogRequest dialogRequest,
  Function(DialogResponse) onDialogTap,
) {
  var dialogType = dialogRequest.customData as DialogType;
  switch (dialogType) {
    case DialogType.Form:
      return _FormCustomDialog(
        dialogRequest: dialogRequest,
        onDialogTap: onDialogTap,
      );
    case DialogType.Basic:
    default:
      return _BasicCustomDialog(
        dialogRequest: dialogRequest,
        onDialogTap: onDialogTap,
      );
  }
}
```

And finally we can update our call in the `DialogExampleViewModel`.

```dart
  Future showCustomDialog() async {
    var response = await _dialogService.showCustomDialog(
      title: 'Please enter your password to confirm',
      mainButtonTitle: 'Submit',
      customData: DialogType.Form,
    );
    print('response data: ${response?.responseData}');
  }
```

This will now show the new form dialog and when you enter a value and press "Submit" you'll see it printed out in the ViewModel! how dope is that. You can manage all of your dialog needs, custom forms, fancy animated dialogs, add buttons, keep it simple, show images etc. All through that dialogRequest checking and building your widgets as you normally would. I hope that clears up the `DialogService` usage. I will be back with another tutorial soon!

Dane
