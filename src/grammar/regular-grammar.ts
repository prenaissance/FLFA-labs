export type RegularProduction<VocabularyT> = {
  from: VocabularyT;
  to: VocabularyT[];
};
export interface RegularGrammar<VocabularyT> {
  readonly start: VocabularyT;
  readonly productions: ReadonlyArray<RegularProduction<VocabularyT>>;
  readonly nonTerminal: ReadonlyArray<VocabularyT>;
  readonly terminal: ReadonlyArray<VocabularyT>;
}

export function createRegularGrammar<VocabularyT>(
  start: VocabularyT,
  productions: ReadonlyArray<RegularProduction<VocabularyT>>,
  nonTerminal: ReadonlyArray<VocabularyT>,
  terminal: ReadonlyArray<VocabularyT>,
): RegularGrammar<VocabularyT> {
  return {
    start,
    productions,
    nonTerminal,
    terminal,
  };
}
