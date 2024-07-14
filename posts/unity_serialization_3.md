---
layout: post
title:  "Unity serialization part 3: Scriptable Objects"
date:   2015/10/22 20:35:38 +0200
author: Matheus Amazonas
categories: jekyll update
---
This post is part of a series about Unity serialization. Click [here](unity_serialization_1) for part 1: how it works and examples or click [here](unity_serialization_2) for part 2: defining a serializable type.

On the [last article](unity_serialization_2), we learnt how we can define our own serializable types and discovered some problems that can emerge from it. One solution (although not ideal) to our problems is Scriptable Objects. These objects have two major uses: saving and storing data in the Editor and saving and storing data as an asset. According to the documentation, they are optimized and can store huge portions of data. There are a few singularities about Scriptable Objects and we will discuss them on the following paragraphs.

# Defining and Creating

Primarily let’s learn how to define a Scriptable Object using the same example we’ve been using in the last article:

```csharp
public class MyDatabase : ScriptableObject
{
	public List<City> cities;
}
```

As we can see, the only difference is that our class now derives from `ScriptableObject`. There is no need to add a serializable modifier to our script, since `ScriptableObject` derives from `Unity.Object` and that should be enough to make it serializable. The next step is creating an instance of `MyDatabase`, which isn’t possible without some extra code. In the past, a mix of Editor UI and Asset Database code was required, but recently (Unity 5.1), a simple modifier can make our lives better: `[CreateAssetMenu]`.

```csharp
[CreateAssetMenu]
public class MyDatabase : ScriptableObject
{
	public List<City> cities;
}
```

By marking your `ScriptableObject` with this modifier, a menu item will be created in the `Asset/Create` menu. Easy like that, this should create an Asset called `New My Database` in the Assets folder and it can be referenced by any `MonoBehaviour` just like any other type derived from `Unity.Object`. By doing this, we solve the first problem present on the previous blog [post](unity_serialization_2): databases should be assets and not `MonoBehaviour`. Now let’s learn how Scriptable Objects act differently from custom serializable classes in Unity.

# Objects are stored as references, not copies

Consider the example from the previous [post](unity_serialization_2) and think about this: if a `MonoBehaviour` has two references to the same `City` object, how will they get serialized? How does the change made in one affect the other? The answer to these questions is slightly counterintuitive:  they are decoupled and serialized separately, hence changing one’s value won’t change the other’s. Let’s see an example using a `MonoBehaviour` that executes in edit mode just to make things easier:

```csharp
[ExecuteInEditMode]
public class MonoBehaviourDecoupleTest : MonoBehaviour 
{
	public City city1;
	public City city2;
	
	private void OnEnable()
	{
		if (city1 == null)
		{
			City chicago = new City();
			chicago.name = "Chicago";
			city1 = chicago;
			city2 = city1;
		}
	}
}
```

Based on this example, any changes made to the object `city2` are also reflected on the object `city1`, which happens… until you hit play and pause. After doing that, modifying one object doesn’t affect the other. That happens because by hitting play, we force Unity to serialize the scene data, which will serialize each object “in line” (copying all serializable variables into a new object) and not by reference. By doing that, Unity forgets that those two objects were actually the same and treats both as separate objects.

Only classes that inherit from `Unity.Object` are serialized as actual references and fortunately `ScriptableObject` can help us with that, since it is a `UnityObject`. Let’s use the same example, but first let’s define a new `City` class, this time as a `ScriptableObject`:

```csharp
public class ScriptableCity : ScriptableObject 
{
	public string name;
}
```

Now let’s use it instead of a regular `City` like the previous example. Note that we have a peculiar way of instantiating a `ScriptableObject`, and the reason behind that will become clear soon:

```csharp
[ExecuteInEditMode]
public class ScriptableDecoupleTest : MonoBehaviour 
{
	public ScriptableCity city1;
	public ScriptableCity city2;

	private void OnEnable()
	{
		if (city1 == null)
		{
			city1 = ScriptableObject.CreateInstance<ScriptableCity>();
			city1.name = "Chicago";
			city2 = city1;
		}
		
		Debug.Log(city1.name);
		Debug.Log(city2.name);
		city1.name = "New York";
		Debug.Log(city1.name);
		Debug.Log(city2.name);
	}
}
```

