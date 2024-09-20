import { render } from "@testing-library/react";
import { expect, test } from "vitest";
import GlowyButton from "./GlowyButton";

test("if GlowyButton render", () => {
	render(<GlowyButton />);
});
