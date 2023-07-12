---
title: How to perform real-time pagination with Firestore
description: In this written tutorial we will implement paginated data that responds in real time using Firestore and Flutter.
authors:
  - en/dane-mackier
published: 2020-03-14
updated: 2020-03-14
postSlug: how-to-perform-real-time-pagination-with-firestore
ogImage: /assets/tutorials/045/045.jpg
ogVideo: https://www.youtube.com/embed/1chV50D5BVU
featured: false
draft: false
tags:
  - firebase
relatedTutorials:
  - en/028-continuous-scroll-index
  - en/029-responsive-architecture
  - en/047-remote-config
# codeUrl: https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F045%2F045-starting.zip?alt=media&token=9809cf85-6f3e-4996-bff7-349bfe2f891c
---

The problem with our current implementation in [this code base](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F045%2F045-starting.zip?alt=media&token=9809cf85-6f3e-4996-bff7-349bfe2f891c) is that we request all the information from the posts collection in one go and listen to all of it for updates. This won't work well when your list starts going into the thousands. We'll use the code above to continue this tutorial.

## Implementation

I have updated the posts collection and added in 100 posts with images for us to use as example data. Today we will implement infinite scrolling using "paged data" from firestore. Here are the high-level steps we'll take to complete this task:

- Request a limited amount of posts at a time (20)
- Save the last document for reference on next request
- Keep the results of the request in a list of posts that represent pages
- When that query updates, update the list of posts that represent the pages

It doesn't say it all, but it's a good guide to follow. Lets get going.

### Add Page requesting into the UI

