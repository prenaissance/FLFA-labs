import { console } from "fp-ts";
import { Grammar } from "../grammar";
import { createInput, Input } from "./input";

export class LanguageParser<VocabularyT> {
  constructor(private readonly _grammar: Grammar<VocabularyT>) {}

  isValid(
    input: Input<VocabularyT[]>,
    currentState: VocabularyT = this._grammar.start,
  ): boolean {
    const { productions, terminal } = this._grammar;
    console.log({ input, currentState });
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
}
