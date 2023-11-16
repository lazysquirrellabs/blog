---
layout: post
title:  "How Windows Mixed Reality’s poor reliability forced a kiosk game switch to HTC VIVE"
date:   2021/08/05 20:36:38 +0200
author: Matheus Amazonas
categories: jekyll update
---
In a [previous article]({{ site.post8 }}), I described the development of VoedingscentrumVR, an educational, kiosk, VR game for Windows Mixed Reality. Although at the time of writing it seemed like it was the end of that game’s development, some surprises crossed our path. Eventually, we ditched Windows Mixed Reality altogether and switched to a HTC VIVE, SteamVR-powered solution and we are happy we did it. Here’s the story behind that shift.

> **Disclaimer***:* Most of the events described in this article happened before the COVID-19 pandemic hit the Netherlands and the different testing stages happened either before the restrictions started, or after most of them had been lifted.
{: .callout }

# A small summary

The application had two released versions. Version 1.0 shipped as a full Windows Mixed Reality (hereafter referred as WMR), using both the headsets and controllers and it was deployed at [Boerhaave Museum](https://rijksmuseumboerhaave.nl/). We quickly concluded that there were some design flaws and the controllers had to be dropped. Version 1.1 brought Leap Motion support to enable interaction with objects without controllers and it was installed at [Open Air Museum](https://openluchtmuseum.nl/en). Read the [original article]({{ site.post8 }}) for more detailed information about the development of the game.

# The problems

Some technical issues regarding the WMR headsets surfaced when version 1.1 was installed at Open Air Museum. Since version 1.0 failed early during the period it was available to the public, the application never ran for long periods of time. As a consequence, some reliability issues had never been a problem.

After the game had been open to public for two weeks, we received some concerning feedback from the museum staff, and two problems were described. First, the booting process (which starts the game automatically) was often failing because the WMR headset was not being recognized and the WMR Portal displayed an error message. Second, the headset would often flicker, the sound coming out of the headphones would glitch and eventually the headset screen would turn black.

After some testing with other WMR headsets, we came to the conclusion that the Samsung headset broke. We replaced it with a HP headset, which seemed to fix the flickering problem. At this point, we thought that the headset replacement also fixed the booting problem, but that was not the case. After a couple of days had passed, the client told us the booting problem persisted. Some investigation showed us that the cause was the same as before the hardware replacement: the headset wasn’t being recognized. After a lot of research and reaching out to Microsoft support, we concluded that the USB extension cable we were using was not suitable for our use because it couldn’t deliver enough power to keep the headset on. We then bought a powered USB 3 hub alongside an active USB 3 extension, trying to solve the power problem. But unfortunately it didn’t. We then acquired the only USB 3 hub Microsoft cites in their support page as “known to work well with Windows Mixed Reality”. It was slightly more reliable (the error rate was lower), but it didn’t solve the problem.

We went back to researching possible solutions to the problem, and that’s when we found a [weird, yet somewhat effective solution](https://www.reddit.com/r/WindowsMR/comments/djxzlb/i_have_to_restart_my_pc_anytime_i_want_to_use_my/): kill the `explorer.exe` process and restart it. We created a startup script that would kill the process, open it up again, and then load the game. This seemed to solve the connectivity and discovery problem and most of the system boots were successful.

Unfortunately, yet again, we received an email from the client a week later saying the connectivity problem had returned. At this point, both the client’s and our faith in the current solution were diminished by the repeated failed attempts to keep the game running uninterruptedly. We decided to try a platform switch, dropping the not-so-mature WMR in favor of a platform known for its reliability and robustness: the HTC VIVE running over SteamVR.

# The platform switch

We expected the switch to be a long and cumbersome process but – as described on the sections below – it went faster and smoother than we anticipated.

## Software

A platform switch often hides unexpected problems that we never anticipate when planning it. Although we were prepared for many surprises when developing the new version for the VIVE and SteamVR, the switch was easier than we feared.

> A quick recap on the technical aspects of the development process: the application was developed using the Unity engine and Virtual Reality Toolkit ([VRTK](https://vrtoolkit.readme.io/)).
{: .callout}

VRTK proved to be a wise choice made early in development because it supported both WMR and SteamVR platforms with their Unity plugin. Thus, the platform migration wasn’t expected to be as troublesome as it could have been. But another early development decision made the transition almost seamless. WMR lacked some advanced settings – like kiosk mode and custom idling timeout – that were crucial for our application. When looking for solutions for these demands, we discovered that we could run WMR applications on top of SteamVR with the help of a WMR plugin for SteamVR available on the Steam store. By doing so, we could have access to more advanced settings in the SteamVR dashboard while still using WMR hardware. We tested this solution and it met our needs at the time so we kept it in the game.

As a consequence, the application already run on top of SteamVR and no software change (with the exception of a play area recalibration) was necessary to port it to the HTV VIVE. No other surprises popped up and the platform switch took only a couple of hours, overcoming our most optimistic expectations.

It is worth noting that since our game did not use the WMR controllers for interaction, we did not test it during the migration. Thus, we can not testify on the potential challenges regarding the controllers on such a switch.

## Hardware

We had some previous development experience with the HTC VIVE and we owned a set for development purposes. We used this set during development but acquired another one to be used on the installation. HTC doesn’t sell new VIVE sets anymore, but they did sell certified pre-owned VIVE sets, which we ended up buying. The set worked flawlessly and met all our expectations.

The game used a Leap Motion as input device for interacting with VR objects. The HTC VIVE has been used alongside the Leap Motion in numerous projects, so we did not expect any challenges on that front. This proved to be true as gluing the Leap Motion to the VIVE headset was easily done and cable management was aided by the headset’s supporting straps and their cable holders.

The VIVE cables are longer than the WMR’s, but cable extensions were still necessary to meet the game demands. We replaced the short HDMI and USB cables that connect the VIVE’s setup box to the PC with the active HDMI and USB 3 extensions previously used with the WMR setup. Additionally, a long power extension was used to power the setup box.

# The outcome

The main goal of the platform switch was to improve the game’s reliability over long periods of time. Accordingly, we ran preliminary tests in which we left the game running for hours (sometimes overnight) in the office and tried to play it randomly during the day. All of our testes played as expected: the headset always was tracked, its screen never flickered or turned off unexpectedly and the hand tracking performed satisfactorily. Summarizing: the game worked for long periods of time.

We then moved to the next stage in testing: a field test exposed to the public. We installed the game at [Corpus Museum](https://corpusexperience.nl/en/#!) for a trial run of two weeks. During this period, the game was turned on right before the museum’s opening time and it was shut down right after its closing time. At the end of the two weeks, we finally received positive feedback from the museum staff. The game ran well and without any downtime as it was observed on the previous locations. In addition, the museum staff didn’t have to run any VR play area recalibration – something that was common with WMR.

We are now confident that spending some time to migrate the solution from WMR to the HTC VICE paid off. The system’s robustness and reliability improved significantly, finally meeting our standards.

# Some small interaction tweaks

During the test period at the museum, it became apparent that the hand grab interaction assisted by the Leap Motion was not as good as we expected. Most children initially struggled to grab items in the VR world because the VR hands would not close when their actual hands did. Some got used to the mechanics and how the sensor reacted to their movements, but others did not and it was clear that it harmed their experience.

We came back to the drawing board and tried to rethink the hand interaction. So far we’ve tried to mimic the real world as much as we could, but it was proven to be inefficient. Usually, we want the VR objects to replicate behaviors of real world objects, but sometimes that is not only unnecessary, but also undesired. Part of the magic of VR is to create and experience worlds and situations that are not possible in the real, physical universe. After reminding us of this point, we freed ourselves from the “physically impossible” chains and started to brainstorm interaction solutions that could be inaccurate in a non-VR settings, but more pleasant for our players.

Two game interactions were suffering from the issue described above:

- Grabbing food from a serving tray and placing it on the feeding plate so the creature could eat it.
- Grabbing balls from a box and throwing them so the creature could fetch them. Alternatively, the player could place the ball in a cannon that would shoot it. This interaction suffered the most because the hand tracking issue would impact both the grabbing and the throwing.

Once we’ve realized that our task was to aid the players to interact with the VR world – and not to create the most realistic experience ever – it was easy to come up with solutions. We decided to remodel the two interactions differently.

For the first one (the food selection interaction), we decided to let players choose items by simply touching them, regardless of the hand pose. Once the hand touched an item, the item would snap to the player’s hand. Then, the player could choose what to do: put it back on the food tray or place it on the feeding plate. As a nice side effect, this change eliminated another existing problem: food items that were thrown out of player’s reach sometimes could not be retrieved. Since throwing food items was not possible anymore, this problem ceased to exist.

We fixed the second interaction (grabbing and shooting balls) by eliminating the need to grab balls altogether. The shooting cannon was modified so it would have a button that would shoot balls when pressed. There was no need to feed the cannon with balls and it had an endless ball supply. Therefore, the players could still shoot some balls and watch the creature fetch them, but they would not directly interact with balls anymore, eliminating the interaction issue.

Internal tests showed that the new interactions allowed for a smoother, more effortless gameplay experience, without hurting the educational and fun aspects of the game. Preliminary external tests confirmed what we experienced in the office: the changes made interacting with VR items a joy instead of a hassle. As a consequence, children left the play session happy and amazed, instead of frustrated. Finally, once the pandemic numbers went down and the restrictions were lifted, we were able to test the game in the field. The entire structure was setup at Rosmalen’s Library and children were welcomed to play. After a few weeks running smoothly, with not hardware problems whatsoever, we were glad to find out that children (and some parents) loved the game and groups of children were visiting the library specifically to try out Voedingscentrum VR.

# Conclusion

In this article we saw how a platform switch from Windows Mixed Reality to HTC VIVE via SteamVR fixed some reliability problems in a VR game. We also saw how reimagining hand interactions by abandoning physical world constraints improved the gameplay experience. In the end of the journey described on these two articles, we can safely say we have built the game we’ve imagined in the beginning of the development process.