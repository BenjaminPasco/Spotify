import { useState } from "react";

export default function useTest() {
	const [value, setValue] = useState("initialValue");
	return { value, setValue };
}
