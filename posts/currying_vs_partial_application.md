---
layout: post
title:  "FP: Currying vs. partial application"
date:   2017-10-26 20:33:38 +0200
author: Matheus Amazonas
categories: jekyll update
description: Currying and partial application are two concepts usually found in functional languages that are often confused. In this post, we try to clear up that mishmash.
---
While learning Functional Programming, there were two concepts that for me, were really hard set apart: currying and partial application. One day, I finally decided I would dig deeper and learn what each one represents and more importantly, why I mixed them up. In this article we’ll see what currying and partial application are, distinguish them, see how they’re used in functional languages, discuss why these concepts get mixed up so easily and present why they are so important.

One tiny thing before we start. Even though the concepts we focus are widely used in functional languages, we won’t use a purely functional language to explain them – Python. You have to trust me on this.
## Currying

Currying is the process of transforming a function that takes many (N) arguments into a series of (N) functions, each one taking exactly one argument. Well, maybe doesn’t tell us much, but let’s take a look at the example code below and learn from example. The Python code above shows the definition of the `mult_pow` function, which takes 3 numbers, raises the first one to the power of the second, and multiplies the result by the third one. Pretty straight forward. The only way to evaluate this function is by calling it and providing the 3 arguments.

```python
def mult_pow(x,y,z):
	return x ** y * z
 
print(mult_pow(2,3,4))
>> 32
```
Now let’s try to curry this function. As described above, we will transform this function into 3 new functions, each one taking exactly one argument. We call `mult_pow_c` the **curried** version of `mult_pow`.

```python
def mult_pow_c(x):
	return lambda y: lambda z: x ** y * z
```

