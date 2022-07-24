---
layout: post
title:  "Null Check and Equality in Unity"
date:   2020/04/01 20:36:38 +0200
author: Matheus Amazonas
categories: jekyll update
---
In some programming languages – like C# – it is a common practice to use comparison operators and functions to check for null references. However, when programming in Unity, there are some particularities to keep in mind that the usual C# programmer usually does not take into consideration. This article is a guide on how these caveats work and how to properly use C#’s equality tools in Unity.

# A quick recap of C#’s equality functions and operators

There are three main ways to check for equality in C#: the `ReferenceEquals` function, the `==` operator and the `Equals` function. If you are an experienced C# developer that knows your ways in and out of the language’s equality tools, fell free to skip this section and jump straight to the Unity section.

## The ReferenceEquals function

This function is not as famous as the other alternatives, but it is the easier to understand. It’s a static function from the Object class and it takes two object arguments to be compared for equality.

```csharp
public static bool ReferenceEquals (object objA, object objB);
```

It returns a bool that represents whether the two arguments have the same reference – that is, the same memory address. It can not be overwritten, which is understandable. It does not check for the object contents and/or data, it only takes their references into account.

## The == operator

The `==` operator can be used for both value and reference types. For built-in value types, it returns whether the values are the same. For user-defined types, they can only be used if the operator has been defined. Here’s an example of a `==` operator defined for the `Coordinates` struct. The `!=` operator must also be defined whenever the `==` is, otherwise a “*The operator == requires a matching operator ‘!=’ to also be defined*” compilation error will be thrown.

```csharp
public struct Coordinates
{
    private int _x;
    private int _y;
 
    public static bool operator ==(Coordinates a, Coordinates b)
    {
        return a._x == b._x && a._y == b._y;
    }
 
    public static bool operator !=(Coordinates a, Coordinates b)
    {
        return !(a == b);
    }
}
```

The operator’s behavior differs a bit for user-defined reference types (a.k.a. objects). A custom `==` operator can be defined for any reference type, but unlike for value types, you don’t *have* to define the operator before using it. The reason behind that is because the `SystemObject` class (which all other reference types inherit from) implements the `==` operator. The implementation is really simple, and well known: two instances of `Object` are considered equal if their references (i.e. their memory addresses) are the same. Its behavior is the same as the `ReferenceEquals` function explained above.

Although this might make sense, sometimes we want to implement a custom behavior for this operator, usually when we want 2 different objects (with different references) to be considered equal if some of their data is the same. Consider the following example with the `Person` class, where two instances are equals (according to the `==` operator) if they share the same `_id`.

```csharp
public class Person
{
    private string _name;
    private int _id;
     
    public static bool operator ==(Person a, Person b)
    {
        if (ReferenceEquals(a, null) || ReferenceEquals(b, null))
            return false;
        return a._id == b._id;
    }
 
    public static bool operator !=(Person a, Person b)
    {
        return !(a == b);
    }
}
```

Not that both arguments are of type Coordinates, so the operator can only be used on objects of that type – and on its subtypes.

## The Equals function

This function lives in the `Object` class but unlike `ReferenceEquals`, it is virtual and can be overwritten by any user-defined type. Its default behaviors for reference types (implemented in the `Object` class) mimics `ReferenceEquals`: it checks if the object share the same reference. Its default behavior for value types (defined in the `ValueType` class) checks if all fields of both objects are the same. Check its definition below.

```csharp
public virtual bool Equals (object obj);
```

Unlike the `==` operator, it is not static and it only takes 1 parameter of type object which representes the object to check equality against. Also notice that unlike the `==` operator, the argument is of type object, and not of the same type as we are implementing `Equals` for. Check the example below, where the function is implemented in the `Coordinates` class.

```csharp
public class Coordinates
{
 
    private int _x;
    private int _y;
     
    public override bool Equals(object obj)
    {
        if (ReferenceEquals(obj, null))
            return false;
        if (obj is Coordinates c)
            return c._x == _x && c._y == _y;
        return false;
    }
}
```

In addition to checking the parameter for a null reference, it is necessary to cast it into `Coordinates` before actually checking for equality. It is also worth noting that the `==` operator can check both parameters for null values, while `Equals` only checks its only parameter. If the object we are calling `Equals` on is `null`, a `NullReferenceException` will be thrown.

If you want to dive deeper into C#’s equality tools, you might want to check [this article](https://coding.abel.nu/2014/09/net-and-equals/){:target="_blank"} out.

# Equality in Unity

Out of the three main equality tools C# provides (`ReferenceEquals`, `Equals` and `==`), only the `==` operator requires special attention – the other two behave exactly like they do in vanilla C#.

Unity provides a custom implementation of the == operator (and naturally for != as well) for types that inherit from the `UnityEngine.Object` class (e.g. `MonoBehaviour` and `ScriptableObject`). For other types – like a custom class that doesn’t inherit from any other class – C#’s standard implementation will be used. When comparing a `UnityEngine.Object` against null, the engine not only checks if the operand it null by itself, but it also checks if its underlying entity was destroyed. For example, observe the following sequence of actions:

