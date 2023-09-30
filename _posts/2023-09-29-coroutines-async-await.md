---
layout: post
title:  "Asynchronous programming in Unity: Coroutines vs. async/await"
date:   2023/09/29 16:53:12 +0200
author: Matheus Amazonas
categories: jekyll update
---
{::options parse_block_html="true" /}

# Introduction

This article aims to contrast two different strategies for writing asynchronous C# code in Unity projects: Unity's Coroutines and C#'s asynchronous programming model via `async`/`await`/`Task`. We start by quickly introducing both concepts. Following, we discuss how game developers have a different relationship with asynchronous operations. Then, we describe several differences between the two approaches. Next, an alternative to C#'s vanilla `Task` class is presented. Finally, the conclusion wraps the article up.

> ℹ️ If you are familiar with Coroutines and `async`/`await` and you're just looking for the differences between them, jump to the [Coroutines vs. async/await](#coroutines-vs-asyncawait) section.
{: .callout }

# Coroutines

Coroutines are a handy tool to conveniently write code that spans over multiple frames. They can be used, for example, to dim a light until it's completely off. 

Writing one synchronous method (like the one below) will not accomplish the dim effect we're looking for because the method will start and end its execution within the same frame. Consequently, instead of dimming the light over time, it will instantly (to the player's eyes) turn it off.

```csharp
[SerializeField] private Light _light;

public void DimLight()
{
    const int steps = 100;
    var originalIntensity = _light.intensity;
    var decrement = originalIntensity / steps;
    for (var i = 0; i < steps; i++)
        _light.intensity -= decrement;
}
```

Instead, we need to change the light's intensity progressively, over multiple frames. Naturally, we can accomplish that with the `Update` method:

```csharp
[SerializeField] private Light _light;
private const float Steps = 180;
private bool _dimming;
private float _decrement;
private int _stepCount;

public void StartDimming()
{
    _decrement = _light.intensity / Steps;
    _dimming = true;
}

private void Update()
{
    if (!_dimming) return;
    if (_stepCount >= Steps)
    {
        _dimming = false;
        return;
    }
    
    _light.intensity -= _decrement;
    _stepCount++;
}
```

Even though this approach is definitely valid, it has some drawbacks. First, it's not exactly easy to read—the reader must look at three different places (private fields, `StartDimming` and `Update`) to understand the behavior. Second, it pollutes the `Update` method, specially if the class implements more of these multi-frame operations. Third, it requires an `Update` method to begin with, which has a performance cost, even when the dimming is not being performed. Lastly, disabling the script instance will pause the dimming, which might be undesirable.

That's where Coroutines come in. They are a handy tool provided by the Unity API to write operations that span across frames in a contained, readable and maintainable manner. Here's how the light dimming would be implemented with a Coroutine, where the `DimLight` method is the Coroutine, and `StartDimming` is the method that starts it by calling `StartCoroutine` (Unity's [API method](https://docs.unity3d.com/ScriptReference/MonoBehaviour.StartCoroutine.html){:target="_blank"}).

```csharp
public void StartDimming()
{
    StartCoroutine(DimLight());
    Debug.LogWarning("Dimming started!");
}

private IEnumerator DimLight()
{
    const int steps = 180;
    var originalIntensity = _light.intensity;
    var decrement = originalIntensity / steps;
    for (var i = 0; i < steps; i++)
    {
        _light.intensity -= decrement;
        yield return null;
    }
}
```

It's important to point out the asynchronous nature of a Coroutine: the code inside `DimLight` will run asynchronously, once every frame (`yield return null` ”skips” to the next frame).  On the other hand, the call to `StartCoroutine` inside `StartDimming` will complete execution within the same frame it was called (in other words, it's synchronous), and so will the call to `Debug.LogWarning`. 

Coroutines can be stopped, chained, and Unity's API offers support for this asynchronous pattern in many ways. Even though there is [a lot you can do](https://docs.unity3d.com/Manual/Coroutines.html){:target="_blank"} with Coroutines, the aim of this article is not to dive deep into them, but to contrast them with an alternative.

