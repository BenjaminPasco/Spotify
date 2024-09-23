import pg from "pg";
const { Pool } = pg;

const dbUser = process.env.DB_USER || "user";
const dbPassword = process.env.DB_PASSWORD || "password";
const dbHost = process.env.DB_HOST || "127.0.0.1";
const dbPort = process.env.DB_PORT || 5432;
const dbName = process.env.DB_NAME || "spotify";

const connectionUrl = `postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
const pool = new Pool({
	connectionString: connectionUrl,
});

type DBMusicMetaData = {
	object_storage_id: string;
	title: string;
	artist?: string;
};

export type MusicMetaData = {
	objectStorageId: string;
	title: string;
	artist?: string;
};

async function initClient() {
	const createTableQuery = `
		CREATE TABLE IF NOT EXISTS musicMetaData (
			id SERIAL PRIMARY KEY,
			object_storage_id VARCHAR(100) NOT NULL,
			title VARCHAR(100) NOT NULL,
			artist VARCHAR(100)
		)
	`;
	try {
		await pool.connect();
		await pool.query(createTableQuery);
		console.log("connection pool created, musicMetaData table created");
	} catch (error) {
		console.error(error);
	}
}

initClient();

export { pool };

export async function createMusicMetadata({
	objectStorageId,
	title,
	artist,
}: MusicMetaData): Promise<{
	insertedMetaData: null | { id: string };
	error?: string[];
}> {
	const createMusicMetadata = `
		INSERT INTO musicMetaData (object_storage_id, title, artist)
		VALUES ($1, $2, $3)
		RETURNING id;
	`;
	let client: null | pg.PoolClient = null;
	try {
		client = await pool.connect();
		const result = await client.query<{ id: string }>(createMusicMetadata, [
			objectStorageId,
			title,
			artist,
		]);
		if (!result.rows.at(0)?.id) {
			return {
				insertedMetaData: null,
				error: ["no row inserted in metadata table"],
			};
		}
		return { insertedMetaData: result.rows.at(0) || null };
	} catch (error) {
		return {
			insertedMetaData: null,
			error: [
				typeof error === "string"
					? error
					: "unknown error trying to insert file metadata",
			],
		};
	} finally {
		if (client !== null) {
			client.release();
		}
	}
}

export async function getAllMusicMetadata(): Promise<{
	success: boolean;
	rows: Array<MusicMetaData>;
}> {
	const getAllMusicDataQuery = `
		SELECT object_storage_id, title, artist
		FROM musicMetaData 
	`;
	let client: null | pg.PoolClient = null;
	try {
		client = await pool.connect();
		const result = await client.query<DBMusicMetaData>(getAllMusicDataQuery);
		if (!result.rows) {
			throw "wrong result";
		}
		const rows: MusicMetaData[] = result.rows.map((row) => {
			return {
				objectStorageId: row.object_storage_id,
				title: row.title,
				artist: row.artist,
			} satisfies MusicMetaData;
		});
		return { success: true, rows };
	} catch (error) {
		return { success: false, rows: [] };
	} finally {
		if (client !== null) {
			client.release();
		}
	}
}
