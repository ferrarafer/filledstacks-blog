---
title: How to Unit Test in Flutter
description: In this tutorial we go over unit testing, what it is and how to use it.
authors:
  - en/dane-mackier
published: 2020-06-07
updated: 2020-06-07
postSlug: how-to-unit-test-in-flutter
ogImage: /assets/tutorials/051/051.jpg
ogVideo: https://www.youtube.com/embed/n21w5T3jdWE
featured: false
draft: false
tags:
  - stacked
  - provider
  - testing
# codeUrl: https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F051%2F51-starting.zip?alt=media&token=0931cbec-031d-4eb4-a3f5-4407cc938b86
# friendlyId: tutorial-051
---

This tutorial will be an intro into Unit testing much like my services tutorial was an intro to the single responsibility principle. It's a very deep and vast set of knowledge which comes from years of practice. In this tutorial I will cover the basics of unit testing, how I think of it, how we use it in production with some concrete examples. This will be broken into two parts, basics of unit testing and then services and mocks for production unit testing.

<br>

## What is Unit Testing?

Unit Testing is a form of testing where you write code to test the smallest testable part of your Software. It has some inputs and usually 1 output or result. It is the foundation of the testing pyramid and should contain the largest coverage and volume of tests given a set of functionalities and your definition of a unit. The same way that there's arguments about what defines a Single Responsibility there are also arguments around what defines a Unit to test. This tutorial is my interpretation.

## What is a Unit?

Well, here we get into a territory where the answer is a mix of personal opinion (i know those are dangerous in development) and situational awareness. The situation being your code base and it's intention. I write unit tests to confirm the code that's expected to do something does the thing. Every part of it, and sometimes what it should not do. The code is written (mostly) in isolation (Unit testing in solidarity) and assumes everything else besides that unit of work works 100% without bugs. So what is a unit of work? Lets go over a list of things I go through to define the tests I write, this can be for a function a property on a class, an entire service or an entire ViewModel.

- **Testing an assumption**: There are multiple things we assume when calling a function or a property. This can be a check to confirm something is not null, a certain value is set when we get to a certain point, a function has been called before you get here, etc.
- **Testing a state**: After calling THIS function what is the state of the object being tested. Confirm it's the exact state you want it to be. This can be the case for multiple actions as well as a single action.
- **Testing an interaction**: When I call THIS function on my ViewModel does it call THIS function on my service. These seem silly but they serve an important role of documenting interaction between services.
- **Testing conditionals**: When calling this function, if the value is X call service Y with X+2 etc.
- **Testing error handling**: Given I call this function should throw exception with this value. Given I get an exception we should call show dialog and inform the user.
- **Testing how our code reacts to values from services**: This is where the mocks come in, given the api returns this result, check that the state is correct, or a function was called.

A lot of the points above overlap, actually all of them overlap but they're meant to serve as a guide for those starting out that cannot define a unit of work to test. The next thing we have to talk about is the unit test structure.

## What do we unit test

We unit test the ViewModels and the services. If the service is wrapping another libraries functionality we assume 100% test coverage on their side and don't test their library functionality. We can test our assumptions to confirm that it at least does what we want it to do, but we won't test the full library. Services that perform actual work like fetching info using the API, saving to a database, the implementations of these services will be unit tested as well. ViewModels should ALWAYS be testable, that's why there should never be any UI code in a ViewModel. No controllers of any kind, definitely no widgets. That's all UI code that relates to the context which doesn't belong in the ViewModel.

## Unit test anatomy

Unit tests should be helpful, it should help you highlight problems down the line and provide a safety net for you to fall in when any new bugs are introduced. It serves a dual purpose of documenting expectations and functionality and ensuring easier regression testing when changing your code. If your unit tests pass it means everything you wrote up to that point, all your assumptions still holds true. Whether that is the fact that a function was called before another or if a value is not null at a certain point. For that reason it's important to talk about the anatomy of a unit test, starting with the naming.

### Naming a Unit test for readability

There's a naming convention that I've been following since my start in unit testing which helped quite a lot. This ensures that when reading your unit test results you know what it's for and what it's accomplishing. It's long and wordy, but that's the point of it. There are 4 things that it has to satisfy to be an acceptable name. We all \*_sarcastic voice_\* know how easy it is to name things \*_sarcastic voice_\*. Lets go over the naming points to consider in Order of how they re added into the name.

- We need to know what class is being tested, file name if you're functional.
- We need to know what function is being called, or which property is inspected
- We need to you HOW the function was called, with which values (if appropriate) or with which assumptions, if any.
- We need to know what to expect as a result

When running unit tests in the IDE or command line this is and example of what you'll see.

```
ProductDetailsViewModel Tests - updateProduct - when called and updateCartProduct is successful, should call back on navigationService and pass the result
```

Reading that you can probably make out what the unit test looks like.

```dart
 test(
      'when called and updateCartProduct is successful, should call back on navigationService and pass the result',
      () async {
        // Setup
    var navigationService = getAndRegisterNavigationServiceMock();
    var cartProduct = getCartProduct();
    var model = ProductDetailsViewModel(
      product: getProduct(),
      selectedProduct: cartProduct,
    );
    model.increaseQuantity();
    model.increaseQuantity();

    // Action
    await model.updateProduct();

    // Result
    verify(navigationService.back(result: true));
  });
```

Now you might also notice that the unit test doesn't have the full name as I described. That's because we create test suites to make up the full name. This test is in the following group structure.

```dart
 group('ProductDetailsViewModel Tests -', () {
   group('updateProduct -', () {
      test(
          'When called should call updateCartProduct with cart product and updated data',
          (){

      });
   });
 });
```

