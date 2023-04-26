import { stringify } from "yaml";
import { parseJsonToAst } from "@/json-parser/json-ast";

const sample = `
{
  "some": "data",
  "more": {
    "nested": "data",
    "bool": true
  },
  "array": [1, 2, 3],
  "null": null
}`;

const ast = parseJsonToAst(sample);

console.log("String to parse:");
console.log(sample);
console.log();
console.log("AST:");
console.log(stringify(ast));
