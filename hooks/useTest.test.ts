import { act, renderHook } from "@testing-library/react";
import { expect, test } from "vitest";
import useTest from "./useTest";

test("updating useTest hook value", () => {
	const { result, rerender } = renderHook(() => useTest());
	expect(result.current.value).toBe("initialValue");
	act(() => {
		result.current.setValue("newValue");
	});
	expect(result.current.value).toBe("newValue");
});
