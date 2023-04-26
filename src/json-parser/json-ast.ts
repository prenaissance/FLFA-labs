import { pipe } from "fp-ts/function";
import * as P from "@/parser";
import { number, bool, str, null_ } from "./sub-parsers";

export enum NodeType {
  NumberLiteral = "NumberLiteral",
  StringLiteral = "StringLiteral",
  BooleanLiteral = "BooleanLiteral",
  NullLiteral = "NullLiteral",
  Array = "Array",
  Object = "Object",
  Property = "Property",
}

type BaseNode<NodeT, ValueT> = {
  type: NodeT;
  value: ValueT;
};

type ComposedNode<NodeT, ChildrenT> = {
  type: NodeT;
  children: ChildrenT;
};

type NumberNode = BaseNode<NodeType.NumberLiteral, number>;
type StringNode = BaseNode<NodeType.StringLiteral, string>;
type BooleanNode = BaseNode<NodeType.BooleanLiteral, boolean>;
type NullNode = BaseNode<NodeType.NullLiteral, null>;

type ArrayNode = ComposedNode<NodeType.Array, JsonNode[]>;
type PropertyNode = {
  type: NodeType.Property;
  key: StringNode;
  value: JsonNode;
};
type ObjectNode = ComposedNode<NodeType.Object, PropertyNode[]>;

export type JsonNode =
  | NumberNode
  | StringNode
  | BooleanNode
  | NullNode
  | ArrayNode
  | ObjectNode;

export const numberNode: P.Parser<NumberNode> = pipe(
  number,
  P.withSpacing,
  P.map((value) => ({ type: NodeType.NumberLiteral, value })),
);

export const stringNode: P.Parser<StringNode> = pipe(
  str,
  P.withSpacing,
  P.map((value) => ({ type: NodeType.StringLiteral, value })),
);

export const booleanNode: P.Parser<BooleanNode> = pipe(
  bool,
  P.withSpacing,
  P.map((value) => ({ type: NodeType.BooleanLiteral, value })),
);

export const nullNode: P.Parser<NullNode> = pipe(
  null_,
  P.withSpacing,
  P.map(() => ({ type: NodeType.NullLiteral, value: null })),
);

export const jsonNode = P.lazy(() =>
  P.oneOf(numberNode, stringNode, booleanNode, nullNode, arrayNode, objectNode),
);

export const arrayNode: P.Parser<ArrayNode> = pipe(
  P.sepBy(P.withSpacing(P.char(",")))(jsonNode),
  P.map((children) => ({ type: NodeType.Array as const, children })),
  P.between(P.char("["), P.char("]")),
  P.withSpacing,
);

const propertyNode: P.Parser<PropertyNode> = pipe(
  P.sequence(stringNode, P.withSpacing(P.char(":")), jsonNode),
  P.withSpacing,
  P.map(([key, , value]) => ({ type: NodeType.Property, key, value })),
);

export const objectNode: P.Parser<ObjectNode> = pipe(
  P.sepBy(P.withSpacing(P.char(",")))(propertyNode),
  P.map((children) => ({ type: NodeType.Object as const, children })),
  P.between(P.char("{"), P.char("}")),
  P.withSpacing,
);
