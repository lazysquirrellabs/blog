
# Motivation
I started learning Rust on my free time last summer (2025), and I have been enjoying using it *a lot*. This is the first time in a long period that a programming language has caught so much of my attention, and I'm here for it. I decided to document my experience, opinions, frustrations and plans in this blog post, as a way to consolidate all the ideas in my mind.

# Background
First, I think it's important to quickly describe my software development background to give some context on some of the points below. I'm a game developer with 10 years of experience in mostly Unity and C#; which explains why there is so much comparison with C# in this text.

Besides having contact with the usual Java, Python, C/C++ and others during my bachelors, I spent most of my master's programming using pure functional languages: Haskell and [Clean](https://clean-lang.org).

# How I stumbled upon Rust
> [!info] Feel free to skip this section if you're just interested in my thoughts on Rust.

The first time I've heard about Rust was in a Software Security class back in 2016, where the lecturer was contrasting different safety techniques implemented by programming languages. The talk was about how, from a security perspective, memory-unsafe languages like C and C++ are susceptible to attacks that memory-safe languages like Java and Python were protected against. A slide was brought up with some statistics on [CVE Vulnerabilities](https://www.cve.org) and their causes. It was clear that a good portions of vulnerabilities was caused by memory unsafety: use-after-free, double free, buffer overflow... there was entire group of errors that were exploited into vulnerabilities, and that were just not existing in memory-safe languages. The message was clear: avoid languages that allow for these errors, if you're taking security seriously.

But, even as a barely experienced game developer that programmed mostly on C#, I knew that we couldn't stop using languages as C and C++ just like that. Performance is king in some domains like game engines, and there is a reason why Java game engines are not popular. The same was true for many other domains: operating systems, embedded systems, interactive multimedia, systems programming... the list is long.

We discussed the issue in class, and the lecturer introduced us to some ideas on sophisticated type systems that might achieve both memory safety and great performance. On the center of this discussion was this new programming language whose development was backed by Mozilla and that was starting to gather attention: Rust.

At the time I didn't give it much attention. It was yet another programming language that was supposed to be the Best Thing on Earth™. It wasn't until the pandemic hit (sorry for reminding you of that) that I started to periodically see Rust popping up on different places: discussions with peers, my GitHub feed, YouTube recommendations, etc. Again, I kept ignoring it, but my curiosity kept growing. 

Last summer, motivated by a task at work, I decided so start learning... Swift. It seemed like a fresh and interesting language that learned a lot from the mistakes of more "traditional" languages. Interestingly enough, the more I searched for material on Swift, the more I found comparisons with Rust. I started reading some of these comparisons and reached a funny conclusion: I should be learning Rust instead. So I gave up Swift and finally started looking into Rust. 

# My path so far
I'm far from an experienced Rust developer. My first "Hello World" was about 8 months ago, and I've only used it on my spare time, outside work hours. I have, so far:
- Read the [ Rust Book](https://doc.rust-lang.org/book/) and followed along with exercises.
- Completed [Rustlings](https://rustlings.rust-lang.org).
- Developed a tiny command-line application that helps me at work with the installation of multiple APKs on different Android devices. [GitHub](https://github.com/matheusamazonas/batch_apk_installer), [crates.io](https://crates.io/crates/batch_apk_installer).
- Develop YAPCoL: a parser combinator library. [GitHub](https://github.com/matheusamazonas/yapcol), [crates.io](https://crates.io/crates/yapcol).

I plan to start reading [Rust for Rustaceans](https://rust-for-rustaceans.com) soon. I also have [Rust by example](https://doc.rust-lang.org/rust-by-example/) on my radar and I often refer to it when I forget how to use a given feature. With that said, I haven't read it from head to toe.

# My thoughts
This section contains my thoughts on different aspects of Rust, in no particular order.

## Types
Algebraic Data Types ([ADTs](https://en.wikipedia.org/wiki/Algebraic_data_type)) are up high up on my "features of a perfect programming language" list. Haskell and Clean ruined a good portion of programming languages to me, just because of how good their ADTs support is. I develop mostly in C# at work, and I often run into situations where a good enum-with-data/tagged union would've fit perfectly into the data I wanted to model. I miss ADTs every time I experience that frustration. 

Starting my Rust journey with enums (sum) and structs (product) was a blast. I also loved how methods (associated functions) can be easily defined, and how they're kept apart from the type definition.

## Functions
- Rust's function syntax follows the *right* order: parameters first, followed return type, and finally constraints. I've had enough of reading first the return type, then parameters.
- I actually like `self` and how it distinguishes functions from methods. Functions should be the default, and methods should require some extra syntax. I prefer that to C#'s OOP approach that defaults to methods and requires extra syntax (`static`) to define functions.
- Declaring lifetime variables along type variables was a bit confusing at first.

## Mutability


## Ownership and the borrow checker

## Functional programming
Rust ticked most functional¹ boxes on my "features of a perfect programming language" list. A few worth mentioning:

- Functions are first-class citizens, but that hardly counts as a unique feature nowadays. Coming from C#, this was not a surprise, and almost expected. The same goes for lazily-evaluated iterators and tuples.
- Pattern matching is great and it's available in many places and flavors. Unsurprisingly, it's a perfect fit for a language that supports ADTs. Finally, I love the fact that pattern matching is exhaustive, unlike Haskell²—I'm not a big fan of runtime errors.
- Famous types like `Result` and `Option` are a good sight, but I will never forgive Rust for not naming them `Either` and `Maybe`. Ok, I might forgive `Result`, but not `Option`. `Maybe` is the only acceptable name.
- The `?` operator is the closest we get from Haskell's `do` notation and Clean's monadic binding for sequential operations with `>>=`. Don't get me wrong, I'm glad we have `?` and its early exit; they're a life-saver and I can't imagine writing Rust code without them. With that said, it's sad that `Result` is the only supported type, and I hope the [`Try`](https://doc.rust-lang.org/std/ops/trait.Try.html) trait gets stable soon.

Of course we can't ignore the elephant in the room: mutability is allowed. But I think Rust reaches a nice compromise between the different worlds of traditional imperative languages (where mutability is granted) and pure functional languages (where referential transparency is usually unbreakable).

## No `null`
To keep it short: in a world where `Result` and `Option` exist, there is no room for `null`. Rust did well in keeping it out of the language. I'm tired of C#'s `NullReferenceException`, even when it's my fault. I would rather eliminate those at compilation time than at runtime.

## Exceptions
Read this: https://www.artima.com/articles/the-trouble-with-checked-exceptions

## OOP
ADTs + traits is enough. Inheritance is overrated.

## Unsafe

## Generics and `dyn`

## Smart pointers

## Lifetimes

## Asynchronous programming
C#, but futures need to be polled, which is interesting.
Never considered not having a default async runtime, but it makes sense.
Streams are awesome.

## Multithreading

## Structure
Modules are still confusing. I'm not sure there's a direct replacement in C#.

## Tooling
Compiler, cargo, clippy, documentation generator, rustfmt, IDE

## Source and help


# Footnotes
1. Whatever "functional" means.
2. Haskell might support exhaustive pattern matching with external packages, but it doesn't offer native support, neither that's the default.

