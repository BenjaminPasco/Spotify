import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	json,
	redirect,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { JwtPayload } from "jsonwebtoken";
import invariant from "tiny-invariant";
import { v4 as uuidv4 } from "uuid";
import { authenticate } from "~/.server/auth";
import { accessTokenCookie, refreshTokenCookie } from "~/.server/cookies";
import { verifyAccessToken, verifyRefreshToken } from "~/.server/jwt";
import * as dbClient from "../.server/database";
import * as minioClient from "../.server/minio";
import UploadForm from "../components/UploadForm";

export const action = async ({ request }: ActionFunctionArgs) => {
	const actionError = "upload action failed";
	try {
		const formData = await request.formData();
		const file = formData.get("file");
		const title = formData.get("title");
		const artist = formData.get("artist");
		const tags = formData.get("tags");
		if (!file || !(file instanceof File)) {
			return json({ succes: false, error: [actionError, "file is invalid"] });
		}
		if (!title) {
			return json({
				succes: false,
				error: [actionError, "data from form is invalid"],
			});
		}
		const arrayBuffer = await file.arrayBuffer();
		const uniqueId = `${uuidv4()}.mp3`;
		const { uploadedObject, error: objStorageError } =
			await minioClient.pushMusic({
				bucket: "music",
				fileName: uniqueId,
				buffer: Buffer.from(arrayBuffer),
				size: file.size,
				type: file.type,
			});
		if (objStorageError) {
			return json({ succes: false, error: [actionError, ...objStorageError] });
		}
		const { insertedMetaData, error: dbInsertError } =
			await dbClient.createMusicMetadata({
				objectStorageId: uniqueId,
				title: String(title),
				artist: artist ? String(artist) : undefined,
			});
		if (dbInsertError) {
			return json({ succes: false, error: [actionError, ...dbInsertError] });
		}
		return json({ succes: true, uploadedObject, insertedMetaData });
	} catch (error) {
		return json({
			succes: false,
			error: [...[typeof error === "string" ? error : undefined]],
		});
	}
};

export async function loader({ request }: LoaderFunctionArgs) {
	const { authenticated, headers } = await authenticate(request);
	if (!authenticated) {
		return redirect("/auth");
	}
	return json({}, { headers });
}

export default function Upload() {
	return <UploadForm />;
}
