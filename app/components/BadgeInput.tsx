import { Delete } from "lucide-react";
import { useRef, useState } from "react";
import * as badge from "./ui/badge";

type BadgeInputProps = {
	name: string;
	placeholder: string;
	tags: string[];
	removeTag: (tag: string) => void;
	inputValue: string;
	onInputChange: React.ChangeEventHandler<HTMLInputElement>;
	onKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
};

export default function BadgeInput(props: BadgeInputProps) {
	const { tags, removeTag, inputValue, onInputChange, onKeyDown } = props;
	const inputRef = useRef<HTMLInputElement>(null);
	const [isFocus, setIsFocus] = useState<boolean>(false);

	return (
		<>
			<div
				className={`flex flex-wrap flex-row  gap-2 min-h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors  ${isFocus ? "ring-1 outline-none ring-ring" : ""} disabled:cursor-not-allowed disabled:opacity-50`}
			>
				{tags.map((tag) => (
					<badge.Badge key={tag} className="flex items-center gap-1 h-6">
						{tag}
						<button
							type="button"
							onClick={() => removeTag(tag)}
							aria-label={`Remove ${tag} tag`}
						>
							<Delete />
						</button>
					</badge.Badge>
				))}
				<input
					ref={inputRef}
					type="text"
					placeholder={!tags.length ? props.placeholder : ""}
					value={inputValue}
					onChange={onInputChange}
					onKeyDown={onKeyDown}
					onFocus={() => setIsFocus(true)}
					onBlur={() => setIsFocus(false)}
					className="flex-grow min-w-0  outline-none bg-transparent placeholder:text-muted-foreground"
				/>
				<input
					type="text"
					name={props.name}
					id={props.name}
					value={tags}
					hidden
					readOnly
				/>
			</div>
		</>
	);
}
