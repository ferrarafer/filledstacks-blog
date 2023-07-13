---
title: Setting up Firebase Emulator data with Faker
description: Setting up your firebase emulator with some fake data to help increase your client development speed.
authors:
  - en/dane-mackier
published: 2021-06-13
updated: 2021-06-13
postSlug: setting-up-firebase-emulator-data-with-faker
ogImage: /assets/tutorials/077/077.jpg
ogVideo: https://www.youtube.com/embed/beJrxf7ebJg
featured: false
draft: false
tags:
  - stacked
  - boxtout
# friendlyId: tutorial-077
---

When developing an application you're usually dependent on the data you have available to interact with. When we're just starting out we have no real data to depend on for our development. There are two ways to handle this.

1. Use abstraction in your client and provide the required data. This is a method that I've shown in my abstraction to improve development speed tutorial
2. Populate your backend with Fake Data. Here we check if we're running on the emulator and if we are we prepopulate the database with the information that we want.

In this tutorial we'll be covering #2 and setting up our local development suite.

# How will we do it?

We'll use the popular faker.js package to get fake data so we don't have to generate it. Faker will provide you with values for certain properties like names, dates, product names, ratings etc. We will then use this to populate our database based on what we want to start building in the app. We don't need to populate the reviews because we don't even have any products to show.

# What do we need?

Lets take a look at the UI we want to build and then determine what we need at minimum to develop majority of the functionality.

![Restaurant Listing UI](/assets/tutorials/077/restaurant-listing.png)

![Restaurant Product UI](/assets/tutorials/077/product-listing.png)

Based on the designs we can see that we need to list some restaurants with their images and also some products with their data associated. Lets go over the actual data required to be populated.

## Data Population

