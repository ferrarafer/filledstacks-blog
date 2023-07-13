---
title: Flutter Developers, Stop Discussion State Management
description: What is the best state management in Flutter? It doesn't matter.
authors:
  - en/dane-mackier
published: 2023-07-07
updated: 2023-07-07
postSlug: flutter-developers-stop-discussion-state-management
ogImage: /assets/tutorials/089/thumbnail.jpeg
featured: false
draft: false
tags:
  - flutter-web
---

Today I’d like to present you with 5 different topics to discuss as a Flutter developer that is not related to state management.

<br>

The Flutter community has been stuck on state management since the beginning.

<br>

There are more important topics to discuss, that will have a bigger impact on your application’s architecture than state management.

<br>

### State management is a single small piece of an application’s architecture

The 5 topics we’ll discuss today is:

- Code file structure
- Navigation solution
- Layers of separation
- Dependency inversion solution
- Responsive UI building approach

Disregarding these topics can leave you with a code base that is difficult to maintain and scale into a team.

<br>

Simply thinking about these topics will push you toward making better decisions as your code grows during development.

## Code File Structure

Align your code file structure with the mental programming model of your application. File structure includes:

<br>

- File names: How you’ll name files and folders
- File groupings: What files are grouped together and under which folders
- File & Folder nesting: By nesting you create mental scopes in your project, which makes certain associations and file locations easier to remember.

<br>

When a decision on this is made, reinforce it during code reviews, and ensure there’s a basic guide in your readme that explains your final decisions and conventions you’ve chosen.

## Navigation Solution

Flutter comes with a raw navigation solution. It takes quite a lot of work to make it maintainable and scalable in your code. If you use the navigation solution as-is you end up with code that has mixed responsibilities, no separation between UI, state, and business logic, and a set of manual route definitions you have to maintain. When deciding on navigation solutions I decide based on 2 questions:

<br>

- Does it generate routes: As your application grows you’ll have more views, which means more route definitions. Those will also have constructor parameters and manually maintaining that takes a lot of time (believe me I’ve done it). I usually go for a navigation solution that generates all my routes.
- Can I invert the navigator dependency: I personally have to be able to abstract the navigation code from Flutter directly. Since navigation is such a key part of state and some business logic it’s important for me that it’s behind a service/interface that I can mock during unit testing. Therefore I need a way to easily invert the navigation dependency in my codebase.

## Layers of Separation

Layers of separation define where you draw lines in the architecture of your software. I keep things very simple and use the technical names of the code instead of new names. I have 4 layers in my code:

<br>

- UI: Code that renders what’s shown on screen (Flutter code)
- State: Code that decides what to render on screen (Pure dart)
- Business Logic: Code that sits in between the users action and final result (Pure dart)
- Application Logic: The code that does the final bits of work (http request, DB connection, etc)

Below is a graphic of how that might look when a user interacts with our system.

![view-viewmodel-relationship.png](/assets/tutorials/089/view-viewmodel-relationship.png)

## Dependency Inversion Principles

This is the most common principle I’ve come across in software architectures. The simple definition is, to get objects that your code depends on from outside of the object that needs it, instead of constructing it inside of the object. I [wrote an technical post about it](https://filledstacks.substack.com/p/the-1-required-pattern-for-flutter) that you can read to get a better definition of dependency inversion.

<br>

Failure to think about this almost guarantees that your code will not be unit testable, which indicates that it’s tightly coupled to its internals. This means that changes in code can have effects on other parts of the system that you cannot possible see a connection between.

Select the option you feel most comfortable with. Use my technical post above to guide you on the matter.

## Responsive UI Building Approach

Depending on how much attention you pay to your application’s design and appearance, you might have different designs for different screen sizes and even orientations. Choosing your responsive building approach is important. Basically there are 2 options and a hybrid that you can choose from.

<br>

- **Scaling:** This is when you take the design as it is and scale it to fit the screen that it’s on. It’s most common because it’s the fastest to implement and requires almost no additional work.
- **Per screen type layout:** This is where each screen type (mobile, tablet, desktop) has its own design. Some take it even further and create different designs per orientation as well.
- **Hybrid:** In this approach, you create a screen layout per design and scale certain parts of the UI to account for different sizes within the screen type. i.e. small mobile, medium mobile and large mobile devices.

By thinking through the 5 things mentioned above you can set yourself up for a good code base, and if you’ve already started with your code, these questions and ideas should point to you which topics you haven’t considered for your code base.

<br>

These topics are quite important to me, when I ran my agency I built a framework to easily set all this up in a few seconds which is publicly available for you to use. It’s called [Stacked](https://stacked.filledstacks.com/) it covers all the topics above and in combination with the [responsive_builder](https://pub.dev/packages/responsive_builder) package you’ll have the exact stack I used to build my large client’s applications.
