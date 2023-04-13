# Topic: Chomsky Normal Form

### Course: Formal Languages & Finite Automata

### Author: Andrieș Alexandru

---

## Theory

### Chomsky Normal Form

A CFG is in Chomsky Normal Form if the Productions are in the following forms −

- A → a
- A → BC
- S → ε (if the language supports the empty string)

The steps to convert a CFG to Chomsky Normal Form are −

Step 1 − If the start symbol S occurs on some right side, create a new start symbol S’ and a new production S’→ S.

Step 2 − Remove Null productions. (Using the Null production removal algorithm discussed earlier)

Step 3 − Remove unit productions. (Using the Unit production removal algorithm discussed earlier)

Step 4 − Replace each production A → B1…Bn where n > 2 with A → B1C where C → B2 …Bn. Repeat this step for all productions having two or more symbols in the right side.

Step 5 − If the right side of any production is in the form A → aB where a is a terminal and A, B are non-terminal, then the production is replaced by A → XB and X → a. Repeat this step for every production which is in the form A → aB.

## Objectives:

1.  Learn about Chomsky Normal Form (CNF).

2.  Get familiar with the approaches of normalizing a grammar.

3.  Implement a method for normalizing an input grammar by the rules of CNF.

    i. The implementation needs to be encapsulated in a method with an appropriate signature (also ideally in an appropriate class/type).

    ii. The implemented functionality needs executed and tested.

    iii. A BONUS point will be given for the student who will have unit tests that validate the functionality of the project.

    iv. Also, another BONUS point would be given if the student will make the aforementioned function to accept any grammar, not only the one from the student's variant.

## Implementation description

### Setup

This project is written in TypeScript and uses Vitest for testing. It has a github actions CI pipeline to run the tests, so the verification of the code is automated without having to clone the repository. All tests will be placed in the `./tests` folder and the specs are grouped by the laboratory for simplicity.

### Implementation

I extended the existing `Grammar` class with methods for simplifying the grammar. These are used for converting a grammar to CNF:

```ts
toChomskyNormalForm(): Grammar {
    return this.withoutNullProductions()
      .withoutUnitProductions()
      .withoutUselessProductions()
      .withoutLongProductions()
      .withoutChainProductions();
  }
```

this will be the only declarative part of the implementation, as the rest of the code is very algorithmic.

Displaying the included methods in order, starting with `withoutNullProductions`:

```ts
withoutNullProductions(): Grammar {
    const { start, productions, nonTerminal, terminal } = this;

    const nullProduction = productions.find(({ to }) => to.length === 0);
    if (nullProduction === undefined) {
      return this.clone();
    }
    const [nullProductionSymbol] = nullProduction.from;
    const nonTerminalProductions = productions.filter(
      (p) => p !== nullProduction,
    );
    const hasAlternateProductions = nonTerminalProductions.some(
      ({ from }) => from[0] === nullProductionSymbol,
    );

    if (!hasAlternateProductions) {
      const newProductions = nonTerminalProductions.map(({ from, to }) => ({
        from,
        to: to.filter((word) => word !== nullProductionSymbol),
      }));

      return new Grammar(
        start,
        newProductions,
        nonTerminal.filter((n) => n !== nullProductionSymbol),
        terminal,
      ).withoutNullProductions();
    }
    // context free grammars (CNF reducible) won't have >= 1 left side symbols
    // so I'll only replace the first symbol in the right side for one null production
    // and recurse
    const combinationsWithoutNullElement = combinationsWithout(
      nullProduction.from[0],
    );
    const newProductions = nonTerminalProductions.flatMap(({ from, to }) =>
      combinationsWithoutNullElement(to).map((to) => ({ from, to })),
    );

    return new Grammar(
      start,
      newProductions,
      nonTerminal,
      terminal,
    ).withoutNullProductions();
  }
```

The first transformation of the grammar is also the hardest. Not only do the null productions need to be removed, that must be done with all the combinations of removal. These combinations are calculated with the following utility function:

