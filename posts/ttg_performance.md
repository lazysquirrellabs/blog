---
layout: post
title:  "Terraced Terrain Generator performance improvements"
date:   2023/04/09 11:10:12 +0200
author: Matheus Amazonas
categories: jekyll update
---
This post details the process of improving the performance of Terraced Terrain Generator (TTG), a tool developed to procedurally generate terraced terrains in Unity. For more info about TTG, check its [website](http://ttg.matheusamazonas.net), and [repository](https://github.com/matheusamazonas/TTG). This post is part of a series that documents the development process of TTG, containing the following posts:
- [Developing a Terraced Terrain Generator](/posts/ttg) 
- [Terraced Terrain Generator performance improvements](/posts/ttg_performance) (this post)
- [Adding custom terrace heights to Terraced Terrain Generator](/posts/ttg_custom_heights)
- [Adding more detail to Terraced Terrain Generator using Perlin noise octaves](/posts/ttg_octaves)

# Things could be better
Even though the goal of the terraced terrain generator was mostly accomplished on the feature level, performance was far from ideal. Generating a terrain would freeze the application for a couple of seconds, too much memory was allocated by the garbage collector and high-detailed terrains were almost unfeasible, even on a high-end MacBook Pro with a M1 Max chip. It was clear that some performance improvements were necessary. Here are the ones that were implemented by TTG.

# Internal representation
In early stages of development, a `Mesh` component (built-in Unity entity) was passed along the generation steps. The shape generation created a basic `Mesh`, which was passed to the fragmentation step to be worked on. The fragmentation process would read the data from the provided `Mesh`, but it would create a new one to serve as output. This pattern was repeated along all generation steps.

The problem with this approach is that is incurs a heavy cost on the engine side: for each step, vertices and triangle indices were copied, normals were recalculated, a lot of internal checks were performed and an unnecessary amount of garbage was generated. This approach worked fine during development because each step could be easily debugged (just stop generation at that step and render its output mesh), but it was not fit for release.

To remedy this performance problem, an internal representations of mesh data was created and instances of this entity are passed along instead of `Mesh` instances. This strategy could only be implemented once there was a substantial degree of confidence on the correctness of each step. Even though no data was collected to quantify the impact of this change, the performance improvement gained was clear: generating a terrain was much faster and creating more detailed terrains started to become tangible.

# Asynchronous generation using a separate thread
During development, terrain generation was synchronous, which meant that the main thread would freeze computing a frame until generation was completed. As a consequence, the application's frame rate would drops substantially. Even though this behavior might not be problematic in some cases (e.g. loading a level), it is impractical in others. VR games are the perfect example to illustrate why the terrain generation should not freeze the game: the player instantly notices the freeze because moving their head in the real world would not translate into head movement in VR. VR games are not the only scenario where the freeze would be harmful; frame rate drops are generally undesirable in video games and interactive media.

## Possible solutions
With that in mind, two solutions were considered:

- Generate the terrain so fast that it doesn't substantially drop the frame rate.
- Generate the terrain in another thread, freeing the main one to process and render the game.

Although the first approach seems ideal, it's both extremely hard to implement and also subjective to the nature of the application using the generator. It's hard because there is only much that could be improved in the terrain generation—there is no “make this super fast” magical button. It's subjective because it's hard to answer the question “How was is fast enough?”. Maybe it's fast enough for my example project with a target 30 FPS. But what if the target frame rate of the application is 120 FPS? With these challenges in mind, I decided to focus my efforts on the second option: asynchronous terrain generation using a separate thread. 

## Multithreading
The strategy I chose was to turn the generation method into an asynchronous method using the `async` keyword, and make it return a `Task<Mesh>` instead of `Mesh`. That way, I could move all the heavy calculations to a separate - pooled - thread and return the final mesh. Callers of the generation function could `await` it, and receive the generated `Mesh` once the generation was complete. That strategy seems nice on paper, but if you've tried to use the thread pool in Unity before, you might not know that Unity doesn't work well with multithreading. Most of the Unity API isn't thread safe and calling some of its members from another thread that's not the main one will most likely throw the following exception:

```
UnityException: Internal_Create can only be called from the main thread.
Constructors and field initializers will be executed from the loading thread when loading a scene.
Don't use this function in the constructor or field initializers, instead move initialization code to the Awake or Start function.
```

Due to Unity's lack of vanilla multithreading support, its API (including the `Mesh` class) can't be used in a separate thread. How are we supposed to generate a new terrain mesh in a separate thread then? 

## Going around Unity's constraint
The key to solve this problem is in the previous subsection: avoid using the Unity API (particularly the `Mesh` class) during most of the terrain generation and delay the creation of the `Mesh` instance until it's absolutely necessary. In the end, the heavyweight calculations can be moved to a separate thread and, once they're over, we can switch back to the main thread and create the `Mesh` instance using the data from the generation process. In fact, the only calls that will execute in the main thread are `mesh.SetVertices`, `mesh.SetIndices` and `mesh.RecalculateNormals`. Everything else runs on a separate thread.

The strategy described above allowed terrain generation—particularly bigger, more detailed ones—to run without substantially dropping the application's frame rate. In the end, terrain generation runs in the background and can definitely be used in VR games and applications.

## Async isn't panacea
Finally, there is one aspect of the asynchronous, multithreaded solution worth pointing out: it is not always the best solution. Sending the terrain generation to another thread, watching for its completion, throwing possible exceptions and switching back to the main thread have a performance cost. This overhead translates into (slightly) longer generation times and more garbage created than the synchronous alternative. Even though this overhead is negligible is most cases, it might not be in others. For this reason, and also because sometimes synchronous behavior is desired, I decided to keep both synchronous and asynchronous APIs in the generator. It is up to the user to decide which one is better suited to them.

# Duplicated vertex elimination
The generated terrains were great, but when looking up close, their vertex count seemed high. It's hard to judge whether generated meshes have “too many vertices”, because the generation algorithm doesn't randomly places unnecessary triangles. But still, the thought that those generated terrains contained too many vertices did not leave my mind.

After some deeper investigation, that hunch was proved right. The generation’s fragmentation phase was creating vertex duplicates when fragmenting triangles and that became more evident the higher the fragmentation depth. This behavior was being propagated at each fragmentation pass, widening the computational power requirement between depth values. In the worst case scenario, a vertex could be duplicated 3&#08319; times, where *n* is the depth. For a depth of 5, that's 242 duplicates of the same vertex.

In the context of real-time applications, this behavior is simply unacceptable. The higher the vertex count is, the longer the CPU and graphics card will take to render a frame, the lower the frame rate is and the poorer the user experiences the application. Two strategies to eliminate this behavior were considered:

- Brush up the mesh after creation, eliminating vertices that are substantially closely together—also known as vertex welding.
- Modify the fragmentation algorithm so it never adds duplicated vertices to start with.

## The fix
The second strategy was chosen for 2 reasons:

- Instead of fixing an undesired behavior late in the process, it eliminates the behavior entirely.
- The other strategy would increase the processing power required to generate the terrain, while reducing the vertex count early in the process had to potential to reduce the processing requirements.

Once the strategy was chosen, I started implementing it. I chose to use a `Dictionary` to keep track of all vertices used in intermediate mesh data—not only during fragmentation. The vertices (`Vector3`) were used as dictionary keys and their index in the mesh vertex array was used as the dictionary values. By doing so, it is guaranteed that no duplicates of a given vertex are present in the dictionary. 

Although this strategy was easy to implement, it could potentially introduce some undesired aspects:

- Dictionary operations could negatively impact performance when compared to the previous solution: arrays (hashing and lookups are more expensive than direct memory accesses). Even though this is true, as we will soon see, the positive performance impact that it introduced (i.e. reduced vertex count) either balanced or outweighed the negative impact.
- The memory footprint of dictionaries is larger than arrays’ footprint. Once again, even though this is true, as we will soon see, the positive memory footprint impact that the dictionary approach introduced (less vertices means less data and smaller memory footprint) outweighed the negative impact.
- The amount of garbage generated by dictionaries is generally greater than when using arrays and lists (mostly due to resizing). Even though this is true, it was later circumvented (see the section below on Native constructs for more).

## The outcome
Once the solution above was implemented, it was time to quantify how performant it was. Tests were executed based on the generation of a specific terrain. All tests were performed in synchronous mode because it guarantees that the entire generation occurs in a single frame, easing data collection. Preliminary tests showed that asynchronous mode delivered similar results, but spread across multiple frames. All terrain generation tests were performed using the same input, displayed below:

| Seed | Sides | Depth | Radius | Height | Frequency | Terraces | Mode        |
| ---- | ----- | ----- | ------ | ------ | --------- | -------- | ----------- |
| 1    | 8     | 5     | 20     | 10     | 0.075     | 15       | Synchronous |

Although test data like the vertex and index counts of a given terrain are always constant, other data like generation duration and allocated memory vary slightly in each generation. In order to measure these fields more accurately, an average of 100 generations of the same terrain was calculated. All test results can be seen in the table below, where the “Before” column contains results obtained before the vertex duplicate elimination strategy described in this section was implemented, and the “After” column contains results measured after its implementation.

|                        | Before   | After    |
| ---------------------- | -------- | -------- |
| Vertex count           | 98782    | 18383    |
| Index count            | 36250    | 21699    |
| GC allocated (average) | 6.5 MB   | 1.6MB    |
| Duration (average)     | 22.02 ms | 22.78 ms |

As we can see above, the number of vertices in the final terrain mesh decreased by 81.4% and the number of indices by 40.1%. This represents a significant reduction in the number of vertices and a great reduction in the the number of indices. It's also evident that the amount of memory allocated by the garbage collector decreased by 75.4% in average, a most welcomed improvement. Finally, we can see that the new implementation takes, in average,  3.45% longer to complete than the original approach. Even though this means that the new implementation is slightly slower than the original one, the difference is negligible, particularly when the significant improvements in the other test results are taken into consideration.

Based on the outcome of the experiments, the vertex duplicate elimination feature was incorporated into the generator.

# Native constructs
Each stage of the terrain generation requires new data; either for internal usage, or for output, or for both. Most of the data allocated during the generation won't be actually used in the final mesh; it's only used for internal representation. 

After some investigation and minor tweaks, I reached the conclusion that there wasn't much room left for memory usage optimization. In theory, I could recycle some vertex and index arrays, but doing so drastically reduce code readability, and I wanted this tool to be something other people could easily tinker with. In the end, I just couldn't find places in the code where memory allocations could be reduced without sacrificing maintainability anymore. But what about garbage generation?

If a language like C++ (which doesn't manage the memory for you) was being used, this wouldn't be a problem because we could manually free the memory used by a given generation phase once its intermediate data was useless. But this is Unity and C# we're talking about. You don't have to worry about that… right?

Well, it ends up that creating a terrain generates a lot of garbage and the garbage collector is almost guaranteed to run right after the terrain is generated. In some cases this wouldn't pose a problem (specially because we're talking about a terrain generation tool), but I wanted to keep garbage generation to a minimum. Part of this problem was solved by the vertex duplicate elimination described above (less vertices means less data and generated garbage), but there was still room for improvement.

But how can we reach C++'s level of memory control in Unity with C#? The Unity [Collections](https://docs.unity3d.com/Packages/com.unity.collections@1.4/manual/index.html) package provides some unmanaged data structures that can be used in managed C# code—you just need to manage their lifetime. Among the data structures that this package contains are `NativeList`, `NativeArray` and `NativeHashMap`, which provide C# wrappers to unmanaged lists, arrays and dictionaries, respectively. After some time looking into the package documentation and learning how to properly create and dispose these structures, I was ready to put them into action. They were used as replacements for vanilla types such as `List`, array and `Dictionary` in terrain generation code.

Then, similarly to the subsection above, tests were performed to quantity the impact of the changes on the memory allocated by the garbage collector and on the generation duration. The test results are displayed below, where the “Before” column contains results obtained before native constructs were added, and the “After” column contains results measured after their addition.

|                                    | Before   | After    |
| ---------------------------------- | -------- | -------- |
| GC allocated (average of 100 runs) | 1.6MB    | 5KB      |
| Duration (average of 100 runs)     | 22.78 ms | 22.73 ms |

The results were surprising, at least to me. Garbage collector allocation dropped from 1.6MB to 5KB. That's a significant drop of 99.68%, in average. Meanwhile, generation duration remained marginally unchanged, within the error margin. The results speak for themselves. Based on the experiment results described above, native constructs were fully implemented into the generator.

# Conclusion
At first, Terraced Terrain Generator's performance was far from what I considered ideal. Terrain generation took too long, generated terrains had an enormous amount of vertices and the garbage collector was allocating big chunks of memory. Creating bigger, more detailed terrains was unfeasible, even on powerful machines.

After dedicating some time into investigating the performance bottlenecks of the tool and studying its code in depth, I was able to identify some aspects that presented potential improvement opportunities. I tested some of my hypotheses and implemented the ones that improved TTG's performance the most.

In the end, the Terraced Terrain Generator became a tool that performs well enough to be used in a variety of scenarios, from desktop video games to mobile VR applications. At the same time, I gained valuable knowledge of Unity's mesh generation APIs, analysis tools, performance improvements and native constructs.