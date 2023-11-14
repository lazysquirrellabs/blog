---
layout: post
title:  "How does Unity scripting work under the hood?"
date:   2014/12/22 20:33:38 +0200
author: Matheus Amazonas
categories: jekyll update
---
On the [previous post]({{ site.post1 }}) we learnt how Unity exports to so many platforms. Now let’s talk about a subject that can sound unnecessary at first, but helped (at least me) a lot on the process of understanding how Unity works. We all know [Unity](http://unity3d.com/) is an engine, but how it really works? In this post we’ll learn about:

- How Unity Engine is implemented
- How we access the engine code
- Wrappers
- How to use your own Mono library inside Unity
- Unity Engine vs Unity Editor

We’ve always been told that managed programming languages are slow compared to native code, even though some managed languages are reaching great performance. We know that Java and C# are great for web development, non-critical systems and mobile apps. But when it comes to high performance (a pit where realistic graphics always fall) we all know these guys can’t do a lot for us. Although the Unity game world is fulfilled with 2D or simple graphics games, it’s capable of delivering [stunning](http://www.youtube.com/watch?v=qbP7Z4btVvc) and [realistic](http://forum.unity3d.com/threads/9842-First-Unity-Game-screen-shots-(New-Level)) [worlds](http://thegolfclubgame.com/) and [scenes](http://www.navalaction.com/).

So we ask (at least I did) ourselves: how does Unity deliver such amazing graphics with a great performance, if all the coding is made with C#, Javascript or Boo, and runs on a virtual machine (Mono)? If these are managed languages, how does it do the job? Is it dark magic? Unfortunately not.

One more time, let’s do some researching. After consulting Google, we get to an answer. The Unity Engine itself, the core, is written using C\C++, which we know is a native language. All the graphics, sound, physics coding is mostly C++ (I can’t say how much exactly because I don’t have access to the source code). But the guys from Unity itself gave us some tips is an article [about C\C++ code coverage](http://blogs.unity3d.com/2014/02/27/how-do-we-use-code-coverage-for-unity/). By now things start to make sense: Unity is written in C/C++ and that’s why it’s so fast, smooth and provides us with a good performance. It’s almost over when suddenly another question pops: So why (and how) do we program in C# if Unity runs native code under the hood?

Again, the answer lays in one single hero: **Wrappers**! Oh, you don’t know what a wrapper is? Let’s talk about it a bit.

So when you are coding in C/C++, it’s a common practice to create libraries with a couple of functions\classes you are using. When you do so, you choose which functions\classes you want to expose, and which you want to hide. The exposed ones will be accessible out of the library and the hidden ones are not, commonly used by other functions\classes inside it. You know, the famous exposing code problem. When you’re done, you often have a DLL file with your library inside, and you can use it as any regular library.

But if you never used wrappers, you probably used your libraries with the same language you wrote them. So here is where the wrappers do their magic. One of the wrappers uses (there are others) is giving us a layer that provides cross language interoperability. This means you can call a C\C++ code from a C#, Python or Perl programs, per example. If you never heard about wrappers and cross language use, this can be mind-blowing, but think about it: it’s all about moving data around. If you know how to handle the data between both sides, they can work in perfect harmony.

The first time I used it was in a Game Development class where our teacher gave us an assignment that consisted of compiling a C library into a DLL file, wrapping it with C# code, and import it into Unity. There are some tutorials online teaching how to do so and I think [this one](http://ericeastwood.com/blog/17/unity-and-dlls-c-managed-and-c-unmanaged) is really straightforward. If you are curious about, try it, it’s such a simple exercise but it can teach you a lot about how Unity works. It may sound really painful (and it can be) to wrap bigger libraries, but there are tools that help us to do such challenging job. The one we used was [SWIG](http://www.swig.org/), it worked perfectly and it was all magic.

So what we just did? We created C code that is accessible from C# code. Do you get what we just did? Let’s call this C code “Unity Engine”, and let’s assume it has hundreds of functions to deal with graphics, sound, physics and particles. Now let’s create a library from it and then create a wrapper in C# that will access it. This way, any C# project that contains our library can access its content. This is the Unity Engine! The core is written using C\C++ and you code in C# taking advantage of the native code performance. The Unity Engine itself is a DLL in your installation folder, [check it out](http://docs.unity3d.com/Documentation/Manual/UsingDLL.html). Also, you can add your own Mono libraries to your Unity project, the guys from Unity [teach you how to play with it](http://docs.unity3d.com/Documentation/Manual/UsingDLL.html).

Let’s talk about one more thing: the difference between the Unity Engine and the Unity Editor. The Unity Engine is a huge library that provides us a lot of tools to run games. The Unity Editor (the gray interface, with the inspector, hierarchy, etc.) we use is another thing: it’s a user interface (UI) that helps us to build games, but it’s not necessary to run them. It’s literally just a friendly interface to help us using the Unity Engine. The editor runs some of its code from the Unity Engine, and some of its own. It is built mostly in C#, and can be expanded: you can create your own windows, inspectors, and crazy stuff like [your own browser](http://youtu.be/itkm-emb5tg?t=49m46s). Extending the editor IMO is one of the most powerful Unity’s features.

Summing up, the Unity Engine is a C\C++ set of libraries that help us to run games, and we access it using a wrapper, typically using C#. It’s a clever way to build games with great performance by taking advantage of the fast and easy development of C#. Finally, the Unity Editor is a user-friendly interface that helps us to build games using the Unity Engine.

Last but not least, the Unity Engine itself (native portion) runs in plenty of devices because it was compiled to all of those devices: check the Unity installation folder and you can see the dlls to every platform the engine exports to. So with this thought, we complete the ~~circle of life~~ circle of execution on a Unity game: the Unity Engine’s core was written in C\C++ and runs on every platform the engine targets. We can interact with that code through C# wrappers, which runs on the Mono virtual machine. Lastly, the Mono project by its nature (bringing C# to other platforms) gives us the environment to run C# applications on our devices.

That closes our discussion about how the Unity Engine works greatly on so many platforms with amazing performance and easy programming.

> **Important update (September, 2015)** ⚠️  
> Unity’s IL2CPP technology is changing the way the engine’s scripting backend works, eliminating Mono’s VM and AOT compiler. [Take a look at it!](http://blogs.unity3d.com/2014/05/20/the-future-of-scripting-in-unity/)
{: .callout }