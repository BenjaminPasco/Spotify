import { type ChangeEvent, type KeyboardEvent, useState } from "react";

export default function useBadgesInput() {
	const [tags, setTags] = useState<string[]>([]);
	const [inputValue, setInputValue] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	const addTag = (tag: string) => {
		if (tags.includes(tag)) {
			setError("Tag is already in the list");
			return;
		}
		setError(tags.length >= 10 ? "You reached the 10 tag limit" : null);
		setTags((oldTags) => [...oldTags, tag]);
		setInputValue("");
	};

	const removeTag = (tagToRemove: string) => {
		setTags(tags.filter((tag) => tag !== tagToRemove));
	};

	const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
		if (event.target.value === "") {
			setError(null);
		}
	};

	const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === " " && inputValue.trim()) {
			event.preventDefault();
			addTag(inputValue.trim());
			return;
		}
		if (event.key === "Backspace" && !inputValue && tags.length > 0) {
			const lastTag = tags.at(tags.length - 1);
			lastTag && removeTag(lastTag);
		}
	};

	return { tags, removeTag, inputValue, onInputChange, onKeyDown, error };
}
