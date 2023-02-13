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

export function createGrammar<VocabularyT>(
  start: VocabularyT,
  productions: ReadonlyArray<Production<VocabularyT>>,
  nonTerminal: ReadonlyArray<VocabularyT>,
  terminal: ReadonlyArray<VocabularyT>,
): Grammar<VocabularyT> {
  return {
    start,
    productions,
    nonTerminal,
    terminal,
  };
}
