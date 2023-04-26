# Topic: Chomsky Normal Form

### Course: Formal Languages & Finite Automata

### Author: Andrieș Alexandru

---

## Theory

All the stuff related to parsing and ASTs is covered in the [3rd lab work](./lab3.md).

I'm using an LL(k) parser and the official JSON specification, and the AST is freestyle.

## Objectives:

1. Get familiar with parsing, what it is and how it can be programmed [1].
2. Get familiar with the concept of AST [2].
3. In addition to what has been done in the 3rd lab work do the following:
   1. In case you didn't have a type that denotes the possible types of tokens you need to:
      1. Have a type **_TokenType_** (like an enum) that can be used in the lexical analysis to categorize the tokens.
      2. Please use regular expressions to identify the type of the token.
   2. Implement the necessary data structures for an AST that could be used for the text you have processed in the 3rd lab work.
   3. Implement a simple parser program that could extract the syntactic information from the input text.

## Implementation description

### Setup

This project is written in TypeScript and uses Vitest for testing. It has a github actions CI pipeline to run the tests, so the verification of the code is automated without having to clone the repository. All tests will be placed in the `./tests` folder and the specs are grouped by the laboratory for simplicity.

### Getting familiar with the concept of AST

The AST is a tree representation of the source code. It is created during parsing and used for compilation / interpreting. I learn the best from examples, and here is an amazing resource that I used as inspiration for the PBL project [ast explorer](https://astexplorer.net/), which is a website that aggregates various AST implementations for different languages and allows you to see the AST for a given editable source code.

### Implementing the parser

The parser implemented in this laboratory work is a [Scannerless parser](https://en.wikipedia.org/wiki/Scannerless_parsing). I will not need any tokenization with the technique of parser combinators, as sub-parsers hold the logic needed to define sequences of lexemes, like in the following example:

```ts
// src/json-parser/json-ast.ts
const propertyNode: P.Parser<PropertyNode> = pipe(
  P.sequence(stringNode, P.withSpacing(P.char(":")), jsonNode),
  P.withSpacing,
  P.map(([key, , value]) => ({ type: NodeType.Property, key, value })),
);
```

where the logic is described declaratively by parser combinators (`sequence`, `map`) and the traditional tokens / lexemes are defined by other parsers (`stringNode`, `char(string)`).

## Implementation

The self-made "library" and primitives are reused and described from [the 3rd lab work](./lab3.md). Over-engineering the "lexer" (full-blown parser) was not useless. While the last implementation parsed a JSON string into an in-memory dynamic object that the JSON represents, which is JSON's very use case, the implementation in this laboratory work is a bit redundant - to show the structure of the JSON through an AST. This is redundant, because the JSON format is already a tree structure and it's self explanatory, here's what the end result looks like:

Source:

```json
{
  "some": "data",
  "more": {
    "nested": "data",
    "bool": true
  },
  "array": [1, 2, 3],
  "null": null
}
```

AST:

```yaml
type: Object
children:
  - type: Property
    key:
      type: StringLiteral
      value: some
    value:
      type: StringLiteral
      value: data
  - type: Property
    key:
      type: StringLiteral
      value: more
    value:
      type: Object
      children:
        - type: Property
          key:
            type: StringLiteral
            value: nested
          value:
            type: StringLiteral
            value: data
        - type: Property
          key:
            type: StringLiteral
            value: bool
          value:
            type: BooleanLiteral
            value: true
  - type: Property
    key:
      type: StringLiteral
      value: array
    value:
      type: Array
      children:
        - type: NumberLiteral
          value: 1
        - type: NumberLiteral
          value: 2
        - type: NumberLiteral
          value: 3
  - type: Property
    key:
      type: StringLiteral
      value: "null"
    value:
      type: NullLiteral
      value: null
```

The possible nodes for the AST are described by an enum, which is also used as the discriminator for the Nodes themselves:

```ts
// src/json-parser/json-ast.ts
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
```

The parsers are easy do defined, since the primitives are reused from lab 3. Here's an example of a primitive:

```ts
// src/json-parser/json-ast.ts
const stringNode: P.Parser<StringNode> = pipe(
  str,
  P.withSpacing,
  P.map((value) => ({ type: NodeType.StringLiteral, value })),
);
```

And here are some more complex parsers, starting with the array:

```ts
// src/json-parser/json-ast.ts
const arrayNode: P.Parser<ArrayNode> = pipe(
  P.sepBy(P.withSpacing(P.char(",")))(jsonNode),
  P.map((children) => ({ type: NodeType.Array as const, children })),
  P.between(P.char("["), P.char("]")),
  P.withSpacing,
);
```

I hope that the naming makes things intuitive, but here is the grammar for this parser:

```bnf
arrayNode ::= \s* "[" [jsonNode] { "," jsonNode }* "]" \s*
```

where `\s` is a whitespace character.

The object parser is similar, but a bit more complex:

```ts
// src/json-parser/json-ast.ts
const propertyNode: P.Parser<PropertyNode> = pipe(
  P.sequence(stringNode, P.withSpacing(P.char(":")), jsonNode),
  P.withSpacing,
  P.map(([key, , value]) => ({ type: NodeType.Property, key, value })),
);

const objectNode: P.Parser<ObjectNode> = pipe(
  P.sepBy(P.withSpacing(P.char(",")))(propertyNode),
  P.map((children) => ({ type: NodeType.Object as const, children })),
  P.between(P.char("{"), P.char("}")),
  P.withSpacing,
);
```

And to export the final parser:

```ts
// src/json-parser/json-ast.ts
const jsonNode = P.lazy(() =>
  P.oneOf(numberNode, stringNode, booleanNode, nullNode, arrayNode, objectNode),
);
export const parseJsonToAst = (str: string) => P.run(str)(jsonNode);
```

## Conclusions / Screenshots / Results

### Results

All the added functionality is tested, with 100% coverage for the addition. Here's a sample of the unit tests:

```ts
// tests/lab5.spec.ts
it("should parse null literal", () => {
  const result = parseJsonToAst("null");

  expect(result).toEqual({
    type: NodeType.NullLiteral,
    value: null,
  });
});

it("should throw on invalid input", () => {
  expect(() => parseJsonToAst("invalid")).toThrow();
});

it("should parse arrays", () => {
  const result = parseJsonToAst('[1, "hello", true]');

  expect(result).toEqual({
    type: NodeType.Array,
    children: [
      { type: NodeType.NumberLiteral, value: 1 },
      { type: NodeType.StringLiteral, value: "hello" },
      { type: NodeType.BooleanLiteral, value: true },
    ],
  });
});
```

There is a small demo that can be run with `pnpm run demo:ast`, and the results were shown in [The implementation description](#implementation)

### Conclusion

In this laboratory work I extended the functionality of the JSON parser from laboratory work 3. I added typings for the AST nodes and implemented the AST generation in a simple and modular way, reusing most of the constructs and algebraic structures defined previously. I explored how to generate an AST for a serialization format and looked at the results of alternative implementations to inspire my own.

I still think that generating an AST for JSON is a redundancy, but I could not predict that I would need to continue with the topic and implement an AST in the future when I worked on lab 3.

## References

1. [AST Explorer](https://astexplorer.net/)
2. [Wikipedia - Scannerless parsing](https://en.wikipedia.org/wiki/Scannerless_parsing)