Assuming we have a `MonoBehaviour` called `ExampleBehaviour`, create a new Game Object and attach an instance to it:

```csharp
var obj = new GameObject("MyGameObject");
var example = obj.AddComponent();
```

Later on the game, we decide to destroy the `ExampleBehaviour` instance:

```csharp
Destroy(example);
```

And later on, we check the `ExampleBehaviour` instance for equality against null:

```csharp
Debug.Log(example == null);
```

The log statement above will print “true“. At first, that might seem obvious because we just destroyed that instance, but as I explained on [my previous article]({{ site.post10 }}){:target="_blank"}, the instance’s reference is *not* null and it was not garbage-collected yet. In fact, it won’t be garbage-collected until the scope it has been defined still exists. What Unity’s custom `==` operator does in this scenario is to check if the underlying entity has been destroyed, which in this case is true. This behavior helps programmers identifying objects that have been destroyed but still hold a valid reference.

## Other similar operators

A few C# operators have implicit null checks. They are worth investigating here because they behave inconsistently with the `==` operator.

### The null-conditional operators ?. and ?[ ]

These operators were planned as shortcuts for safe member and element access, respectively. The portion of code following the `?.` or `?[]` will only be executed if the object they been invoked on is not null. In standard C#, they are the equivalent of executing a similar call wrapped in a null check. For example, the following code, assuming that `_dog` is not instance of `UnityEngine.Object`:

```csharp
if (_dog != null)
    _dog.Bark();
```

Can be replaced with:

```csharp
_dog?.Bark();
```

Although these two code snippets might behave exactly the same in vanilla C#, they behave differently in Unity if `_dog` is an instance of `UnityEngine.Object`. Unlike `==`, the engine does not have custom implementation for these operators. As a consequence, the first code snippet would check for underlying object destruction whereas the second code snippet would not. If you use the Rider IDE, the warning “Possible unintended bypass of lifetime check of underlying Unity engine object” will be displayed whenever one of these operators are used on an object of a class that inherits from `UnityEngine.Object`.

### The null-coalescing operators ?? and ??=

The `??` operator checks if its left operand is null. If it not is, it returns its left operand. If it is, it returns its right operand. In the example below, assuming that `Animal` is a class that does not inherit from `UnityEngine.Object`, `a3` will point to `a2` because the left operand of `??` (`a1`) is null.

```csharp
Animal a1 = null;
Animal a2 = new Animal();
Animal a3 = a1 ?? a2;
```

It is equivalent to

```csharp
if (a1 == null)
    a3 = a2;
else
    a3 = a1;
```

The `??=` is an assignment operator that assigns its right operand to its left operand only if its left operand is null. In the example below, `a1` will be assigned to `a3` only if `a1` is null.

```csharp
Animal a1 = ...
a1 ??= a3;
```

It is equivalent to

```csharp
Animal a1 = ...
if (a1 == null)
    a1 = a3
```

Just like the null-conditional operators, there are no custom implementations of these operators for `UnityEngine.Object`. As a consequence, if the `Animal` class from the code snippets above inherited from `MonoBehaviour`, for example, the implicit null checks would not behave like the null checks using the `==` operator. Thus, their respective “equivalent” code would not be equivalent anymore. Again, a warning will be displayed in the Rider IDE when using these operands on objects that inherit from `UnityEngine.Object`.

# Wrapping up

Equality operators and functions are basic language constructs present in every C# programmer’s toolset. When developing in standard C#, a programmer should keep in mind how some of these constructs behave differently for value and reference types. When programming in C# for Unity, a developer must also keep in mind how the engine tailored the language’s `==` and `!=` operators to its ecosystem. In addition, one must keep in mind that some shortcut operators that perform implicit null checks behave inconsistently with the engine’s `==` operator. With that in mind, a developer should master all these equality tools in order to avoid undesired behavior. Finally, some IDEs like Rider will warn the programmer about possible pitfalls regarding these operators.

That’s it for today. As always, feel free to leave a comment with questions, corrections, criticism or anything else that you want to add. See you next time!

# Source

- [Passion for Coding: .NET == and .Equals()](https://coding.abel.nu/2014/09/net-and-equals/){:target="_blank"}
- [Unity Blog: Custom == operator, should we keep it?](https://blogs.unity3d.com/2014/05/16/custom-operator-should-we-keep-it/){:target="_blank"}
- [Rider: Avoid null comparisons against UnityEngine.Object subclasses](https://github.com/JetBrains/resharper-unity/wiki/Avoid-null-comparisons-against-UnityEngine.Object-subclasses){:target="_blank"}
- [Rider: Possible unintended bypass of lifetime check of underlying Unity engine object](https://github.com/JetBrains/resharper-unity/wiki/Possible-unintended-bypass-of-lifetime-check-of-underlying-Unity-engine-object){:target="_blank"}