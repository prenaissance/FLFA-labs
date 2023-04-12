import { areArraysEqual, combinationsWithout } from "./utilities";

export type Production = {
  from: string[];
  to: string[];
};

export const getUniqueProductions = (productions: Production[]) => [
  ...productions
    .reduce((map, production) => {
      const key = `${production.from.join("")} -> ${production.to.join("")}`;
      if (map.has(key)) {
        return map;
      }
      return map.set(key, production);
    }, new Map<string, Production>())
    .values(),
];

export class Grammar {
  constructor(
    readonly start: string,
    readonly productions: Production[],
    readonly nonTerminal: string[],
    readonly terminal: string[],
  ) {}

  clone(): Grammar {
    const { start, productions, nonTerminal, terminal } = this;
    return new Grammar(
      start,
      productions.map((p) => ({ ...p })),
      [...nonTerminal],
      [...terminal],
    );
  }

  getClassification():
    | "regular"
    | "context-free"
    | "context-sensitive"
    | "recursive" {
    if (this.isRegular()) {
      return "regular";
    }
    if (this.isContextFree()) {
      return "context-free";
    }
    if (this.isContextSensitive()) {
      return "context-sensitive";
    }

    return "recursive";
  }

  private isRegular(): boolean {
    const { nonTerminal, terminal } = this;

    const isRegularLeftToRight = this.productions.every(({ from, to }) => {
      const isFromNonTerminal =
        from.length === 1 && nonTerminal.includes(from[0]);
      const isToRegularLeftToRight = to
        .slice(0, -1)
        .every((word) => terminal.includes(word));

      return isFromNonTerminal && isToRegularLeftToRight;
    });

    const isRegularRightToLeft = this.productions.every(({ from, to }) => {
      const isFromNonTerminal =
        from.length === 1 && nonTerminal.includes(from[0]);
      const isToRegularRightToLeft = to
        .slice(1)
        .every((word) => terminal.includes(word));

      return isFromNonTerminal && isToRegularRightToLeft;
    });

    return isRegularLeftToRight || isRegularRightToLeft;
  }

  private isContextFree(): boolean {
    return this.productions.every(
      ({ from }) =>
        from.length === 1 &&
        from.every((word) => this.nonTerminal.includes(word)),
    );
  }

  private isContextSensitive(): boolean {
    const { nonTerminal } = this;
    return this.productions
      .flatMap(({ from }) => from)
      .every((word) => nonTerminal.includes(word));
  }

  withoutRighthandStart(): Grammar {
    const { start, productions, nonTerminal, terminal } = this;

    const hasRighthandStart = productions.some(({ to }) => to.includes(start));

    return hasRighthandStart
      ? new Grammar(
          `${start}'`,
          [
            ...productions,
            {
              from: [`${start}`],
              to: [start],
            },
          ],
          [...nonTerminal, `${start}'`],
          terminal,
        )
      : this.clone();
  }

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
}
