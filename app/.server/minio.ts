import { Client } from "minio";
import invariant from "tiny-invariant";

let minioClient: Client | null = null;

try {
	minioClient = new Client({
		endPoint: process.env.MINIO_HOST || "localhost",
		port: Number(process.env.MINIO_PORT) || 9000,
		useSSL: false,
		accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
		secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
		pathStyle: true,
	});
	console.log("Minio client initialized", !!minioClient);
} catch (error) {
	console.error("Minio client failed to initialize");
}
export { minioClient };

export async function ensureBucketExists(
	bucketName: string,
): Promise<{ error?: string[] }> {
	try {
		invariant(minioClient !== null, "Minio client not initialized");
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
					: // : "unknown error trying to check if bucket exist",
						(error as string),
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
	uploadedObject: null | Awaited<ReturnType<Client["putObject"]>>;
	error?: string[];
}> {
	try {
		invariant(minioClient !== null, "Minio client not initialized");
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
}: { bucket: string; objectStorageIds: string[]; error?: string[] }) {
	try {
		return await Promise.all(
			objectStorageIds.map((id) => {
				invariant(minioClient !== null, "Minio client is not initialized");
				return minioClient.presignedGetObject(bucket, id);
			}),
		);
	} catch (error) {
		return { error: [error] };
	}
}

export async function getMusicLink({
	bucket,
	objectStorageId,
}: { bucket: string; objectStorageId: string; error?: string[] }) {
	try {
		invariant(minioClient !== null, "Minio client is not initialized");
		return minioClient.presignedGetObject(bucket, objectStorageId);
	} catch (error) {
		return { error: [error] };
	}
}
