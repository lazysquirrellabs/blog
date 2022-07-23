---
layout: post
title:  "[Postmortem] Developing an educational, kiosk, VR game for Windows Mixed Reality"
date:   2019/07/29 20:35:38 +0200
author: Matheus Amazonas
categories: jekyll update
---
In this article I analyze the development Voedingscentrum VR, an educational, kiosk-style and Virtual Reality game I helped to develop at [Fantazm](https://www.fantazm.com){:target="_blank"} from October 2018 until April 2019. After a quick introduction about the project, the biggest problems that surfaced during development are explained along with the solutions we found to solve them. At the end, a quick conclusion wraps the article up.

# Introduction

The project was commissioned by [Voedingscentrum](https://www.voedingscentrum.nl/nl/service/english.aspx){:target="_blank"} (The Netherlands Nutrition Center), an independent organization funded by the Dutch government. Their aim is to use relevant research regarding sustainable nutrition to promote balanced, sustainable food consumption and production.

## Concept

The game was planned as a fun, educacional VR experience targeted at children from 9 to 12 years old. Players are placed into a cartoonish world where they need to feed Smikkel – an elephant-like creature – for 3 to 4 meals: breakfast, lunch, afternoon snack and dinner.

![/blog/assets/images/post8/smikkel.png](/blog/assets/images/post8/smikkel.png){:class="img-right"}

A robot waiter teaches the players about the game mechanics and its main loop: for each meal the player chooses, Smikkel comes to the dinner table and you feed it by choosing, grabbing and placing food items (served by the waiter) on a plate. Once all the food items of a specific meal are chosen (between 2 and 6 items), Smikkel eats the food and its mood, energy levels and appearance change according to the food items you fed him. Following, playtime starts and the player can interact with Smikkel by petting it and throwing balls so it can fetch them. During playtime, it should be evident that the food Smikkel ate affected its behavior. Additionally, the waiter displays a report showing the selected food items and gives the user feedback on the chosen food.
{: .text-justify}

![/blog/assets/images/post8/waiter.png](/blog/assets/images/post8/waiter.png){:class="img-left"}

Once playtime finishes, the feeding loop starts again. Once all the meal loops are over, the waiter gives a final feedback, announces that the experience is over and instructs the player to remove their VR headset. During the entire experience, spectators can watch the gameplay through a TV.

The educational value is clear: children learn that what they ingest might affect their mood, stamina and health. The fun aspect is present: immersing into a cartoonish VR world and interacting with fictional characters is exciting, even for adults.

## Team

Voedingscentrum was responsible for nutrition expertise and game design insights. The development team consisted of one game designer/project manager, two game developers (I inherited the project from another developer), one 2D artist, two 3D artists, one external 3D artist/animator and an external voice actor agency.

## Timeline

Prototyping started as early as May of 2018 and the last version of the game was deployed in April 2019. Although this period might seem long, development didn’t take place continuously because the development team didn’t work on this project exclusively. Therefore, it’s hard to estimate how many hours were put into development.

## Setup

The VR experience was meant to be installed in Dutch museums. Besides the VR headset and controllers, walls with game art, a grass carpet and a TV (for spectators) would be installed to add a fun, immersive and inviting environment. By design, the experience should work unsupervised and require low maintenance. Windows Mixed Reality (hereafter referred as WMR) was chosen as the target platform because it offers the features we sought (VR headset with controllers and inside-out tracking) at an affordable price.

{% capture t_description %}
Me playing the first setup of VoedingscentrumVR at <a href="https://rijksmuseumboerhaave.nl" target="_blank">Boerhaave</a> museum in Leiden, the Netherlands. <a href="https://www.facebook.com/voedingscentrum/photos/a.10150983607945481/10161161378380481/?type=1&theater" target="_blank">Source</a>: Voedingscentrum Facebook page.
{% endcapture %}
{% include image.html class="wide" url="/blog/assets/images/post8/48415118_10161161378390481_3020615091566411776_o.jpg" align="center" description=t_description caption="true"%}

## Development environment

The project was developed using the Unity engine (by the end of the project, 2018.3.11f) and C# as a programming language. On initial development stages, Unity Collaborate was used for version controlling, but later we switched to a Git-based solution hosted by BitBucket.

## Versions

Three versions (1.0, 1.1 and 1.2) of the game were shipped. The first one was installed at Boerhaave Museum (Leiden, the Netherlands) in December of 2018 and it showed us right away that there were some challenges we had to overcome before the game was ready for the world. The exhibition was taken down and we came back to the drawing board. After a quick break, we started the development of version 1.1, on which we tackled most of the problems the previous version unearthed. Although most of the design problems found in version 1.0 were fixed in version 1.1, technical problems (mostly regarding Windows Mixed Reality) could not be overcome. The application was migrated from WMR to HTC VIVE + SteamVR on version 1.2.

# Challenges

As expected, some challenges surfaced during the development process and after we installed the experience for the first time. In this section we discuss how we overcame them – whenever possible. Keep in mind that this article was published months after development ceased. Therefore, some of these problems might not exist anymore. If that’s the case and you are aware of a possible solution, please leave a comment on the comments section so this post can be updated. Adding new solutions to this postmorten can help many developers that might run into the same problems we did.

## Controllers

Arguably the biggest challenge we faced during the game development were the WMR controllers. It’s nothing about their build quality or responsiveness (which are both great, by the way), but we ran into a few different aspects that didn’t match our project. We did not find solutions for some of these challenges, and there’s a reason behind that. At the end, the accumulation of problems regarding the controllers was so overwhelming that we decided to ditch the controllers altogether. We used a Leap Motion to track hand movement so we could use the player’s hands as interaction interfaces instead. Nevertheless, the problems we ran into before ditching the controllers  are listed below.

Although the WMR controller has many buttons (touchpad, thumbstick, menu, windows, trigger, grab), the proposed gameplay was so simple that it only required one button. This sounds like the opposite of a problem and we didn’t expect it to be one at all, but something surfaced during playtests with children. Unless they were instructed beforehand, players had a hard time figuring out how to interact with the elements in the VR world, usually because they didn’t know which button to press. Changing the button mapping didn’t seem to solve the problem because different children were attracted to different buttons. Our proposed solution was to create either a sleeve or a case around the controller to hide unused buttons and to guide the children towards the desired one. We considered modifying the controller, removing the thumbstick altogether and even placing a banner with gameplay instructions next to the headset. None of these sounded like good solutions, but we were open to trying them out in order to allow a smooth gameplay.

The game was supposed to run unsupervised in a museum. Therefore, the entire experience should always be ready for a new game session, requiring no setup from the player whatsoever. This requirement was put into check by the controllers because when left idle, they turn off automatically and – unlike the headset – there is no way (via software or hardware) to setup the idle timer duration. Therefore, if there was enough time between game sessions to bring the controllers to an idle state, the next player would have to turn them on in order to play. We were left with no other choice but to add an instruction banner explaining how to turn the controllers on, which again, was far from ideal.

WMR controllers are turned on by pressing their Windows key for a few seconds. Since it had already been stablished that the users might have to turn the controllers on before playing, that key must have been easily accessible. That introduced an unexpected problem that didn’t surface until we installed the first version of the game for public access: the same key serves as a “home” key for the entire WMR ecosystem. When pressed, the current application is suspended and the user is brought to the WMR home, an environment that serves as a start screen for MR applications. From there, the user can have access to other applications (e.g. web browser, other games, settings, YouTube…) without any constraints at all. Unfortunately, this feature can not be disabled via software and physically disabling the key wasn’t viable because it’s the same key that turns the controllers on. Hence, we were stuck in a pit: disabling or hiding the key incapacitates the controller, and leaving it accessible gives the user total freedom over the computer.  We could not solve this problem and it was one of the key factors that lead us to the Leap Motion switch.

Finally, the controllers are wireless and no cords keep someone from removing them from the experience. Attaching them to a piece of hardware would add more wires to the existing headset cords and could hurt gameplay and overall enjoyment. We didn’t expect anyone to bring the controllers home as a memento and decided to risk losing them, which didn’t happen during the short period of time the installation was displayed.

Facing all these challenges, we started to question our platform choice and to search for alternatives to WMR. But other platforms either didn’t solve our existing problems or introduced new ones. Our team had some experience with the Leap Motion and we decided it was worth a shot. We took a couple of days to implement the Leap Motion and its library into the game and by the end of it, we were quite surprised. Not only using the hands to interact with the VR elements solved all of the problems we had with the WMR controllers, but it also felt way more natural than pressing buttons. We decided to keep the WMR headset but we ditched the controllers for the Leap Motion. After some tests with children, we identified some problems regarding the Leap Motion (discussed on the next section), but they appeared to be way more manageable than the challenges we had with the WMR controllers.

## Leap Motion

The Leap Motion was meant to replace the WMR controllers as interaction devices in the VR world. Although the switch eliminated the challenges we faced with WMR, other characteristic issues surfaced once we started to use the Leap Motion.

Whilst migrating to the Leap Motion solution, it was clear the one of the game’s key interactions was far from ideal: throwing balls. Previously, the user could grab balls using the WMR controller’s trigger button and throw them by releasing it, using a bezier curve as an indicator of where the ball would land. Naturally, we thought that when using your hands, the user could simply grab the ball and instinctively throw it. It sounded like the obvious design choice. Although, during internal playtests, an instinctive throw was never successful and the ball would always drop during the movement. The reason became evident: a natural ball throw usually requires a backwards arm movement, bringing the player’s hands outside of the Leap Motion tracking area.

![/blog/assets/images/post8/screenshot-2019-07-07-at-17.11.39.png](/blog/assets/images/post8/screenshot-2019-07-07-at-17.11.39.png){:class="img-right"}

In order to execute a successful throw, the user had to keep their hands in the tracking area during the entire movement, which did not look natural whatsoever. We overcame this obstacle by changing the ball throwing design and adding a ball cannon which throws balls inserted into its feeder. After some external playtests, we added some visual clues to the ball cannon (on the right) and it was clear that the ball throwing problem was solved. Children are naturally attracted to the cannon and the visual cues make its purpose obvious.
{: .text-justify}

All playtests with the Leap Motion happened during winter, which introduced an unexpected and somewhat funny new challenge. Long sleeve shirts (wore due to low temperatures) often covered part of the children’s hands, occluding them from the Leap Motion. As a consequence, tracking was regularly compromised. It’d never happen during development because the developer (a.k.a. me) comes from a warm part of Brazil and isn’t comfortable wearing long sleeve shirts. Therefore, clothing occlusion was never present during internal playtests. This is yet another – funny – example of how even the smallest cultural differences can affect game development. We didn’t focus too much on this problem because of the following reasons. First, it didn’t seem to harm gameplay substantially because the players were still able to interact with the VR elements, despite he occasional loss of tracking. Second, a small percentage of children experienced this clothing occlusion. Third, the problem was seasonal and wasn’t present for a good part of the year. Lastly, instructions to tuck away long sleeves were added to the game instructions.

In order to integrate the Leap Motion into the VR setup, the sensor had to be fixed to the headset. During development, we examined the VR headset ([Lenovo Explorer](https://www.lenovo.com/gb/en/smart-devices/virtual-reality/lenovo-explorer/Lenovo-Explorer/p/G10NREAG0A2){:target="_blank"}), trying to find the best place to attach the Leap Motion sensor. The gameplay focus mostly on hand movement at and above eye level. Therefore, the Leap Motion sensor should be angled on a way that is optimal for the proposed gameplay. Additionally, the sensor’s location could not block the headset sensors. Once we found the perfect spot, we attached the sensor to the Lenovo headset using regular office tape. Before shipping the game, we had to come up with a more permanent, safe solution. We ended up using glue to attach the Leap Motion to the headset. The Leap Motion never fell off the VR headset during the couple of months the installation was publicly available.

During the installation of the experience, one problem became evident: the headset the client chose ([Samsung Odyssey](https://www.samsung.com/us/support/computing/hmd/hmd-odyssey/hmd-odyssey-mixed-reality/){:target="_blank"}) was different from the one used during development and it had a different sensor placement. Finding an optimal spot to attach the Leap Motion became a challenge because there’s less free room on the Samsung headset. After a few tests, it became obvious that there was no spot that would not occlude (even if just a bit) the headset sensors without compromising the hand tracking. In the end, we glued the Leap Motion in such a way that it would slightly obstruct the headset sensor, but not enough to compromise the WMR tracking. As a lesson, make sure you use the target hardware during development to avoid problems on installation/deployment day.

## Sound

Since the game is intended to be displayed on public spaces, the environmental noise could muffle the game voices and sounds. Thus, a setup with headphones was desirable. Luckily, there was a WMR headset with built-in headphones: the Samsung Odyssey. During playtests, a new game requirement was added: the external TV used to display the gameplay to spectators should also play the game sounds. By the time the game’s first version was installed, there was a Windows Mixed Reality setting to enable or disable audio redirection to the headset, but no audio mirroring option was available. The audio could go either to the headset or to the TV, but never to both. After some research, we found some third-party Windows applications that could simulate audio cards and that could potentially solve the problem, but it introduced some delay between the headset and the TV audio, which was undesirable. By the time we started working on the game’s second version, the WMR settings were updated and a mirroring option was added, but it presented the same delay problem as the third-party mirroring solution. Currently, the delay is still present and we have not found a solution for it yet.

## Windows Mixed Reality

Even though the WMR platform sounds really promising and the quality of the compatible hardware is quite impressive for a first generation of devices, the development platform has a lot of room for improvement.

Sadly, the WMR settings panel is quite basic and lacks many features that are present on other VR platforms (idling timeout, stop rendering when idling, “locked” mode, etc). We needed some of these features for our game and it was sad to see that they were just not there. When searching for solutions, we found out that it was possible to develop SteamVR applications for WMR compatible headsets and controllers, so we decided to give it a try. Since we were using [VRTK](https://vrtoolkit.readme.io/){:target="_blank"} – which supports both WMR and SteamVR – the switch to SteamVR took less than a day and it was successful. We we able not only to use the WMR hardware with SteamVR, but we also had access to SteamVR’s control panel. Both versions of the game are actually SteamVR applications.

Additionally, there’s not much control over WMR’s play area. First, you can’t customize the play area walls (e.g. color, shader). Second, you can’t choose which way is forward while setting up the area. Apparently, the WMR platform totally ignores which way you start setting up the area and chooses whichever play area side is the longest one. As a consequence, which way the player faces when the game starts might differ based on the WMR room setup process you perform. Being able to select which way is forward was crucial on this project because the physical, printed walls (seen at the picture in the intro) should match the virtual environment. As a workaround, scripts to rotate and save the player’s rotation using keyboard shortcuts were added to the game. After doing the WMR setup, we do our own VR play area rotation adjustments using the keyboard shortcuts. This problem could be avoided if the user had more control over the play area settings during room setup. Additionally, we often experience wrong floor height values and have to use the WMR standard “Floor Check” app to fix it. I believe that a simple and easy floor height check should be included during room setup, like the one from the Oculus Quest.

Overall, I found the WMR platform to be too closed to developers. Sometimes it felt like I was fighting against the platform in order to accomplish my goals. Many settings that should be available (either on the WMR control panel or via an API) can’t be changed whatsoever. That being said, I did notice that the team responsible for the WMR platform is listening to developers and is slowly implementing requested features. Maybe the platform is just not mature enough and all it needs is some time to evolve.

## Kiosk mode

The game had specific requirements that made it a kiosk application: the computer should be easy to turn on and off (ideally just one physical button), the application should open automatically when the system finishes booting up, nobody should assist or instruct players, the application should run as long as the computer was on and the game should reset every time someone takes the headset off. At the time, unlike with the HoloLens, WMR didn’t have a kiosk mode, so we had to implement the requirements by ourselves.

We cleaned the target computer from anything that could interrupt gameplay: notifications and Windows Update were disabled, anti-virus and performance improvement programs were uninstalled, Wi-Fi was turn off and unnecessary startup items were removed. Then, we made sure the application would never be interrupted by energy saving features: we disabled Window’s energy saving options and the headset sleep timer [[1](https://forums.highfidelity.com/t/turning-off-windows-mixed-reality-sleep/14526){:target="_blank"}, [2](https://www.reddit.com/r/WindowsMR/comments/85durt/how_to_prevent_sleep_and_app_shutdown/){:target="_blank"}]. To prevent screen burn-in on the headset display, we added a “headset fade” component that fades the display to black when nobody is wearing the headset.

The WMR Control Panel automatically shows up once a WMR application is open. This behavior may seem logical, but it might get on the way of some kiosk applications. Two applications are being loaded and are competing for windows focus (i.e. stay on top): the Control Panel and the game. Even though the VR application is set to run on full screen mode, it might lose focus for the WMR Control Panel, which is undesired, given that spectators would not be able to watch the gameplay with the Control Panel on top of the game window. Luckily, we found a [workaround](https://forum.unity.com/threads/unity-5-windows-7-application-focus-fullscreen-problem-workaround.327240/){:target="_blank"} on Unity’s forums that worked perfectly. Once implemented, this solution enables to developer to steal windows focus anytime. The game steals focus once its setup process (waiting for the headset to return to an idle state) is over and the WMR Control Panel never occludes the game screen.

The game should reset every time the headset is taken off so the next player gets to experience a fresh environment. We used SteamVR’s [library](https://forum.unity.com/threads/hmd-removed-or-put-on.523660/){:target="_blank"} to check for user presence via the built-in headset’s proximity sensor instead of Unity’s [user presence check](https://docs.unity3d.com/2018.3/Documentation/ScriptReference/XR.XRDevice-userPresence.html){:target="_blank"} because the latter only changed state once the headset idled. As a consequence, if a player handed the headset to another person, the headset wouldn’t idle, the user presence variable wouldn’t change and the game wouldn’t reset. Using the proximity sensor enabled a more controlled reset process which always reset the game when players were switched.

Once the above features were implemented, the game behaved like a kiosk application that could be turn on and off using a single button (the computer’s power button) and that would work uninterruptedly for hours on end.

# Other lessons

## Playtests

Before starting external playtests, we would introduce the game and instruct the children on how to play it. In retrospect, we shouldn’t done that. Since the game would be used as an unsupervised installation, nobody would explain to children how to play the game (in the end we added some small icons with basic guidelines on the spectator screen, but it still wasn’t as informative as the instructions we gave them). Therefore, we should’ve replicated the same kind of environment during external playtests. As a consequence, we didn’t catch usability and UX problems as soon as we should have. In fact, some of the problems were only evident after the first day the game was available to the public. On future projects, we will try to mimic the real world environment on external playtests in order to catch usability problems as early as possible.

## Programming

*Attention: this subsection is targeted at programmers.*

I tried two new features on this project: async/await and C# 7. The first one was used as a replacement for coroutines because it delivers the same features but enables the usage of return values and error handling. You can read more about the motivation behind the switch and how to use async/await in Unity [here](http://www.stevevermeulen.com/index.php/2017/09/using-async-await-in-unity3d-2017/){:target="_blank"}. The new version of C# brings features as nested functions, pattern matching, tuples, more expression-bodied members and out variables. These features allow for more succinct but easily understandable code. You can read more about them [here](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=2&cad=rja&uact=8&ved=2ahUKEwj8p9efv7LjAhWFyKQKHaYSCKEQFjABegQIBxAB&url=https%3A%2F%2Fblogs.msdn.microsoft.com%2Fdotnet%2F2017%2F03%2F09%2Fnew-features-in-c-7-0%2F&usg=AOvVaw1dYTRAtnI2IfwNBovKptxE){:target="_blank"} and [here](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=1&ved=2ahUKEwj8p9efv7LjAhWFyKQKHaYSCKEQFjAAegQIABAB&url=https%3A%2F%2Fdocs.microsoft.com%2Fen-us%2Fdotnet%2Fcsharp%2Fwhats-new%2Fcsharp-7&usg=AOvVaw3imMXTODOiW-PngovgZ93J){:target="_blank"}. Both async/await and C# 7 additions proved to be worth the time investment and I’m glad I took the time to learn about them.

## Tooling

Looking back, I wish we’d created more tools to automate repetitive tasks we had to perform during development. An example is taking screenshots of food items within the environment for client approval. The first time I had to take screenshots, I didn’t think that we would end up having so many approval iterations, so I didn’t implement a tool to automate it and took them manually. And every time I had to take the screenshots again, I’d think “I’m sure this is the last time. It’s not worth implementing a tool just for this”. And as one can imagine, I was wrong. Many times.

# Conclusion

VoedingscentrumVR was a challenging project, mostly from usability and UX perspectives. We learned valuable lessons on how to design unsupervised VR applications, how to deal with WMR limitations, how to plan better playtests and how to design better interactions using the Leap Motion. It was a project that seemed an easy task at the beginning, but that showed us we had more to learn than expected. But at the end, we accomplished our task and developed a fun, educational VR game that children enjoy playing.

This was my first project after going back to game development. It was also my first VR project since 2016 and my first WMR project ever. Besides learning more about VR development, this project taught me a lot about project and time management and client communication. Although there were times I wish this project was over already (as we do in every project), I’m now grateful I was part of it.

As usual, if you have any questions, comments or corrections (specially corrections!), please leave a comment on the comments section. I hope to see you all on the next blog post!