To request more data we need to know when we reach the bottom of the list and call our refresh functionality. To do that we will use the `CreationAwareListItem` pattern that I shared in [this tutorial](https://www.filledstacks.com/post/flutter-infinite-scroll-using-flutter-only/#ui-implementation) a few months back. Under the widgets folder create a new file called creation_aware_list_item.dart

```dart
import 'package:flutter/material.dart';

class CreationAwareListItem extends StatefulWidget {
  final Function itemCreated;
  final Widget child;
  const CreationAwareListItem({
    Key key,
    this.itemCreated,
    this.child,
  }) : super(key: key);

  @override
  _CreationAwareListItemState createState() => _CreationAwareListItemState();
}

class _CreationAwareListItemState extends State<CreationAwareListItem> {
  @override
  void initState() {
    super.initState();
    if (widget.itemCreated != null) {
      widget.itemCreated();
    }
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
```

It's a very simple class. It takes in the child you want to show (your list item UI) and calls the itemCreated function when the item is initialised / inserted into the render tree. This means whenever a item is created we'll get this callback. Open up the `HomeView` and wrap your GestureDetector for the list item in the `CreationAwareListItem`.

```dart
ListView.builder(
  itemCount: model.posts.length,
  itemBuilder: (context, index) =>
  // Wrap yout list item in a creation aware item
      CreationAwareListItem(
    itemCreated: () {
      // when the item is created we request more data when it's the 20th index
      if (index % 20 == 0)
        model.requestMoreData();
    },
    child: GestureDetector(
      onTap: () => model.editPost(index),
      child: PostItem(
        post: model.posts[index],
        onDeleteItem: () =>
            model.deletePost(index),
      ),
    ),
  ),
)
```

When the item is created or inserted into the tree we the itemCreated callback will fire. Once that happens we'll check if the index of the list item % 20 == 0 and request more data. Now we can move onto the requestMoreData functionality.

### Request More Data

Open up the `HomeViewModel` and add a new function requestMoreData. This will call the requestMoreData function on the `FirestoreService`

```dart
class HomeViewModel extends BaseModel {

  ...
  void requestMoreData() => _firestoreService.requestMoreData();
}
```

Open up the `FirestoreService` where we will add all the meat of this implementation. First thing to do it to move the request / subscription to the query stream into it's own function. Create a new function called \_requestsPosts() and move the code from listenToPostsRealTime in there and call the function before returning.

```dart
Stream listenToPostsRealTime() {
  _requestPosts();
  return _postsController.stream;
}

void _requestPosts() {
  _postsCollectionReference.snapshots().listen((postsSnapshot) {
    if (postsSnapshot.documents.isNotEmpty) {
      var posts = postsSnapshot.documents
          .map((snapshot) => Post.fromMap(snapshot.data, snapshot.documentID))
          .where((mappedItem) => mappedItem.title != null)
          .toList();

      // Add the posts onto the controller
      _postsController.add(posts);
    }
  });
}
```

This function will have to change to account for the following:

1. **Allow the query to be modified on next request**: This means we have to split the query from the request / subscription.
2. **Limit the number of results**
3. **Keep track of the page being requested**
4. **Store results in a paged structure for real time updates**
5. **Broadcast all the results instead of the results from the current fetch**

Lets get cracking. We'll start by splitting the query from the request, ordering it by title (you need an order for startAfterDocument to work) and limit it to 20 posts.

```dart
 void _requestPosts() {
    // #2: split the query from the actual subscription
    var pagePostsQuery = _postsCollectionReference
        .orderBy('title')
        // #3: Limit the amount of results
        .limit(20);

    ...
 }
```

Next up we'll add the make sure to keep track of the last document that was fetched. We'll add a `DocumentSnapshot` into the class and we'll adjust the query if that value is not empty.

```dart
DocumentSnapshot _lastDocument;

void _requestPosts() {
  var pagePostsQuery = _postsCollectionReference
      .orderBy('title')
      .limit(20);

  if (_lastDocument != null) {
    pagePostsQuery = pagePostsQuery.startAfterDocument(_lastDocument);
  }
  ...
}
```

We'll set the \_lastDocument when the results we're getting is for the last page in the list of pages so lets get onto that. We'll create the structure that will keep our paged data. This will be a `List<List<Post>>` a list of lists of posts. Each entry will be a "page with 20 items in it". Under the \_lastDocument variable create the \_allPagedResults list.

```dart
  List<List<Post>> _allPagedResults = List<List<Post>>();
```

After we check and adjust the startAfterDocument query value we will get the currentRequestIndex which will represent the page that the current requests data belongs to.

```dart
void _requestPosts() {
  ...
   if (_lastDocument != null) {
    pagePostsQuery = pagePostsQuery.startAfterDocument(_lastDocument);
  }

  var currentRequestIndex = _allPagedResults.length;

   pagePostsQuery.snapshots().listen((postsSnapshot) {
      if (postsSnapshot.documents.isNotEmpty) {
        var posts = postsSnapshot.documents
            .map((snapshot) => Post.fromMap(snapshot.data, snapshot.documentID))
            .where((mappedItem) => mappedItem.title != null)
            .toList();

        _postsController.add(posts);
      }
   });

}
```

Now we can handle the data that comes back. We can remove the `_postsController.add` call since we don't want to broadcast only that one page's data. We want to send out all the data at once. We'll start off by checking if the pageExists for the current data that's being fetched. That's a simple check, all we do it see if the currentRequestIndex is less than the length of the number of items in the pagedStructure. If it's not it means it's a new set of results, otherwise the page already exists. We'll then use this to either add a new post or update the existing posts. When that's complete we send out all the posts by folding the list of lists into one.

```dart
void _requestPosts() {
 pagePostsQuery.snapshots().listen((postsSnapshot) {
      if (postsSnapshot.documents.isNotEmpty) {
        var posts = postsSnapshot.documents
            .map((snapshot) => Post.fromMap(snapshot.data, snapshot.documentID))
            .where((mappedItem) => mappedItem.title != null)
            .toList();

        // Check if the page exists or not
        var pageExists = currentRequestIndex < _allPagedResults.length;

        // If the page exists update the posts for that page
        if (pageExists) {
          _allPagedResults[currentRequestIndex] = posts;
        }
        // If the page doesn't exist add the page data
        else {
          _allPagedResults.add(posts);
        }

         // Concatenate the full list to be shown
        var allPosts = _allPagedResults.fold<List<Post>>(List<Post>(),
            (initialValue, pageItems) => initialValue..addAll(pageItems));

        //  Broadcase all posts
        _postsController.add(allPosts);
      }
    });
}
```

What this does now is make sure whenever there's query info updated we update only the 20 items that it affects and broadcast that entire list for easier consumption. Finally when this is done we can indicate if we have more posts and we can set the last fetched document. Create a new bool variable in the class called `_hasMorePosts` with default value of true. Then add the last two lines in the listen callback. We'll also bail out of the entire function when we don't have more posts to request. Commented lines are the new ones.

```dart
bool _hasMorePosts = true;

void _requestPosts() {
    var pagePostsQuery = _postsCollectionReference
        .orderBy('title')
        .limit(20);

    if (_lastDocument != null) {
      pagePostsQuery = pagePostsQuery.startAfterDocument(_lastDocument);
    }

    // If there's no more posts then bail out of the function
    if (!_hasMorePosts) return;

    var currentRequestIndex = _allPagedResults.length;

    pagePostsQuery.snapshots().listen((postsSnapshot) {
      if (postsSnapshot.documents.isNotEmpty) {
        var posts = postsSnapshot.documents
            .map((snapshot) => Post.fromMap(snapshot.data, snapshot.documentID))
            .where((mappedItem) => mappedItem.title != null)
            .toList();

        var pageExists = currentRequestIndex < _allPagedResults.length;

        if (pageExists) {
          _allPagedResults[currentRequestIndex] = posts;
        } else {
          _allPagedResults.add(posts);
        }
        var allPosts = _allPagedResults.fold<List<Post>>(List<Post>(),
            (initialValue, pageItems) => initialValue..addAll(pageItems));

        _postsController.add(allPosts);

        // Save the last document from the results only if it's the current last page
        if (currentRequestIndex == _allPagedResults.length - 1) {
          _lastDocument = postsSnapshot.documents.last;
        }

        // Determine if there's more posts to request
        _hasMorePosts = posts.length == 20;
      }
    });
  }

```

And that is basically it. If you run the code now you'll see that you can infinitely scroll and when you edit one of those items in the console in the paged data you'll see that it updates. That's my process of adding real time paginated data. If you want to save and cancel the subscription store the StreamSubscription returned in a list of Subscriptions. The index will match the pageNumber so you can cancel updates for specific pages if you choose to. Pretty neat.

That's it for this week. See you next week.

- Dane
