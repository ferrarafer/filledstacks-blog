---
title: How to plan for Product Development
description: This tutorial goes over the process a development team should take before writing code.
authors:
  - en/dane-mackier
published: 2021-07-11
updated: 2021-07-11
postSlug: how-to-plan-for-product-development
ogImage: /assets/tutorials/079/079.jpg
ogVideo: https://www.youtube.com/embed/UycSBMseHTE
featured: false
draft: false
tags:
  - boxtout
  - planning
# friendlyId: tutorial-079
---

Planning a feature for development is not exactly what you think. It's not with the purpose of knowing every single line of code you want to write, or even figuring out everything that might block you during the process. Planning a development feature is a process to help you:

- Understand your problem better
- Create a plan for development
- Set a goal so that you can know when to stop developing the feature.

All three of those points are extremely important when it comes to knowing what you can deliver in a certain amount of time.

Regardless of how many experienced software developers and project planning says that timeline estimates are guesses (with which I fully agree), they all still ask you for an estimate on how long it's going to take. So we might as well get better at our guesses.

In this tutorial we will go over the planning of a feature we (or you, if you want to contribute) need to implement in our BoxtOut application. The feature we are planning to build is "Location based results". In a food delivery service it's important to show the user only restaurants that are in their vicinity to ensure a speedy delivery of their food. We'll go through each of the points above and do concrete planning for the feature in those steps.

# Understanding your problem

It's absolutely crucial that you understand the problem you are trying to solve. Problem sometimes has a negative connotation so we can also phrase it as "Understanding your feature". There are different levels of information that you are privy too during the process leading up to this. At the point of development feature planning it's only technical and the actual problem / feature that matters. It's great if we know the business reasons and the impact it will have on our clients financials, but those problems were solved before we got to the technical development planning. Which is what this is.

The way that I break down a problem, which has been very successful, is by "walking through what we want to happen". Before we can do that, lets give a single user story to the feature.

**When a user opens the app they should see only restaurants close to them.**

That is the feature we're trying to build. At this point we can move on to the solutions portion.

## Exploring Solutions

We'll write down a minimum of 2 solutions. Beginners won't have these solutions stashed away in their heads so there's some research that'll have to go into this. More experienced developers can combine different tools / solutions from their past experience and using their engineering knowledge can come up with viable solutions. I will choose two known solutions to this problem and we can explore pro's and cons of them both.

### Divide restaurants into regions and return results per region

With this solution we place the merchant within a specific region. This will be determined by the lat/lng they enter when filling in their restaurant information. When a user enters their address in the app for delivery we figure out what region they're in and we'll return only restaurants for that region to the home / browse view.

**Pros:**

- Region system that will allow us to easily separate drivers / analytics / admin functions
- Less work to be done on the backend in terms of logic and time taken for query to return

**Cons:**

- Exclusion of restaurants that might be similar distance but not in the same region

### Return results based on a radius / minimum distance from the user

With this solution we don't care about regions. Each restaurant still stores their lat/lng and we use the basic distace between lat/lng points algorithm to get an "estimate" of how far it is. This will be done on the backend and we'll only return restaurants that are available to the user. The response from the backend will be amended and will contain the distance from the user's selected address to the restaurant.

**Pros:**

- Straight forward implementation
- Not affected by city borders

**Cons:**

- Backend to do calculations during the request which will extend the total request time
- Not very accurate. This means that a restaurant can say it's 10km's away but the path it has to travel to get to you is 18km's long. Which is almost double, and that's not very accurate.
- No way for a restaurant to determine if they want to show up for the "distance". Which is a concern to ensure that their ratings don't get pummelled by long delivery times

After laying our your two solutions it's time to talk to the senior in the team or the architect if you have 1 at your disposal. In our case we'll choose #1 . I think mentally it's easier to handle and we don't need a well defined, highly optimised algorithm to calculate the information we require. Now that we've determined our feature and have a solution to implement we need to come up with our development plan.

## Exploring Selected Solution

In this step we need to ensure that EVERY question we have is answered. These questions will arise as we walk through the implementation and find points that are not entirely clear at a high level. It's not to determine the implementation details. That will be done by the implementing developer. It's specifically to determine at a product architecture level:

- How things will interact
- Where the information / data will come from
- What the process will be for getting / surfacing this data to the user.

To make use of this functionality we know that the Merchants on the system has to be divided into regions. Here comes the first question: _How do we determine which region a merchant belongs to?_ This question falls into the 3rd part above. **What is the process to get this information**

