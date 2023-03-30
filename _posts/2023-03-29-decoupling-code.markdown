---
layout: post
title:  "Game testing made easier: decoupling code"
date:   2023/03/29 18:46:12 +0200
author: Matheus Amazonas
categories: jekyll update
---
# Introduction

Most (or close to none) of the game projects I've worked in the past implemented automated tests. I was aware of the benefits this type of testing could bring, but I was also knew that implementing them could be quite challenging. In this article, I describe a strategy that helped me to write automated tests in a video game I've developed: code decoupling.

# Motivation

It is widely accepted among software developers that automated tests are extremely helpful when developing, maintaining and validating applications. Some modern approaches like Test-driven Development (TDD) go as far as to put test code as the central player during the development of a software. In some areas like web development, where Continuous Integration and Delivery are becoming more and more common, automated tests are a programmer's bread and butter. Then why is it so uncommon to write automated tests in video game projects, when compared to traditional software?

# The challenge

There is no clear answer to this question, but one thought keeps popping up in discussions on the subject: video games are just too complex. Take a simple 3D endless wave survival game as an example. In this game, multiple enemies follow and attack the player when they're close enough. The player can attack them using melee and range weapons that are occasionally dropped by enemies when killed. Even though it doesn't sound like the most complex game ever created, it actually is quite convoluted when we analyze it from a testing perspective.

Let's start with the basics. The player is located in the world using a 3D position, which consists of 3 floating points. They're also looking at a given point, which is a rotation represented as a quaternion, consisted of 4 floating points. Each enemy also has their own position and rotation. Both the player and the enemies also have a physics collider—for simplicity, let's consider it a sphere collider. The player can use their melee weapon as well as shoot projectiles, both having their own physics collider. Now imagine both the player and the enemies moving at 60 frames per second, possibly interacting with each other. To add insult to injury, throw melee weapons and multiple projectiles on top of that. And the cherry on the cake: let's say the game has support for an online multiplayer mode.

The number of possible combinations of variables is overwhelming and the number of possible interactions between the existing components goes through the roof. Writing automated tests for this might become more daunting a task than actually developing the game because identifying all possible relevant scenarios and corner cases is nearly impossible.

Let's look at the problem from another perspective: bug reproduction. It's not rare for game developers to fail to reproduce some bugs, even when they have multiple bug reports with screenshots and screen recordings of them. They try over and over again, but some bugs seem to be impossible to reproduce. After some time, they finally succeed to reproduce the bug and realize that the test attempts were not using the same variable set as the users who were able to reproduce the bug. This could be anything from hitting a wall at a very specific angle, equipping a specific armor set, or being under the effect of a special potion. If reproducing bugs might be that hard, how does one write automated tests for a game?

# Code decoupling

The answer is not simple, and there are different techniques that help developers with automated testing. In this article, I will discuss a technique that has been really relevant to me in the projects I’ve recently worked on.

In past projects, the main argument I've heard against investing development time in writing automated tests was that “writing automated tests for games takes too long and yields little outcome”. Usually, this idea is based on the fact that in order to test the game, one had to play the game (or write tests that played the game), which isn't necessarily true.

The strategy I used to ease the process of writing automated tests is well-known in the industry, but is often forgotten: decouple game logic from their interactive/visual representation. In Unity terms, this means that most of the game logic did not live in classes that inherited from `MonoBehaviour` (a Unity class that has a strong focus on the interactive aspect of the game), but in vanilla C# constructs instead.

## Example: company management game

For the sake of analyzing the problem, let's introduce a simple fictional video game: a multiplayer turn-based strategy game where each player manages a company that produces, distributes and sells water bottles. Each company is composed of 5 departments, including a financial department responsible for budgeting. Each department has 3 different areas, which can be improved by acquiring upgrades. Upgrades will affect some KPIs (Key Points of Interest) like production rate, sales and profit. Each turn, players need to decide on:

- The budget for next year.
- What's the price of the product (water bottle) for the next year.
- Which department upgrades will be acquired.

At the end of each turn, a year is simulated, including market demand, supply, upgrades, budgeting, etc. among all player companies. At the end of 10 turns, the winning player is the one who managed to maintain the most profit.

The game could certainly benefit from more features, but it's complex enough to aid us on understanding the central topic of this article.

## Separation of concerns

Now that we understand the example, let's analyze it from the code decoupling perspective. First, let's look into the highly coupled way of coding it.

Take the company department code, for example. Previous approaches I had contact with consisted of creating a `DepartmentBehavior` class — which inherits from `MonoBehaviour` —containing all code regarding a company department. This code included, for example, changing UI elements when some events took place, hiding the department UI when the player wasn't focused on it and playing some animation when the department was selected. It also contained logic for features like enabling and disabling certain upgrades based on department budget and how to unlock the next upgrade once the previous one was completed.

The example above contains two types of logic: interactive/visual logic and game logic. All the UI and animation features fall under the “interactive/visual” category. They control elements of the game engine which are directly responsible for the interactive and visual aspect of the game. The other features (i.e. managing upgrades based on department budget and upgrade locking/unlocking) fall under the “game logic” category. They control the rules of the game, while ignoring the visual and interactive aspect of it.

This distinction is the heart of the code decoupling strategy. The idea is that the game logic code should be decoupled from its interactive/visual counterpart. By doing so, the game logic code doesn't depend on interactions, and we can test it separately from the rest of the application.

## Applying code decoupling