We use debug logs to check the data since the inspector won’t show us much useful info easily. Differently from the first example, hitting play and pause won’t decouple the references and both cities will be named “New York”. Notice the difference here: the variables `city1` and `city2` were not serialized as part of the `ScriptableDecoupleTest` script – which happened in the first example. What Unity actually does is create a scene object (remember the odd way of instantiating it?) and keep it hidden, serialize it as part of the scene, and save its reference in `city1` and `city2`. Therefore, every time we change one variable, the other changes too, since both reference the same object, just like any reference to an `UnityObject` (`Rigidbody`, `Collider`, `Renderer`…). Thereby, `ScriptableObject` solves the third problem presented on the previous blog post: reference decoupling.

We can also use Scriptable Objects as assets instead of scene objects and the effect is the same. In addition, this approach may be considered really specific, but is essential when really complicated relationships must be consistent between objects.

# Polymorphism

We face a serialization problem when using polymorphism and custom serializable classes: an instance of a derived class is serialized as an instance of the base class. Let’s use the example the Unity Documentation [does](http://docs.unity3d.com/Manual/script-Serialization.html): animals. See the example:

```csharp
[System.Serializable]
public class Animal
{
	public string name;

	public Animal (string name)
	{
		this.name = name;
	}
}
```

Now let’s define the `Dog` class:

```csharp
public class Dog : ScriptableAnimal
{
	public string breed;

	public Dog (string name, string breed) : base(name)
	{
		this.breed = breed;
	}
}
```

And a simple `MonoBehaviour` that runs in the editor for testing:

```csharp
ExecuteInEditMode]
public class BehaviourExample : MonoBehaviour
{
	public List<Animal> animals;

	private void OnEnable()
	{
		if (animals == null)
		{
			animals = new List<Animal>();
		}
		if (animals.Count == 0)
		{
			Animal elephant = new Animal("Elephant");
			Dog dog = new Dog("Dog", "Bulldog");
			Animal lion = new Animal("Lion");

			animals.Add(elephant);
			animals.Add(dog);
			animals.Add(lion);
		}
	}

	private void OnDisable()
	{
		Debug.Log(animals[1] is Dog);
	}
}
```

If you have a list of `Animal` and you add a `Dog` to it, it will be serialized as an `Animal`, not a `Dog`. Add this script to an object in the scene and observe the console when you deactivate it, you will see it displays “True”. Nice! That means that Unity knows that that object is a `Dog`, right? Well, hit play, then stop and do that again. Now it doesn’t remember that anymore, but what happened to that `Dog`? When you hit play, you told Unity to serialize the scene data, and that’s exactly what it did. It happens that because of how Unity’s serialization process works, it forgets about the fact that the dog is a `Dog` and treats it as an `Animal` instead.

Scriptable Object can help us with that, given that it inherits from `Unity.Object` and that type is always serialized as references – and never inline. Let’s change the definition of `Animal` a bit and make it inherits from `ScriptableObject`:

```csharp
public class ScriptAnimal : ScriptableObject
{
	public string name;
}
```

Now let’s use an equivalent example to the one above, but adapting it to the way Scriptable Objects are created and initialized:

```csharp
[ExecuteInEditMode]
public class ScriptableExample : MonoBehaviour
{
	public List<ScriptAnimal> animals;

	private void OnEnable()
	{
		if (animals == null)
		{
		 	animals = new List<ScriptAnimal>();
		}

		if (animals.Count == 0)
		{
			ScriptAnimal a1 = ScriptableObject.CreateInstance<ScriptAnimal>();
			Dog dog = ScriptableObject.CreateInstance<Dog>();
			ScriptAnimal a2 = ScriptableObject.CreateInstance<ScriptAnimal>();

			a1.name = "Elephant";
			dog.name = "Dog";
			dog.breed = "Bulldog";
			a2.name = "Lion";

			animals.Add(a1);
			animals.Add(dog);
			animals.Add(a2);
		}
	}

	private void OnDisable()
	{
		Debug.Log(animals[1] is Dog);
	}
}
```

This example is analogue to the previous one, so run it and observe the console. Even after hitting play, stopping the game and disabling the script, we get “True” as output, which means that the dog is still a `Dog` and it was serialized as one, keeping the polymorphism intact. Therefore, Scriptable Objects solve the second problem introduced in the last blog post: polymorphism and user-defined classes. This might not be the best solution ever when dealing with serialized polymorphic code (we can’t use constructors anymore and inspecting the objects is a pain) but it may be necessary in some situations.

In addition, a fix to this polymorphism serialization problem has been extremely [requested](http://feedback.unity3d.com/suggestions/serialization-of-polymorphic-dat) by the community in the last years and haven’t been solved it.

# Serialization depth limit (or no support for null)

Demonstrating an example of the depth serialization problem in Unity is fairly simple. Take a look:

```csharp
[Serializable]
public class DepthClass
{
	public List<DepthClass> depthObjects;
}
```

This code looks harmless, but it’s not, as seen on the error thrown (on previous versions of Unity it was a warning, or simply didn’t thrown any message at all):

> Serialization depth limit exceeded at ‘DepthClass’. There may be an object composition cycle in one or more of your serialized classes.
> 

Let’s understand why. Let’s take a look at the `depthObjects` variable and try to figure out how it would be serialized in Unity if it’s an empty list. The naive thought would say that if it should be serialized as null, like any other field, but it’s not. It happens that Unity doesn’t support null serialization for custom classes (like it does for instances of `UnityObject`) and that object will be serialized as en empty instance – which is transparent to the user. On top of that, each of those empty instances has its own `depthObjects` variable, which would be serialized as another empty instance, creating a cycle that would never end, therefore crashing Unity. To avoid that, [the folks](http://docs.unity3d.com/Manual/script-Serialization.html) at Unity Technologies set a limit (7 levels) for serialization depth, which means that after 7 levels of depth, Unity will assume that it hit a cycle and will stop the serialization at that point. Seven levels of serialization can sound like too much, but for some problems, it might be necessary.

Given that, always think twice before serializing any field that has recursive declarations. If it’s not really necessary to serialize it, don’t! But if you really want to use 7 or more levels, or you really need to serialize it, you should use Scriptable Objects. Since Scriptable Objects do support null serialization, this problem simply vanishes:

```csharp
[Serializable]
public class DepthClass : ScriptableObject
{
	public List<DepthClass> depthObjects;
}
```

And this simple change should get rid of the error and let you use more than 7 depth levels of references.

# Data can be shared among objects

This problem (although not listed on the previous article) is exactly the same discussed in the Unity [documentation](http://docs.unity3d.com/Manual/class-ScriptableObject.html) about Scriptable Objects. If you store an array of integers that occupies about 4MB in a prefab and you instantiate that prefab 10 times, you would have a copy of the array in each prefab’s instance, occupying a total of 40MB. That happens because the array lives on the script itself, and copying the prefab copies the script, hence the array.

If instead of declaring the array on the prefab’s script you had a reference to a `ScriptableObject` which contains the array, all the instances would point to the same data. Therefore, 10 instances of that prefab would store 10 references to the same object (and not the actual data), occupying about 4MB only. Not only that substantially saves memory, but changes made to the array from any of the instances will affect the others, maintaining database consistency.

There is a catch, though. What if, instead of storing the array on a `ScriptableObject`, we store it on an empty prefab with a `MonoBehaviour`? Let me show what I mean. First let’s create a `MonoBehaviour` to holds the data:

```csharp
public class BehaviourDatabase : MonoBehaviour
{
	public Vector4[] vectors;
}
```

Let’s add this script to a scene object and save it as a prefab. Now let’s create another script that holds a reference to a `BehaviourDatabase`, add it to a scene object (let’s call it `DatabaseModifier`) and drag the prefab we just created to its `database` field.

```csharp
public class MemoryTest : MonoBehaviour
{
	public BehaviourDatabase database;
}
```

If we copy this `DatabaseModifier` object a dozen times and run the scene, we see that it behaviors exactly how we expected the `ScriptableObject` to behave: they all store a reference to the prefab on the project folder – and not the actual data. Not only that, but any change made on the array of `Vector4` will also change the prefab’s data. Well, but if that also works, so why use `ScriptableObjects` instead of a prefab and a `MonoBehaviour` to store only data as an asset?\* That’s what I tried to find out, but couldn't find any solid, convincing and direct answer. Among some reasons, I found that:

- We don’t have a `GameObject` and a `Transform` and any overhead it can create;
- The idea behind a prefab is that it can be instantiated multiply times in runtime, which isn’t our case;

Those are not really convincing, but I personally rather have a `ScriptableObject` just because of the second reason. For the other uses, though, Scriptable Obejcts are extremely recommended.

\*: Note the emphasis on _data_only_. Using a prefab and a `MonoBehaviour` won’t solve the other problems.

# Conclusion

In this article we learnt how to solve some problems (most of them described on the [last](unity_serialization_2) article) that may emerge when dealing with custom serialized types and Unity serialization. Even though some problems can be solved by using Scriptable Objects, this solution is far form ideal.