### Determining the region a merchant belongs to

There are 3 options for this:

1. Given that Merchant onboarding will be an operations task and will have on the ground sales representatives to onboard a merchant. They should know the area well enough to place restaurants in certain regions manually. This means that we don't have to do any calculation or define region boundaries at this point.
2. We use the lat / long information supplied when creating the merchant and using google geocoding we figure out which region the merchant belongs too.
3. We use the city as the region

Out of the options above I choose #3. It's the easiest to implement and the most straight forward at the moment.

_How do we store the merchant on the backend? -_ This question holds a lot of merit on firestore. Lets go over the two options:

**Storing under single merchants collection**

With this option all merchants are stored in a single root merchants collection. Similar to our users.

**Pros:**

- All merchants available under single collection

**Cons**

- Difficult to find merchants for regions in the database
- Additional query required to get merchants for a region

**Store merchants under region collections**

In this option we have a root collection called `regions` under each region there will be a document with the id matching the `region` name. In side of that region collection we'll have merchant documents.

**Pros:**

- Easy to see in DB how many regions we have
- Easy to query for merchants in a region
- Easy to manage details per region if we have a details document in the region collection

**Cons:**

- Additional sub structure for Merchants even though it's a first party data member it'll be treated as a part of a region. Which is fine for our purpose.

With those laid out we'll choose _Store merchants under region collections._

This concludes our backend requirements from the perspective of the **Merchant region management** and we can move on to the feature from the perspective of the **Users region management.**

### Determining the region a user belongs to

When the user saves their address we want to assign that address to a region. _How will we determine a users region?_ Given the geocoding functionality that exists the easiest solution at this point is to use the city we're in as the region. This will make is quite easy to map against addresses / coordinate points that already exist. This means when the user saves their address we will take the city and save it as the region. Later on we can go lower to the town level if we need that level of accuracy.

# Create a Development Plan

At this point we 100% understand the solution for the functionality that we want. We've not talked about any code and if you understand basic parts of the product you should be able to read the above and get at least a vague idea of what needs to be done. At this point the development planning can start to ensure we have a plan that covers all the work required in addition to giving guidance to the QA team on what to test and how they should expect it to work. We'll start with the non-client work.

## Backend work

_What do we need in code to make this functionality work?_ at this point nothing. We'll insert the merchant with the information that we want and clients will query for a specific region. But for us to develop the region functionality in the client we need some data on the backend to test against. So there's going to be 1 task for backend work which is.

### ⬜ **Setup fake data for region merchant generation when running on emulator**

- Generate region for Cape Town (we'll to lower the address city from geoapi)
- In region for Cape Town add 10 merchants

## Front End work

Here we'll need quite a bit work to be done.

### ⬜ When selecting an address, if there's no merchants for address show user the feedback

- When selecting an address in the `AddressSelectionView` we will check the `regions` collection to see if a region exists.
  - If it doesn't exist we will show a "Not serviced yet" UI to the user
  - If it does exist we will navigate to the HomeView

You should always be mindful of work spawned from work that's being planned. Above we can see that we'll need a design for the "Not serviced yet" UI. For now we can probably use the dialog that we have in the designs. Which still spawns a new client task

### ⬜ Build the Custom Dialog UI based on Design System

- Create a Dialog Builder that produces the following result in a dialog

![Custom Flutter Dialog UI](/assets/tutorials/079/1.png)

- It should take in a title, description and main button title
- We should also be able to swap between the tick and a "close sign" cross in the top circle

### ⬜ When we get to Home show user the merchants from their region

- Make a query to firestore for `regions/$city` and list all the results returned as merchant listings
- The merchant listing should look as follows

![Flutter restaurant listing UI](/assets/tutorials/079/2.png)

- Add the merchant listing into the BoxUI package and make use of it in the customer app

# Define the end goal

For the functionality "Show Location Based Results" we are complete. What we need to be able to do by the end of this feature is:

- Select an address as a user
  - If that address is not serviced then show the user it's not serviced
  - If it is then navigate to the HomeView
- On the home view, the use should only see results for merchants that are in their city

That's it. We don't need to build the merchant details view yet, that is all we need to complete our feature and that is all that we will develop. We have our acceptance criteria, we know how to test it, we have our development tasks and now we can start writing the code.

I hope this was helpful, making a tutorial about planning takes longer to go through because I have to actually plan the feature as well while writing it. But this will also be a guide we'll use internally going forward.
