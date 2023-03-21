import * as E from "fp-ts/Either";
import * as A from "fp-ts/Array";
import * as S from "fp-ts/Semigroup";
import { pipe } from "fp-ts/function";
import * as I from "./input";
import { Parser, ParserResult } from "./parser";

export function oneOf<A1, A2>(p1: Parser<A1>, p2: Parser<A2>): Parser<A1 | A2>;
export function oneOf<A1, A2, A3>(
  p1: Parser<A1>,
  p2: Parser<A2>,
  p3: Parser<A3>,
): Parser<A1 | A2 | A3>;
export function oneOf<A1, A2, A3, A4>(
  p1: Parser<A1>,
  p2: Parser<A2>,
  p3: Parser<A3>,
  p4: Parser<A4>,
): Parser<A1 | A2 | A3 | A4>;
export function oneOf<A1, A2, A3, A4, A5>(
  p1: Parser<A1>,
  p2: Parser<A2>,
  p3: Parser<A3>,
  p4: Parser<A4>,
  p5: Parser<A5>,
): Parser<A1 | A2 | A3 | A4 | A5>;
export function oneOf<A1, A2, A3, A4, A5, A6>(
  p1: Parser<A1>,
  p2: Parser<A2>,
  p3: Parser<A3>,
  p4: Parser<A4>,
  p5: Parser<A5>,
  p6: Parser<A6>,
): Parser<A1 | A2 | A3 | A4 | A5 | A6>;
export function oneOf<A>(...parsers: Parser<A>[]): Parser<A> {
  return (input: I.Input) =>
    pipe(
      parsers,
      A.map((parser) => parser(input)),
      S.concatAll(E.getSemigroup<ParserResult<A>>(S.first)),
    );
}
