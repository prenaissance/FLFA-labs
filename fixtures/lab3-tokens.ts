export const arrayString = JSON.stringify([1, "hello", [true, false]]);
export const arrayTokens = [
  {
    type: "open-array",
  },
  {
    type: "number",
    value: 1,
  },
  {
    type: "comma",
  },
  {
    type: "string",
    value: "hello",
  },
  {
    type: "comma",
  },
  {
    type: "open-array",
  },
  {
    type: "boolean",
    value: true,
  },
  {
    type: "comma",
  },
  {
    type: "boolean",
    value: false,
  },
  {
    type: "close-array",
  },
  {
    type: "close-array",
  },
] as const;
export const objectString = JSON.stringify({
  a: 1,
  b: "hello",
  c: { d: true },
});
export const objectTokens = [
  {
    type: "open-object",
  },
  {
    type: "string",
    value: "a",
  },
  {
    type: "colon",
  },
  {
    type: "number",
    value: 1,
  },
  {
    type: "comma",
  },
  {
    type: "string",
    value: "b",
  },
  {
    type: "colon",
  },
  {
    type: "string",
    value: "hello",
  },
  {
    type: "comma",
  },
  {
    type: "string",
    value: "c",
  },
  {
    type: "colon",
  },
  {
    type: "open-object",
  },
  {
    type: "string",
    value: "d",
  },
  {
    type: "colon",
  },
  {
    type: "boolean",
    value: true,
  },
  {
    type: "close-object",
  },
  {
    type: "close-object",
  },
];

export const kitchenSinkString = JSON.stringify({
  a: 1,
  b: "hello",
  c: { d: true },
  e: [1, 2, 3],
  f: [null],
});

export const kitchenSinkTokens = [
  {
    type: "open-object",
  },
  {
    type: "string",
    value: "a",
  },
  {
    type: "colon",
  },
  {
    type: "number",
    value: 1,
  },
  {
    type: "comma",
  },
  {
    type: "string",
    value: "b",
  },
  {
    type: "colon",
  },
  {
    type: "string",
    value: "hello",
  },
  {
    type: "comma",
  },
  {
    type: "string",
    value: "c",
  },
  {
    type: "colon",
  },
  {
    type: "open-object",
  },
  {
    type: "string",
    value: "d",
  },
  {
    type: "colon",
  },
  {
    type: "boolean",
    value: true,
  },
  {
    type: "close-object",
  },
  {
    type: "comma",
  },
  {
    type: "string",
    value: "e",
  },
  {
    type: "colon",
  },
  {
    type: "open-array",
  },
  {
    type: "number",
    value: 1,
  },
  {
    type: "comma",
  },
  {
    type: "number",
    value: 2,
  },
  {
    type: "comma",
  },
  {
    type: "number",
    value: 3,
  },
  {
    type: "close-array",
  },
  {
    type: "comma",
  },
  {
    type: "string",
    value: "f",
  },
  {
    type: "colon",
  },
  {
    type: "open-array",
  },
  {
    type: "null",
    value: null,
  },
  {
    type: "close-array",
  },
  {
    type: "close-object",
  },
];
