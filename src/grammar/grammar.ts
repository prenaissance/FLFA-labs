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

    return this.productions.every(({ from, to }) => {
      const isFromNonTerminal =
        from.length === 1 && nonTerminal.includes(from[0]);
      const isToRegularLeftToRight = to
        .slice(0, -1)
        .every((word) => terminal.includes(word));
      const isToRegularRightToLeft = to
        .slice(1)
        .every((word) => terminal.includes(word));

      return (
        isFromNonTerminal && (isToRegularLeftToRight || isToRegularRightToLeft)
      );
    });
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
}
