---
layout: post
title:  "Generating sphere meshes procedurally"
date:   2024/06/10 17:29:00 +0200
author: Matheus Amazonas
categories: jekyll update
---

This article is supplemented with [Sphere Generator](https://github.com/matheusamazonas/sphere_generator), a Unity package that implements the sphere generation strategies described here. Feel free to follow the article along with Sphere Generator's source code.

# Why?

Spheres are one of the most popular 3D shapes out there. Planets, balls, eyes, jewelry, fruit, bullets... the list of objects that can be represented by spheres is long. That brings the question: when developing games and 3D applications, how can we generate a sphere mesh? I asked myself this question while developing the next release of [TTG](https://ttg.matheusamazonas.net), which will deliver spherical terraced terrains, and the answer wasn't as obvious as I thought.

Although the parametric formula for points in a continuous 3D sphere is [well known](https://en.wikipedia.org/wiki/Sphere#Parametric), it's not enough to generate a sphere mesh because computers can't work with continuous representations. The formula delivers a way of finding infinite points in a sphere surface, but computers can't handle infinite data—memory is limited. Therefore, we need to make choices on how to represent a sphere mesh, mainly:
- How many points we would like the sphere mesh to contain.
- How to distribute the points on the sphere surface, and consequently on the mesh. In other words, the mesh's topology.

The first choice might impact how detailed a sphere mesh is. The higher the number,  the closer to an actual continuous sphere surface it might be. Ideally, we'd like to keep that number as low as we can get away with, without harming the level of detail too much. 

The second choice might seem unimportant at a first glance, but it's crucial for 3D applications, particularly when UV mapping and texturing come into the equation. It's also crucial for terrain generation tools like [TTG](https://ttg.matheusamazonas.net). 

The 2 choices (i.e. points number and topology) are independent—changing one won't affect the other—but changes to either might drastically impact the generated sphere mesh. There are many different topology strategies to choose from, and that's what we're going to look into next.

# Different sphere types
Some topology strategies stand out when looking at sphere mesh generation:
- UV sphere.
- Cube sphere.
- Icosphere.

The image below contains examples of each type by row, respectively. Columns represent the growing number of points (a.k.a. vertices) in the sphere meshes, which is indicated by the number below each mesh. Note how the meshes progressively resemble a continuous sphere as the number of vertices increases. Their shape also become almost indistinguishable from each other in the last column; the only noticeable difference is the topology. 
![A display of examples of 12 different shapes representing 3 different sphere types (icosphere, cube sphere, UV sphere), each one with 4 examples with different vertex count.](/assets/images/post22/sphere_display.png)

The sections below focus on each one of these topology strategies. They introduce the topology, present their characteristics and explain how to generate them via code. Even though the code snippets presented in these sections are written in the C# programming language, they should be simple enough that programmers not acquainted with C# should be able to follow-up.

## UV Sphere

## Cube sphere


## Icosphere

The first step 

# Conclusion
For TTG, I chose icosphere.


