import { it } from "vitest";
import { expect } from "vitest";
import { describe } from "vitest";

describe("placeholder", () => {
  it("placeholder", () => {
    expect(1).toEqual(1);
  });
  it("test 2", () => {
    expect(1 === (() => 2)()).toBe(false);
  });
});
