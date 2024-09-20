import { expect, test } from "vitest";
import { sum } from "./sum";

test("if sum(a, b) = a + b", () => {
	expect(sum(1, 4)).toBe(5);
});