All the tests in the updateProduct test suite will have `ProductDetailsViewModel Tests - updateProduct -` prefixed to its name. This allows you to read the tests for each class and each function / property clearly. The second part of the unit test anatomy is the structure.

### Unit Test Structure

When writing a unit test there's s certain structure to follow. Arrange, Act, Assert. Or in normal english, Setup, Action, Result. In the setup portion of the unit test you construct the object you're testing (if any) in the action you perform or call the function you want to test and in the result section you check your expectations or assumptions are correct. This holds true for all unit tests I've written. In some cases Action and Result is merged like when testing for exceptions being thrown. This is how a normal unit test will look in Flutter in one of my code bases.

```dart
test('Given a paged query result, return PaginatedQuery as query type',
          () {
  // Setup - Arrange
  var parser = GraphQLResponseParser();
  // Action - Act
  var result = parser.determineQueryType(addressResponse['data']);
  // Result - Assert
  expect(result, GqlResultType.PaginatedQuery);
 });
```

This allows you to mentally separate the test code into sections making it more readable. I don't put the comments in my test like it is above but I mostly separate those sections at least by 1 new line for readability. Onto writing some unit tests for a ViewModel we have in the code base and see how to run them, check when they fail and view results.

## Writing Unit tests

In a flutter project, in every project a test folder is created. The dart code plugin will automatically pick up tests in this folder if the file name ends in \_test.dart and you run the flutter test command. [Download the starting project](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F051%2F51-starting.zip?alt=media&token=0931cbec-031d-4eb4-a3f5-4407cc938b86) and I'll show you my basic setup for Flutter tests.

### File placement and naming

Under the test folder I have additional folders that match my lib file structure. Not completely but it handles the main things. Create a folder called service_tests where the services tests will go. Create a folder called viewmodel_tests where the `ViewModels` tests will go. Then create another folder called setup. In the setup folder create a new file called test_helpers.dart and test_data.dart these files will contain the mocks and fakes + their setup functions that will keep your tests readable.

### Determining and Writing a Unit test

Under the viewmodel_tests folder create a new file called validation_example_viewmodel_test.dart. Inside we'll setup the basic test setup for each file. [Here](https://gist.github.com/FilledStacks/b57b77da10fdcb2d4d95a28de4a4ced4) you can find the snippet I use to generate this code and start off the unit tests. Take this file, copy all the content. Press ctrl+shift+p and type snippets. then type or create dart.json and paste the contents of the snippets in there. Lets start with the first test.

<br>

**When constructed canSubmit should be false** - _Testing an assumption_

We want to ensure that when we land on the view and no values are preset that can save is false. Use the `testm` snippet to generate the following.

```dart
void main() {
 group('ValidationExampleViewmodelTest -', (){

 });
}
```

Inside of that use the test `testg` snippet to generate the group with a single test. The group description will be the property we're testing and the test description will be the title above. Your file should now look like this.

```dart
void main() {
  group('ValidationExampleViewmodelTest -', () {

    group('canSubmit -', () {

      test('When constructed canSubmit should be false', () {
        var model = ValidationExampleViewModel();
        expect(model.canSubmit, false);
      });

    });
  });
}
```

If you have the Dart Code plugin installed you'll see the run and debug options above your tests and group that's provided by codelense. You can click on run or you can run `flutter test` to confirm that this test is passing. Onto the next tests. Since this will be a real time validation we have exposed three different functions to set each data field individually.

<br>

**When setName is called and no contact is set, should be false** - _Testing a state_

Use the single test snippet, `tests`, to generate the new test and we'll call setName before checking the state.

```dart
test('When setName is called and no contact is set, should be false', () {
  var model = ValidationExampleViewModel();

  model.setName('FilledStacks');

  expect(model.canSubmit, false);
});
```

This should still return false because no email or mobileNumber is supplied. We'll showcase 1 more test then I'll go over all the units I have identified as worth testing for this set of functionality and the rule(s) they fall under.

<br>

**When setName is called and valid email is set, should be true** - _Testing a state_

```dart
test('When setName is called and valid email is set, should be true', () {
  var model = ValidationExampleViewModel();

  model.setName('FilledStacks');
  model.setEmail('dane@tester.com');

  expect(model.canSubmit, true);
});
```

That's basically how you unit test, after the fact. I actually wrote this functionality using TDD so all the unit tests can be [seen here](https://github.com/FilledStacks/stacked-example/blob/part-4-unit-testing-1/test/viewmodel_tests/validation_example_viewmodel_test.dart). As an exercise for you I'll write down some units of work you can write that will provide more feedback for any of the critical parts of this unit of work that causes a bug.

- When setName is called and invalid email is set, should be false
- When setName is called and valid mobileNumber is set, should be true
- When setName is called and mobileNumber is set invalid, should be false
- When setName is called should notifyListeners to rebuild UI
- When setEmail is called should notifyListeners to rebuild UI
- When setMobileNumber is called should notifyListeners to rebuild UI
- When name is set to null should return false (throws exception currently)
- When email is set to null should return false (throws exception currently)
- When mobileNumber is set to null should return false (throws exception currently)

New group: validMobileNumber mark with @visibleForTesting to ensure not called outside of tests.

- Given number with 2 digits should return false
- Given number with 1 digit should return false
- Given number with more than 3 digits return true

Do the same for the name validation. With those tests there's no line of code you can change in the viewmodel that won't break a test. It's 100% coverage. Since I'm back in the unit testing game I'm struggling to work in some of the older code bases before I introduced ViewModel tests again so I'll be going through my old code and creating all the unit tests for all the ViewModels in my spare time.

<br>

The next tutorial will go over Mocking and setting up unit testing for ViewModels that use services. Thank you for reading. I hope that was helpful.

<br>

Dane
