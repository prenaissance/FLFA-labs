export type RegularProduction = {
  from: string;
  to: string[];
};
export interface RegularGrammar {
  readonly start: string;
  readonly productions: ReadonlyArray<RegularProduction>;
  readonly nonTerminal: ReadonlyArray<string>;
  readonly terminal: ReadonlyArray<string>;
}

export function createRegularGrammar(
  start: string,
  productions: ReadonlyArray<RegularProduction>,
  nonTerminal: ReadonlyArray<string>,
  terminal: ReadonlyArray<string>,
): RegularGrammar {
  return {
    start,
    productions,
    nonTerminal,
    terminal,
  };
}
