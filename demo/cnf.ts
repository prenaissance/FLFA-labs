import { v2Grammar, v13Grammar } from "@/fixtures/lab4-grammars";

const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const yellow = (text: string) => `\x1b[33m${text}\x1b[0m`;

console.log(yellow("Variant 2 (mine) grammar"));
console.log(v2Grammar.toString());
console.log();
console.log(green("Variant 2 grammar in CNS"));
console.log(v2Grammar.toChomskyNormalForm().toString());
console.log();
console.log(yellow("Variant 13 (random number) grammar"));
console.log(v13Grammar.toString());
console.log();
console.log(green("Variant 13 grammar in CNS"));
console.log(v13Grammar.toChomskyNormalForm().toString());
