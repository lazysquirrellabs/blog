---
layout: post
title:  "Android 6 (Marshmallow) permissions and Unity"
date:   2016/07/09 20:35:38 +0200
author: Matheus Amazonas
categories: jekyll update
---
While working on [Overclock](http://sky.vu/oc), our team faced a new problem with Android 6 (Marshmallow): all permissions were requested when the app launches the first time instead of when the user downloads the app. Not only that, but the permissions are requested individually and not altogether like it used to be, which showed us some permissions we didn’t even notice were there. After some research, we found some answers and some problems and I’ll list them here to hopefully help some developers in the future.

This article will talk about Android 6 permission changes, how Unity adds some of them based on your API requests, how the engine requests them and which changes should be made to this system.

## Android Marshmallow’s permission changes 

Starting on Android 6, user permissions are requested during run time rather than during installation. According to Google, the change streamlines the installation and update process and allows fine tuning of the app’s functionalities: since the permissions are requested individually, the user can allow some and deny others. For example: a user can grant location privilegies but deny camera permission and the app may function seamlessly. Before the update, given that all the permissions were displayed grouped before installation, denying them would cancel the installation.

The Android Support Library provides us with methods of checking, requesting and dealing with permissions request responses. You can check more about it [here](http://developer.android.com/training/permissions/requesting.html).

## A bit about Android permissions 

In order to fully understand the problem, we must learn a bit more about Android permissions, starting with protection levels.

### Protection Levels

System permission are divided into two protection levels: normal and dangerous. Normal permissions usually request data or resources out of the app’s sandbox but that shouldn’t harm the user’s privacy or other apps, e.g., time zone permission. You can take a look at the list of normal permission [here](http://developer.android.com/guide/topics/security/normal-permissions.html). Dangerous permissions request either data or resources that may affect the user’s privacy of the execution of other apps, e.g., read the phone’s contact list and manage phone calls. Normal permissions are automatically granted without user prompt, while dangerous permissions require user authorization.

### Permission Groups

Another concept that we should talk about is Permission Groups. Given that the number of permissions available on an Android environment might be quite long, they are grouped into Permission Groups based on which data or resource it requests access for.

Let’s take the “Contacts” permission group as an example. It contains three permissions: `READ_CONTACTS`, `WRITE_CONTACTS` and `GET_ACCOUNTS`. As you can see, all the permissions are directly related to the user contacts. Groups are extremely handy because if your app needs those three permissions, we don’t need to request each one individually. When we request any permission in the “Contacts” group, we are actually requesting a group permission. Given that, if an app is running on Android Marshmallow requests the `READ_CONTACTS` permission, the user grants it and later on it requests the `WRITE_CONTACTS` permission, no prompt will be shown to the user on the latter, because he/she already granted permission to the “Contacts” group. Hence the `WRITE_CONTACTS` permission shall be automatically granted.

## Unity and Android permissions 

Now that we know how Android permissions work and what changed after the latest update, let’s understand how Unity handles permissions.

### Permissions Added by Unity

One of the most common searches about Unity and Android permissions is “why is my app requesting permission to make and manage phone calls if I don’t have that on AndroidManifest.xml file?” and that’s exactly how we started our search. After some reading, we found out the `READ_PHONE_STATE` permission is the source of the problem.

We thought “we don’t need to read the phone state, why is that permission even in the AndroidManifest?” and proceeded to delete the permission request. To our surprise, even after deleting the entry, our app still requested the permission. We thought we were crazy for a second and started to dig in all the AndroidManifest files we have in our project (plugins) looking for that entry, but we couldn’t find it.

### The villain

Then, after some more research, we found the villain:  `SystemInfo.deviceUniqueIdentifier` . This simple example shows us how Unity sometimes might be a bit too nosy and adds some permissions to our AndroidManifest on the build process. Some of Unity’s API calls require a permission to be granted to function rightfully. Unity (trying to make your life easier) identifies when your application’s source code contains that call and adds the permission request to your AndroidManifest file during the build process (hence why you can’t find it in your Manifest file). Some might say that’s too much babysitting and some might say it’s a good feature and I personally think there should be a switch on that functionality, but let’s move on.

Now let’s understand why this call needs a permission. The `deviceUniqueIdentifier` call does exactly what it says: it returns the device’s unique identifier (genius!). This identifier is often used as an ID for guest users so the game can save its progress on the server, even though the user didn’t create an username. This allows users to keep their progress after deleting the app from their phone. Given the premise that every phone has a unique, non-mutable identifier (guess what, it doesn’t), this works great.

The problem lays on how the engine gets that identifier. There is no guaranteed way of getting a phone’s unique ID, but there are some solutions close enough and the IMEI is the most famous and used one. The IMEI is an – usually – unique identifier used to identify most mobile and satellite phones in the world and is generally used to block stolen phones around the globe.

The root of the problems is that to access the phone’s IMEI on an Android phone, you need the `READ_PHONE_STATE` permission, which is part of the `PHONE` Permission Group. Now try to guess how a request to that permission group is described. You’re right: “Allow this app to make and manage phone calls?”. That’s right. Just to access the IMEI, you must request permission to the entire `PHONE` group, which includes making and managing phone calls. It sounds like an overkill, but that’s how Android sets it up.

### Recap

So we found the cause of the problem: fetching the device’s unique ID needs the `READ_PHONE_STATE` permission which is in the `PHONE` permission group. Unity, trying to help us, automatically adds the permission when the deviceUniqueIdentifier call is present in code. Based on those findings, it looked like there was no scape to that problem: we either don’t use that API call to fetch the device’s unique ID or we accept the problem and move on.

We considered abandoning the guest login option, since we had another login methods (email, Facebook, Game Center) that were also affected by the permission request problem, even though they didn’t even use the device ID. After some talk, we concluded that, from a game design perspective, removing that option was more painful than having that aggressive permission request.

## But… What if?

During the talk about Android permissions and mobile games, we noticed that some of the games we played already made use of the runtime permissions, but on a less intrusive way. They only requested a permission when it was really necessary and showed a popup explaining why they needed that permission. That is far from ideal, but solves 2 problems:

- Request permissions when it’s not necessary
- Letting the user know why we need that permission

After some digging, we found out that Unity doesn’t provide a way of doing that natively. The engine simply requests every single permission when the app starts and there is no way you can control that. The only tool available is completely turning off the requests, which we will talk about on our workaround.

### Non-official workaround

Since Unity lacks a solution for this problem, we sought an alternative solution. We can’t control when Unity requests the permission, but we can use another tools ([1](https://www.assetstore.unity3d.com/en/#!/content/62735), [2](http://stackoverflow.com/questions/35027043/implementing-android-6-0-permissions-in-unity3d/)) to do that, totally bypassing Unity. Those tools let us work with the Android 6 permission model inside Unity. One extra step to implement that is to tell Unity to stop requesting the permissions when the app launches. We can do that easily by adding the following line to the AndroidManifest.xml file:

```xml
<meta-data android:name=“unityplayer.SkipPermissionsDialog”android:value=“true”/>
```

##  Conclusion: What Unity should do 

The final fix for this problem would be an official solution from Unity: an API that implements the Android Marshmallow (6.0) permission model, giving us control over runtime permission requests. Our team wasn’t the first one to bump into this problem and won’t be the last, and there is a [Unity Feedback topic](https://feedback.unity3d.com/suggestions/add-android-m-6-dot-0-permission-model-support) currently open that addresses this very same problem. If you feel affected by this, please vote for it.

## Reference

- [Android Developers - Request app permissions](http://developer.android.com/training/permissions/requesting.html)
- [Android Developers - Permissions on Android](http://developer.android.com/guide/topics/security/permissions.html)
- [Unity Answers - Disable permission dialog in Unity 5](http://answers.unity3d.com/questions/1152724/disable-permission-dialog-in-unity-5.html)