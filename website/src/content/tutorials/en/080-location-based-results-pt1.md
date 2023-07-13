---
title: Get results for user location - Part 1
description: This tutorial goes over checking users entered location and notifying them if we dont service the area.
authors:
  - en/dane-mackier
published: 2021-07-18
updated: 2021-07-18
postSlug: get-results-for-user-location-part-1
ogImage: /assets/tutorials/080/080.jpg
ogVideo: https://www.youtube.com/embed/yM4y83-sN6M
featured: false
draft: false
tags:
  - boxtout
  - location
  - firebase
# friendlyId: tutorial-080
---

In the previous episode we planned the feature for how we want to handle user based results. In this episode we'll implement the first part. This tutorial will go over checking if the address that's been selected by a user is serviced by boxtout.

# Overview

Since the planning I have updated the implementation task slightly. More details about it can be read [here](https://github.com/FilledStacks/boxtout/projects/1#card-64811511). When a user selects an address we will check if the area is serviced before we allow them to save the address. That's what we're tackling today.

If you want to follow along please [download the code here](https://github.com/filledstacks/boxtout). At the point of reading this the new branch will already be merged into main but you can update to the point before that and continue with the code.

# Implementation

The first thing that we need to do is decide if we're going to check if the address exists when selecting the auto complete result or when tapping to save the selected auto complete result. I think doing it when saving the auto complete result would be better. Otherwise you'll get a blocking experience every time the user selects an address from auto complete.

## Check if region is serviced using the city selected

For this we'll start with a unit test (of course). We want to confirm that "When selectAddressSuggestion is called, given a valid place with a city is returned, we should call isCityServiced on the firestoreApi with the city from the results"

```dart
test(
    'When saving address, should check if place is serviced on firestoreApi using the city from the details',
    () async {
  final firestoreApi = getAndRegisterFirestoreApi();

  getAndRegisterPlacesService(
      placesDetails: PlacesDetails(
    placeId: 'id',
    city: 'Test City',
  ));

  final model = _getModel();
  await model.selectAddressSuggestion(
    autoCompleteResult: PlacesAutoCompleteResult(placeId: 'id'),
  );

  verify(firestoreApi.isCityServiced(city: 'test-city'));
});
```

Next we can add the `isCityServiced` function to the `FirestoreApi` .

```dart
class FirestoreApi {
	...
	Future<bool> isCityServiced({required String city}) {
    return Future.value(false);
  }
}
```

Then we can re-run `flutter pub run build_runner build --delete-conflicting-outputs` to make sure the mock of `FirestoreApi` has the new function in it. At this point there are two things to implement before we can continue:

1. Converting any city coming in to match the required format lowercase hyphen concatenated i.e. Cape Town ⇒ cape-town
2. Implementing the functionality to check if a place is serviced

Lets starts with #1

### Convert city to document Id

For this will create an extension on the String property that we can call. We'll write a simple test for it to confirm it work. Create a new file under `test/extention_tests/string_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:customer/extensions/string_extensions.dart';

void main() {
 group('StringTest -', (){
   group('toCityDocument -', () {
    test('When called with "Cape Town" should return "cape-town"', () {
      final result = 'Cape Town'.toCityDocument;
      expect(result, 'cape-town');
    });
   });
 });
}
```

Then you can create a new file in `lib/extensions/string_extensions.dart`

```dart
extension StringHelpers on String {
  String get toCityDocument {
    return this.split(' ').join('-').toLowerCase();
  }
}
```

The format is simple. We split by space, join using `-` and then to lower everything. This will be our document id as well so we need to keep things consistent. That wraps up number 1. So lets get our original test to pass now.

### Implement city serviced check

Second thing to implement is the City service check on the firestore api. We planned to:

1. Keep a collection called regions
2. Each document in there will have the id of a city
3. Inside that document there will be a list of merchants as a sub collection

To us that means that to check if a place is serviced all we have to do is check if a document exits in the regions collection. Easy peasy. Open up the `FirestoreApi` and we'll add a new collection for regions and then check if the city document exists.

```dart
class FirestoreApi {
	final CollectionReference regionsCollection =
      FirebaseFirestore.instance.collection(RegionsFirestoreKey);
	...
	Future<bool> isCityServiced({required String city}) {
		log.i('city:$city');
    final cityDocument = await regionsCollection.doc(city).get();
    return cityDocument.exists;
  }
}
```

In `lib/constants/app_keys.dart` add a new key for regions.

```dart
const String RegionsFirestoreKey = 'regions';
```

Bet you didn't think region management could be that quick 😆. Now we can get back to our original mission and failing test. Check if if service exists when saving the address.

### Fix Original Failing Test

We know it's failing because we're not even calling the function so we'll update the `selectAddressSuggestion` function to check if the place is serviced after getting the place details.

```dart
/// Gets the details from the Places Api and saves it to the backend
  Future<void> selectAddressSuggestion({
    PlacesAutoCompleteResult? autoCompleteResult,
  }) async {
	  ...
      final placeDetails =
          await _placesService.getPlaceDetails(selectedResult.placeId ?? '');
      log.v('Place Details: $placeDetails');

      final city = placeDetails.city ?? '';

      final cityServiced =
          await _firestoreApi.isCityServiced(city: city.toCityDocument);
		...
  }
```

After adding this, if you run `flutter test` you'll see that a lot of tests fail. The reason for that is because we didn't stup the `isCityServiced` call so lets do that quickly. Open up the `test_helpers.dart` file and add the following code into `getAndRegisterFirestoreApi`

```dart
MockFirestoreApi getAndRegisterFirestoreApi({
  bool saveAddressSuccess = true,
  bool isCityServiced = true,
}) {
  _removeRegistrationIfExists<FirestoreApi>();
  final service = MockFirestoreApi();

  when(service.isCityServiced(city: anyNamed('city')))
      .thenAnswer((realInvocation) => Future.value(isCityServiced));

	...
}
```

If you run flutter test now you'll see that all tests pass, so our new test is there covering if we're checking for serviced city. Now we need to add the test to ensure that when city is not serviced we:

1. Show the user a dialog explaining what happened
2. Ensure the address doesn't get saved
3. Ensure the busy state is reset

### Show dialog when city not serviced

The test for this functionality looks like this.

```dart
test(
    'When saving address and place is not serviced, should show user a dialog with not serviced details',
    () async {
  final dialogService = getAndRegisterDialogService();
  getAndRegisterFirestoreApi(isCityServiced: false);

  final model = _getModel();
  await model.selectAddressSuggestion(
    autoCompleteResult: PlacesAutoCompleteResult(placeId: 'id'),
  );

  verify(dialogService.showDialog(
    title: CityNotServicedDialogTitle,
    description: CityNotServicedDialogDescripton,
  ));
});
```

Open up the app_strings file and add the following two new consts in there.

```jsx
const String CityNotServicedDialogTitle = 'We don\'t service this area';
const String CityNotServicedDialogDescription =
    'At the moment we do not service your area. Please select a different address. If you want to see our serviced cities please select "View serviced areas" below.';
```

To get this test to pass we check if cityServiced is false and then we show a dialog.

```jsx
if (!cityServiced) {
  await _dialogService.showDialog(
    title: CityNotServicedDialogTitle,
    description: CityNotServicedDialogDescripton,
  );
}
```

### Make sure the address doesn't get saved

The test for this is quite simple. We want to verify that we never call saveAddress with anything on the firestoreApi.

```jsx
test(
    'When saving address and place is not serviced, should not call saveAddress on the FirestoreApi',
    () async {
  final firestoreApi = getAndRegisterFirestoreApi(isCityServiced: false);

  final model = _getModel();
  await model.selectAddressSuggestion(
    autoCompleteResult: PlacesAutoCompleteResult(placeId: 'id'),
  );

  verifyNever(firestoreApi.saveAddress(
    address: anyNamed('address'),
    user: anyNamed('user'),
  ));
});
```

And the code to make that pass is simply to put the rest of the code in the function into the else part besides the setBusy(false) line.

```jsx
if (!cityServiced) {
  await _dialogService.showDialog(
    title: CityNotServicedDialogTitle,
    description: CityNotServicedDialogDescripton,
  );
} else {
  final address = Address(
    placeId: placeDetails.placeId!,
    lattitude: placeDetails.lat ?? -1,
    longitute: placeDetails.lng ?? -1,
    city: placeDetails.city,
    postalCode: placeDetails.zip,
    state: placeDetails.state,
    street: placeDetails.streetLong ?? placeDetails.streetShort,
  );

  final saveSuccess = await _firestoreApi.saveAddress(
    address: address,
    user: _userService.currentUser,
  );

  if (!saveSuccess) {
    log.v('Address save failed. Notify user to try again.');
    _dialogService.showDialog(
      title: AddressSaveFailedDialogTitle,
      description: AddressSaveFailedDialogDescription,
    );
  } else {
    log.v(
        'Address has been saved! We\'re ready to show them some products!');
    _navigationService.clearStackAndShow(Routes.homeView);
  }
}
```

And that's our entire implementation to check if a users city is serviced. To test this out we'll need some regions on the emulator.

## Setup Fake Data for Regions

In the `src/backend` folder of boxtout you can open up the `functions/src/system/fakeDataPopulator.ts` file. And we'll add a new function called `generateRegions`.

```jsx
private async generateRegions() {
  log('generateRegions');

  await this.firestoreDatabase.collection('regions').doc('cape-town').set({});
}
```

and we can call that in the `generateFakeData` function.

```jsx
async generateFakeData() {
  log('generateFakeData');

  const generateDocument = await this.getGenerateDocument().get();

  if (!generateDocument.exists) {
    await this.createGenerateDocument();
    await this.generateMerchants();
    await this.generateRegions();
  }
}
```

we're not generating everything right now. Just enough to test the region check. So we know when running with the emulator we should only be able to select an address within the city of Cape Town. Start up the backend in the emulator using `firebase emulators:start` and then we'll run the mobile customer app with `USE_EMULATOR` set to true and we'll select a location not in Cape Town. Like 20 Solstice street, Umhlanga and we'll see the following.

![Area not serviced dialog](/assets/tutorials/080/1.png)

And when we select an address in Cape Town like Waterfront Victoria we'll get sent to the home view. So we have user location validation complete!
