import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { minioClient } from "../.server/minio";

export const loader = async (args: LoaderFunctionArgs) => {
	const statObject = await minioClient.statObject("music", "music.mp3");
	const fileUrl = await minioClient.presignedGetObject(
		"music",
		"music.mp3",
		60 * 60,
	);
	return json({ success: true, fileUrl });
};
export default function Song() {
	const data = useLoaderData<typeof loader>();
	return (
		<div>
			{" "}
			<audio controls src={data.fileUrl}>
				<source src={data.fileUrl} type="audio/mp3" />
				Your browser does not support the audio element.
				<track kind="captions" src="" srcLang="en" label="English Captions" />
			</audio>
		</div>
	);
}
