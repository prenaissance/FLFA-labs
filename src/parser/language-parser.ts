import { Grammar } from "../grammar";
import { createInput, Input } from "./input";

export class LanguageParser<VocabularyT> {
  constructor(private readonly _grammar: Grammar<VocabularyT>) {}

  isValid(
    input: Input<VocabularyT[]>,
    currentState: VocabularyT = this._grammar.start,
  ): boolean {
    const { productions, terminal } = this._grammar;
    if (input.index === input.input.length) {
      return (
        terminal.includes(input.input[input.index]) &&
        productions.some(
          (production) =>
            production.from === currentState &&
            production.to[0] === input.input[input.index],
        )
      );
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
}
