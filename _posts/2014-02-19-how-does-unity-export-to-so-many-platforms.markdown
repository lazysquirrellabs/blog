---
layout: post
title:  "How does Unity export to so many platforms?"
date:   2014-02-19 20:33:38 +0200
author: Matheus Amazonas
categories: jekyll update
---
So for my first article I picked a not so simple theme, but one that has been extremely intriguing to me lately. This week a friend, during a talk about game development and Unity3D, asked me: *“How does Unity export to so many and different platforms?”* I started to think and formulate my answer, struggled and I couldn’t really answer why. I never really thought about it. So I started researching about it.

### Intro

[Unity3D](http://unity3d.com/) is probably the most famous Game Development Engine on the market. It’s user friendly (15 y.o. kids can use it after a few tutorials, trust me), it’s available for both Windows and MacOS X (a Linux port is on experimental phase)  and finally and the most important in this article: it can export to basically any existing device. I’m not kidding, check the list at their [website](http://unity3d.com/unity/multiplatform):

- iOS
- Android
- Windows Phone
- BlackBerry
- Windows
- Windows Store Apps
- Mac OS X
- Linux
- Their native Web Player
- PS 3
- Xbox 360
- Wii U
- PS 4
- Xbox One
- Tizen
- SamsungTV
- PS Vita
- Gear VR
- Oculus Rift

It’s a legit myriad of devices and environments. If you don’t know Unity3D and want to give a try, the free version lets you export to Mac OX, Linux, Windows, iOS, Android, BlackBerry, Web Player, SamsungTV, WebGL, Tizen and Windows Phone. It’s pretty awesome, try it! (unfortunately I’m not making money by advertising, I just truly think it’s awesome).

**Update:** As pointed by Jashan in the comments section, I focused only on scripting in this article, so I decided to write a bit about how Unity3D exports other features to so many platforms. As you will notice whilst reading the next paragraphs, although Unity Technologies does a great job with Unity3D, it relies on several companies to help them to bring some features into it. When a new platform is announced, the UT developers check if every single one of these features are supported by one of their partners, and if so, the time dedicated to support it is reduced drastically. Now let’s take a look at some of the main features.

### **Graphics**

Let’s start with graphics. A few graphics API are supported by Unity: OpenGL, OpenGL ES, WebGL, Metal and DirectX, each of these APIs targeting a different platform. OpenGL is widely used, from MacOS X and some iOS devices, to Linux and even Windows. OpenGL ES is compatible with mobile devices, mostly Android and some iOS. WebGL is the new promise on browser-based graphic application and games, eliminating the need of plugins like Flash and Unity web player. Metal is Apple’s new graphics API, compatible with the most recent iOS devices and computers from the Californian company. Finally, DirectX is Microsoft’s own graphics API solution, compatible with Windows, Windows Phone and Xbox. So even though the folks from UT dedicate a lot of time for graphics, most of the time is devoted to integrate these tools to the engine, and not to write their own API from scratch.

### **Physics**

When it comes to physics, Unity trusts solely in one tool: Nvidia’s PhysX, which supports every single platform Unity builds to. It is, hands down, one of the best physics engines in the market, and it’s been trustful and efficient since the first version of the game engine, when PhysX was called Novodex and didn’t belong to Nvidia yet. The main reason to have a single physics solution for all platforms is consistency: all collisions and movements must behave identically in every device you support, otherwise some platforms can be favored in game.

### **Lighting**

Once again, Unity relies on externals tools to implement lighting, both baked and realtime. Before Unity 5, Autodesk’s Beast was used as a baked lighting tool, been replaced by Geomeric’s Enlighten, which is now used for both realtime GI and baked lighting on the new versions (5.x) of the engine.

### **Networking**

In 2014, Unity Technologies [announced](http://blogs.unity3d.com/2014/05/12/announcing-unet-new-unity-multiplayer-technology/) UNET (Unity Networking), which is their own networking and multiplayer solution, made in house. In the past, some networking solutions were common, the most famous being Photon. The new tool consists of two parts: the Networking APIs (with high and low level APIs) and the paid Multiplayer services. Since this is a internal project, UT has to port the code to all supported platforms, differently from graphics, physics and lighting described above.

### **Finally: Scripting**

**STOP**: If you are a developer, is really confident about concepts like managed and native code, execution environments and different platforms, this section is for you. If you are an 3D artist, 2D artist or you are just curious about how this works, I’m really sorry but you may consider stopping here and accepting an awful answer: [it’s magic](http://www.reactiongifs.com/r/mgc.gif). Seriously, you may jump to the last two paragraphs of this section that summarizes it. If you are still curious, give it a try!

For those who don’t know, Unity lets us script using C# and Unityscript (eww), and without any conversion or specialized tool, export our game to any of the previously listed platforms. Simple like that. So here comes the question: HOW? I thought that just stopping and thinking about it I could come up with an answer, but even tough I had some knowledge about how Unity works under the hood, I couldn’t figure out why. So I asked my best friend in these times (Google) the question that titles this post. Let’s just say I didn’t have the best feedback ever, and later I found out why: I was asking the wrong questions.

The answer lays on the real star of this post: **Mono**. I knew Mono was really important to Unity, but it goes further than I thought. Let’s start with the beginning: what the hell is Mono? According to the official [website](http://www.mono-project.com/Main_Page), Mono is a “cross platform, open source .NET development framework”. That’s somehow confusing, so let’s go deep in the Mono history.

Right after Microsoft released the .NET framework in 2000 as a “new platform based on internet standards”, this guy called Miguel de Icaza of [Xamarin](http://xamarin.com/?gclid=CJaMj4Lw2LwCFQ1o7AodZBgAeg) really liked .NET but wanted to develop for Linux. Since Microsoft .NET didn’t support (and still doesn’t) Linux or other non-Windows platforms, he simply decided to create his own environment, the Mono open source project in 2001. So Mono is basically an open source project to “bring” the .NET Framework to other platforms including its own C# compiler and CLR (Common Language Runtime). Historically, Mono was way behind .NET when it comes to features in the beginning. Today, not only it implements most of the .NET tools, but some extra ones. So summing up, Mono is an open source, C/C++ written implementation of the .NET development framework that today is available to a whole [bunch of platforms](http://www.mono-project.com/Supported_Platforms) (do you see a pattern here?).

So now let’s stop talking about Mono and give our friend Unity some attention again. So how we program our scripts in Unity? Using C# or Unityscript. So there comes the questions: if we program using C#, how can a Unity game run on so many platforms? Doesn’t Android use Java and iOS use Objective-C instead of C#? Does Unity compile every single game to each of the platforms native code? So many questions.

Let’s start with the last question. No, Unity doesn’t compile every single game to each of the platforms native code. That’s just insanity. Doesn’t Android use Java? Not only. You can still develop using native code (C/C++). But no one wants do do that, right? Wrong, that’s exactly what Mono does.

Now let’s go to the main question: how does my Android device runs a game that was written in C# but there’s no runtime environment that runs C# in it? Well, Mono runs it. But hey, I didn’t install Mono on my device. So basically the question is: how does Mono “get into” my device? With each game made in Unity (and every application developed using Mono) goes a Mono runtime environment. Are you crazy? No, and I can’t prove it right now, but here’s what Xamarin (remember them?) claim on their [How it works](http://xamarin.com/how-it-works) page, and makes perfect sense:

> Write your app in C# and call any native platform APIs directly from C#. The Xamarin compiler bundles the .NET runtime and outputs a native ARM executable, packaged as an iOS or Android app.
> 

This brings other question: a Mono developed app attaches the whole framework to itself? The answer can be found in the same website: unused classes in the framework are stripped during linking. So the only portions of the framework that are bundled and put into your app are the ones you use. If you want to read more about how it works on the Xamarin products, visit the [Developer Center](http://docs.xamarin.com/guides/cross-platform/application_fundamentals/building_cross_platform_applications/part_1_-_understanding_the_xamarin_mobile_platform/).

So this is it boys and girls. Mono is the savior here. He provides the .NET Framework to Unity Games. This is why you can code using C# and run the game at so many platforms. I think this is it for my first post here. I hope I can keep the blog updated with more thoughts that have been concerning me. If you like, if you don’t, if there’s an error or even if you think this is total BS, please leave a comment.

### **Important update**

(September, 2015): Unity’s IL2CPP technology is changing the way the engine’s scripting backend works, eliminating Mono’s VM and AOT compiler. [Take a look at it!](http://blogs.unity3d.com/2014/05/20/the-future-of-scripting-in-unity/)

What to read next? I wrote a new post about how Unity3D works under the hood and how our code interacts with the engine code [here]({{ site.post2 }}).