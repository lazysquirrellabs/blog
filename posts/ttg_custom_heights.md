---
layout: post
title:  "Adding custom terrace heights to Terraced Terrain Generator"
date:   2023/11/21 18:56:45 +0200
author: Matheus Amazonas
categories: jekyll update
---
This blog post details how custom terrace heights were added to [Terraced Terrain Generator (TTG)](https://ttg.matheusamazonas.net). It is part of a series that documents the development process of TTG, containing the following posts:
- [Developing a Terraced Terrain Generator](/posts/ttg) 
- [Terraced Terrain Generator performance improvements](/posts/ttg_performance) 
- [Adding custom terrace heights to Terraced Terrain Generator](/posts/ttg_custom_heights) (this post)
- [Adding more detail to Terraced Terrain Generator using Perlin noise octaves](/posts/ttg_octaves)

## The problem
Even though I was happy with what version 1.0.0 of TTG delivered, there was still room for improvement. I was particularly bothered by the fact that all terraces were equally spaced—the height gap between a terrace and its predecessor was constant. Equal spacing might be desirable in some scenarios, but in others it just doesn't make sense, particularly when we're trying to resemble real-life terrains. Here's an example of a terraced with equally spaced terrains:

![](/assets/images/post20/problem.png)

Take a sandy beach with multiple terraces representing the sand, for example. If they're equally spaced, the height gap between each sand terrace will be considerable, which doesn't match the smooth, slow ascends of a sandy beach. At the other end of the spectrum are snowy mountain peaks, which every so often extrude from their surroundings. A constant progression spanning from the bottom of the ocean to the highest mountain peak (like in the picture above) doesn't look convincing.

## The solution
In addition to the existing generation parameters, users can provide an array of relative terrace heights: floating point values between 0 (0%) and 1 (100%) that represent the height of the terraces, relative to the terrain's maximum height. On a terrain with a maximum height of 10 units, a relative terrace height of 0 would place that terrace at 0 units high. A terrace with a relative height of 1 would be placed at 10 units high, and one with a relative height of 0.62 would be placed at 6.2 units high, and so on. 

Implementing this feature did not require substantial code changes, and it did not introduce a new generation step. Previous versions already used a terrace height array during the [slicing step](/posts/ttg#step-4-terrain-slicing-) of the terrain generation—it just wasn't customizable, and the terrain heights were equally distributed between 0 and the terrain's maximum height. All that was necessary to introduce this feature was to replace the existing code that calculates terrace heights with code that takes the user-defined relative terrace heights into consideration:

```csharp
_terraceHeights = relativeTerraceHeights.Select(h => h * maximumHeight);
```

## The outcome
We can modify the last terrain example using the new custom terrace heights feature to make it more dynamic and convincing. Sandy terraces can be placed unevenly and closer together to reflect the smooth ascend of a beachfront. Desert terraces can be placed closely to mimic an erosion effect. The gap between the dry and snowy portions of the mountains can be widened to highlight the mountain's peak. The image below displays an example of these changes:

![](/assets/images/post20/custom_heights.png)

## Conclusion
Although custom terrace heights were a simple and easily-implemented addition to TTG, the value it added was clear: the user has more control over the height of the terraces, enabling more terrain variability. This feature shipped as part of [TTG 1.1.0](https://github.com/lazysquirrellabs/TTG/releases/tag/1.1.0), where both the API and the helper component were updated to support custom terrace heights. On the next release, I ~~plan to add~~ added ([1.2.0](https://github.com/lazysquirrellabs/TTG/releases/tag/1.2.0)) Perlin noise octaves to TTG, enabling feature-rich terraced terrains to be created.