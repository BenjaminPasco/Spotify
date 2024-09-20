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