```ts
export const combinationsWithout =
  <T>(element: T) =>
  (arr: T[]) => {
    const indices = arr.reduce((acc, curr, i) => {
      if (curr === element) return [...acc, i];
      return acc;
    }, [] as number[]);
    const indicesCombinations = getCombinations(indices);
    const combinations = indicesCombinations.map((indices) => {
      return arr.filter((_, i) => !indices.includes(i));
    });
    // remove duplicates
    return combinations.filter((c, i) => {
      return combinations.findIndex((c2) => areArraysEqual(c, c2)) === i;
    });
  };
```

the implementation of `getCombinations` is not shown here, as that is a trivial task.

The next transformation is `withoutUnitProductions`:

```ts
withoutUnitProductions(): Grammar {
    const { start, productions, nonTerminal, terminal } = this;

    // 'from' length === 1 for context free
    const unitProductions = productions.filter(
      ({ to }) => to.length === 1 && nonTerminal.includes(to[0]),
    );
    if (unitProductions.length === 0) {
      return this.clone();
    }

    // initialize with the non unit productions
    let guf = productions.filter((p) => !unitProductions.includes(p));

    // for each unit production
    unitProductions.forEach(({ from, to }) => {
      const transitiveProductionResults = guf
        .filter(({ from: f }) => areArraysEqual(f, to))
        .map((production) => production.to);

      // for each transitive production result add transitive production to guf
      transitiveProductionResults.forEach((to) => {
        guf.push({ from, to });
      });

      guf = getUniqueProductions(guf);
    });

    return new Grammar(start, guf, nonTerminal, terminal);
  }
```

The second implementation is not recursive. First, the set of productions that result directly in terminals are collected, and then the transitive productions are added to the grammar till there are none left to be found. This removes the unit productions from the grammar.

The next transformation is `withoutUselessProductions`. It is implemented as follows:

```ts
withoutUselessProductions(): Grammar {
    return this.withoutNonGeneratingProductions().withoutUnreachableProductions();
  }
```

The first method in the chain works in a similar way to `withoutUnitProductions`, by collecting the "leaf" nodes of grammar that lead to terminals and then adding the transitive productions to the grammar. The second method is something like tree-shaking, where the productions that do not have a path from `S` can be removed.

The next transformation is `withoutLongProductions`:

```ts
withoutLongProductions(): Grammar {
    const { start, productions, nonTerminal, terminal } = this;
    const firstLongestProduction = productions.reduce(
      (max, prod) => (prod.to.length > max.to.length ? prod : max),
      productions[0],
    );

    if (firstLongestProduction.to.length <= 2) {
      return this.clone();
    }

    const replacementSymbol = getAvailableLetter(nonTerminal);
    const replacedSequence = firstLongestProduction.to.slice(1);
    const newNonTerminal = [...nonTerminal, replacementSymbol];
    const newProductions = [
      {
        from: [replacementSymbol],
        to: replacedSequence,
      },
      ...productions.map(({ from, to }) =>
        areArraysEqual(to.slice(1), replacedSequence)
          ? {
              from,
              to: [to[0], replacementSymbol],
            }
          : { from, to },
      ),
    ];

    return new Grammar(
      start,
      newProductions,
      newNonTerminal,
      terminal,
    ).withoutLongProductions();
  }
```

The first step is to find the longest production. If there are none, the grammar is returned as is. If there are, the first symbol is replaced with a new non-terminal symbol, and the rest of the production is added as a new production. The new production is added to the grammar, and the process is repeated until there are no more long productions.

The utility `getAvailableLetter` is implemented as follows:

```ts
const capitalLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const getAvailableLetter = (
  used: string[],
  letters = capitalLetters,
): string =>
  letters.find((l) => !used.includes(l)) ??
  getAvailableLetter(
    used,
    letters.map((l) => `${l}'`),
  );