# The `async`/`await` pattern

The `async` and `await` keywords are part of C#'s [asynchronous programming model](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/){:target="_blank"}, which follows the [Task-based Asynchronous Pattern](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap){:target="_blank"} (TAP). In short, it is a bundle of language features (keywords, types, methods and runtime support) that aim to ease asynchronous programming. 

## Motivation

The motivation behind asynchronous programming in traditional software development is simple: some operations (most notably I/O operations) depend on external resources and conditions to complete. We call such operations “asynchronous”. Receiving network packages via the `Socket.Receive` [method](https://learn.microsoft.com/en-us/dotnet/api/system.net.sockets.socket.receive?view=net-7.0){:target="_blank"} is an example of a potentially asynchronous operation: we depend on external resources (in this case, on actual data to be available) to complete the operation. Whenever traditional, synchronous code tries to execute an asynchronous operation, it has no other choice: it must wait until the asynchronous operation is performed, “blocking” execution until a certain condition (e.g., a network packet has arrived) is met. In this context, “blocking” means that the thread executing the synchronous code will pause execution, causing a context switch (an expensive operation).

Asynchronous programming came to solve the resource management issue: instead of blocking the thread while waiting for the asynchronous operation to complete, signal that you're waiting for it, say what you'd like to be done after it's completed, and release the thread so it can perform other tasks. Whenever the asynchronous operation is completed, the runtime will fetch a thread to continue the execution from where it left off.

## History

Previously, writing asynchronous C# code meant dealing with lots of callbacks, state objects, and completion events. Reading asynchronous code was not a linear operation and it involved following a callback chain. More often than not, most of the time and effort spent writing asynchronous code was dedicated to managing the asynchronous aspect of the code, instead of completing the task at hand.

## Task-based Asynchronous Pattern (TAP)

Introduced in .NET Framework 4.5, the TAP simplifies writing and reading asynchronous code. Asynchronous operations are represented by the `Task` and `Task<T>` classes. Instead of following a callback chain, tasks can be read sequentially, line after line. In addition, tasks can be composed and canceled. Waiting for an asynchronous operation is accomplished via the `await` keyword. A method can be awaited if it returns an “awaitable” type (e.g., `Task`). Asynchronous methods (i.e., methods that wait for asynchronous operations) must be tagged with the `async` keyword. 

## TAP in Unity

The Task-based Asynchronous Pattern has been supported in Unity [since version 2017.1](https://github.com/Unity-Technologies/UnityCsReference/blob/96f436785a211ceaee095b67b170b8ce73908350/Runtime/Export/UnitySynchronizationContext.cs){:target="_blank"}. Therefore, we can rewrite the light dimming example from the previous section using TAP's constructs:

```csharp
// Although it is good practice to suffix an asynchronous method's 
// name with `Async`, doing so doesn't trigger any language features.
public async Task DimLightAsync()
{
    const int steps = 180;
    var originalIntensity = _light.intensity;
    var decrement = originalIntensity / steps;
    for (var i = 0; i < steps; i++)
    {
        _light.intensity -= decrement;
        await Task.Yield();
    }
}
```

The code above is extremely similar to the dimming's Coroutine approach from the previous section. In fact, the only differences are the method's return type, the addition of the `async` keywords, and the replacement of the `yield return null` statement with `await Task.Yield()` (which also “skips” to the next frame). When compared to the Coroutine approach, the snippet above doesn't improve readability, it doesn't eliminate the need for any special feature, neither improves performance. Then why the hell are we considering replacing our old friend Coroutine with this new, shiny construct?

There are some valid points worth considering  when comparing the two approaches. But before we jump into the differences, I would like to discuss how asynchronous programming in game development differs from traditional software development.

# Asynchronous programming in game development

In “traditional” software, asynchronous operations are a necessary evil that we can't get gif of. Let's say, for example, that we're waiting for a network socket to receive some data and there's none available. It's impossible to eliminate the issue at hand (there's no data to receive). We can't just magically place the data into the socket buffer, unless it has actually been received. There's no other choice besides waiting until the data is available to continue execution. In an ideal world, asynchronous operations would not exist and every operation would be synchronous. Thread blocking would be eradicated and everything would be amazing. But that's not the world we live in, and we have to cope with asynchronous calls. Solutions like TAP and `async`/`await` aim to ease writing and reading asynchronous code, but they don't eliminate their existence.

Even though the same holds for game development, we don't just cope with asynchronous operations. We add asynchronicity to operations that technically don't need it. The light dimming example from the previous sections is a perfect example of this practice. We can easily write synchronous code that progressively dims a light using iterations. In fact, that's what we did in this article's first code snippet. But doing so synchronously isn't interesting in a video game (or any kind of interactive media) because users would not be able to watch the dimming, and would experience the operation as an instant shutdown.

This distinction might seem obvious, but it has some impact on how game developers deal with asynchronous operations. While non-game developers try to avoid asynchronous operations at all costs, game developers embrace them. Instead of a necessary evil, they become a tool to model operations that span across multiple frames. Consequently, game developers might not only encounter, but also write asynchronous code much more often than traditional developers. I believe, therefore, that like any other tool, we should understand it, compare the available options and learn which ones are best for each task.

# Coroutines vs. `async`/`await`

Even though both strategies are capable of modeling asynchronous operations, there are some important differences between them. This section presents the ones I judge most important, split into different aspects and in no particular order.

<details open >
  <summary><h3 style="display:inline">Availability</h3></summary>

Unlike C#'s [Task-based Asynchronous Pattern](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap){:target="_blank"} (TAP) and its `async`, `await` and `Task`, Unity's Coroutine is not a language/runtime feature. Instead, it's part of Unity's API and runtime. The methods used for Coroutine management (i.e., `StartCoroutine`, `StopCoroutine`, etc) are part of the `MonoBehaviour` [class](https://docs.unity3d.com/ScriptReference/MonoBehaviour.StartCoroutine.html){:target="_blank"}. In addition, a Coroutine is directly tied to the `MonoBehaviour` that started it. 

This means that Coroutines can only run in instances of classes that inherit from `MonoBehaviour`, effectively limiting the types of classes that have access to this tool. There are some ways to get around this limitation, but they usually use a dedicated `MonoBehaviour` just to run Coroutines created by non-`MonoBehaviour` classes, which is far from an ideal solution, in my opinion.

C#'s TAP (Task-based Asynchronous Pattern) and its types (e.g., `Task`), on the other hand, can be used in any class, turning it into a default choice for non-`MonoBehaviour` classes.
</details>

<details open >
  <summary><h3 style="display:inline">Outcome accessibility</h3></summary>

Coroutines return an instance of `IEnumerator`, which will be used by Unity's runtime to run and manage the Coroutine. Consequently, we can't use Coroutines to return some value without reverting to other old-school asynchronous strategies like callbacks—which won't actually return a value, just perform an operation at a given point, without any guarantees.

Even though this lack of return value isn't a problem in many scenarios, we would sometimes like to communicate the outcome of an asynchronous operation. For example, whether the operation was a success (`bool`), how look it took to complete (`float`) or how many attempts it took to succeed (`int`). 

On the other hand, C#'s TAP offers the `Task<T>` type, which represents an asynchronous operation that returns a value of type `T` upon completion. The value will be available once the task is completed and can be conveniently accessed in tandem with the `await` keyword.

```csharp
private Task<bool> TryToDoSomething() { ... }

bool success = await TryToDoSometing();
```
</details>

<details open >
  <summary><h3 style="display:inline">Stopping and cancellation</h3></summary>

Both Coroutines and `Task` offer mechanisms to stop asynchronous operations. The `MonoBehaviour` class offers the following methods for stopping Coroutines:

- `StopAllCoroutines` to stop all Coroutines running on that instance.
- `StopCoroutine` ****to stop a specific Coroutine (3 overloads are offered).

In C#'s TAP, we don't say a task was stopped, we say it was *canceled*, and [cancellation tokens](https://learn.microsoft.com/en-us/dotnet/api/system.threading.cancellationtoken?view=net-7.0){:target="_blank"} are used to signal task cancellation. It's a drastically different approach when compared to Coroutine's, with a steeper learning curve that includes learning about `CancellationToken`, `CancellationTokenSource`, `OperationCanceledException` and `AggregateException`. At the same time, it allows for two extremely useful concepts that are not available with Coroutines:

- The running `Task` is aware that it got canceled, and therefore, it can perform some cleanup operations. For example, a file download can be canceled by the user via the application UI, and the download, being aware of the cancellation, can close sockets and file handlers. With Coroutines, calls to `StopCoroutine` are often followed by cleanup calls, which expose implementation details to the caller (e.g., the download operation is now spread into multiple calls) and are more error-prone (given that the cleanup calls can be mistakenly left out).
- Likewise, the code that is awaiting a canceled `Task` is also aware of the cancellation—if best practices are followed. Provided with that information, the caller might decide to go down a different path than the successful one. Following the download example above, a download progress window might call a `DownloadAsync`  method and display a message if the download completes, but dismiss itself if it was canceled (by someone else). All that is possible within one enclosed method in the download window class, without the need for any extra data to signal completion. With Coroutines, we need to use dedicated fields that communicate whether a Coroutine completed successfully, checking its value before continuing. This approach is less readable, less maintainable and more error-prone (updating the supporting fields becomes a chore).

Although the `Task` approach to stopping/cancellation isn't as simple as the Coroutine one, it is much more powerful. Once tamed, it becomes particularly useful in more complex scenarios with multiple nested levels of asynchronous calls.
</details>

<details open >
  <summary><h3 style="display:inline">Lifetime management</h3></summary>

A Coroutine is tightly coupled to the `MonoBehaviour` that started it. If its `MonoBehaviour` is destroyed, the Coroutine stops automatically. A Coroutine will also stop running (not pause!) whenever the game object that holds its `MonoBehaviour` is disabled. Re-enabling the game object will not resume the Coroutine. At the same time, disabling the script instance that started the Coroutine has no effect on its lifetime. Even though this behavior might seem handy at times (it protects developers who forget to stop a Coroutine), it might have some [undesired effects](https://forum.unity.com/threads/fixed-coroutine-issue-coroutine-stopped-for-no-reason.329317/#post-5018075){:target="_blank"}, particularly when disabling game objects. Even worse, there is no way to avoid this automatic stopping.

`Task`, on the other hand, runs on a dedicated scheduler and requires manual lifetime management by default. A `Task` won't stop running if the script instance that created it is disabled or destroyed. It also won't stop if the game object that contains the script instance that started it is destroyed. Hell, it won't stop running in the Unity editor even if you exit play mode. The developer is responsible for explicitly managing the lifetime of a `Task`, and for cancelling it whenever necessary. In Unity applications, this often requires calls to the `CancellationTokenSource.Cancel` and `Dispose` methods inside `OnDestroy`. 

Even though C#'s TAP's approach requires manual lifetime management, it doesn't hide potential surprises, and it offers more flexibility than Coroutine's approach. Additionally, the explicit task cancellation calls serve as documentation about the exact circumstances under which asynchronous operations should stop running. Finally, TAP's cancellation token approach offers granular control over the order in which tasks are canceled.
</details>

<details open >
  <summary><h3 style="display:inline">Error handling</h3></summary>

C#'s error handling mechanism composed of runtime exceptions, `try`/`catch`/`finally` blocks and execution flow interruptions are a great tool in a developer's arsenal. 

Unfortunately, Coroutines and error handling don't go very well together because `yield` statements can't be placed inside `try`/`catch`/`finally` blocks. Consequently, there is no way for a method waiting for a Coroutine to finish executing (using a `yield return` statement) to get notified about the thrown exception. Take the following code as an example:

```csharp
private IEnumerator MoveTarget() { ... }
private IEnumerator DimLight() { ... }

private IEnumerator RunComposed()
{
    // There is no need to call StartCoroutine when yielding Coroutines
    // to accomplish sequential composition.
    yield return MoveTarget();
    yield return DimLight();
}
```

Since a `yield` statement can't be wrapped by a `try`/`catch` block, there is no way for `RunComposed` to handle an exception thrown by either `MoveTarget` or `DimLight`.  Therefore, special care must be taken when writing Coroutines, especially when [exogenous](https://ericlippert.com/2008/09/10/vexing-exceptions/){:target="_blank"} exceptions might be thrown.

C#'s TAP and `Task`, on the other hand, do not suffer from the same limitation as Coroutines. Calls to `await` can be placed inside `try`/`catch`/`finally` blocks. Here's an example:

```csharp
private async Task RunComposedAsync()
{
    try
    {
        await MoveTargetAsync();
    }
    catch (ArithmeticException)
    {
        // Cleanup the mess 
    }
}
```

If `MoveTargetAsync` throws an `ArithmeticException`, it will be caught. In the end, there are no limitations to error handling when using TAP constructs, including the `await` keyword. In fact, not only is error handling fully compatible with C#'s TAP, but the entire `Task` cancellation workflow is [based on exception handling](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/task-cancellation){:target="_blank"}.
</details>

<details open >
  <summary><h3 style="display:inline">Multithreading support</h3></summary>

Multithreading is a great way of leveraging the multicore capability of modern processors to improve performance, and its proper use might lead to major performance gains in video games.  As [some](https://gamedev.stackexchange.com/questions/91900/event-error-can-only-be-called-from-the-main-thread){:target="_blank"} of [you](https://www.reddit.com/r/unity_tutorials/comments/ipfwvv/how_to_fix_get_transform_can_only_be_called_in/){:target="_blank"} [might](https://stackoverflow.com/questions/53916533/setactive-can-only-be-called-from-the-main-thread){:target="_blank"} [know](https://forum.unity.com/threads/can-only-be-called-from-the-main-thread.622948/){:target="_blank"}, Unity isn't exactly friendly towards multithreaded code and offers an alternative to C#'s vanilla threads for multithreading solutions: the [Job System](https://docs.unity3d.com/Manual/JobSystemOverview.html){:target="_blank"}. In this section, I would not like to focus on C#'s threads versus Unity's jobs discussion. Each tool has its merits, and there's enough to talk about to fill up its own blog post.

Instead, I would like to focus on C#'s threads and on a characteristic of multithreaded code: asynchronicity. Because multithreaded code runs on another thread (shocking!), it is, by nature, asynchronous. We have no guarantees about when it's going to finish executing, and we often don't even know which thread will execute it. With that in mind, developers could greatly benefit from using tools meant for asynchronous programming alongside multithreaded code, effectively benefiting from a single tool to rule all asynchronous constructs.

Unfortunately, Coroutines are not a good match for multithreaded code. There is no API support to mix threads and Coroutines together and as Unity's documentation [reminds us](https://docs.unity3d.com/Manual/Coroutines.html){:target="_blank"}, Coroutines are not threads and their code still executes on the main thread. 

On the other hand, C#'s TAP offers great support for multithreading. A `Task` can execute on a thread from the thread pool using `Task.Run`:

```csharp
private Task DownloadAndDecompressImage() { ... }

Task.Run(DownloadAndDecompressImage);
```

Additionally, `Task.Run`  also returns a `Task`, which can be awaited:

```csharp
private async Task<bool> DownloadAndDecompressImage() { ../ }

var success = await Task.Run(DownloadAndDecompressImage);
```

Task cancellation, error handling, outcome accessibility… all the points discussed so far are also supported in a multithreaded context. In the end, C#'s TAP has a clear edge over Unity's Coroutines when it comes to handling the asynchronous nature of multithreaded code.
</details>

<details open >
  <summary><h3 style="display:inline">Fire and forget</h3></summary>

Although waiting for asynchronous operations is essential to working with them, there are some scenarios in which it's not interesting to do so. For example, displaying a fireworks animation once the player scores and not waiting for its completion to perform any other action. This category of asynchronous operations is often referred to as “fire and forget”.

With Coroutines, fire and forget is as simple as it can be: just start the Coroutine, and forget about it! Well, with some caveats. As we've seen before, the Coroutine will stop running automatically if the `MonoBehaviour` instance or the game object that holds the instance gets destroyed, which is great because the developer doesn't have to manually stop it. But at the same time, if the game object gets disabled, the Coroutine will also stop running. Thus, we need to account for that and—whenever applicable—restart the Coroutine once the game object is re-enabled.

With C#'s TAP, it's not that simple for two reasons:

- As we've seen before, `Task` lifetime management is completely manual, and the burden lies with the developer. Unlike Coroutines, a `Task` won't stop running unless it's told so or if an exception is thrown and uncaught. Consequently, we need to inform asynchronous `Task`s about game object destruction. That can be accomplished either by using a supporting field (e.g., `bool _isAlive`) or by using TAP's best practices for task cancellation: cancellation tokens. When compared to Coroutines, it's definitely more cumbersome.
- Fire and forget isn't as common in standard C#/.NET projects as it is in Unity projects. Just the concept of starting an asynchronous operation to never wait or fetch its outcome sounds weird to most developers. Once again, game development challenges traditional applications of asynchronous code. As a consequence of this uncommonness, TAP doesn't provide great support for starting “fire and forget” tasks. We can still do it: simply invoke the method without awaiting (e.g., `RotateAsync();`), but the compiler (and also some IDEs) will warn you about the fact that an asynchronous call is not being awaited.

Unlike Coroutines, tasks that were started by a `MonoBehaviour` instance will not stop running if the game object that holds the instance is disabled. Whether this characteristic is considered an advantage or disadvantage is subject to the nature of the task; it might be handy, or it might be a pain that requires a workaround.

Ultimately, the convenience of Coroutines when it comes to starting and stopping “fire and forget” asynchronous operations is clearly superior. At the same time, the fact that Coroutines automatically stop when their game object is disabled might be a liability. C#'s TAP offers more control over the game object disabling scenario, but is evidently less convenient when it comes to starting and stopping tasks. With that said, check the session on UniTask later in this post to see how a new player brings that convenience back to C#'s TAP in Unity.
</details>

<details open >
  <summary><h3 style="display:inline">Memory allocation</h3></summary>

We must keep an eye on allocated memory whenever developing games in a programming language that provides automatic memory management via a Garbage Collector (GC) like C#. We benefit from keeping GC allocations as low as possible in two ways. First, the overall application's memory usage is reduced—often a marginal gain, considering that assets usually take up most of a game's memory footprint. Second, and more importantly, it reduces the frequency with which the GC collects garbage; an operation that takes a considerable amount of time and that often causes performance drops.

Both `Coroutine` and `Task` are classes (a reference type, allocated on the heap by the GC), and creating new instances of them forces the GC to allocate memory. But not every usage of Coroutines and C#'s TAP will. For example, waiting until the next frame:

```csharp
// Coroutine
yield return null;

// TAP
await Task.Yield();
```

None of the calls above will allocate memory on the heap. The first one returns null (which obviously doesn't allocate). Despite `Task.Yield` living in the `Task` class, it [doesn't return](https://github.com/microsoft/referencesource/blob/51cf7850defa8a17d815b4700b67116e3fa283c2/mscorlib/system/threading/Tasks/Task.cs#L3031){:target="_blank"} a `Task`, but a `YieldAwaitable`—a [struct](https://github.com/microsoft/referencesource/blob/51cf7850defa8a17d815b4700b67116e3fa283c2/Microsoft.Bcl.Async/Microsoft.Threading.Tasks/Runtime/CompilerServices/YieldAwaitable.cs#L13){:target="_blank"}.

Waiting for a given amount of time, on the other hand, does allocate memory on the heap. In the code below, for example, both calls will allocate memory, although the `Task` call will allocate considerably more. 

```csharp
// Coroutine
yield return new WaitForSeconds(0.001f); // In seconds

// TAP
await Task.Delay(1); // In milliseconds
```

The allocation cost of both Coroutines and Tasks might seem nitpicking, but it is wise to consider the fact that these constructs might be used in loops with lifetimes that might span across several frames. We should also consider that, given the asynchronous nature of games we've discussed before, an application might have several Coroutines or Tasks running simultaneously. The allocation cost accumulates over time and might cause frequent performance drops caused by garbage collection.

Fortunately, an alternative to C#'s `Task` aims to reduce this performance overhead: UniTask. We will dive into this solution in the next section.
</details>

# UniTask: an alternative to `Task`

[UniTask](https://github.com/Cysharp/UniTask){:target="_blank"} is a library that, in their words, “provides an efficient allocation free async/await integration for Unity”. It introduces a replacement for the `Task` class when using C#'s TAP in Unity: the `UniTask` struct. It's a drop-in replacement that behaves almost exactly like `Task` would, with a few exceptions: 

- It does not allocate as much memory on the heap as `Task`. Consequently, it reduces the amount of generated garbage and the frequency of garbage collection. The difference can be explained by the fact that `Task` and its internal data types are mostly classes, while `UniTask` and its internal data types are mostly structs.
- It brings better support for “fire and forget” asynchronous operations with the `UniTask.Forget` method.
- It introduces a rich API that is tailored for Unity development: `WaitForSeconds`, `WaitUntil`, `WaitWhile`, `WaitForEndOfFrame` and others. In addition, it provides methods to compose `UniTask`s, like `WhenAll` and `WhenAny`.
- It's fully interoperable with Coroutines. `ToUniTask()` can be called to transform a Coroutine into a `UniTask` and `ToCoroutine()` can be used the other way around. In addition, it adds `await` support for Coroutines and `AsyncOperation`:
    
    ```csharp
  private IEnumerator MoveTarget() { ... }
  
  await MoveTarget();
  await SceneManager.LoadSceneAsync("Menu");
    ```

When compared to `Task`, `UniTask` maintains most of the characteristics discussed in the previous section: outcome accessibility, cancellation, lifetime management, error handling and multithreading support. At the same time, it improves “fire and forget” support and memory allocation. The downside is clear: availability. UniTask is not built into C#'s standard library nor into Unity. In my opinion, it's a price worth paying for an overall superior solution for writing asynchronous code in Unity.

# Conclusion

In this article, we took a deep dive into two solutions for writing asynchronous code in Unity: Coroutines and C#'s Task-based Asynchronous Pattern (TAP) with `async`/`await`. We compared these approaches against each other in categories that exposed the main differences between them.

Coroutines had an advantage on “fire and forget” support and a slight lead on memory allocation. C#'s TAP with the `Task`/`async`/`await` trio proved to be a better choice when it came to availability, outcome accessibility, stopping/cancellation, error handling and multithreading support. Either could be deemed a more compelling choice when it comes to lifetime management—it depends on who you ask.

[UniTask](https://github.com/Cysharp/UniTask){:target="_blank"} comes to `Task`'s rescue and snatches Coroutine's trophies on “fire and forget” support and memory allocation. It becomes the overall winner in all categories except one: availability. Although Coroutines are still a great solution for “fire and forget” operations, I would avoid mixing different asynchronous techniques in the same code base. Choosing a single approach reduces tech fragmentation, avoids bugs caused by wrong assumptions and improves maintainability.

I've been using UniTask for writing asynchronous code in both professional and personal [projects](https://matheusamazonas.net/portfolio.html){:target="_blank"} for over three years now. It has undoubtedly delivered on its promise, and I can't see myself writing asynchronous code in Unity without it. 

With that said, in the end, it's a matter of personal choice. If you are happy with Coroutines and don't want to step into C#'s TAP world, go ahead. If you like `async`/`await` but don't want to bother with UniTask, you do you. Would you like to dive deep into UniTask? Be my guest. But be conscious of each tool's characteristics, limitations and strengths. In the end, we're all just trying to make fun games, no matter what tools we use.

That's all for today! As usual, feel free to use the comment section below for questions, suggestions, corrections, or just to say “hi”. See you on the next one!