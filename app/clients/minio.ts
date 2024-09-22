import { Client } from "minio";
export const minioClient = new Client({
	endPoint: "localhost",
	port: 9000,
	useSSL: false,
	accessKey: "minioadmin",
	secretKey: "minioadmin",
});

export async function ensureBucketExists(bucketName: string) {
	const exist = await minioClient.bucketExists(bucketName);
	if (!exist) {
		await minioClient.makeBucket(bucketName, "eu-west-1");
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
	success: boolean;
	uploadedObject: null | Awaited<ReturnType<typeof minioClient.putObject>>;
}> {
	try {
		await ensureBucketExists(bucket);
		const result = await minioClient.putObject(bucket, fileName, buffer, size, {
			"Content-Type": type,
		});
		return { success: true, uploadedObject: result };
	} catch (error) {
		return { success: false, uploadedObject: null };
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