Now that we've discussed the concept of code decoupling, let's see how to apply it in our example game.

Instead of writing a `DepartmentBehaviour`, let's split the two types of code into two different entities. The `DepartmentController` class inherits from `MonoBehavior` and controls most interactive aspects in the game engine side: UI elements, animations, sound, etc. A different —vanilla, not `MonoBehaviour`— class named `Department` contains the game logic (how upgrades and budgeting work, etc.). An instance of a `Department` is fed to each instance of `DepartmentController`, allowing the controller to listen for events invoked by the `Department` instance (like an upgrade completion) and also to invoke some of its methods (e.g. acquire a given upgrade). In the end, the controller will, well… *control* a department, but indirectly (via decoupling) instead of directly (with coupled interactive and game logic code).

If we keep decoupling and connecting more game entities (e.g. `Upgrade` and `UpgradeController`, `Company` and `CompanyController`), we end up with the same features and the same game, but its code base is completely decoupled. So far, it seems like we've accomplished nothing.

## Reaping what we sowed

We are not seeking code decoupling just for the sake of it. A decoupled codebase has a characteristic that might seem obvious but is often overlooked: we don't need the interactive aspect of the game engine to play games anymore. All we need is to create instances of the entities (i.e. `Company`, `Department`, etc.) with the relevant data and then perform operations (e.g. buy an upgrade, change a department's budget) via code. If we write the right boilerplate code, we can play full game matches via code only. 

As a matter of fact, we don't need the engine at all to perform these operations; they don't depend on the `MonoBehaviour` controllers (it's the other way around) and can be executed in plain .NET projects. In other terms: we can write automated tests that play full matches without any human (or interactive tool) intervention. As a bonus, we can run thousands of tests (depending on the game complexity) in a matter of seconds.

Just like that, we can write automated tests on game logic that are:

- Highly reproducible: the outcome of a test will depend only on the initial state of the entities and on the operations performed on them. There are no more interactions at 60 frames per second to take into consideration. Therefore, subsequent runs of the same tests should always give the same outcome.
- Fast: hundreds of tests can be simulated in the same amount of time that it would take to just load the game in a playtest. Full matches can be played in a matter of seconds.
- Reliable: the final game will use the same code as the tests and thus will behave exactly the same — given that the data and operations are equal.
- Easy to create: once you've discovered a bug in the game logic, writing an automated test for it should require a considerable smaller amount of effort than programming an interactive test.
- Scalable: doubling the size of your automated test suite means adding a few seconds to your build pipeline, not hours or days in playtests.

## Not just game logic

Even though the examples above focus on game logic, that's not the only kind of code that benefits from decoupling. Here are some other examples:

- Networking. Now that game logic is split from interactive code, we could extend the automated networking tests to include full matches played over the network, or even connected to a remote server.
- Database integrity. Given that we can create game logic entities without touching interactive code, we could create automated tests that check the integrity of our database.
- Fuzzy testing. Provide random, unexpected or invalid data as input and see how the application reacts to it. Does it handle it gracefully, or does it crash?
- Serialization/deserialization.

# Tests and UI as views

If we consider the decoupled game logic portion of the codebase as the game core, the UI (engine-based) and the automated tests can be considered as *views* of our game. The UI is a view where the game is played by interacting via a graphical interface that is rendered at high frame rates, using input methods like a mouse and a keyboard. Automated tests are a view where the game is played via predefined operations executed by a test scheduler. 

Other examples of views:

- A command-line version where the game is played via instructions sent by the user via the terminal.
- An instance of the game logic code running in a server used as an authority that receives commands via the network, sent by players in different parts of the world.

When looked under this light, code decoupling makes our games more extendible. For example, it's much easier to implement a command-line version of a game first, then extend it with a UI view.

# Not a silver bullet

Although code decoupling can open doors for more automated tests on some game projects, it's not the answer to all of our testing problems.

First, it doesn't eliminate the need for interactive testing. In the end, we would like our video game to be interactive — regardless of which view we chose. The interactive aspect will definitely require extra code that should still be tested. In graphical games, the amount of code that's executed on top of the decoupled game logic is still considerable (especially if you count game engine code). Testing that aspect of your game is still cumbersome; but it's less daunting of a task if your code is decoupled and your automated test suite covers most of your game logic. Whether testing the interactive aspect of the game will be (partially) automated is still an important decision to be made.

Second, some games will benefit more from code decoupling than others. The fictional game we analyzed in this article is (purposely) an example of a game that highly benefits from the strategy we discussed: turn-based strategy games. Other types of games that substantially profit from decoupling are:

- Puzzle games like Sudoku and Minesweeper.
- Tabletop games like blackjack and UNO.
- Investigation games.

Highly interactive games, in the other hand, benefit less. That's the case of:

- First-person shooters.
- Open world RPGs.
- Fighting games.
- Platformers.

Even though these games rely heavily on interactions, they can still use code decoupling and automated tests on non-interactive aspects of the game like inventory management, skill tree progression and shopping systems, for example.

# Conclusion

In this article, we saw how video games differ from traditional software in regard to automated testing and how decoupling game logic from interactive code opens a door into more and better automated tests. We looked into how this technique could be applied in a fictional game, how we can benefit from it and what its limitations are.

I hope that, just like I did, more developers learn how to leverage game logic decoupling in their video game projects. As always, feel free to leave a comment with suggestions, questions, opinions, corrections or just to say “hi”. See you on the next one!