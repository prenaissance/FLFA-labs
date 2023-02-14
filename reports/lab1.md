# Intro to formal languages. Regular grammars. Finite Automata.

### Course: Formal Languages & Finite Automata

### Author: Andrieș Alexandru

---

## Theory

### Regular expressions

Regular expressions are a subset of formal languages, the most restrictive and the simplest from the Chomsky hierarchy. They are used to describe a language, and are used to describe the language of a finite automaton. The grammar of a regular expression is the following:

- Non-terminals
- Terminals
- Start symbol
- Production rules

And such a definition has a one to one correspondence with a finite automaton.
Although it would have been simpler, in my opinion, to use the finite automaton for parsing, I chose the regular expression grammar in this laboratory work.

## Objectives:

1. Understand what a language is and what it needs to have in order to be considered a formal one.

2. Provide the initial setup for the evolving project that you will work on during this semester. I said project because usually at lab works, I encourage/impose students to treat all the labs like stages of development of a whole project. Basically you need to do the following:

   a. Create a local && remote repository of a VCS hosting service (let us all use Github to avoid unnecessary headaches);

   b. Choose a programming language, and my suggestion would be to choose one that supports all the main paradigms;

   c. Create a separate folder where you will be keeping the report. This semester I wish I won't see reports alongside source code files, fingers crossed;

3. According to your variant number (by universal convention it is register ID), get the grammar definition and do the following tasks:

   a. Implement a type/class for your grammar;

   b. Add one function that would generate 5 valid strings from the language expressed by your given grammar;

   c. Implement some functionality that would convert and object of type Grammar to one of type Finite Automaton;

   d. For the Finite Automaton, please add a method that checks if an input string can be obtained via the state transition from it;

## Implementation description

### Setup

This project is written in TypeScript and uses Vitest for testing. It has a github actions CI pipeline to run the tests, so the verification of the code is automated without having to clone the repository. All tests will be placed in the `./tests` folder and the specs are grouped by the laboratory for simplicity.

### Grammar

The grammar is defined as a type and is used to construct a "parser". Nothing much to it.

```ts
// src/grammar/index.ts
export type Production<VocabularyT> = {
  from: VocabularyT;
  to: VocabularyT[];
};

export interface Grammar<VocabularyT> {
  readonly start: VocabularyT;
  readonly productions: ReadonlyArray<Production<VocabularyT>>;
  readonly nonTerminal: ReadonlyArray<VocabularyT>;
  readonly terminal: ReadonlyArray<VocabularyT>;
}
```

### Finite Automaton / "Parser"

The `LanguageParser` class is constructed from a `Grammar` and is used to verify the validity and generate sentences of the language defined by the grammar. It's not an actual parser, as it doesn't output anything as of lab 1.

It has 2 recursive methods for generating sentences and verifying the validity of a sentence.

```ts
// src/parser/language-parser.ts
import { Grammar } from "@/grammar";
import { choice } from "@/common/utilities";
import { ParsingError } from "./errors";
import { createInput, Input } from "./input";

export class LanguageParser<VocabularyT> {
  constructor(private readonly _grammar: Grammar<VocabularyT>) {}

  isValid(
    input: Input<VocabularyT[]>,
    currentState: VocabularyT = this._grammar.start,
  ): boolean {
    const { productions, terminal } = this._grammar;
    if (input.index === input.input.length) {
      return terminal.includes(currentState);
    }

    const nextChar = input.input[input.index];
    const production = productions
      .filter((production) => production.from === currentState)
      .find((production) => production.to[0] === nextChar);

    if (!production) {
      return false;
    }

    const nextInput = createInput(input.input, input.index + 1);
    return this.isValid(nextInput, production.to.at(-1));
  }

  generateSentence(
    existing: VocabularyT[] = [this._grammar.start],
  ): VocabularyT[] {
    const { productions, terminal } = this._grammar;
    const head = existing.at(-1)!;
    if (terminal.includes(head)) {
      return existing;
    }

    const outcomes = productions
      .filter((production) => production.from === head)
      .map((production) => production.to);

    if (!outcomes.length) {
      throw new ParsingError("Cannot reach an end state", existing.length - 1);
    }

    return this.generateSentence([
      ...existing.slice(0, -1),
      ...choice(outcomes),
    ]);
  }
}
```

It passes all tests, but in the future it would be good to change it to a non-recursive implementation (and with a tokenized output, obviously).

## Conclusions / Screenshots / Results

In this laboratory work I implemented a simple grammar parser that can generate sentences and verify the validity of a sentence. By implementing the grammar parser, I learned to work with recursive parsing and finite automata. I also learned how to use the Vitest framework for testing, which was not part of the objectives. The unit tests cover all the objectives, some of their names being:

- should mark invalid sentences that do not reach the end of the automaton
- should validate %s as a valid sentence
- should generate sentences that pass validation (100 times instead of the required 5)

The topics from the coursework that I found useful for this laboratory work were:

- Regular grammars
- Deterministic finite automata

## References

1. Course material
