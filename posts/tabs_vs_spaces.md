---
layout: post
title: "Tabs vs. spaces: the discussion that should not exist"
date: 2024/07/14 19:11:00 +0200
author: Matheus Amazonas
categories: jekyll update
description: I am a firm believer that the "tabs vs. spaces" discussion regarding code indentation should not even exist... because tabs is the only sane answer.
---
I am a firm believer that the "tabs vs. spaces" discussion regarding code indentation should not even exist... because tabs is the only sane answer. 

And I don't mean to joke with that punchline—I truly believe that tabs are objectively the right choice when it comes to source code indentation. I also think that by choosing spaces, one pushes their opinion down an entire team's throat. My goal in this article is to describe why I believe that tabs are the way to go.

> ℹ️ Consistency throughout codebases and teams is more important than sticking to our personal opinion. Personally, I believe that mixing tabs and spaces for indentation is worse than using spaces because the inconsistencies and merge conflicts that it brings (if you're using a Version Control System) greatly outweigh the clear benefits of picking tabs.
{: .callout }

## The problem
First, it's important to quickly describe the problem. The "tabs vs. spaces" debate surrounds the choice of character used to indent code blocks. Indentation is usually represented as whitespace between the start of one line and the following one. For example:

```csharp
while (true)
  counter++;
```

The C# snippet above contains code that is indented to hint the reader about code structure: the second line starts with 2 spaces to inform the user that the line is part of the `while` code block. 

Whether the indentation impacts the code structure—and consequently its behavior—depends on the programming language. Some programming languages like Python and Haskell use indentation as part of the program's structure. Thus, changing code indentation might change a program's behavior. In contrast, [free-form languages](https://en.wikipedia.org/wiki/Free-form_language) like C, C++, Java, C#, JavaScript and Go completely ignore indentation, trailing spaces and line breaks. Therefore, removing code indentation will have no impact on a program's behavior. In free-form languages, indentation improves readability, and nothing else. For example, the following C# code snippets behave exactly like the previous one:

```csharp
while (true)
counter++;
```

```csharp
while (true) counter++;
```

With that in mind, we ask ourselves the question: which character should be used to represent indentation? ASCII is the encoding standard for source code in most western countries, and it contains the following whitespace characters:
- Space: `' '`.
- Horizontal tabulation: `'\t'`.  Also known as "character tabulation" or simply "tab".
- Vertical tabulation: `'\v'`.
- Carriage return: `'\r'`.
- New line: `'\n'`.
- Form feed: `'\f'`.

Out of the six characters above, only two can be used to represent whitespace within the same line and page: space and horizontal tabulation. A space's width is of exactly one column, and it has no visual representation (i.e. it's a whitespace character). The horizontal tab is also a whitespace character, but its width is not fixed. It is up to the software that's rendering the ASCII text to choose how wide a tab should be. Text editors, including the ones often used by programmers, usually offer customizable tab width. 

And so the eternal discussion was born: should we use tabs or spaces for indenting code?

### Why should we care?
Both tabs and spaces look like whitespace, so why should we care? First, as pointed out in the introduction, consistency is key. Mixing tabs and spaces is a recipe for disaster, particularly when working in a team, and even more when working with Version Control Systems.

Well, then let's just pick any and move on, right? They both look the same, so how can they be any different? As it happens, there are many practical differences between them. The following sections describe and contrast the differences and ultimately conclude that, given the distinction, [Richard Hendricks was right](https://www.youtube.com/watch?v=SsoOG6ZeyUI) and tab is objectively the best choice.

## The differences
Let's take a look at the distinction from different perspectives.

### Consistency
I would like to start with an argument that is usually used in favor of spaces, but that fails to understand the nature behind tabs. The argument usually goes in the lines of:

> Tabs might look different in different computers or even software applications, leading to inconsistency. Spaces, in the other hand, will always look the same regardless of the computer or software it's being displayed at.

I've encountered this argument multiple times, spanning from discussions with friends, to Stack Overflow/Exchange threads ([1](https://stackoverflow.com/a/11492212/4347249), [2](https://softwareengineering.stackexchange.com/a/66)) and even to code convention manuals in companies I've worked at. This argument fails to understand the nature of tabs, to the point that it presents tabs' "inconsistency" as a flaw—like it's a bug in a software. **It's not a bug. It is a feature.** In fact, it is *the* feature. That's the whole point of tabs. That's why they were created. 

But if not a flaw, what is this "inconsistency", a strength? What does it bring to the table?

### Customization
The origins of the tab character shine a light on what value the "inconsistency" brings. To fully understand the idea behind the tab character, we need to go back in time as early as 1900, when electronic computers did not exist and typewriters reigned. The tab key was first introduced as a mean of automating the tabulation process (arrange data or text in a table form), saving the typist repeated presses of the space and backspace keys. The width of the tabulation was flexible, and it was determined by a tabulator rack and its clips.

The idea of tabulation with customizable width made its way through the 20th century all the way to the ASCII standard which we still use today, in the form of the vertical and horizontal tabulation characters `'\t'` and `'\v'`.  These characters were [created](https://en.wikipedia.org/wiki/Tab_key#Tab_characters) to allow for flexible tabulation on printers, where the user could customize its length in column and line units, respectively.

In short, tab characters have always been used to provide customizable tabulation. The only thing programmers did was to reuse it for indentation. Instead of physically moving a tabulator rack on a printer to customize the width of horizontal tabulation, we change the settings of our favorite text editor.

Notice how, in this case, customization might lead to "inconsistency": the same source code might be displayed differently on my computer than on my colleague's because the software applications used to display the code have different tabulation widths set. If we would like to make both of them look exactly the same, all we need to do is to change the tab width setting on one of the applications. This is as much as inconsistent as saying "the cars in the road are inconsistently colored" when in reality what it means is "car colors are customizable". 

### Respecting each other's preferences
Some might say that spaces also allow for customization—you can choose any amount of spaces for indentation as you wish, just like you can do with tabs. Although that sounds like a simple solution when working individually, it becomes problematic when working on a team because only two outcomes are possible. Either:
- The team agrees on a standard number of spaces to use for indentation (let's say 4), keeping the code base consistent, or;
- No standard is agreed on, and each developer is free to choose a space count to their heart's content.

The first scenario accomplishes consistency at the cost of customization and respecting personal opinion. Your team agreed on 4 spaces for indentation, but you would like to use 2? Too bad—you're forced to use 4. That's what I meant with "pushing their opinion down an entire team's throat" in the introduction. The second scenario allows for customization, and it respects personal opinion, but it abandons consistency. Whether a file uses 2 or 4 spaces for indentation depends on who wrote it—or even worse, sometimes the same file might contain mixed space counts because multiple developers worked on it. We can't have both with spaces. We either pick consistency or customization.

Tabs come to the rescue. First, it delivers consistency: a codebase that uses tabs for indentation will have consistent indentation lengths within the same code editor. The code might look different between my computer and my coworker's, but neither I nor they should care about that, just like they might use a different code editor, font and editor theme as me. Second, as it just became obvious, customization is also conserved. Thus, unlike spaces, tabs manage to deliver on both promises. It's the best of both worlds and is objectively a better choice.

### Accessibility
One aspect of the debate that is often forgotten (but that thankfully has been remembered more often these days) is accessibility. Take the following scenarios into consideration:
1. A visually impaired developer struggles to recognize small indentations in code. Indentations of 1, 2 or even 4 columns are hard to identify, and they are more comfortable with at least 6 columns. If the code base they work on used 4 spaces for indentation, they would struggle to work comfortably. 
2. Another developer, with a completely different visual impairment, uses a large font on their code editor in order to make the code more readable. We're not talking about small increments here; we're talking about *huge* font sizes that are not personal taste, but instead a necessity. If, for example, the code being displayed uses 4 spaces for indentation, large portions of the screen will be wasted. Screen real-estate is already valuable for people that are not visually impaired, imagine for those who are. In this case, the developer in question would highly benefit from a small indentation. In some instances, 1 column would be ideal.
3. A (partially) blind developer uses a refreshable braille display to program. Just like the developer from the previous point, screen real-estate is at a premium because most of those special displays can only display 40 braille cells. If a code block had, for example, 3 levels of indentation with 4 spaces for each level, 12 braille cells would be used just to represent indentation. That's 30% of the screen's width. Just like the previous developer, users of such displays could highly benefit from indentation that took fewer braille cells.

Unlike with developers that are not visually impaired, the indentation choice in the cases above is not a matter of personal preference, and it might directly impact one's ability to work on a certain codebase. Unfortunately, there is no choice of space-based indentation length that satisfies the needs of all these developers. Picking a small space indentation length (e.g. 1) would be detrimental to the first developer's experience. If a large length was chosen instead (e.g. 6), the second and third developers would be negatively affected.

Tabs, in the other hand, allow developers 1 and 2 to choose whatever column length is more comfortable to work with. Developer number 3 would also benefit from using tabs because tab characters can be represented using only one braille cell, dropping the number of characters used for indentation by 75%. In the 3 indentation levels example, that means using 3 (7.5%) of the available cells for indentation instead of 12 (30%).

The scenarios above are not fictional. Points 1 and 2 were experienced by Chase Moskal and shared on a Reddit [thread](https://www.reddit.com/r/javascript/comments/c8drjo/nobody_talks_about_the_real_reason_to_use_tabs/) that gained some traction in the tabs/spaces discussion. The third scenario was [presented](https://github.com/prettier/prettier/issues/7475#issuecomment-668544890) first-hand by Marco Zehe, who is totally blind from birth. These scenarios should, in my opinion, be enough to establish tabs as a standard even if the benefits so far discussed in this article did not hold. The accessibility argument dwarves any small nitpick and personal preference.

### Alignment
Some spaces defenders argue that it's hard to align multiline code with tabs because its flexible nature won't allow for consistent alignment. The code snippet below, for example, contains a multiline method call that was perfectly aligned using tabs (with width set to three columns) on lines 2 and 3:

```csharp
user.Update(form.id,
				form.name,
				form.lastName);
```

Even though the alignment seems fine here, it will break once we change the width of a tab. If we set it to 2, for example, this is how it would look like:

```csharp
user.Update(form.id,
      form.name,
      form.lastName);
```

It becomes clear that using tabs for alignment is not a good idea if we would like to preserve the layout across different text editors. This would be a great argument against tabs, if it wasn't missing the point of the discussion. We are debating over a choice for *indentation*, not for alignment. Spaces can still be used for alignment alongside tabs for indentation. This approach to formatting code is known as:

> Use tabs for indentation and spaces for alignment.

The images below demonstrate this practice. Both of them display the same code snippet, which uses tabs for indentation and spaces for alignment. Tabs are visually represented here as straight, horizontal lines, and spaces as white dots. The only difference between the two images is that on the first one, the code editor's tab width is set to 4 and on the second one, to 2.

![](/assets/images/post23/alignment1.png)
![](/assets/images/post23/alignment2.png)

Notice how the alignment didn't break when the tab width was modified. This approach works on any indentation level and can be used when code is indented, aligned, then indented again, preserving the desired layout. This last addition to our formatting strategy delivers all benefits of tabs (consistency and customization) while preserving alignment when different tab widths are used.
### File space (JK)
There is one last argument against using spaces for indentation. Each tab is stored as a single character, and so is each space. In the best case scenario (if 1 space is used for each indentation level) tabs take the same amount of storage than spaces. In the most common scenario (4 spaces), they take 1/4 of the storage space. In the worst case scenario (infinite spaces are used), it's impossible to store the source code using spaces due to storage limitations.

This argument is usually considered quite weak to the point that it is often considered a joke, but I can not let the gag die. In a time when 4K video streaming is becoming a norm, the gap between the storage needs of these 2 strategies is beyond negligible.
## One last thing
It might go without saying, but better safe than sorry: enforcing tab width in a team or organization goes against the idea of using tabs to begin with. Customization is the reason behind the tab character, and abandoning it defeats its purpose. If you do so, you might as well use spaces.

Additionally, if you build a tool for developers that allows source code to be displayed, I beg you: allow users to choose their own tab width.
## Conclusion
Tabs should be the industry's indentation standard because it preserves consistency while allowing for customization and respecting personal preferences. Additionally, it is *the* choice when it comes to accessibility. Finally, tabs can be used for indentation along spaces for alignment, combining the best of both worlds.

That's all, folks! As usual, feel free to use the comment section below for questions, suggestions, corrections, or just to say “hi”. See you on the next one!