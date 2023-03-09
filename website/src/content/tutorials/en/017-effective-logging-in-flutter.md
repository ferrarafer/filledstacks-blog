---
title: Flutter Logging - a Guide to use it effectively
description: A tutorial that gives direct guidelines for Logging and how to keep it effective.
authors:
  - en/dane-mackier
published: 2019-07-05
updated: 2019-07-05
postSlug: flutter-logging-a-guide-to-use-it-effectively
ogImage: /assets/tutorials/017/017.jpg
ogVideo: https://www.youtube.com/embed/c5CwHXj21xw
featured: false
draft: false
tags:
  - flutter
  - logging
  - debugging
relatedTutorials:
  - en/020-future-basics
  - en/026-stream-basics
---

In this tutorial we will cover how to effectively log in your application to help debug and improve your long term maintenance. This tutorial will not cover logging to a file or logging to a remote service. The strategies / ideas behind this tutorial can be applied to any logging library so the location of the logging is irrelevant for this topic. We are only focussing on logging in a manner that provides useful feedback and insights into what's happening in your application.

## Motivation

When something goes wrong, or you're adding a new feature and suddenly somethings aren't working as it should, you want to have a history of everything that happened up until that point. This will give you a better change to figure out what caused the problem without having to debug. I confess that I don't know what the software engineering guides are to logging. This tutorial will detail the rules I follow based on the apps that I've built as well as apps that I frequently maintain and update. It's what has consistently provided me with an easy journey during the testing / bug fixing phase.

## Logging Guidelines

Lets go over when, what and how I log to expose potential bugs that may creep in. First thing's first, you need to have logging levels. That's not even a guideline, that's a given. Without having logging levels you'll end up with a mess that makes it even harder to debug. With that said lets get onto the guidelines.

There are a few hard rules that I follow and then there are a few that will depend on the situation and what you consider to be important. Lets start with the basics.

#### Determine the path your user takes through your code (INFO)

If you adopt any one of these logging suggestions this one would be at the top of my list. One quick way you can determine the path your code is running is by placing a log at the start of every public function logging it's name and the parameters passed to it.We'll use the format "[methodName] | parameterName: value" This log should be an info log. Given you separated your code properly, like in [this tutorial](/post/flutter-architecture-my-provider-implementation-guide) there should be a clear public api within your code base that can detail to you everything that happened. Following these calls will show you how your user is moving through the app and what they're doing. This includes your navigation, so it's good to setup a singular point of navigation [like this](/post/flutter-navigation-cheatsheet-a-guide-to-named-routing) where you can log the requested path with the arguments.

In addition to the info logs you can go one step further and add `debug` logs to private functions that these public calls make use of and log their parameters as well. When you start implementing your app like this you'll see that in time you'll be able to tell when something is wrong given the path your code was "supposed" to take.

#### Warn yourself (WARNING)

I've found that warnings are more helpful than errors. You want to give yourself as many chances to figure out where something is going wrong to help determine the cause of a problem, if it results in the worst. A Crash. Certain exceptions you can handle and recover from, you can even finish your intended tasks for the user, but others you can't. You should log a warning when something has not happened as expected. Not things like user input errors. More along the lines of when your app expects something, and it's not there or it's not in the form you need it to be. Expected a certain type of response, expected a value to already be on disk by the time you enter a function or expecting the data to be in a certain format when you start processing it. All of these should be warnings because all of these will lead to nulls being passed around somewhere, which can end up in a crash. If you warn yourself all the way down the line you can trace the origin and fix it before even setting any breakpoints.

#### Don't log the Exception, Explain the errors or potential reasons for it (ERROR)

While you're developing you have the most knowledge of what's going on and what's causing the problems. When you get any exceptions log it specifically using the Exception type that was thrown and put a specific message. If the error is thrown because of an argument passed in then log the error with the potential cause message, and print out the arguments. Make it contextual. If it helps you, print out the stack trace as well. Try and limit it to the last 5 calls. If you followed the rules above you should be able to follow the code up until the error occurred.

#### External communications (DEBUG)

Networking is important, but not important enough to warrant a full info log with all it's information. The public rule above will cover the basic logs for the API class which will log the url you're using and the parameters of the request. What we won't log using info is things like the headers and the response body. That we'll put as a debug log. Try to direct all your requests through a single function where you can debug log the request packet as well as the response packet. Headers and body.

#### Internal workings (VERBOSE)

This is where you can log the inner workings of your application. When you're parsing something that needs to be converted and used in a critical part of the app, verbose log the input of the parsing value as well as the output. These won't show during debug and you'll have to specifically enable it during your app run to make sure you see all the logs. If you're placing values on a stream and it's required down the line for processing or functionality then log every time you add a new value to your controller using a verbose log. You want to add many logs, but not ones that serve no purpose. Try and make sure every verbose log contains a value that has been calculated or set within code, this will keep you away from logs like "Here now" or "This works". Rather have logs like "Results parsed, 4 retrieved from Api, other 6 from cache". Where the 4 and 6 would be calculated using variables in that current scope.

These are the rules that I actively develop with, when I'm at the point where I introduce an architecture into my application. If I didn't add this in, which sometimes I don't we'll push to get this in before a release so that there's information to fall back on when things go south.

That's it for my logging guide, check out some of the other [tutorials](/tutorials) for some more Flutter knowledge.