Let’s analyze this pice of code for a minute. The function `mult_pow_c(x)` takes one argument and will always return a lambda, which is… a function! The returned function takes exactly one argument – `z` – and returns another lambda. This last lambda, again, takes one argument and returns the result. Note that the outer variables `x` and `y` are part of the inner function’s closure and can be accessed by it. As you noticed, we did exactly what the definition of currying said two paragraphs ago: we turned a function that takes many arguments into a series of nested functions, each one taking exactly one argument. To put it in a more formal way, currying transforms a function of N-*[arity](https://en.wikipedia.org/wiki/Arity)* into N functions of 1-*arity*.

Let’s now try to use these two functions and see how their application differ. The first function call uses the *uncurried* version and the second one the *curried* version.

```python
print(mult_pow(2,3,4))
>> 32
 
print(mult_pow_c(2,3,4))
>> TypeError: mult_pow_c() takes exactly 1 argument (3 given)
 
print(mult_pow_c(2))
>> <function <lambda> at 0x10e9fd758>
 
print(mult_pow_c(2)(3))
>> <function <lambda> at 0x10f6a2e60>
 
print(mult_pow_c(2)(3)(4))
>> 32
```

The first call (lines 1-2) demonstrates function application on the uncurried version and behaves as expected. But when we try to run the second call (lines 4-5), invoking `mult_pow_c` instead of `mult_pow` and passing three arguments to it, we get a type error telling us that we called that function with the wrong number of arguments. And indeed we did. Remember that `mult_pow_c` is the curried version of `mult_pow`, hence it only takes one argument. When we give it only one argument (lines 7-8), it returns a function, exactly what we expected from a curried version of `mult_pow`. In this context, if we have a function, what’s the most reasonable thing to do with it? Apply it! We do so (lines 10-11) and we still got a function in return, which makes sense given that `mult_pow` originally is a function that takes 3 arguments (3-arity). Only when we apply the functions three times (lines 13-14), we get the result we expected.

Well, well, well. It looks like we just created a super complicated way of defining functions. We need lambdas, unnecessary parenthesis when calling a function and there is a big knot in my head when I think of it. At first sight, it might look like a cumbersome way of doing simple things, but bare with me along the next section so we can understand why this is a powerful tool.

## Partial Application

Let’s again use a Python example to illustrate the concept of partial application. The following code defines a function to multiply two numbers – `mult` – and a function to double (multiply by two) a number – `double`. Easy peasy.

```python
def mult(x,y):
	return x*y
 
def double(x):
	return mult(2,x)
```

Notice that the `double` is defined in terms of `mult`. This is a pattern that we’ve seen before and some call it “wrapper functions”. Another good example are the functions `pow` (power) and `square` (^2). We use previously implemented functionality and we fix one of the parameters to create a new function. This is also known as [partially applying](https://en.wikipedia.org/wiki/Partial_application) a function, simple like that. Given the original function, we limit its expressiveness by tying some of its parameters. For example, take the `*` operator (multiplication): initially, its image (the set of possible outcomes) includes all the integers, but when we partially apply it, by tying the first argument to 2 (\*2), we reduce the function’s expressiveness by limiting its image to even numbers.

So that’s partial application. On a formal way, partially applying a function to X arguments is the process of transforming a N-arity function into a (N-X)-arity one by means of tying X arguments to values.

## Currying vs. Partial Application

Even though the general idea – and even the semi-formal definitions – might seem closely related, keep in mind that unlike currying, partial application does change the function expressiveness and its meaning. Another way of seeing this is to look at both as a function, where currying would be *Curry*(f) and partial application would be *PA*(f, x…xn). Currying only takes a function as input and returns another function, whilst partial application takes a function and N (N > 0) parameters.

Also, remember the definitions previously introduced: currying is the process of transforming a function of N-arity into N functions of 1-arity. Partial application is the process of taking a N-arity function, **X parameters** and transforming it into a (N-X)-arity function. Now, let’s take a look on how these concepts are introduced in functional languages and why we mixed them up so easily.

## Currying and Partial Application in Functional Languages

Even though we can manually curry a Python function (just like we did earlier), Python doesn’t support currying by default, which means that the following code doesn’t run, where `mult_pow` is the function we defined on the first section.

```python
print(mult_pow(2))
>> TypeError: mult_pow() takes exactly 3 arguments (1 given)
```

That might seem logical for a Python (Or C, C++, Java…) programmer, but it makes currying – something that as we’re going to see, is extremely powerful – a manual, programmer-dependent task.

The twist is that – unlike in imperative languages – in most functional languages, **functions are curried by default**. This might go by as a simple detail, but it has big consequences, as we’re going to see later. In [Haskell](https://www.haskell.org/) or [Clean](http://clean.cs.ru.nl/Clean), every function is curried by default. There’s no way of escaping out of it. As a consequence, every function that takes N arguments (where N > 0) is actually a function that takes one argument and returns a function that takes N-1 arguments, just like we did on our first Python currying example (`mult_pow_c`). In addition, we get that for free: there is no need for any special implementation, syntax or annotation. That, aligned with [higher-order functions](http://learnyouahaskell.com/higher-order-functions) gives us a great toolset to play with functions.

Partial application in such languages becomes so easy **because** of default currying. As we saw in the Python examples, partially applying a function isn’t as trivial as in a functional language.

Take the following Haskell example in consideration (if you’re not used to Haskell, don’t stop here, I won’t use it too much). We define the function `multPow` that takes 3 integers as arguments and returns an integer. Remember that since Haskell functions are curried by default, `multPow` also is a function that takes an integer as parameter and returns another function that takes 2 integers as parameter.

To prove that, we use GHCi (GHC’s interactive environment), to partially apply `multPow` to the parameter 2 by doing `pMultPow = multPow 2`*.* Due to currying and partial application, `pMultPow` is a function that takes 2 integers as parameter and returns another one. You don’t believe me? Ask GHCi to give you some information about `pMultPow` by typing `:i pMultPow` and it will tell you exactly what we expected.

```haskell
multPow :: Int -> Int -> Int -> Int
multPow x y z = x ^ y * z
 
-- In GHCi:
> pMultPow = multPow 2
> pMultPow 3 4
32
> :i pMultPow
pMultPow :: Int -> Int -> Int
```

One interesting fact is that you can notice that from the function’s type annotation itself. We’re used to read Haskell function type signatures in a non-curried manner. For example, we’d read `multPow`'s type signature as “it takes 3 integers and return an integer”, but we might as well read it as “it takes one integer and returns a function that takes 2 integers and returns an integer”. Both are equivalent in a language that is curried by default.

## The Confusion

As we saw, partial application really shines in languages that have functions curried by default because there’s no extra step necessary to define curried function as in most imperative languages. That’s exactly why we easily mix up those concepts: we don’t see the currying, it’s done automatically. So every time someone tries to give an example of currying in a functional language, they fail to point exactly what it represents without using partial application, and the confusion is born. We can avoid that by explaining both concepts using a non-functional language and then bring the discussion back to the shiny, fancy functional world. It’s also why I chose to start this article with Python instead of Clean or Haskell.

## Why is it so important?

The triad of higher-order functions, currying and partial application provides powerful benefits including expressiveness, higher level of abstraction and scalability, but there are two aspects that I want to focus: reusability and modularity.

With higher order functions, functions can be returned and passed as parameters, so you don’t need to overload a method, creating 10 different instances of it that are almost equal, except for one function call. Instead, make only one instance of that (previously overloaded) function that takes a function as parameter and every time you call it, pass the desired function.

With default currying, partially applying a function is trivial, which stops you from creating many wrapper functions just to fix some of the arguments. Let’s take the famous `map` as an example of how these concepts increase modularity and reusability. In Clean, `map` can be defined as in the code below. `Start` is Clean’s equivalent to C’s `main` and function type signatures use the arrow only before the output type (not in between inputs as in Haskell).

```haskell
map :: (a -> b) [a] -> [b]
map _ [] = []
map f [x:xs] = [f x: map f xs]
 
double :: Int -> Int
double x = x * 2
 
Start = map double [1,2,3,4,5]
> [2,4,6,8,10]
Start = map ((*)2) [1,2,3,4,5]
> [2,4,6,8,10]
```

As we can see – by the `(a -> b)` – `map` is a higher-order function: it takes one function as input. It’s also polymorphic, given that it operates on lists of any type (`a` and `b` here are type variables). So, as expected, it maps a function over a list, element by element. In addition, we define the `double` function which… well, doubles a number. After mapping `double` over a list, we get a list in which all of its elements are the double of the original elements. Notice that we don’t limit the types `a` and `b` by any means. Given that, every time I need to apply a function over a list, I use `map`. Due to its high-order nature, I don’t need to worry about the list type as long as I provide a fit function as argument. That means that I don’t need to write 10 versions of overloaded `map`s, one for each kind I need, and even for different functions to map over! Imagine creating versions of map in C for ints and doubles, for doubling, squaring, dividing by 2 and many other possible operations. In a functional language, that’s not necessary.

Finally, let’s take a look on the second `map` example above. Instead of defining a new function just to multiply an element by two, I can take advantage of Clean’s default currying and partially apply – on the spot – the `*` operator on the argument 2, which would give me a new function that takes one integer as input and return an integer – exactly what I need to use `map`, and exactly what `double` is.

This is a small and naive example to illustrate one of the biggest advantages of pure functional programming. Since function outputs only depend on its inputs (and nothing else!), and since we have higher-order functions with default currying and partial application, functions are little building blocks. You can just plug them, pass them around, partially apply them, run them over a list and all. That allows a level of reusability and modularity that simply isn’t possible (and won’t ever be) in imperative languages. Functions like `map` and `foldr` are reused on a daily bases by functional programmers, along with many functions they’re written themselves. Reusing functions is the bread and butter of a functional programmer. Every time you see yourself writing code that somehow resembles some code you’ve written, you think “how can I generalize this and then specialize it when I need to so I don’t need to write many slightly different versions of the same code?”

## Conclusion

Even though currying and partial application are concepts that are related, they are not the same thing. Currying is a process of transforming a function into an equivalent one and partial application involves fixing a function to one of its arguments. Partial application really shines on functional languages where functions are curried by default, and that might be the reason why functional programmers get those concepts mixed up so easily. Allied with higher-order functions, these concepts increase modularity and reusability in an extraordinary way, and that’s one of the aspects where functional programming shines the most.

If you have any comments, suggestions, corrections (especially corrections), please fell free to leave a comments below.

## Sources

- [Functional Programming For The Rest Of Us](http://www.defmacro.org/2006/06/19/fp)  
- [What is the difference between currying and partial application?](https://stackoverflow.com/questions/218025/what-is-the-difference-between-currying-and-partial-application)  
- [Currying and Partial Application](https://www.schoolofhaskell.com/user/EFulmer/currying-and-partial-application)  
- [Learn You a Haskell for Great Good!: Higher order functions](http://learnyouahaskell.com/higher-order-functions)