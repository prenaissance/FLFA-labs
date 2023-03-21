import * as E from "fp-ts/Either";
import * as RA from "fp-ts/ReadonlyArray";
import * as S from "fp-ts/Semigroup";
import { flow, pipe } from "fp-ts/function";
import * as I from "./input";
import {
  Parser,
  ParserError,
  ParserResult,
  ParserSuccess,
  absurd,
  chain,
  map,
  success,
} from "./parser";

const firstParserResultSemigroup = <A>() =>
  E.getSemigroup<ParserError, ParserSuccess<A>>(S.first());
export const alt =
  <A1>(p1: Parser<A1>) =>
  <A2>(p2: Parser<A2>) =>
  (input: I.Input) =>
    firstParserResultSemigroup<A1 | A2>().concat(p1(input), p2(input));

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
export function oneOf<A>(...parsers: Parser<A>[]): Parser<A>;
export function oneOf<A>(...parsers: Parser<A>[]): Parser<A> {
  return (input: I.Input) =>
    pipe(
      parsers,
      RA.fromArray,
      RA.map((parser) => parser(input)),
      S.concatAll<ParserResult<A>>(E.getSemigroup(S.first()))(absurd(input)),
    );
}

export function sequence<A1, A2>(
  p1: Parser<A1>,
  p2: Parser<A2>,
): Parser<[A1, A2]>;
export function sequence<A1, A2, A3>(
  p1: Parser<A1>,
  p2: Parser<A2>,
  p3: Parser<A3>,
): Parser<[A1, A2, A3]>;
export function sequence<A1, A2, A3, A4>(
  p1: Parser<A1>,
  p2: Parser<A2>,
  p3: Parser<A3>,
  p4: Parser<A4>,
): Parser<[A1, A2, A3, A4]>;
export function sequence<A1, A2, A3, A4, A5>(
  p1: Parser<A1>,
  p2: Parser<A2>,
  p3: Parser<A3>,
  p4: Parser<A4>,
  p5: Parser<A5>,
): Parser<[A1, A2, A3, A4, A5]>;
export function sequence<A1, A2, A3, A4, A5, A6>(
  p1: Parser<A1>,
  p2: Parser<A2>,
  p3: Parser<A3>,
  p4: Parser<A4>,
  p5: Parser<A5>,
  p6: Parser<A6>,
): Parser<[A1, A2, A3, A4, A5, A6]>;
export function sequence<A>(...parsers: Parser<A>[]): Parser<A[]> {
  return (input: I.Input) =>
    pipe(
      parsers,
      RA.fromArray,
      RA.reduce(success<A[]>([], input), (acc, parser) =>
        pipe(
          acc,
          E.chain((acc) =>
            pipe(
              parser(acc.nextInput),
              E.map((success) => ({
                value: [...acc.value, success.value],
                nextInput: success.nextInput,
              })),
            ),
          ),
        ),
      ),
      E.mapLeft(() => ({
        input,
        expected: ["sequence"],
      })),
    );
}

export const between =
  (open: Parser<any>, close: Parser<any>) =>
  <A>(p: Parser<A>) =>
    flow(
      map<[any, A, any], A>(([_, value, __]) => value)(
        sequence(open, p, close),
      ),
    ) as Parser<A>;

export const many: <A>(p: Parser<A>) => Parser<A[]> =
  <A>(p: Parser<A>) =>
  (input: I.Input) =>
    pipe(
      p(input),
      E.fold(
        () => success([], input),
        (result) =>
          pipe(
            many(p)(result.nextInput),
            E.map((success) => ({
              value: [result.value, ...success.value],
              nextInput: success.nextInput,
            })),
          ),
      ),
    ) as ParserResult<A[]>;

export const many1: <A>(p: Parser<A>) => Parser<A[]> = <A>(p: Parser<A>) =>
  chain<A, A[]>((result) =>
    pipe(
      many(p),
      map((results) => [result, ...results]),
    ),
  )(p);
