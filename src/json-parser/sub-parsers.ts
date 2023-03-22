import * as RA from "fp-ts/ReadonlyArray";
import * as P from "../parser";
import { pipe } from "fp-ts/function";

export const number = pipe(
  P.sequence(
    P.optional(P.char("-")),
    P.oneOf(P.char("0"), P.many1(P.digit)),
    P.optional(P.sequence(P.char("."), P.many1(P.digit))),
    P.optional(
      P.sequence(
        P.oneOf(P.char("e"), P.char("E")),
        P.optional(P.oneOf(P.char("+"), P.char("-"))),
        P.many1(P.digit),
      ),
    ),
  ),
  P.map((arr) => arr.flat(3).join("")),
  P.map((s) => Number(s)),
);

export const str = pipe(
  P.between(P.char('"'), P.char('"'))(P.many(P.except(P.char('"'))(P.anyChar))),
  P.map((arr) => arr.join("")),
);

export const bool = pipe(
  P.oneOf(P.str("true"), P.str("false")),
  P.map((s) => s === "true"),
);

export const null_ = pipe(
  P.str("null"),
  P.map(() => null),
);

export const json = P.lazy(() =>
  P.oneOf(number, str, bool, null_, array, object),
);
type JsonType =
  | number
  | string
  | boolean
  | null
  | JsonType[]
  | Record<string, any>;

export const array: P.Parser<JsonType[]> = pipe(
  json,
  P.sepBy(P.withSpacing(P.char(","))),
  P.between(P.char("["), P.char("]")),
);

export const object: P.Parser<Record<string, JsonType>> = pipe(
  P.sequence(str, P.withSpacing(P.char(":")), json),
  P.sepBy(P.withSpacing(P.char(","))),
  P.between(P.char("{"), P.char("}")),
  P.map(RA.map(([k, _, v]) => [k, v] as const)),
  P.map(Object.fromEntries),
);
