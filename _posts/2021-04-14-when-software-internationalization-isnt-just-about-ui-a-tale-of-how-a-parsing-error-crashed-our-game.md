---
layout: post
title:  "When software internationalization isn’t just about UI: a tale of how a parsing error crashed our game"
date:   2021/04/14 20:36:38 +0200
author: Matheus Amazonas
categories: jekyll update
---
Whenever we talk about adapting a game to different countries, the first thing we often think of is localization, but we sometimes neglect its sibling: internationalization. Wait, what’s the difference again? Internationalization is the process of designing and developing your software so it can easily be adapted and used in different, countries, cultures and languages. Localization is the process of adapting an existing software to be used in a new country, culture or language, usually by means of translating text and or/adding components that are relevant to the new environment. Even though localization uses the tools provided by internationalization to deliver its work, internationalization’s role is not to simply assist localization, as we will find out soon. In this article I will discuss how a software internationalization bug crashed our game, how hard it was to unearth the source of the error and how easy it was to fix it.

# How every bug starts

Someday, a few days after we released a new version of our mobile application, we started receiving bug reports on one if its mini games. Our application consisted of 2 devices that communicate with each other: a dashboard and a client. Game data is exchanged between them at the start of every mini game to ensure that both ends generate the same world. The bug report described that the dashboard application froze right when one of the mini games started, and eventually quit. The other mini games were unaffected and so was the client application. We had experienced that before: it sounded like a memory problem that forced the OS to kill the app. We tried to replicate the bug, but failed every time. We used the same devices (iPad Air and Oculus Go) and the same OS version as the customers, and we still could not reproduce the crash. Yet, our customers reported that the crash was consistently happening whenever they tried to play that specific mini game. We were almost giving up and driving to one of our closest customer’s office to experience the crash firsthand, when we got our hands on a couple of devices that could reproduce the bug consistently.

# Time to dig deeper

Once we could reproduce the bug consistently, it was time to pinpoint the source of the crash and finally, of the bug. We generated a development build and installed it into the iPad using XCode’s debug mode, which lets us observe the application’s memory consumption. Just like we first imagined, starting the game caused a RAM surge to the point which the OS killed the application.

Now, the source of the crash was evident: memory consumption. We were left to discover the cause of such high RAM usage. At this point, it seemed like it was just another case of our application growing just a bit too much with the new version (new features, more assets), just enough to hit the device’s memory threshold. We started by investigating the usual suspect of memory hunger: art assets. After some thought, we concluded that assets were probably not the problem because that mini game was one of the least asset-heavy games in the system. Just to test this theory, we ran the app on an iPad which had twice as much RAM as the previous one. To our surprise, the app’s memory consumption also climbed up to the point where the OS killed the app. But this time, the RAM usage was more than twice as much as on the previous iPad. Something was allocating RAM non-stop, and there was no way it was the assets.

The next suspect in the line was code. This mini game had been part of the application for at least one year, thus there must had been a change that broke its logic and is allocating memory like there’s no tomorrow. We checked our repository’s history and… there were no changes in that mini game. At all. Neither code, nor asset changes. Maybe it was not the code after all? Who’s the next suspect in line?

Data. Whenever a game starts, the client application will generate the world and it will send the generational data to the dashboard application. If that data is corrupted, it can make the game perform an absurd task that would endlessly allocate memory. This was not the case because both worlds (the dashboard and the client) were generated using the same data and the application never froze on the client, only on the dashboard. So maybe it was not the data?

# Back to ground zero

> **Disclaimer**: for the sake of simplicity, some implementation details are hidden and/or modified.
{: .callout }

So far, we had concluded that the bug was caused neither by assets, nor by code nor by corrupted data. What were we left with? Engine bug? All the other mini games ran fine, so it was not likely. At this point we took a step back, stopped analyzing the technical aspects and looked at the game. Which aspects of the gameplay could get out of control to the point which it would consume memory non-stop? It was a simple “connect the dots” game, where the dots formed a sine wave that connected 2 points in space. Depending on the player’s movement capabilities, these 2 points could be closer or farther apart. The spacing between the dots was constant, therefore the sine wave had to be constructed dynamically.

Wait a minute. What if, for some reason, the wave generation never stopped, kept spawning new dots indefinitely and that caused the memory pressure? We could never see that happening because the wave was generated in a single frame, which never was rendered. We added some debug messages in the code and watched the console as the game loaded. Surely enough, hundreds of thousands of dots were instantiated, whereas in a normal game session the number of dots would never go over 100. The game object instantiation stopped only when the OS killed the application. So it **was** the code.

We dove into the code and found out that the number of dots was calculated based on the distance between the start and end points of the sine wave. We analyzed the algorithm used to distribute the points along the wave and it seemed to be correct. After a few more attempts, we found out that the distance between the wave start and end points was in the order of millions of units. That could had only be true if the start and end points were really, really far apart. But in reality, these points should never be farther than 10 units from each other. We dug a bit deeper and found out that the start and end points were indeed millions of units far from each other on the dashboard, far away from the play area. On the client, the wave was correctly generated and its start and end points were certainly not millions of units apart.

We checked the game data exchanged between dashboard and client, and it seemed to be correct. The start and end point fields contained something like `3.141592` and `-4.162192`. We tested the same game with an Android tablet as dashboard instead of the iPad. The start and end points were where they should be, just a few units apart from each other, within the player’s field of view. And as expected, no crashes happened on the Android tablet. Maybe it was a platform-dependent bug? Again, we tested with another iPad. The game ran fine, the sine wave was generated as expected and there were no crashes. What was going on here?

