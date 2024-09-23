import { Client } from "minio";
export const minioClient = new Client({
	endPoint: process.env.OBJ_STORE_ENDPOINT || "localhost",
	port: Number(process.env.OBJ_STORE_PORT) || 9000,
	useSSL: false,
	accessKey: process.env.OBJ_STORE_ACCESS_KEY || "minioadmin",
	secretKey: process.env.OBJ_STORE_SECRET_KEY || "minioadmin",
});
console.log("Minio client initialized");

export async function ensureBucketExists(
	bucketName: string,
): Promise<{ error?: string[] }> {
	try {
		const exist = await minioClient.bucketExists(bucketName);
		if (!exist) {
			await minioClient.makeBucket(bucketName, "eu-west-1");
		}
		return {};
	} catch (error) {
		return {
			error: [
				typeof error === "string"
					? error
					: "unknown error trying to check if bucket exist",
			],
		};
	}
}

export async function pushMusic({
	bucket,
	fileName,
	buffer,
	size,
	type,
}: {
	bucket: string;
	fileName: string;
	buffer: Buffer;
	size: number;
	type: string;
}): Promise<{
	uploadedObject: null | Awaited<ReturnType<typeof minioClient.putObject>>;
	error?: string[];
}> {
	try {
		const { error } = await ensureBucketExists(bucket);
		if (error) {
			return {
				uploadedObject: null,
				error: ["error uploading file to object storage", ...error],
			};
		}
		const result = await minioClient.putObject(bucket, fileName, buffer, size, {
			"Content-Type": type,
		});
		return { uploadedObject: result };
	} catch (error) {
		return {
			uploadedObject: null,
			error: [
				typeof error === "string"
					? error
					: "unknown error uploading file to object storage",
			],
		};
	}
}

export async function getMusicFiles({
	bucket,
	objectStorageIds,
}: { bucket: string; objectStorageIds: string[] }) {
	return await Promise.all(
		// objectStorageIds.map((id) => minioClient.statObject(bucket, id)),
		objectStorageIds.map((id) => minioClient.presignedGetObject(bucket, id)),
	);
}

export async function getMusicLink({
	bucket,
	objectStorageId,
}: { bucket: string; objectStorageId: string }) {
	// objectStorageIds.map((id) => minioClient.statObject(bucket, id)),
	return minioClient.presignedGetObject(bucket, objectStorageId);
}
