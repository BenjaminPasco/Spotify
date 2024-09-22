import pg from "pg";
const { Pool } = pg;

const connectionUrl = "postgres://user:password@localhost:5432/mydatabase";
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
	} catch (error) {}
}

initClient().catch(console.error);

export { pool };

export async function createMusicMetadata({
	objectStorageId,
	title,
	artist,
}: MusicMetaData): Promise<{
	success: boolean;
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
			throw "music metadata not inserted";
		}
		return { success: true };
	} catch (error) {
		return { success: false };
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
