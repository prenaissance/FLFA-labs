# Topic: Lexer & Scanner

### Course: Formal Languages & Finite Automata

### Author: Andrieș Alexandru

---

## Theory

Lexing, also known as lexical analysis, is the process of breaking down a stream of input characters into meaningful tokens or symbols that can be further processed by a parser.

Unless a grammar is normalized in some way, which is a cumbersome process, the act of lexing comes with unavoidable ambiguity.
For example, the following grammar:

```ebnf
S -> a S b | a b
```

A strategy to lex when ambiguity is present is to use a strategy for solving the successful case, and the strategies are backtracking and lookahead. With backtracking, the lexer will try to match the longest path first, and come back to the point of ambiguity if it fails to try the other paths. With lookahead, the lexer will look ahead into the input, as many characters until the path is unambiguous, and then match the longest path. I chose the lookahead strategy, just because I like it more.

### Monadic parsing

<p align="center">
  <img alt="CATegories" src="https://typelevel.org/cats/img/cats2.png">
</p>

Monadic parsing, also known as parser combinator, is a way of parsing text by composing parsers. The parser itself corresponds to the infamous type class [Monad](<https://en.wikipedia.org/wiki/Monad_(functional_programming)>) and its parse operation can either succeed or fail. These basic functions make possible to compose parsers in a modular way and chain them together to create more complex parsers. Monadic parsers can parse right-recursive context-sensitive grammars and have an LL(k) parsing complexity.

## Objectives:

1. Understand what lexical analysis is.
2. Get familiar with the inner workings of a lexer/scanner/tokenizer.
3. Implement a sample lexer and show how it works.

## Implementation description

### Setup

This project is written in TypeScript and uses Vitest for testing. It has a github actions CI pipeline to run the tests, so the verification of the code is automated without having to clone the repository. Since the last laboratory work, I added code coverage reporting with [Codecov](https://codecov.io/gh/prenaissance/FLFA-labs):

[![codecov](https://codecov.io/gh/prenaissance/FLFA-labs/branch/master/graph/badge.svg?token=GDMDMQ0LAC)](https://codecov.io/gh/prenaissance/FLFA-labs)

I added the [fp-ts](https://gcanti.github.io/fp-ts/) library starting with this laboratory work. It has no implementation of parsing, but it has implementations of functions to work with type classes in typescript.

### Topic

I chose to implement a lexer (and also a parser) for JSON, which is the most used data interchange format for web applications. The specification for JSON can be found [here](https://www.json.org/json-en.html). The string escape characters probably work, other than that it fully supports the specification. Disclaimer - I will implement the lexer with parsers.

To make the laboratory work a bit harder I decided not to use the power of RegEx, but to implement these needs with parser combinators.

### Inner "library"

Starting with the input, since we won't parse imperatively and hold any mutable state, the pointer to the current character that needs to be analyzed will be encapsulated in an immutable struct of the following form:

```ts
// src/parser/input.ts
export interface Input {
  readonly text: string;
  readonly index: number;
}

export const of = (text: string, index = 0): Input => ({
  text,
  index,
});

export const next = flow(
  O.fromPredicate((input: Input) => input.index < input.text.length),
  O.map(({ text, index }) => [text[index], of(text, index + 1)] as const),
);
```

The advancing operation can fail, so it's wrapped in an `Option` type class.

The parser type definition is not very complex - it's a function taking an `Input` and returning a processed output that can fail:

```ts
// src/parser/parser.ts
export type ParserSuccess<A> = {
  value: A;
  nextInput: I.Input;
};

export type ParserError = {
  input: I.Input;
  expected: string[];
};

export type ParserResult<A> = E.Either<ParserError, ParserSuccess<A>>;

export type Parser<A> = (input: I.Input) => ParserResult<A>;
```

and to make the parser actually _Monadic_, I added these functions:

```ts
// src/parser/parser.ts
export const map =
  <A, B>(f: (a: A) => B) =>
  (parser: Parser<A>) =>
    flow(parser, mapResult(f)) as Parser<B>;

export const chain =
  <A, B>(f: (a: A) => Parser<B>) =>
  (parser: Parser<A>) =>
    flow(
      parser,
      E.chain(({ value, nextInput }) => f(value)(nextInput)),
    );
```

The `map` function is used to transform the output of a parser, and the `chain` function is used to chain parsers together. The `chain` function is the most important one, because it allows us to compose parsers in a modular way.

To actually do something with parser combinators, a basic set of parsers is needed. Here is the most basic parser, one that is able to match a single character:

```ts
// src/parser/primitives.ts
export const char = (c: string) => (input: I.Input) =>
  pipe(
    I.next(input),
    O.chain(O.fromPredicate(([chr]) => chr === c)),
    E.fromOption<ParserError>(() => ({ input, expected: [c] })),
    E.map(([chr, nextInput]) => ({ value: chr, nextInput })),
  ) as ParserResult<string>;
```

Believe it or not, these are the construct on which the rest of the parsing is built upon. I will skip some of the upcoming implementations and show the signatures/ uses only.

### Combinators

Well, a character is not very helpful! It would be useful if at least one of two characters could be matched, or a few characters in a row. Let's upgrade the parser capabilities to match the [Alternative](https://gcanti.github.io/fp-ts/modules/Alternative.ts.html) type class:

```ts
// src/parser/combinators.ts
const firstParserResultSemigroup = <A>() =>
  E.getSemigroup<ParserError, ParserSuccess<A>>(S.first());
export const alt: <A1>(
  p1: Parser<A1>,
) => <A2>(p2: Parser<A2>) => Parser<A1 | A2> =
  <A1>(p1: Parser<A1>) =>
  <A2>(p2: Parser<A2>) =>
  (input: I.Input) =>
    firstParserResultSemigroup<A1 | A2>().concat(p2(input), p1(input));
```

now the parser can get an alternative choice if the first one fails, example:

```ts
const parser = alt(char("a"))(char("b"));
```

such a parser will first try to match "b" and then try the alternative. No if checks to be seen, just 5 composed functions or something like that.

I extended the `alt` function to work with any number of parsers, trying to match them in order

```ts
// src/parser/combinators.ts
export function oneOf<A>(...parsers: Parser<A>[]): Parser<A> {
  return (input: I.Input) =>
    pipe(
      parsers,
      RA.fromArray,
      RA.map((parser) => parser(input)),
      S.concatAll<ParserResult<A>>(E.getSemigroup(S.first()))(absurd(input)),
    );
}
```

Getting a parser to match a sequence of parsers is a bit more complicated, here's how the combinator looks like. It's a bit convoluted, but treat it as a black box that converts an array of parsers into a parser that returns an array of results. (This, by the way, upgrades again the parser with the possibilities of a **Foldable**!)

```ts
// src/parser/combinators.ts
export function sequence<A>(...parsers: Parser<A>[]): Parser<A[]> {
  return (input: I.Input) =>
    pipe(
      parsers,
      RA.fromArray,
      RA.reduce(success<A[]>([])(input), (acc, parser) =>
        pipe(
          acc,
          E.chain((acc) =>
            pipe(
              parser(acc.nextInput),
              E.map((success) => ({
                value: [...acc.value, success.value],
                nextInput: success.nextInput,
              })),
            ),
          ),
        ),
      ),
      E.mapLeft(() => ({
        input,
        expected: ["sequence"],
      })),
    );
}
```

Now, making a parser for a sequence of characters, aka a string, is trivial:

```ts
// src/parser/primitives.ts
export const str = (s: string) =>
  pipe(
    s.split(""),
    RA.map(char),
    (arr) => sequence(...arr),
    map(RA.reduce("", (acc, curr) => acc + curr)),
  );
```

And with that, parsing some primitives can be done:

```ts
// src/json-parser/sub-parsers.ts
export const bool = pipe(
  P.oneOf(P.str("true"), P.str("false")),
  P.map((s) => s === "true"),
);

export const null_ = pipe(
  P.str("null"),
  P.map(() => null),
);
```

That was easy enough. As I said, I'll omit the implementation of some parser combinators, but let's try to make a parser that will match the json specification of a number:

<p align="center">
  <img alt="json number grammar" width="60%" src="https://i.stack.imgur.com/wmFqa.gif"/>
</p>

```ts
// src/json-parser/sub-parsers.ts
export const number = pipe(
  P.sequence(
    P.optional(P.char("-")),
    P.oneOf(P.char("0"), P.many1(P.digit)),
    P.optional(P.sequence(P.char("."), P.many1(P.digit))),
    P.optional(
      P.sequence(
        P.oneOf(P.char("e"), P.char("E")),
        P.optional(P.oneOf(P.char("+"), P.char("-"))),
        P.many1(P.digit),
      ),
    ),
  ),
  P.map((arr) => arr.flat(3).join("")),
  P.map((s) => Number(s)),
);
```

Without using regular expressions, it would probably be a pain to write the equivalent of the above parser. And since monadic parsers are so declarative, the code can be read as a specification of the grammar.

The rest of the steps to make a full json parser require some recursive parsing, which is surprisingly also easy to write. There's the rest of the code:

```ts
// src/json-parser/sub-parsers.ts
type JsonType =
  | number
  | string
  | boolean
  | null
  | JsonType[]
  | Record<string, any>;

export const array: P.Parser<JsonType[]> = pipe(
  json,
  P.sepBy(P.withSpacing(P.char(","))),
  P.between(P.char("["), P.char("]")),
);

export const object: P.Parser<Record<string, JsonType>> = pipe(
  P.sequence(str, P.withSpacing(P.char(":")), json),
  P.sepBy(P.withSpacing(P.char(","))),
  P.between(P.char("{"), P.char("}")),
  P.map(RA.map(([k, _, v]) => [k, v] as const)),
  P.map(Object.fromEntries),
);

export const json = P.lazy(() =>
  P.oneOf(number, str, bool, null_, array, object),
);
```

That's it. The final parser complies to the JSON specification and it's a scanner-less parser. Notice that nowhere in the process were tokens created, primitive parsers are the substitute for tokens. This, however, does not meet the objectives of the laboratories, so some the primitives defined above will be reused to make a redundant lexer.

### Lexer implementation

As stated, the lexemes are the outputs of the primitives parsers defined above. The lexer will map the lexemes into a bit more meaningful form.

```ts
// src/json-parser/lexer.ts
const lexNumber = pipe(
  number,
  P.map((n) => ({ type: "number", value: n } as const)),
);

const lexStr = pipe(
  str,
  P.map((s) => ({ type: "string", value: s } as const)),
);

const lexNull = pipe(
  null_,
  P.map(() => ({ type: "null", value: null } as const)),
);

const lexBool = pipe(
  bool,
  P.map((b) => ({ type: "boolean", value: b } as const)),
);

const lexLiteral = P.oneOf(lexNumber, lexStr, lexNull, lexBool);
```

These are the literals, but there are also the separators and the brackets. These are easy to implement with the `char` parser:

```ts
// src/json-parser/lexer.ts
const lexOpenArray = pipe(
  P.char("["),
  P.map(() => ({ type: "open-array" } as const)),
);

const lexCloseArray = pipe(
  P.char("]"),
  P.map(() => ({ type: "close-array" } as const)),
);

const lexOpenObject = pipe(
  P.char("{"),
  P.map(() => ({ type: "open-object" } as const)),
);

const lexCloseObject = pipe(
  P.char("}"),
  P.map(() => ({ type: "close-object" } as const)),
);

const lexComma = pipe(
  P.char(","),
  P.map(() => ({ type: "comma" } as const)),
);

const lexColon = pipe(
  P.char(":"),
  P.map(() => ({ type: "colon" } as const)),
);

const lexSymbol = P.oneOf(
  lexOpenArray,
  lexCloseArray,
  lexOpenObject,
  lexCloseObject,
  lexComma,
  lexColon,
);
```

These are the parsers for all the needed tokens. The lexer will scan the input for these tokens until it reaches the end of the input, ignoring spaces between lexemes:

```ts
// src/json-parser/lexer.ts
export const lex = pipe(P.oneOf(lexLiteral, lexSymbol), P.withSpacing, P.many);
```

The fixtures for testing the lexer are located in `fixtures/lab3-tokens`. Here is an example of the lexer results:

Input: `'[1, "hello", [true, false]]'`

Output:

```json
[
  { "type": "open-array" },
  { "type": "number", "value": 1 },
  { "type": "comma" },
  { "type": "string", "value": "hello" },
  { "type": "comma" },
  { "type": "open-array" },
  { "type": "boolean", "value": true },
  { "type": "comma" },
  { "type": "boolean", "value": false },
  { "type": "close-array" },
  { "type": "close-array" }
]
```

## References

1. (Fantasy Land)[https://github.com/fantasyland/fantasy-land] - A specification for interoperability of common algebraic structures in JavaScript.
2. (Cookielab article)[https://www.cookielab.io/blog/how-to-write-your-own-json-parser-using-functional-typescript-fp-ts-part-i] - unfinished article that inspired me to do this.
3. (dev.to)[https://dev.to/gcanti/getting-started-with-fp-ts-setoid-39f3] - series of articles on algebraic structures in fp-ts.
4. (youtube playlist)(https://www.youtube.com/watch?v=6oQLRhw5Ah0&list=PLP29wDx6QmW5yfO1LAgO8kU3aQEj8SIrU) - playlist on parser combinators in javascript
