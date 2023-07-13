---
title: Firebase CloudStorage in Flutter
description: This tutorial will cover how to use Cloud storage along with the pattern used in Production by the FilledStacks development team.
authors:
  - en/dane-mackier
published: 2020-02-09
updated: 2020-02-09
postSlug: firebase-cloud-storage-in-flutter
ogImage: /assets/tutorials/042/042.png
ogVideo: https://www.youtube.com/embed/WDqi-ZUXHEo
featured: false
draft: false
tags:
  - firebase
  - firestore
  - cloud-storage
# codeUrl: https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F042%2F042-compound.zip?alt=media&token=329be8ee-13a4-4ae7-8d87-8bfc173294c3
---

Hello there Flutter Dev 🙋‍♂️ In this tutorial we will be going over Cloudstorge on Firebase and how to integrate that with your mobile application. This tutorial is part 5 of a free [Firebase and Flutter course](https://www.youtube.com/playlist?list=PLdTodMosi-Bzj6RIC2wGIkAxKtXPxDtca) that has weekly videos. To get the videos as they come out, make sure to subscribe to my [Youtube Channel](https://www.youtube.com/filledstacks).

Today we'll do a simple task that is probably a very common task in mobile app development. We will provide the user with a UI to select and upload a photo, save that photo in a post and display that to them in a collection. The photo will be stored in Firebase CloudStorage and we'll use a URL to the photo to display to users in the app. We'll start off by updating the UI to allow us to upload a photo.

I'm starting off [with this project](https://firebasestorage.googleapis.com/v0/b/filledstacks.appspot.com/o/tutorials%2F042%2F042-compound.zip?alt=media&token=329be8ee-13a4-4ae7-8d87-8bfc173294c3) for my UI which is the final code from part 3 of the series. If you don't have a project to follow along with you can use this code base for the tutorial. Download the code and open it in VS Code.

## Cloud Storage Setup

Before we start with the code lets setup our cloud storage. Open up the [firebase console](https://console.firebase.google.com) and click on the storage icon in the left toolbar. Click on create bucket, choose the location and continue. You will now have what is called a "bucket" where you can store files. You can think of this as a hard drive that you access through a url web request. Each of the files here will have an access token / url that you can access only through that url with the attached token. You can set visibility by controling the access level for that download url token. This is the url we'll use to display the image in the app.

## Implementation

Let go over a quick implementation overview. We'll create a service that wraps the provided firebase storage package. This service will take in a `File` object and a title and upload that to the storage. When the operation is complete we will return the url which is what we'll put inside of our post as the imageUrl. The file that we're passing in will be selected using the UI presented by the image picker library. Let's get to it.

### Code setup

We start off by adding the firebase_storage and the image_picker package to the pubspec.

```yaml
firebase_storage: ^3.1.1
image_picker: ^0.6.3+1
```

Firebase storage is to interact with the Firebase Cloud Storage, the image picker is to show the user a UI that will allow them to select an image from their device.

### Cloud Storage Implementation

Under the services folder create a new file called cloud_storage_service.dart. We'll give it a function called `uploadImage` that Takes in a required file as well as a title. You can pass in the UID, or anything you'd like to identify your images by.

```dart
import 'package:firebase_storage/firebase_storage.dart';

class CloudStorageService {
  Future<CloudStorageResult> uploadImage({
    @required File imageToUpload,
    @required String title,
  }) async {

  }
}

class CloudStorageResult {
  final String imageUrl;
  final String imageFileName;

  CloudStorageResult({this.imageUrl, this.imageFileName});
}
```

To access the Firestore Storage instance we use the `FirebaseStorage.instance` static property. The storage library works similar to the firebase documents. You can get a reference to a file that doesn't exist yet and then add the data in there that you want. We'll get a reference to our future file using the title and the date epoch to keep it unique. Once we have our reference we will call `putFile` and pass it in the selected `File`. This will give us a `StorageUploadTask`. This object has an onComplete Future that returns a `StorageTaskSnapshot` (similar to firebase snapshot). We can await that future and once we have the snapshot we can use the `StorageReference` returned and get the downloadUrl. We'll return the url when the task is complete or null.

```dart
  Future<CloudStorageResult> uploadImage({
    @required File imageToUpload,
    @required String title,
  }) async {

    var imageFileName = title + DateTime.now().millisecondsSinceEpoch.toString();

    final StorageReference firebaseStorageRef = FirebaseStorage.instance
    .ref()
    .child(imageFileName);

    StorageUploadTask uploadTask = firebaseStorageRef.putFile(imageToUpload);

    StorageTaskSnapshot storageSnapshot = await uploadTask.onComplete;

    var downloadUrl = await storageSnapshot.ref.getDownloadURL();

    if (uploadTask.isComplete) {
      var url = downloadUrl.toString();
      return CloudStorageResult(
        imageUrl: url,
        imageFileName: imageFileName,
        );
    }

    return null;
  }
```

<br />

Open up the locator.dart file and register the `CloudStorageService` with the get_it instance.

```dart
locator.registerLazySingleton(() => CloudStorageService());
```

### Image Selection Implementation

We'll start off by wrapping the `ImagePicker` library into our own class. This way our business logic is not dependent on any third party packages. It's something I like to do, if you go the additional step and add it behind an interface then you can mock it out during testing as well.

<br />

Create a new folder called utils. Inside create a new file called image_selector.dart

```dart
import 'package:image_picker/image_picker.dart';

class ImageSelector {
  Future<File> selectImage() async {
    return await ImagePicker.pickImage(source: ImageSource.gallery);
  }

}
```

I know it seems silly to have a class that wraps one line, but you can do much more with it than this. You can keep the file in memory until you're certain it's uploaded, you can have different sources passed in from different functions, etc. The main reason for this is to remove the dependency of `ImagePicker` from any of the code in the app that has to make use of the functionality.

<br />

Open up the locator.dart file and register the `ImageSelector` with the get_it instance.

```dart
locator.registerLazySingleton(() => ImageSelector());
```

<br />

Finally open up the `CreatePostViewModel` where we'll locate the selector and then make use of it in a function called selectAndUploadImage. We'll also import the `CloudStorageService` for later use. We'll use the selectImage function to set the image to upload and display that to the user in the UI.

```dart
class CreatePostViewModel extends BaseModel {
  final ImageSelector _imageSelector = locator<ImageSelector>();
  final CloudStorageService _cloudStorageService = locator<CloudStorageService>();

  File _selectedImage;
  File get selectedImage => _selectedImage;

  Future selectImage() async {
    var tempImage = await _imageSelector.selectImage();
    if(tempImage != null) {
      _selectedImage = tempImage;
      notifyListeners();
    }
  }
}
```

In the same viewmodel update the `addPost` function to upload the image if we're not editting the post. We'll then use that url as the imageUrl in the post. _For error handling I would show a snack bar if the imageUrl comes back null that indicates to the user that the image upload has failed._

```dart
 Future addPost({@required String title}) async {
    setBusy(true);

    CloudStorageResult storageResult;

    if (!_editting) {
      storageResult = await _cloudStorageService.uploadImage(
          imageToUpload: _selectedImage, title: title);
    }

    var result;

     if (!_editting) {
      result = await _firestoreService.addPost(Post(
        title: title,
        userId: currentUser.id,
        imageUrl:  storageResult.imageUrl,
        imageFileName: storageResult.imageFileName
      ));
    } else {
      result = await _firestoreService.updatePost(Post(
        title: title,
        userId: _edittingPost.userId,
        documentId: _edittingPost.documentId,
        imageUrl: _edittingPost.imageUrl,
        imageFileName: _edittingPost.imageFileName,
      ));
    }

    ...
  }
```

Next, open the `Post` model and add the new imageFileName String that we'll use to later delete the post.

```dart
class Post {
  ...
  final String imageFileName;

  Post({
    ...
    this.imageFileName,
  });

  Map<String, dynamic> toMap() {
    return {
      ...
      'imageFileName': imageFileName,
    };
  }

  static Post fromMap(Map<String, dynamic> map, String documentId) {
    if (map == null) return null;

    return Post(
      ...
      imageFileName: map['imageFileName'],
      documentId: documentId,
    );
  }
}

```

Now we can go onto the UI for the functionality. First thing to do is update the `CreatePostView` and add a gesture detector onto the grey rectangle we're displaying. When tapped we'll call the `selectImage` function. We'll also add a conditional to make sure when an image is selected we show it in that grey block. Update the container in the create_post_view that has the text in it to the following.

```dart
GestureDetector(
  // When we tap we call selectImage
  onTap: () => model.selectImage(),
  child: Container(
    height: 250,
    decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(10)),
    alignment: Alignment.center,
    // If the selected image is null we show "Tap to add post image"
    child: model.selectedImage == null
        ? Text(
            'Tap to add post image',
            style: TextStyle(color: Colors.grey[400]),
          )
          // If we have a selected image we want to show it
        : Image.file(model.selectedImage),
  ),
)
```

If you run the app now, tap on the FAB, enter a title and tap on the image block you'll see the image picker pop up. Select an image and it should be showing in the grey block in place of the text :) Add the post by pressing the FAB and it'll send it up to the cloud and return you a url.

<br/>

If you open up the cloud storage now you'll see a file with the title you enetered and a number after it. That's the image you uploaded. Next up is displaying the image.

### Image display implementation

To display the images from the cloud storage we will use the cached_network_image package. Add it to your pubspec.

```yaml
cached_network_image: ^2.0.0
```

Open up the post_item and we'll update the UI. First thing is to make sure when we have an image we don't want to give the list a fixed size. We'll check if there's an image. If there's an image we set the heigh to null (meaning wrap content), otherwise we set it to 60.

```dart
class PostItem extends StatelessWidget {
  final Post post;
  ...
  @override
  Widget build(BuildContext context) {
    return Container(
      // Check if we have an image and set it to null or 60
      height: post.imageUrl != null ? null : 60,
      margin: const EdgeInsets.only(top: 20),
      alignment: Alignment.center,
      child: Row(
        children: <Widget>[
          Expanded(
              child: Padding(
            padding: const EdgeInsets.only(left: 15.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                // If the image is not null load the imageURL
                post.imageUrl != null
                    ? SizedBox(
                        height: 250,
                        child: CachedNetworkImage(
                          imageUrl: post.imageUrl,
                          placeholder: (context, url) =>
                              CircularProgressIndicator(),
                          errorWidget: (context, url, error) =>
                              Icon(Icons.error),
                        ),
                      )
                // If the image is null show nothing
                    : Container(),
                Text(post.title),
              ],
            ),
          )),
         ...
        ],
      ),
      ...
    );
  }
}

```

That's it. You can now, post an image to the cloud storage. Then see it load as an item in the list of posts :)

### Delete on Cloud Storage

Last thing to do is to delete the image again when a post is removed. This can be done by simple getting the ref and calling delete on it. Open up the `CloudStorageService` and we'll add a delete function.

```dart
class CloudStorageService {
   Future deleteImage(String imageFileName) async {
    final StorageReference firebaseStorageRef =
        FirebaseStorage.instance.ref().child(imageFileName);

    try {
      await firebaseStorageRef.delete();
      return true;
    } catch (e) {
      return e.toString();
    }
  }
}
```

Open up the `HomeViewModel`, locate the `CloudStorageService` and then after deleting the post from the firestore db call the delete function on the `CloudStorageService` as well.

```dart
class HomeViewModel extends BaseModel {
  final CloudStorageService _cloudStorageService = locator<CloudStorageService>();

  Future deletePost(int index) async {
    var dialogResponse = await _dialogService.showConfirmationDialog(
      title: 'Are you sure?',
      description: 'Do you really want to delete the post?',
      confirmationTitle: 'Yes',
      cancelTitle: 'No',
    );

    if (dialogResponse.confirmed) {
      var postToDelete = _posts[index];
      setBusy(true);
      await _firestoreService.deletePost(postToDelete.documentId);
      // Delete the image after the post is deleted
      await _cloudStorageService.deleteImage(postToDelete.imageFileName);
      setBusy(false);
    }
  }

}
```

And That's it. Basic Cloud storage functionality wrapped into a service for easy use. Make sure to follow me on Youtube for the rest of the series. Until next week :)

Dane Mackier
