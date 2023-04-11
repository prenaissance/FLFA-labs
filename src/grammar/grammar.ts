import { combinationsWithout } from "./utilities";

export type Production = {
  from: string[];
  to: string[];
};

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
    // context free grammars (CNF reducible) won't have >= 1 left side symbols
    // so I'll only replace the first symbol in the right side for one null production
    // and recurse
    const combinationsWithoutNullElement = combinationsWithout(
      nullProduction.from[0],
    );
    const newProductions = productions
      .filter((p) => p !== nullProduction)
      .flatMap(({ from, to }) =>
        combinationsWithoutNullElement(to).map((to) => ({ from, to })),
      );

    return new Grammar(
      start,
      newProductions,
      nonTerminal,
      terminal,
    ).withoutNullProductions();
  }
}
