import { type ActionFunctionArgs, json } from "@remix-run/node";
import { v4 as uuidv4 } from "uuid";
import UploadForm from "~/components/UploadForm";
import * as dbClient from "../clients/database";
import * as minioClient from "../clients/minio";

export const action = async ({ request }: ActionFunctionArgs) => {
	try {
		const formData = await request.formData();
		const file = formData.get("file");
		const title = formData.get("title");
		const artist = formData.get("artist");
		const tags = formData.get("tags");
		if (!file || !(file instanceof File)) {
			throw "file is invalid";
		}
		if (!title) {
			throw "file data is invalid";
		}
		const arrayBuffer = await file.arrayBuffer();
		const uniqueId = `${uuidv4()}.mp3`;
		const { success: uploadObjectStorageSuccess, uploadedObject } =
			await minioClient.pushMusic({
				bucket: "music",
				fileName: uniqueId,
				buffer: Buffer.from(arrayBuffer),
				size: file.size,
				type: file.type,
			});
		const { success: insertDbSuccess } = await dbClient.createMusicMetadata({
			objectStorageId: uniqueId,
			title: String(title),
			artist: artist ? String(artist) : undefined,
		});
		if (!uploadObjectStorageSuccess || !insertDbSuccess) {
			throw "error during upload";
		}
		return json({ succes: true, message: "File upload success" });
	} catch (error) {
		return json({ succes: false, message: "File upload failed" });
	}
};

export default function Upload() {
	return <UploadForm />;
}
