import { type LoaderFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { minioClient } from "../.server/minio";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	invariant(params.id, "id is undefined");
	// const readable = await minioClient.getObject("music", `${params.id}.mp3`);
	// const stream = new ReadableStream({
	// 	async start(controller) {
	// 		readable.on("data", (chunk) => {
	// 			controller.enqueue(chunk);
	// 		});
	// 		readable.on("end", () => {
	// 			controller.close();
	// 		});
	// 		readable.on("error", (error) => {
	// 			controller.error(error);
	// 		});
	// 	},
	// });
	// return new Response(stream, {
	// 	headers: {
	// 		"Content-Type": "audio/mpeg",
	// 		"Cache-Control": "no-store",
	// 	},
	// });
	const objectStat = await minioClient.statObject("music", `${params.id}.mp3`);
	const fileSize = objectStat.size;
	const rangeHeader = request.headers.get("Range");
	let start = 0;
	let end = fileSize - 1;
	if (rangeHeader) {
		const parts = rangeHeader.replace(/bytes=/, "").split("-");
		invariant(parts[0]);
		start = Number.parseInt(parts[0], 10);
		end = parts[1] ? Number.parseInt(parts[1]) : end;
	}
	const contentLength = end - start + 1;
	if (start >= fileSize || end >= fileSize) {
		return new Response("Requested range is invalid", { status: 416 });
	}
	const readable = await minioClient.getPartialObject(
		"music",
		`${params.id}.mp3`,
		start,
		contentLength,
	);
	const stream = new ReadableStream({
		async start(controller) {
			readable.on("data", (chunk) => {
				controller.enqueue(chunk);
			});
			readable.on("end", () => {
				controller.close();
			});
			readable.on("error", (error) => {
				controller.error(error);
			});
		},
	});
	return new Response(stream, {
		status: rangeHeader ? 206 : 200,
		headers: {
			"Content-Range": `bytes ${start}-${end}/${fileSize}`,
			"Accept-Ranges": "bytes",
			"Content-Length": contentLength.toString(),
			"Content-Type": "audio/mpeg",
			"Cache-Control": "no-store",
		},
	});
};