```

The last transformation is `withoutChainProductions`:

```ts
withoutChainProductions(): Grammar {
    const { start, productions, nonTerminal, terminal } = this;
    const firstChainProduction = productions.find(
      ({ to }) =>
        to.length === 2 &&
        (nonTerminal.includes(to[0])
          ? !nonTerminal.includes(to[1])
          : nonTerminal.includes(to[1])),
    );

    if (!firstChainProduction) {
      return this.clone();
    }
    const replacedTerminal = firstChainProduction.to.find((word) =>
      terminal.includes(word),
    )!;

    const newNonTerminalSymbol = getAvailableLetter(nonTerminal);
    const newNonTerminal = [...nonTerminal, newNonTerminalSymbol];
    const newProductions = [
      ...productions.map(({ from, to }) =>
        to.includes(replacedTerminal) && to.length === 2
          ? {
              from,
              to: to.map((word) =>
                word === replacedTerminal ? newNonTerminalSymbol : word,
              ),
            }
          : { from, to },
      ),
      {
        from: [newNonTerminalSymbol],
        to: [replacedTerminal],
      },
    ];

    return new Grammar(
      start,
      newProductions,
      newNonTerminal,
      terminal,
    ).withoutChainProductions();
  }
```

The first step is to find the first chain production. If there are none, the grammar is returned as is. If there are, the first terminal symbol is replaced with a new non-terminal symbol, and the rest of the production is added as a new production. The new production is added to the grammar, and the process is repeated until there are no more chain productions.

This method does produce some redundant productions, but the result is CNF compliant.

## Conclusions / Screenshots / Results

### Results

All the functionality except the final `toCNF` method is tested (the last one would be too cumbersome) and the test coverage is almost 100%. The demo of CNF conversion can be seen by running `pnpm i && pnpm run demo:cnf`. I used my variant and variant number 13 to show that the implementation is generic. Here is the output of the demo:

```
Variant 2 (mine) grammar
Start: S
Terminal symbols: a, b
Non-terminal symbols: A, B, C, D, S
Productions:
  A ->
  A -> AS
  A -> B
  A -> aD
  A -> b
  A -> bAAB
  B -> b
  B -> bS
  C -> AB
  D -> BB
  S -> aB
  S -> bA

Variant 2 grammar in CNS
Start: S
Terminal symbols: a, b
Non-terminal symbols: A, B, C, D, E, F, G, H, S
Productions:
  A -> AS
  A -> GB
  A -> GD
  A -> HA
  A -> HB
  A -> HE
  A -> HF
  A -> HS
  A -> b
  B -> HS
  B -> b
  C -> AB
  C -> HS
  C -> b
  D -> BB
  E -> AF
  F -> AB
  G -> a
  H -> b
  S -> GB
  S -> HA
  S -> b

Variant 13 (random number) grammar
Start: S
Terminal symbols: a, b
Non-terminal symbols: A, B, C, D, S
Productions:
  A -> BD
  A -> a
  A -> bDAB
  B -> BA
  B -> b
  C -> BA
  D ->
  D -> BA
  S -> DA
  S -> aB

Variant 13 grammar in CNS
Start: S
Terminal symbols: a, b
Non-terminal symbols: A, B, C, D, E, F, G, S
Productions:
  A -> BA
  A -> BD
  A -> GC
  A -> GE
  A -> a
  A -> b
  B -> BA
  B -> b
  C -> DE
  D -> BA
  E -> AB
  F -> a
  G -> b
  S -> BD
  S -> DA
  S -> FB
  S -> GC
  S -> GE
  S -> a
```

### Conclusion

In this laboratory work I extended the functionality of the implemented grammar to include the conversion to Chomsky Normal Form. The implementation required some different algorithms and was a pleasant moderately low level challenge. While implementing the conversion to CNF, I also learned some of the required steps to CFG minimization, which might be useful in another laboratory work. As for normalization of the grammar to CNF or GNF, I think that the required steps are too much when making the grammar for a programming language, and where performance and reliability are important, it's better to use an existing solution that already normalizes the grammar under the hood.

## References

1. [Wikipedia - CNF](https://en.wikipedia.org/wiki/Chomsky_normal_form)
2. [Tutorialspoint - CNF](https://www.tutorialspoint.com/automata_theory/chomsky_normal_form.htm)
3. [Random useful PDF](https://people.computing.clemson.edu/~goddard/texts/theoryOfComputation/9a.pdf)
