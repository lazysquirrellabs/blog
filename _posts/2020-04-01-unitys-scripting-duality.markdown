---
layout: post
title:  "Unity’s Scripting Duality and Object Destruction"
date:   2020/04/01 20:35:38 +0200
author: Matheus Amazonas
categories: jekyll update
---
The Unity engine provides users with tools and abstractions that ease its usage and hide its complexity. Although we often take these commodities for granted and completely forget they exist, we often face a situation in which they become apparent, usually due to an unexpected behavior. In this article, I discuss how an example of such an abstraction tool — Unity’s scripting solution — can accidentally expose the engine’s underlying mechanisms.

# The duality: managed vs. native

As we all know, Unity’s programming language of choice is C#, but we need to keep in mind that the engine code itself isn’t written in C#, but in C/C++. Consequently, every code piece that invokes engine code (e.g. `transform`, `GetComponent`, `gameObject.SetActive`) does not run directly on the C# side, but on the native C++ side instead. An object of a type that inherits from `UnityEngine.Object` (like a `MonoBehaviour`) has two counterparts that live in different worlds: a managed object in C# world and an object in the native engine world. These two entities are linked to each other — the managed entity holds a pointer to the native entity — but are not, in fact, the same thing. Calls to the managed entity (often referred as a “wrapper”) will be transferred to the native entity whenever necessary: when a call to engine code is invoked. On the opposite side, wrapper calls that do *not* invoke engine code will not send to the native entity and will execute locally.

This might seem an unnecessary deep dive into the engine, but it brings some unexpected consequences. Take the example below. A `Dog` is a `MonoBehaviour` that does two simple things: `Bark` and `Move`. The first is a pure C# method that does not invoke engine code whereas the second moves the dog’s `GameObject`, invoking native engine code.

```csharp
public class Dog : MonoBehaviour
{
    public void Bark()
    {
        Debug.Log("Woof!");
    }
 
    public void Move()
    {
        transform.position += new Vector3(1f,1f,1f);
    }
}
```

Now let’s test our `Dog` script with the help of the `DogExample` script below. This script creates a dog on `Awake` and can perform three actions based on user input: destroy the dog, make it bark and move. Simple as that.

```csharp
public class DogExample : MonoBehaviour
{
    private Dog _dog;
 
    private void Awake()
    {
        var dogGameObject = new GameObject("Dog");
        _dog = dogGameObject.AddComponent();
    }
 
    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.D))
            Destroy(_dog);
        if (Input.GetKeyDown(KeyCode.B))
            _dog.Bark();
        if (Input.GetKeyDown(KeyCode.M))
            _dog.Move();    
    }
}
```

Following, let’s test it, creating a new empty scene with the above script attached to a `GameObject`. Once we play the game, a new `GameObject` named “Dog” is created, with a `Dog` script added to it. If we hit the B key, the dog barks (in Unity’s console). If we hit the M key, it moves (we can see its position in the inspector). Then, we hit the D key to destroy that `Dog` instance. In the editor hierarchy, we can still see the “Dog” object, but there is no `Dog` script attached to it. If we try to make the dog move, a `MissingReferenceException` is thrown, stating that “The object of type ‘Dog’ has been destroyed but you are still trying to access it”. The exception makes sense because we’ve just destroyed the `Dog` instance. The same thing happens if we decide to destroy the `dog.gameObject` instead (but then the “Dog” game object would be removed from the hierarchy).

However, if we press the B key to make the dog bark, no errors are thrown and the “Woof!” message is displayed on the console. What just happened? The `Dog` script was just destroyed and an error was thrown proving it. How can the dog still bark?

It is here where the managed vs. native duality explained in the previous session becomes useful. The two entities are different: a `Dog` script lives in the managed C# world and its underlying components (i.e. its `GameObject` and `Transform`) live in the native, C++ engine world. They are somewhat connected, but they are *not* the same thing. When the wrapper dog was destroyed, its script instance was removed from the “Dog” game object and its native components were wiped out, but the managed `Dog` object wasn’t, and it will only be destroyed when it gets garbage-collected. As long as we keep a reference to that `Dog` instance, it will live. When we invoke the dog’s `Bark` method, we are simply invoking a regular C# method of an entity that lives in the managed world. As long as it doesn’t try to access any of its native world entities that just got destroyed, that call method should execute successfully.

This scenario changes if we try to access any of its underlying native entities, like its `gameObject` property, as we do in the `Move` method. In that case, the engine throws an error to let us know that the object of type `Dog` we are trying to access was destroyed. Note that the exception is a `MissingReferenceException`, an exception defined in the `UnityEngine` namespace. It is not a `NullReferenceException` and thus, it is not a C# built-in exception. Again, that sounds too deep of a dive into the engine details, but this subtle detail underscores the fact that the managed entity (the `Dog` instance) was not destroyed at all, otherwise an `NullReferenceExceptionexception` would have been thrown. In fact, the wrapper object still lives. The call to `Destroy` will only destroy native, engine components. In other words, the lifetime of native entities will be determined by a call to `Destroy` (or a non-additive scene load) whereas the lifetime of managed entities will be determined by the garbage collector. Thus, the two entities have different life cycles, and sometimes we need to keep that in mind.

For a deeper look into how the Unity engine works under the hood, check [this article]({{ site.post2 }}){:target="_blank"} out.

