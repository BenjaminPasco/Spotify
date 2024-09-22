import { Form } from "@remix-run/react";
import type { PropsWithChildren } from "react";
import useBadgeInput from "../hooks/useBadgeInput";
import BadgeInput from "./BadgeInput";
import * as button from "./ui/button";
import * as card from "./ui/card";
import * as input from "./ui/input";

export default function UploadForm() {
	const { tags, removeTag, inputValue, onInputChange, onKeyDown, error } =
		useBadgeInput();
	return (
		<card.Card className="max-w-md mx-auto mt-10">
			<Form
				method="post"
				encType="multipart/form-data"
				className="flex flex-col gap-4"
			>
				<card.CardHeader>
					<card.CardTitle>Upload your music</card.CardTitle>
				</card.CardHeader>
				<card.CardContent className="flex flex-col gap-4">
					<div>
						<Title>
							<label htmlFor="file">Music</label>
							<Information>Required - accepted format: .mp3</Information>
						</Title>
						<input.Input
							type="file"
							name="file"
							id="file"
							accept=".mp3"
							required
						/>
					</div>
					<div>
						<Title>
							<label htmlFor="title">Title</label>
							<Information>Required</Information>
						</Title>
						<input.Input
							type="text"
							name="title"
							id="title"
							placeholder="Bohemian Rhapsody"
							required
						/>
					</div>
					<div>
						<Title>
							<label htmlFor="artist">Artist</label>
						</Title>
						<input.Input
							type="text"
							name="artist"
							id="artist"
							placeholder="Queen"
						/>
					</div>
					<div>
						<Title>
							<label htmlFor="tags">Tags:</label>
							{error ? <ErrorMessage>{error}</ErrorMessage> : null}
						</Title>
						<BadgeInput
							name="tags"
							placeholder="Rock - Band - 70s"
							tags={tags}
							removeTag={removeTag}
							inputValue={inputValue}
							onInputChange={onInputChange}
							onKeyDown={onKeyDown}
						/>
					</div>
				</card.CardContent>
				<card.CardFooter>
					<button.Button>Upload Music</button.Button>
				</card.CardFooter>
			</Form>
		</card.Card>
	);
}

function Title(props: PropsWithChildren) {
	return (
		<div className="flex flex-row items-center gap-2">{props.children}</div>
	);
}

function Information(props: PropsWithChildren) {
	return (
		<span className="text-sm italic text-muted-foreground">
			{props.children}
		</span>
	);
}

function ErrorMessage(props: PropsWithChildren) {
	return <p className="text-red-500 text-sm">{props.children}</p>;
}
