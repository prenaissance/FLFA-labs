import { describe, it, expect } from "vitest";
import { NodeType, parseJsonToAst } from "@/json-parser/json-ast";

describe("lab5", () => {
  it("should parse string literals", () => {
    const result = parseJsonToAst(' "hello world" ');
    expect(result).toEqual({
      type: NodeType.StringLiteral,
      value: "hello world",
    });
  });

  it("should parse numeric literals", () => {
    const result = parseJsonToAst("12.3e-4");

    expect(result).toEqual({
      type: NodeType.NumberLiteral,
      value: 12.3e-4,
    });
  });

  it("should parse boolean literals", () => {
    const result = parseJsonToAst("true");

    expect(result).toEqual({
      type: NodeType.BooleanLiteral,
      value: true,
    });
  });

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

  it("should parse objects", () => {
    const result = parseJsonToAst('{ "a": 1, "b": "hello", "c": true }');

    expect(result).toEqual({
      type: NodeType.Object,
      children: [
        {
          type: NodeType.Property,
          key: {
            type: NodeType.StringLiteral,
            value: "a",
          },
          value: { type: NodeType.NumberLiteral, value: 1 },
        },
        {
          type: NodeType.Property,
          key: {
            type: NodeType.StringLiteral,
            value: "b",
          },
          value: { type: NodeType.StringLiteral, value: "hello" },
        },
        {
          type: NodeType.Property,
          key: {
            type: NodeType.StringLiteral,
            value: "c",
          },
          value: { type: NodeType.BooleanLiteral, value: true },
        },
      ],
    });
  });
});