# The potential problem

We just went through why a user-defined `MonoBehaviour` still lives in the managed world even after their corresponding native entity was destroyed. Also, we discussed how we can still invoke some of their methods successfully, as long as they don’t try to access their native engine components. This fact introduces two important questions: how do we easily identify that these managed entities should not be accessed anymore because their underlying entities were destroyed? Is it a good practice to still access a `MonoBehaviour` after is has been destroyed?

Let’s start answering the second question: no, it is *not* a good idea to access a `MonoBehaviour` after its native entities were destroyed. One might think that it’s safe to keep some of its methods free from accesses to native, engine code, but this practice hurts code maintainability badly. It introduces an unspoken (or undocumented) rule that some methods should not try to access some specific components. Consequently, some developer — unaware of this weird rule — might change the code down the development process, which could potentially introduce errors. Additionally, it goes against the idea of using a `MonoBehaviour`, which is to attach scripts to Game Objects so they can interact. If you want to use an object that does not necessarily relate to a Game Object and its life cycle, do not inherit from `MonoBehaviour` and use a vanilla C# class instead — or maybe you want to use a [Scriptable Object]({{ site.post5 }}){:target="_blank"}.

# The solution

The first question remains open: how do we easily identify that these managed entities should not be accessed anymore? The answer comes from Unity. We can easily check if the underlying entities of a `MonoBehaviour` were destroyed in two ways:

- Check for equality against null:
    
    ```csharp
    if (_dog == null)
        _dog.Move();
    ```
    
- Check it as a boolean expression:
    
    ```csharp
    if (_dog == true)
       _dog.Move();
    ```
    
    or simply
    
    ```csharp
    if (_dog)
       _dog.Move();
    ```
    

The `UnityEngine.Object` class (which `MonoBehaviour` inherits from) implements custom equality operators that check if the underlying entities were destroyed. This operation is more complex than simply checking if the object reference is null because it invokes native code to check if the underlying entity was destroyed. As a consequence, it is also less performant than a vanilla C# null comparison. That’s why the Rider IDE displays a warning (“Comparison to ‘null’ is expensive”) whenever this null check is performed in a performance critical context. This custom implementation was [reconsidered](https://blogs.unity3d.com/2014/05/16/custom-operator-should-we-keep-it/){:target="_blank"} a while ago by Unity developers, but it was kept and still exists. This tool gives us a way to safely and easily check the lifetime of a `MonoBehaviour`‘s underlying object, which was exactly what we were looking for. But there is one thing to keep in mind…

# One little trap

Even though we can use Unity’s custom equality operators to check whether a `MonoBehaviour` has been destroyed, we need to be careful about when we perform this check. As it happens, Unity does not destroy an object exactly when `Destroy` in invoked. Instead, the given object is tagged for destruction, which will only happen after the end of the current Update loop, but [before rendering](https://docs.unity3d.com/ScriptReference/Object.Destroy.html){:target="_blank"}. At that point, all objects that were tagged for destruction will be actually destroyed. As a consequence, a check for destruction invoked right after (within the same `Update` loop) the `Destroy` call will return false. For example:

```csharp
private void DestructionTest()
{
    Destroy(_dog);
    Debug.Log($"Is the dog null/destroyed? {_dog == null}");
}
```

The method above, when executed outputs “Is the dog null/destroyed? False”. If we run the same check one frame later, or even inside `LateUpdate`, the check returns true. That happens because the call to `Destroy` doesn’t actually destroy the object, it only *tags* it for later destruction. After the `Update` loop, the engine gathers all objects tagged for destruction and actually destroys them, one by one. As a consequence, we need to keep the delayed destruction in mind when checking for existing entities.

Not all C#’s equality operators implement this custom behavior. For a deeper look into Unity’s equality operators, check [this article]({{ site.post11 }}){:target="_blank"} on the subject.

# Conclusion

Unity does a great job at hiding implementation details and at abstracting away the complexity of its native side by providing C# wrappers for developers. Although this abstraction layer can be often ignored, there are some nuances we should keep in mind, like the different lifetimes of managed and native entities. But once we understand what is going on behind the scenes, it becomes clear that some unexpected behaviors are just consequences of Unity’s scripting duality.

In this article, we learned how managed entities that inherit from `UnityEngine.Object` have a native counterpart and how their lifetime differ. We also learned how to use Unity’s custom implementation of equality operators to safely check for object destruction. Finally, we learned how the engine’s strategy to handle destruction can interfere on the lifetime check we just mentioned.

That’s it for today. As always, feel free to leave a comment with questions, corrections, criticism or anything else that you want to add. See you next time!

# Source

- [Unity Blog: Custom == operator, should we keep it?](https://blogs.unity3d.com/2014/05/16/custom-operator-should-we-keep-it/){:target="_blank"}
- [Rider: Avoid null comparisons against UnityEngine.Object subclasses](https://github.com/JetBrains/resharper-unity/wiki/Avoid-null-comparisons-against-UnityEngine.Object-subclasses){:target="_blank"}
- [Rider: Possible unintended bypass of lifetime check of underlying Unity engine object](https://github.com/JetBrains/resharper-unity/wiki/Possible-unintended-bypass-of-lifetime-check-of-underlying-Unity-engine-object){:target="_blank"}