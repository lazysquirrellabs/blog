---
layout: post
title:  "Creating and using a native iOS/iPadOS (Swift) library in Unity"
date:   2024/11/17 12:18:38 +0200
author: Matheus Amazonas
categories: jekyll update
---
Unity is a great tool to develop cross-platform games and interactive applications, but it lacks some functionality that is often delivered by native platform libraries. A good example of that is iOS/iPadOS functionality that is only available in native libraries like SwiftUI.

Developers can invoke native code from C# in Unity, as part of its support for native plugins. Although this feature is [documented](https://docs.unity3d.com/Manual/ios-native-plugin-create.html) for C(++) and Objective-C(++), it lacks information when it comes to Swift. Some non-official tutorials I've found are outdated and don't work on newer versions of Xcode. I decided to investigate on how to accomplish the same task using Swift and modern versions of Xcode and document it, in case someone else out there runs into the same issue. This article does exactly that.

In the following sections, we go through the process of setting up an Xcode library project so some of its Swift functions are exposed—once the library is built—so they can be used in a Unity project that targets the iOS platform, using C#. Together, we will build toy examples that can be further developed into real-world features that bridge the gap between Unity and native iOS development.


# Prerequisites
As usual with iOS development, you need a machine running macOS. Xcode is an essential part of the process, and it's only available on Apple's operating system. Once you got your hands on a Mac, ensure that the following is installed:
- Xcode.
- Unity.
- Unity's "iOS Build Support" module.

That should be all we need to get it working.

# Setup
This is the setup that I used to perform the steps below, in case it is relevant to your use case:
- Hardware: macBook Pro 16" (M1 Max).
- OS: macOS Sonoma 14.6.1.
- Software:
  - Xcode 15.0.
  - Unity 60000.0.24.

# Steps
The process is split into 3 parts: library development in Xcode, library import and usage in Unity and finally app build in Xcode.

## Part 1: Library development in Xcode
The general idea is to create a library with custom code, expose some of its functions to external usage via attributes, compile the library, and bring it into Unity. To accomplish that:
- Open Xcode and select "Create new project":
  ![](/assets/images/post25/step1.png)
- On the template selector, select the "iOS" platform, and then "Static Library" template under the "Framework & Library" group:
  ![](/assets/images/post25/step2.png)
- Choose your product name, team (redacted on the screenshot) and organization identifier. Select "Swift" as the language, and press "Next".
  ![](/assets/images/post25/step3.png)
- A project with a single Swift file named after the product name you chose will be created. In this example, it's `MyNativeLibrary.swift`. We will use that file as the native library's entry point. Create a new Swift file to place your custom code file next to it. In this example, it will be named `MyNativeStruct.swift`, and it will contain some dummy method that prints a message:
  ```swift
  public struct MyNativeStruct {
	  static func sayHello() {
		  print("Hello Unity world from Swift native! 🙋‍♂️")
	  }
  }
  ```
- In the entry point file (`MyNativeLibrary.swift`), expose the newly created method using the `_cdecl` attribute:
  ```swift
  import Foundation

  @_cdecl("MyNativeStruct_sayHello")
  public func MyNativeStruct_sayHello() {
	  MyNativeStruct.sayHello()
  }
  ```
  The choice to split the function implementation and its "exposure" is completely arbitrary here. The function above could've implemented the behavior directly, without the need to call `MyNativeStruct.sayHello()`.
- Save your changes. Open the terminal and `cd` into the Xcode's project directory. Then run the following command, replacing  `MyNativeLibrary.xcodeproj` with your project's `.xcodeproj` file, and `MyNativeLibrary` with your project's scheme name (if you haven't changed it, it's your product name):
  ```bash
  xcodebuild -project MyNativeLibrary.xcodeproj -scheme MyNativeLibrary -configuration Release -sdk iphoneos CONFIGURATION_BUILD_DIR=.
  ```
- If the build is successful, an archive file (with an `.a` extension) should now be present in your project's root directory, named after your product name:
  ![](/assets/images/post25/archive.png)
  That is the file that will be brought into Unity.

