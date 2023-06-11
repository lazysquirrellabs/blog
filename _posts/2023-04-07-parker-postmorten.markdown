---
layout: post
title:  "[Postmorten] Parker - the game"
date:   2023/04/07 17:07:12 +0200
author: Matheus Amazonas
categories: jekyll update
---
{::options parse_block_html="true" /}

In this article, I discuss and analyze the development of my last project as a Game Developer at Fantazm: *Parker - the Game*, an online multiplayer turn-based team strategy game. After a quick introduction of the project, its biggest challenges are presented. Then, we focus on the positive side of the project, discussing its successful aspects and the bets that paid off. Following, we analyze elements that didn't play out as expected, lessons learned and how we could have improved both the development and the delivery processes. Finally, I wrap it up with the conclusion.

*Disclaimer*: I was the only developer working in the project, so this postmortem is highly based on my experiences and opinion.
{: .callout }

# Introduction

The project was commissioned by [Event Creators](https://www.eventcreators.nl){:target="_blank"}, a company specialized in events, for their client [Parker](https://www.parker.com/portal/site/PARKER/menuitem.223a4a3cce02eb6315731910237ad1ca/?vgnextoid=c883f1069475e210VgnVCM10000048021dacRCRD&vgnextfmt=NL&vgnextfmt=NL){:target="_blank"}—an industrial equipment supplier. The game was designed to be played on company events.

This project was a “first” for me in two aspects:

- It was my first solo professional video game project, from conception to delivery.
- It was my first time developing both front- and back-end of a video game.

Before we jump into details of the development process, let's take a quick dive into the game itself.

## Concept

The game was planned as a fun, yet informative team experience targeted at Parker employees and partners. In it, teams (3 to 15, containing 1 to 5 players each) control an industrial equipment supplier company along a ten-year period, making decisions that would impact not only their own enterprise, but also the global market. Besides the entertainment value accompanied by the competitive nature of the game, it was also meant to be informative. Game content explores the challenging aspect of running a business placed in a worldwide trend towards sustainable solutions.

Companies are divided into five departments:

- Production and Logistics.
- Sales and Marketing.
- Human Resources.
- Engineering.
- Finances.

![The company view, where players manage their company and its departments.]({{ site.post_images }}/post16/factory.png)

The company view, where players manage their company and its departments.

Each department is divided into three areas that have a mere categorical purpose. The Sales and Marketing department, for example, is divided into Advertising, Campaigns and Sales Growth. 

At the beginning of each calendar year (which is a game turn), players need to make several company decisions, grouped into four categories:

- Department upgrades to acquire. These are items that cost money but that impact the team's company somehow (e.g. improve sales, speed up production, etc.). They take some time to acquire (at least 1 turn) and once they're complete, a new upgrade becomes available. Budget is limited, so upgrade choices become an important factor in a company's success.
- Act on deals: messages sent to teams every new turn offering them business opportunities that should be either accepted or declined. These immediately impact the company and some are long-term commitments.
- Department budgeting: the amount of money each department will have available for upgrades in the next year.
- Pricing choice in the Boardroom—a special type of department without upgrades, meant for corporate decisions. There, they choose the price point for their product based on past market reports on sales volume and average price, calculated on all teams’ performance.

![The world view, where teams can see basic information about their competitors.]({{ site.post_images }}/post16/world.png)

The world view, where teams can see basic information about their competitors.

At the end of each turn, the decisions made by the teams are processed, the market supply, demand and sales are simulated and new company data (including sales and profit) is calculated. This process is repeated at the end of all ten turns. After the last turn is over, winners of three different categories (Employee Happiness, Sustainability and Customer Satisfaction) and one overall winner are declared and displayed to all users on a scoreboard. Finally, the event organizer (acting as host) analyzes the scoreboard together with the players.

## Team

Event Creators staff helped with early game design, with creating game content, with providing valuable feedback during playtests and with project delivery.

Parker staff was responsible for providing domain knowledge that would be used to shape the game experience and to create game content. They also provided valuable feedback during playtests. 

Fantazm was responsible for game production, development, testing and delivery. The development team consisted of a game artist, a game producer/designer and a game developer (yours truly). In addition, other staff members helped with testing.

## Timeline

We started working on the game in October 2020 and most of its development was concluded by June 2021. I didn't dedicate my work time exclusively to this project during this period (and took some well-deserved vacation in January), so it's hard to estimate how many hours I've logged in. After June, the project was put in the freezer for some time, again due to COVID-19 restrictions cancelling our plans.

We picked the project back up around the end of 2021 and worked on some final adjustments around May 2022, just in time for project delivery at a company event in June of that year.

## Setup

The game's frontend is a browser-based WebGL application. Players gather on teams—one on each computer—to compete against each other via internet, connected to the game servers. A participant takes the role of match host and creates a match that will be played at a given date and time. Then, they share the match join link with the players. On the given date and time, the host opens the match and players can enter the match using the join link. Once the players join the match lobby, the host can start the match. The lobby server is responsible for all the steps described up to this point.

Once the match starts, the match server takes control. All the players and the host connect to it and all the communication goes through this channel. The match server is responsible for controlling the turns and for authoring: all the team data processing and market simulation are performed on the server side. Once all turns have passed, the match server computes the final round, decides who are the winners in each category and communicates that information to all connected participants. At this point, the match is over and the connections are closed.

## Development environment

The frontend was developed using the Unity 2019.4 game engine. The backend was hosted on Amazon EC2, on an Ubuntu virtual machine. The lobby server was an ASP.NET Core application and the match server was a .NET Core console application, both using .NET 6. Video assets—we didn't include videos in the build to speed up loading times—were hosted on Amazon S3.

I used macOS for local development, including .NET development. My IDE of choice was JetBrains’ Rider for both frontend development in Unity and backend .NET development. Git repositories were hosted on BitBucket. Unity Cloud Build was used to generate new builds and to perform automated tests.

# Challenges

Just like any software development project, we had to overcome some challenges to deliver the product we envisioned. Here are two challenges I believe are worth highlighting.

## Number one: the pandemic

Initially, the game was planned to be played by several teams in a local network, at company events. That plan was quickly abandoned when, around the time we were ready to kick development off, the COVID-19 pandemic hit.

First, development was delayed due to the huge uncertainty that lingered around most of 2020. Development efforts didn't resume until October of that year.  Second, gathering a large group of people in the same room became a nearly utopian idea. With that in mind, we pivoted the game into a browser WebGL game that could be played remotely, via internet.

## Number two: my first backend

The second challenge was a personal one. Until this project, I had never built a game server from zero to delivery, let alone two—lobby and match. At first, I was apprehensive because I didn't have much professional experience in backend game and web development. But then, once using .NET and C# (the same programming language Unity supports) in the backend became a viable option (more on that later), I became more confident about it. Developing the game servers proved to be a great learning experience, specially regarding multithreaded programming and thread-safety. In the end, the servers delivered great results in terms of features, reliability, robustness and performance.

# What went right

In this section, you will find the successful aspects of the development process that I believe are worth showcasing.

## .NET on Linux and macOS

Linux and macOS have been supported by .NET Core since its first version, in 2016. Although (at the time) fours years had been passed since that release, I was reluctant to adopt it on the game backend because, historically, Microsoft products delivered a much better experience when used in tandem. I was suspicious of the promises of .NET running as well on macOS (which I used for local development) and Linux (which I chose for the server) as on Windows. After some research and reviews of sources I considered reliable, I decided it was worth giving it a try. Worst-case scenario, I could switch to a server running Windows.

In the end, the promises were fulfilled. The development experience was as smooth as it could be, and I was able to use my C# IDE of choice (Rider) for both front and backend development, running macOS. Additionally, sending code changes from my macOS development environment to the Linux server was as easy as committing, pushing and pulling from the git repository.

## Working with Web Sockets

Although the target was platform was web browsers and WebGL, early prototypes were developed and tested in the Unity editor only. By that time, the groundwork for the networking solution were laid, completely based on TCP sockets. This was my first WebGL game and if you have some experience developing web browser games you might have already spotted the obvious mistake I've made: popular web browsers don't support standard network sockets (e.g. TCP and UDP) due to security limitations—which I completely understand.

After some research, I discovered Web Sockets and how they could be used as replacements for regular network sockets. I chose an implementation that was compatible with Unity ([Native WebSockets](https://github.com/endel/NativeWebSocket){:target="_blank"}) and gave it a try. It took me some time to get used to how Web sockets differed from traditional ones, but in the end I was able to get it working with our codebase. Once we fully transitioned to Web Sockets, we were ready to continue development. In the end, Native WebSockets proved to be exactly what we were looking for: a reliable replacement for traditional network sockets.

## Amazon Web Services: EC2 and S3

Our servers were hosted on Amazon EC2 and video assets were stored on Amazon S3. We were quite confident about using EC2 since the beginning, but we were apprehensive about using S3 to host the videos. In the end, both worked as expected and S3 proved to be a good option to store static files.

## Document on the fly

Since this was the first time I had set a game server up from zero, I decided to document every single step I took in the process. When faced with some challenges, I often experimented with different approaches and documented the outcome. Once I got the server working as expected, I was able to easily extract a setup manual from it. I also kept the original version of the setup document as a report on the approaches that I've tried but decided not to pursue, because it contained relevant information that might be valuable in the future.

Documenting the server setup process proved to be a good practice that paid off later, when I decided to deploy a staging server for testing purposes. Thanks to the setup manual, this second server setup was pleasantly uneventful.

## Playtests from the beginning

I'm a firm believer in the “test early, test often” mantra, and we agreed that we would hold playtest sessions with the client regularly, as early as after the first month of active development. There wasn't much to play on the first session; UI interactions were not implemented yet, and the playtest session turned into a presentation about the early stages of the development process. In retrospect, I believe we should have skipped the first one. But with every playtest that followed, we were able to gather more feedback, observe new player behavior, find more bugs and to better manage expectations with the client. In the end, the playtests not only helped us with delivering a better product, but they were also a great break from all the coding.

# Bets that paid off

Being the project's only developer put me in a unique position: for the first time in my career, I was responsible for calling all (technical) shots while working in a project with a team of professionals. It was a great chance to experiment with a few things I've had in the back of my mind, but couldn't explore in most projects I've worked on so far. Even though I had several ideas in my mind to pick from, some were more pressing (and easier to justify) than others. In the end, I chose a few and put them into action. Here are the ones I believe are worth discussing.

## Game Design Document

Even though some say GDDs an essential part of the development process, most of the projects I’ve worked on didn’t use one during the entire development of the game (or at all). For this project, I decided to write and maintain a GDD from start to finish. I described this experience in a [separate blog post](https://matheusamazonas.net/blog/2022/09/10/finally-a-proper-gdd){:target="_blank"}.

## Sharing code

One of the aspects that convinced me to use .NET on the servers was the possibility to share code between front and backend without any middleware. At first, the amount of code that could be shared was uncertain, mostly due to my inexperience on the subject. In the end, most of the game logic was shared between front and backend—although small portions of the code were invoked only by one of the ends. In addition, networking messages code (including (de)serialization) was shared. This strategy proved to be extremely helpful because:

- Some features only had to be implemented once.
- The class of bugs that emerged due to changes being performed on the frontend, but not on the backend (or vice-versa) was eliminated by design.
- We could trust that the server would process data and (de)serialize network messages the same way as the clients did.

## Automated tests

Once again, most (or close to none) of the game projects I've worked in the past implemented automated tests. I was aware of the benefits automated tests could bring, but I also knew that implementing them could be quite challenging. In the end, I was able to implement a small test suite (277 automated tests) that proved to be extremely valuable. These are the topics I would like to highlight from my experience of using automated tests in this project.

<details open>
  <summary><h3 style="display:inline">Code decoupling</h3></summary>
Writing automated tests for video games can be quite challenging due to their interactive nature. In this project, I leveraged the decoupling of game logic and interactive code to let me write more and better automated tests. I described the technique and the experience in a [separate blog post](https://matheusamazonas.net/blog/2023/03/29/decoupling-code){:target="_blank"}.
</details>

<details open>
  <summary><h3 style="display:inline">TDD sneak peek</h3></summary>
I wanted to give Test-driven Development a try and started working on features by writing the automated tests before spending some time actually implementing them. This proved to be a good practice because:

- It forced me to write more automated tests. If the tests come before the feature, it's less likely they will be left for later in development—and then forgotten. More tests led to a better and more stable game.
- It made me question feature specification and rethink design decisions earlier in the process. The act of writing the tests revealed some design flaws that would otherwise be noticed later in development, possibly during playtest.
</details>

<details open>
  <summary><h3 style="display:inline">Regression bugs</h3></summary>
In a nutshell, regressions bugs are bugs that broke a featured that used to work correctly. If the feature in question was sufficiently covered by automated tests, the regression bug could be easily spotted and eliminated before being committed. As a consequence, the number of regression bugs found during playtests was considerably low. Most of the ones we've encountered affected portions of the codebase that were not covered by automated tests, like the UI.
</details>

<details open>
  <summary><h3 style="display:inline">Better commit history</h3></summary>
I adopted the habit of running most of the test suite before committing code. Doing so unearthed some bugs that would've made to the git history otherwise. In the end, not only the repository was cleaner (because there were less revert and bug fix commits), but it was also more stable; even feature branches.
</details>

<details open>
  <summary><h3 style="display:inline">Build automation</h3></summary>
Although I was the only developer working on the project, I decided to make use of Continuous Integration with Unity Cloud Build. Automated tests were added to the build pipeline and builds would fail if tests did. The project benefited from this addition in the following ways:

- Only builds that passed all tests were used for playtests, increasing the number of bugs found earlier—during development—rather than later, during the test sessions.
- Tests that took long to execute and that would be skipped when developing and committing a feature could be executed regularly without blocking the developer's work.
</details>

<details open>
  <summary><h3 style="display:inline">Game logic isn't everything</h3></summary>
When I decided to write automated tests in this project, I had game logic in mind. In the end, most of the test suite focused on that aspect of the codebase, but others naturally popped up during development. Here are some:

- **Serialization**. The game is played online, thus messages must be sent over the network. All messages needed to be serialized on one side and deserialized on the other one (byte representation, not textual). Automated tests proved to be a crucial tool that often exposed serialization bugs.
- **Networking**. Unfortunately, testing serialization isn't enough to improve the quality of the networking solution. Given the multithreaded nature of the server application, thread-safety is something to keep under constant consideration. Automated tests uncovered some bugs that were hard to reproduce without them due to timing limitations. Additionally, these tests aided us with profiling our server's performance.
- **Database**. The game was only as good as its content, and database integrity and consistency was essential. Once again, automated tests came to the rescue and helped us with keeping our database healthy, even along multiple changes performed during the development cycle.
</details>

# What went wrong

Once again, just like any software development project, some aspects of the development and deployment processes did not go as expected. Here are three points I judge worth discussing:

## WebGL templates and Unity Cloud Build

Unity offers a nice way to customize the webpage that shall contain a WebGL game: [WebGL templates](https://docs.unity3d.com/Manual/webgl-templates.html){:target="_blank"}. We decided to use this feature to deliver a customized experience with a design that matched our client's brand design. It worked as expected on local builds, but the template wasn't applied on cloud builds. At first, I thought we were missing something, like some setting we forgot to enable. Turns out this behavior is by design: Unity Cloud Build ignores the project's WebGL template so Unity can use their own template to host the game themselves (a feature we didn't need and didn't want to use). In practical terms, it meant that we were able to use Cloud Build for development and internal test builds, but not for production ones. This problem still persists to this day, despite [users repeatedly requesting changes](https://forum.unity.com/threads/webgl-te:mlate.363057/){:target="_blank"}.

**Update!** *(May 2023)*: It seems like the behavior above has changed, and Unity Cloud Build [finally respects the project's WebGL template](https://forum.unity.com/threads/webgl-custom-template-support.1430821/){:target="_blank"}.

## Shared code and git submodules

We've already discussed the benefits of sharing code between the game's frontend and backend. But how to synchronize the source code files to make sure both ends are running the same codebase?

We had been using git for version control in other game projects, and we were quite satisfied with it, so we decided to use it in this project as well. When the question on sharing common code came up, I thought that git submodules was the obvious answer. I've had some experience with it in the past and besides its particular setup process, it's a straightforward tool that delivers on its promise. What I didn't expect was to struggle to find an optimal strategy to share code between the Unity and .NET projects without substantial caveats. Here's the dilemma:

Unity creates a meta file (`.meta`) for each asset in a project, including C# files. These files are essential to the engine's operation and should not be ignored by git. Once the git submodule containing the shared code was initialized and its files were checked out, Unity would create meta files for each one of them. These meta files should persist, somehow, across git operations. The way I see it, there were two options:

- Keep the meta files in the main branch of the shared code's repository, which would effectively also bring them into the .NET project. This was undesired because I would've liked to keep the .NET project as clean as possible.
- Keep the meta files in a separate branch on the shared code's repository, dedicated just to the frontend. This would require constant rebases (or merges) of the main branch into the branch containing the meta files to keep both branches in synch.

I favored the second approach over the first, and to be honest, I'm still not sure if it was the best choice. To this day, I am not aware of an optimal approach to this problem. If you have an idea, please let me know in the comments section.

## LAN parties aren't always great

The target platform switch to WebGL triggered by the pandemic meant that teams could be physically distant while playing the game, unlike initially planned. We developed and tested the game based on that premise; we were mostly spread across different cities (or countries) during playtests. We didn't notice any hiccups during our tests—neither on our servers nor when downloading the large video files from Amazon S3 in the background.

As time went by and most pandemic restrictions were lifted, it was decided that the game would debut on an event organized by the client. On the day before the event, we went to its venue to test the entire game setup. It quickly became obvious that we had a problem: the local network and internet bandwidth were not enough to handle all 16 instances of the game (15 teams and 1 host) simultaneously downloading the video assets from Amazon S3. As a consequence, videos would buffer, negatively impacting the experience. We thought the Wi-Fi network was to blame, so we tried switching to a cabled network instead, to no avail. Buffering was less frequent, but still present.

In the end, we came up with a last minute offline solution that leveraged the fact that each video was supposed to play simultaneously to all participants: we downloaded the videos on the host computer, which was connected to speakers and a projector, and played the videos when they were needed. This simple solution did the trick, but it still harmed the experienced a little. We learned a lesson that day: when deploying WebGL games to be played in a LAN party setup, either ensure (way in advance) that the local network handles the load, or bring your own server.

# Nice to have

We always aim for quality in our projects, but we often need to prioritize some tasks over others, and some never end up seeing the light of day. In this project, there was one tool I wanted to use, but that ended up not being worth dedicating the time necessary to learn and integrate: Docker.

Although I listed the server setup manual as a positive outcome of the project, the setup process could've been almost completely automated using Docker containers. Once configured, it could have saved us some precious time, specially if we wanted to create multiple instances of the server. In the end, the server setup process was repeated only once, and it turns out that learning and using Docker for the first time would require much more time than just following the setup manual.

# Conclusion

“Parker - the game” was a challenging, yet fun project to work on. Even with a pandemic on the way, we were able to deliver a great game that succeeded at its goal. Personally, the project was quite a learning experience, due to both planned endeavors and to undesirable surprises. In the end, I'm quite proud of the end result, and I'm glad this project crossed my path.

As always, feel free to leave a comment with suggestions, questions, opinions, corrections or just to say “hi”. See you on the next one—I hope it doesn't take too long!