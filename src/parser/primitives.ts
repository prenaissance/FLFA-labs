import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as I from "./input";
import { ParserError, ParserResult } from "./parser";

export const char = (c: string) => (input: I.Input) =>
  pipe(
    I.next(input),
    O.chain(O.fromPredicate(([chr]) => chr === c)),
    E.fromOption<ParserError>(() => ({ input, expected: [c] })),
    E.map(([chr, nextInput]) => ({ value: chr, nextInput })),
  ) as ParserResult<string>;
