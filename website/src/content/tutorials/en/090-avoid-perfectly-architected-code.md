---
title: Software Engineers Avoid Perfectly Architected Code
description: Don't waste time trying to perfect architecture, write code and release it.
authors:
  - en/dane-mackier
published: 2023-07-07
updated: 2023-07-07
postSlug: software-engineers-avoid-perfectly-architected-code
ogImage: /assets/tutorials/089/thumbnail.jpeg
featured: false
draft: true
tags:
  - flutter-web
---

In this post, I want to talk about writing less code. You read that right, writing the least amount of code possible, while keeping it evolvable.

I’ve been coding this way for over 8 years and it’s been the biggest shift in my programming career that I’ve experienced.

Some read this and see “write bad code” which is not the same. “Good enough” is not bad, it’s just good enough to move us past the current obstacle.

### Solve your problem with the least amount of code, you can improve later

When we write the least amount of code, it’s not always the most elegant. This is why we couple this with applying frameworks to refactor, improve and decouple your code when it works.

In this post, I’d like to give you more insight into why I write code this way. You might like it too. We’ll talk about:

- Why I develop this way
- What it means

## Why I develop this way

I’m a big fan of Test Driven Development, writing the tests before the code. Believe me when I say this, when I first learned it (around 24 years old) I was an amped-up, young programmer making his first few dollars and writing code with 0 tests, at all, let alone writing my tests before my code. I just wanted to get code working, test it manually and ship it.

Our team lead at the time was not happy with the amount of manual testing, he didn’t want to remove manual testing, but if we could only edge-case test the latest features instead of always re-testing everything we touch we would save probably 240+ hours a month. It’s when he put us through a TDD workshop as a team. Everyone from the seniors to the juniors (me included) was skeptical. Within an hour our minds changed.

We were introduced to writing enough code to make the test pass, it felt silly sometimes, but we eventually saw the system work its magic. Which is the system I use now every day, even if I don’t do TDD strictly. The system goes, red → green → refactor. It’s simple:

**Red:** Write a test that fails

**Green:** Write only enough code to make that test pass

**Refactor:** Review the code you wrote and improve it (without adding new functionality)

This is where the idea comes from to avoid perfectly architected code early on. This system ensures that.

1. We don’t write code that doesn’t directly address a problem
2. We avoid adding extra unrequested functionality
3. We solve problems and improve our code
4. We ensure we keep our code healthy

## What it means

When I shared this post [on my LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7077495408158994432/) a lot of engineers commented along the lines of “making good decisions early can save a lot of time” and “you’re advocating for writing bad code”. This is not what it means to write the least amount of code. Let’s address each one:

### Making good decisions early can save time later

I don’t disagree with this, but this statement assumes you know exactly what the problem is, how to solve it, what you didn’t think about, and what edge cases exist. Which you don’t. You can’t possibly know this. The only time you actually know what to build is when you’ve started the journey, you’ve seen how you can solve the problem and your code is working.

That is when you should make architectural decisions, and even then, only make those decisions based on how far you are in the process, not what you expect to happen later on, you don’t know what will happen. This is where you can apply the idea of [“Good enough architecture” as spoken about by Stefan Tilkov](https://youtu.be/RtRpL3Ndi0c). The idea that architecture is not an upfront activity decided by some senior and then passed down to everyone else to follow.

It’s my opinion that we should avoid guesswork and use real data to make decisions. Deciding before you’ve done anything is wreckless, sure, there are general patterns we know we’ll need to implement but that’s not what I’m talking about. I’m talking about architectural and abstraction decisions. Those should be done when the ideas prove to you that they are needed.

### I’m advocating for writing bad code

I know you’re not the ones that think this, otherwise, you probably wouldn’t have subscribed to my newsletter. My statement made people think that, and I can see why. When you think of writing the least amount of code it’s not clear what that should look like. But that’s why it has to stay evolvable. Evolvable code has 3 properties:

- Layers of separation: Keeping separate UI, State, Business Logic and Application Logic
- Decoupled: Ensuring the dependency inversion principles is applied
- Testable: The above properties make code testable, but to actually unit test code requires a few more fundamental decisions in how you build and construct objects

These are not really architecture decisions, they are software engineering decisions that should be present at all times. They ensure that when the requirements change your code can evolve to fit them.

Writing the least amount of code does not advocate for ignoring this, but it does advocate ignoring:

- The use of design patterns for “potential situations”
- The over-abstraction of objects for “potentially swapping them out”
- The implementation of additional functionality based on fantasy user scenarios
- The implementation of a pre-defined architecture with many layers of separation

It’s easy for developers to assume, “well this is what we’ll need in the future so let’s add it” but I’ve seen that waste a lot of time. What I do instead is, solve the problem at hand, with the least amount of code possible. When it’s solved, I refactor my solution to apply basic software engineering principles. I release and then I repeat.

Stick to this process and you’ll ensure that you deliver consistently, without sacrificing the quality of your codebase.
