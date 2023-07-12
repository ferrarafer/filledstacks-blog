---
title: Form Validation in Flutter for Beginners
description: Flutter Form Validation Tutorial that covers the basics of Form Validation in a simple form.
authors:
  - en/dane-mackier
published: 2019-06-03
updated: 2019-06-03
postSlug: form-validation-in-flutter-for-beginners
ogImage: /assets/snippets/020/020.jpg
featured: false
draft: false
tags:
  - flutter
  - foundation
  - forms
# friendlyId: snippet-020
---

Validating forms is a common practice in all digital interactions, mobile apps are no different. Today we'll be building a very simple form validation to show you how this is done in Flutter.

## Overview

Flutter provides us with a Form widget. You can build up your child of the widget how you want and just add TextFormField widgets to make it apart of the form. Any TextFormField in the Form child widget will become a field in the Form that you can work with. Each form has to be given a key of type FormState that allows you to access the state at any time.

## Implementation

We'll make a form that takes in a name, a number and an email and we'll validate all of them. We'll start off with a basic project and just add a statefull HomeView under the main app.

```dart
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
       home: HomeView());
  }
}

class HomeView extends StatefulWidget {
  @override
  _HomeViewState createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container()
    );
  }
}
```

For the Body of the Scaffold we'll add a Form and in the Form we'll add a empty Column. We'll also provide the Form with a key that we can use to check the state and ask the form to save.

```dart
class _HomeViewState extends State<HomeView> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Form(
        key: _formKey,
        child: Column(children: <Widget>[

        ]),
      )
    );
  }
}
```

That's all the setup done. Lets add our first Field. We'll start with the name. In the Column add a TextFormField widget, give it a keyboard type of text and a validation function. For validation we'll just check if the name is less than 2 characters and show a validation error if it is. In the validator function when you return a string it will take it as a validation error message. If you return nothing then there will be no error.

```dart
...
 Widget build(BuildContext context) {
    return Scaffold(
      body: Form(
        key: _formKey,
        child: Column(children: <Widget>[
          TextFormField(
            decoration: const InputDecoration(labelText: 'Name'),
            keyboardType: TextInputType.text,
            validator: (value) {
              if(value.length < 2){
                return 'Name not long enough';
              }
            },
          ),
        ]),
      )
    );
  }
...

```

If you type in the field you'll see no validation messages come up. This is because the form does not auto validate. To enable this set the autovalidate value to true for the enclosing Form widget.

```dart
Form(
  autovalidate: true,
  key: _formKey,
  child: Column(children: <Widget>[ ... ]),
);
```

With this enabled you will now get validation ON ALL FIELDS, every time you type a character. Next we'll get and save the form data when the user is ready. Add a FloatingActionButton that checks if the form is valid using the key and then calling save if it is.

```dart
...
return Scaffold(
 floatingActionButton: FloatingActionButton(
  onPressed: () {
      if(_formKey.currentState.validate()) {
        _formKey.currentState.save();
      }
    },
  ),
...
);
```

When this function is called on the currentState it triggers a callback on ALL TextFormFields called onSaved. This function returns the current text in the field. We'll use this to save our data into a variable and then we can use it after the save call. Add the onSaved callback to your TextFormField.

```dart

// Add name variable to the class
String _name;

...
 TextFormField(
    decoration: const InputDecoration(labelText: 'Name'),
    ...
    onSaved: (value)  => _name = value,
 );
```

That's everything you would need to build out a text form. Now we can duplicate and update validation for the other fields. Lets do email next.

```dart
 TextFormField(
    decoration: const InputDecoration(labelText: 'Email'),
    keyboardType: TextInputType.emailAddress,
    validator: (value) {
      if (!EmailValidator.validate(value)) {
        return 'Please enter a valid email';
      }
    },
  ),
```

The validation will be done using the EmailValidator package so add it into your pubspec.

```yaml
email_validator: ^1.0.0
```

Then lastly we can add our phone field.

```dart
TextFormField(
    decoration: const InputDecoration(labelText: 'Mobile'),
    keyboardType: TextInputType.phone,
    validator: (value) {
      var potentialNumber = int.tryParse(value);
      if (potentialNumber == null) {
        return 'Enter a phone number';
      }
    },
  ),
```

We'll check if it's a number, if it's not we'll show the message. Make sure to set the keyboardType to phone.

That's it for form validation. All you have to do is set the values for each field on the onSave function like with `_name`. Checkout all the [other snippets](/snippets) here. You might find some more Flutter magic.
