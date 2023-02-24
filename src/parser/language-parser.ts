import { RegularGrammar } from "@/grammar/regular-grammar";
import { choice } from "@/common/utilities";
import { ParsingError } from "./errors";
import { createInput, Input } from "./input";

export class LanguageParser {
  constructor(private readonly _grammar: RegularGrammar) {}

  isValid(input: Input, currentState = this._grammar.start): boolean {
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

  generateSentence(existing: string[] = [this._grammar.start]): string[] {
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