## Part 2: Library import and usage in Unity
No special project setup is required in Unity, besides switching platforms to iOS.
- In your Unity project, create a folder under `Assets/Plugins/iOS` with the name of your library and place the archive file above in it:
  ![](/assets/images/post25/unity1.png) 
  The folder name choice is irrelevant to the plugin functionality. The name above was chosen for consistency.
- Create a C# class that will serve as the bridge between Unity and the library. In this example, we will call it `NativeTest`:
  ```csharp
  using System.Runtime.InteropServices;  
  using UnityEngine;  
  
  public class NativeTest : MonoBehaviour  
  {  
	  [DllImport("__Internal")]  
	  public static extern void MyNativeStruct_sayHello();  
  
	  private void Awake()  
	  {  
		  MyNativeStruct_sayHello();  
	  }  
}
  ```
Calling its `MyNativeStruct_sayHello` method will call the Swift counterpart. To test the solution, a call to that method was added in the `Awake` method. In your code, you can call `NativeTest.MyNativeStruct_sayHello` to invoke the native function.
- Add an instance of `NativeTest` to a game object in a scene in that is in the build setting's scene list and that will be loaded on startup—just so we can test it easily.
- Build your project and wait for it to complete.

## Part 3: App build in Xcode
Now that Unity finished building the project, let's run it on a device (or a simulator, if you don't have one available):
- Open the newly built Xcode project generated by Unity.
- On the Project Navigator (left panel), select your project:
  ![](/assets/images/post25/xcode1.png)
- Under "Signing and Capabilities" choose your Team, provisioning profile and signing certificate (redacted on the image):
  ![](/assets/images/post25/xcode2.png)
- Build and wait for the app to start running on your device (or simulator). If everything worked as expected, you should be able to see the hello message on the console, among other messages:
  ```
    -> applicationDidBecomeActive()
    UnloadTime: 1.126375 ms
    Hello Unity world from Swift native! 🙋‍♂️
    WARNING -> applicationDidReceiveMemoryWarning() 
  ```
  Success!

# Extending the code
Even though the example above worked, the function used didn't take any arguments as input and didn't return any values either. Those are crucial buildings blocks of programming languages, and we can not declare this tutorial complete without going through them.

Thankfully, there is nothing special required to handle function arguments and returns for primitive types—as long as their types match. For example, C#'s `int` and Swift's `Int32` both represent 32-bit integer numbers. Let's create a new example function that takes input and returns a value so we can test this theory. 

First, define a new Swift function that multiplies two input values and returns the outcome. Declare the function inside `MyNativeStruct`:
```swift
static func multiply(_ x: Int32, _ y: Int32) -> Int32 {
    return x * y;
}
```
And then expose it in `MyNativeLibrary.swift`:
```swift
@_cdecl("MyNativeStruct_multiply")
public func MyNativeStruct_multiply(x: Int32, y: Int32) -> Int32 {
    return MyNativeStruct.multiply(x, y)
}
```
Repeat the build, copy and paste archive file steps. Finally, in Unity, add the new method to the C# `NativeTest` class:
```csharp
[DllImport("__Internal")]  
private static extern int MyNativeStruct_multiply(int x, int y);
```
And call it inside awake, so we can test it:
```csharp
Debug.Log($"Multiplying 42 by 3: {MyNativeStruct_multiply(42, 3)}");
```
Build the iOS Unity project, open Xcode and build for running. And sure enough, we see the outcome of the example function call in the device logs:
```
Multiplying 42 by 3: 126
UnityEngine.DebugLogHandler:Internal_Log(LogType, LogOption, String, Object)
NativeTest:Awake()
```

# Conclusion
In this short tutorial, we learned how to create a native iOS/iPadOS library written in Swift, and how to use it in a Unity iOS project with C#. We went through the basic concepts and implemented small, simple examples that can be modified to develop real world features that take advantage of native iOS functionality in Unity.