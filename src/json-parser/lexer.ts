import { pipe } from "fp-ts/function";
import { bool, null_, number, str } from "./sub-parsers";
import * as P from "../parser";

const lexNumber = pipe(
  number,
  P.map((n) => ({ type: "number", value: n } as const)),
);

const lexStr = pipe(
  str,
  P.map((s) => ({ type: "string", value: s } as const)),
);

const lexNull = pipe(
  null_,
  P.map(() => ({ type: "null", value: null } as const)),
);

const lexBool = pipe(
  bool,
  P.map((b) => ({ type: "boolean", value: b } as const)),
);

const lexLiteral = P.oneOf(lexNumber, lexStr, lexNull, lexBool);

const lexOpenArray = pipe(
  P.char("["),
  P.map(() => ({ type: "open-array" } as const)),
);

const lexCloseArray = pipe(
  P.char("]"),
  P.map(() => ({ type: "close-array" } as const)),
);

const lexOpenObject = pipe(
  P.char("{"),
  P.map(() => ({ type: "open-object" } as const)),
);

const lexCloseObject = pipe(
  P.char("}"),
  P.map(() => ({ type: "close-object" } as const)),
);

const lexComma = pipe(
  P.char(","),
  P.map(() => ({ type: "comma" } as const)),
);

const lexColon = pipe(
  P.char(":"),
  P.map(() => ({ type: "colon" } as const)),
);

const lexSymbol = P.oneOf(
  lexOpenArray,
  lexCloseArray,
  lexOpenObject,
  lexCloseObject,
  lexComma,
  lexColon,
);

export const lex = pipe(P.oneOf(lexLiteral, lexSymbol), P.withSpacing, P.many);