Based on our planning we know how our collections will work. We documented it all in the [BoxtOut Wiki](https://github.com/FilledStacks/boxtout/wiki). We know we'll have a `Merchant` model and associated collection. Lets cover the data we want based on the designs above

### Merchant

- Name
- Image
- Categories: This will be the cuisines for the food delivery version
- Rating
- Number of Ratings

### Product

- Name
- Description
- Image
- Category: Singular because we'll put it under a grouped list for that category
- Price: Integer in cents

With the models above faked we'll be able to start building our UI for fetching and showing Merchants and products. Now that we have that lets do the faking!

# Implementation

Open up your `index.ts` file where we will add some code to check if we're running on the emulator. We'll put the below before we do the export of the functions.

```jsx
if (process.env.FUNCTIONS_EMULATOR) {
  console.log("We are running emulators locally.");
}
```

Just as a sanity check run `npm run build` and then `firebase emulators:start` in your functions folder. You should see the logs printed out. now lets move on to the faking.

## Setting up the Fake Data

We'll start off by installing `faker`

```jsx
npm i faker
```

Then we can go ahead and start or faking setup. We'll use a class that will generate everything for us. We'll call it `FakeDataPopulator`. Create a new folder under `functions\src\` called `system` and inside create a new file called `fakeDataPopulator.ts`

```jsx
import { firestore } from "firebase-admin";

// enable short hand for console.log()
function log(message: string) {
  console.log(`FakeDataPopulator | ${message}`);
}

/**
 * A class that helps with populating a local firestore database
 */
export class FakeDataPopulator {
  /**
   * The database to populate
   */
  firestoreDatabase: firestore.Firestore;

  constructor(firestoreDatabase: firestore.Firestore) {
    this.firestoreDatabase = firestoreDatabase;
  }

  generateFakeData() {
    log("generateFakeData");

    this.firestoreDatabase.collection("merchants").add({
      name: "I am first merchant",
    });
  }
}
```

It takes in the firestore db we want to modify and have a generateFakeData function to call. To test out everything is in order we will construct and call this class in the index file when when we're running on the emulator.

```jsx
...
import admin = require("firebase-admin");
import { FakeDataPopulator } from './system/fakeDataPopulator';

// Initialise the admin functionality for the firebase backend
admin.initializeApp();

const firestoreDatabase = admin.firestore();

if (process.env.FUNCTIONS_EMULATOR) {
  console.log('We are running emulators locally.');

  const populator = new FakeDataPopulator(firestoreDatabase);
  populator.generateFakeData();
}

```

Build your code and start the emulators. When you open up the firestore ui for the emulator you'll see that we have 1 entry in the `merchants` collection. Success! BUT 🍑 there's some other setup needed to make this an ideal situation.

## Avoid duplicate generated data

At the moment when you change any of the files it'll reload and therefore "re-generate" the data thus inserting the same data again. We don't want that. _Note: If you're only going to run the emulators and not change anything in any of the files then you don't need to worry about this step since your code won't hot reload._

We'll solve the issue by adding something in the database we can easily check before generating data. We'll create a collection called data and inside we'll have a document called generate. If that document exists we don't generate. If it doesn't we do generate. In the `FakeDataPopulator` we'll create a private function to get the document reference. We'll then use that function to get the document before we generate anything, if it doesn't exist we'll first create the document and then we'll go through our generate logic.

```tsx
async generateFakeData() {
  log('generateFakeData');

  const generateDocument = await this.getGenerateDocument().get();

  if (!generateDocument.exists) {
    await this.createGenerateDocument();

		// Generate the rest of the data
    this.firestoreDatabase.collection('merchants').add({
      'name': 'I am first merchant'
    });
  }
}

private getGenerateDocument(): firestore.DocumentReference {
  return this.firestoreDatabase.collection('data').doc('generate');
}

private async createGenerateDocument(): Promise<void> {
  log('createGenerateDocument');
  await this.getGenerateDocument().set({});
}
```

This this update you can now save, modify your firebase files and it won't add duplicate date into your db.

## Generating Merchants

Now it's time to generate some data! We'll start by generating the `merchants` we know the 5 properties that we want to generate so we'll use the closes matching faker functions we can get and use those. We'll start by creating a function to create the `merchant` document for us.

```tsx
private async createMerchantDocument(merchant: any) {
  await this.firestoreDatabase.collection('merchants').add(merchant);
}
```

Then we'll add another function that will have a loop and generate 30 merchants for us. We'll start by importing faker and the we'll write the function.

```tsx
import * as faker from 'faker';

...

private async generateMerchants() {
  log('generateMerchants');

  for (let index = 0; index < 30; index++) {
    let merchant = {
      'name': faker.commerce.productName(),
      'image': faker.image.imageUrl(640, 640, 'food'),
      'categories': [
        faker.commerce.department(),
        faker.commerce.department()
      ],
      'rating': faker.datatype.float(2),
      'numberOfRatings': faker.datatype.number(200),
    };

    await this.createMerchantDocument(merchant);
  }
}
```

We won't get totally accurate products for our cause but we don't need it to be accurate, we need the data. So for name we use productName, images of food for food, categories will fall in deparment, rating a number between 0 and 5 and nummber of ratings a number between 0 and 200. Then we use the `createMerchantDocument` function to create it. We can then use the function

```tsx
async generateFakeData() {
  log('generateFakeData');

  const generateDocument = await this.getGenerateDocument().get();

  if (!generateDocument.exists) {
    await this.createGenerateDocument();
    await this.generateMerchants();
  }
}
```

And that's the process we'll follow for now. As we need more variable data (in the future, not this video) then we'll update our data generator for those scenarios. Test out the code by building and then starting the emulators. You'll see in your firestore UI that you have 30 merchant entries.

## Generating Products

The next collection we need to generate is a subcollection within the merchant. This is the merchant's products. Lets create another function called `generateMerchantsProducts`. This function will require the merchantId to generate so we'll also modify the `createMerchantDocument` to return the id of the document it just created.

```tsx

private async createMerchantDocument(merchant: any): Promise<string> {
  let documentReference = await this.firestoreDatabase.collection('merchants').add(merchant);
  return documentReference.id;
}
```

Then we can use the returned value in the `generateMerchants` function and call the new function using that id.

```tsx
private async generateMerchants() {
		...
    let merchantId = await this.createMerchantDocument(merchant);
    await this.generateMerchantsProducts(merchantId);
  }
}
```

This new function will be the same as the merchant one with the added fact that we're first going into the merchant collection then store the new collection in one of the merchant documents.

```tsx
private async generateMerchantsProducts(merchatId: string) {
  log(`generateMerchantsProducts merchatId:${merchatId}`);

  for (let index = 0; index < 30; index++) {
    let product = {
      'name': faker.commerce.productName(),
      'description': faker.lorem.paragraph(2),
      'image': faker.image.imageUrl(640, 640, 'food'),
      'category': faker.commerce.department(),
      'price': faker.datatype.number(8999),
    };

    await this.createMerchantProduct(merchatId, product);
  }
}

private async createMerchantProduct(merchantId: string, product: any) {
  await this.firestoreDatabase.collection('merchants').doc(merchantId)
				.collection('products').add(product);
}
```

If you run the code now and build you should see that all merchants has 30 products underneath it with data in there.

And that's all we'll do for now. This will ensure that you have data to develop against. In the next video we'll set up the Flutter mobile apps to make use of the emulator and then we can start interacting with the db.