We then noticed an otherwise simple detail: the iPad that was reproducing the crashes had its system language set to Dutch while the iPad which ran the game with no problems had it set to English. A suspicion arose: could the bug had been caused by the system language settings? We set the “crashing” device’s system language to English and the crashes stopped. We set it back to Dutch and the crashes were back. We did the opposite on the other device and the same behavior was being reproduced consistently. We called the customer who reported the bug and we confirmed that their iPad’s system was in Dutch. Alright, so we found out why some devices could reproduce the bug and some could not. Now what?

# Ladies and gentlemen: the bug

As you may have guessed by now, the problem was caused by a lack of internationalization. Let’s see what happened, exactly. The game data we discussed above (the sine wave start and end points) was sent from the client to the dashboard, where it was used to construct the sine wave. In this game, only the `X` position coordinates were relevant because the other 2 coordinates were known. The start and end positions’ `X` coordinates were stored as a colon-separated string with a naive implementation that used `ToString()`. An example of such string is `"3.14159265:-4.162"`.

The problem with this solution is that it assumes that `float`s will always turn into strings which separate the integer and fractional parts using dots – which is not always the case. Different countries and cultures might represent decimal numbers using different separators. The USA English (`en-US`) standard uses dots as separators between integer and fractional parts, which would represent the start and end points as `"3.14159265:-4.162"`. It also uses commas as visual separators to ease the reading of long numbers: `4000000` can be represented as `4,000,000`. The Dutch standard (`nl-NL`) does the exact opposite: commas separate integer/fractional sides and dots are used to ease reading of long numbers. Using the Dutch standard, the same points would be represented as `"3,14159265:-4,162"`. This usually is harmless if the calls to `ToString()` and `float.TryParse()` use the same standards. The problem arises when the calls do not use the same standard, which was exactly what happened in our application.

If the client generates the string representation using the `en-US` standard, the output will be `"3.14159265:-4.162"`. If you split this string into 2 substrings based on the colon and tried to parse each substring using the Dutch standard, you would get `31415928` and `-4162` because the Dutch standard sees dots as visual aids, not as separators between integer and fractional parts. As a consequence of this standard mismatch, the start position of the sine wave was `31415928` and the end position was `-4162`. The algorithm that distributed the dots along the wave instantiated thousands, if not millions of dots between those points, which led to the application hang, high memory consumption and eventual crash. In the end, the bug was caused by both code *and* data.

# How do I fix that?

Fortunately, the bug was easily fixed. The C# standard library recognizes that cultural differences play an important roll and provides a data type called [`CultureInfo`](https://docs.microsoft.com/en-us/dotnet/api/system.globalization.cultureinfo?view=net-5.0){:target="_blank" style="text-decoration: underline"} which stores – among other things – how decimal numbers should be represented. The `ToString()` method has an overload which takes a parameter for this purpose: `ToString(IFormatProvider)`, where `CultureInfo` implements [`IFormatProvider`](https://docs.microsoft.com/en-us/dotnet/api/system.iformatprovider?view=net-5.0){:target="_blank"}. Similar overloads are available for [`Parse`](https://docs.microsoft.com/en-us/dotnet/api/system.single.parse?view=net-5.0#System_Single_Parse_System_String_System_Globalization_NumberStyles_System_IFormatProvider_){:target="_blank" style="text-decoration: underline"} and [`TryParse`](https://docs.microsoft.com/en-us/dotnet/api/system.single.tryparse?view=net-5.0#System_Single_TryParse_System_String_System_Globalization_NumberStyles_System_IFormatProvider_System_Single__){:target="_blank" style="text-decoration: underline"}. The bug was fixed by replacing the previous calls to `ToString` and `TryParse` with their respective culture-sensitive overloads. We used [`CultureInfo.InvariantCulture`](https://docs.microsoft.com/en-us/dotnet/api/system.globalization.cultureinfo.invariantculture?view=net-5.0){:target="_blank" style="text-decoration: underline"} as a format provider because it contains invariant culture information that is based on the English language, but not with any country or region.

Method calls with no `IFormatProvider` use [`CultureInfo.CurrentCulture`](https://docs.microsoft.com/en-us/dotnet/api/system.globalization.cultureinfo.currentculture?view=net-5.0){:target="_blank" style="text-decoration: underline"} (the current thread’s culture info) to specify culture information. If a default value for thread `CultureInfo`s is never set by the application, the system’s locale information will be used. That is why our application behaved differently on iPads with different system language and region settings. If we had specified the `CultureInfo` of our calls, the system locale information would had not been used. If your application code consistently uses culture-sensitive method overloads instead of the vanilla ones, you are guaranteed to eliminate internationalization errors like the one described in this article.

In our case, using method overloads that specify a format provider is a standard, but that specific case flew under our radar. That could had been avoided if the programmer who wrote that code used an IDE like [Rider](https://www.jetbrains.com/rider/){:target="_blank"}, which warns users about usages of `ToString`, `Parse` and `TryParse` overloads that do not pass a format provider.

# Conclusion

In this article we saw an example of how poor software internationalization went beyond the UI and led to an application crash due to memory consumption. We also learned how to avoid such errors using the tools available in C#’s standard library.

As usual, please leave a comment if you have something to add to the discussion, to point out and error or to simply say hello. Thank you for the (long) read and until next time!