import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	json,
} from "@remix-run/node";
import {
	Form,
	Links,
	Meta,
	Outlet,
	Scripts,
	useLoaderData,
} from "@remix-run/react";
import { ensureBucketExists, minioClient } from "utils/minio";

export const action = async ({ request }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const file = formData.get("file");
	if (file && file instanceof File) {
		const buffer = await file.arrayBuffer();

		await ensureBucketExists("music");
		await minioClient.putObject(
			"music",
			file.name,
			Buffer.from(buffer),
			file.size,
			{ "Content-Type": file.type },
		);

		return json({ succes: true, message: "File upload success" });
	}
	return json({ succes: false, message: "File upload failed" });
};

export const loader = async (args: LoaderFunctionArgs) => {
	const statObject = await minioClient.statObject("music", "music.mp3");
	const fileUrl = await minioClient.presignedGetObject(
		"music",
		"music.mp3",
		60 * 60,
	);
	return json({ success: true, fileUrl });
};

export default function App() {
	const data = useLoaderData<typeof loader>();
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="data:image/x-icon;base64,AA" />
				<Meta />
				<Links />
			</head>
			<body>
				<h1>FileUpload</h1>
				<Form method="post" encType="multipart/form-data">
					<input type="file" name="file" />
					<button type="submit">Upload</button>
				</Form>
				<audio controls src={data.fileUrl}>
					<source src={data.fileUrl} type="audio/mp3" />
					Your browser does not support the audio element.
					<track kind="captions" src="" srcLang="en" label="English Captions" />
				</audio>
				<Outlet />
				<Scripts />
			</body>
		</html>
	);
}
