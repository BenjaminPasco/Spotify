import pg from "pg";
import invariant from "tiny-invariant";
const { Pool } = pg;

const dbUser = process.env.DB_USER || "dbadmin";
const dbPassword = process.env.DB_PASSWORD || "dbadmin";
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = process.env.DB_PORT || 5432;
const dbName = process.env.DB_NAME || "spotify";

const connectionUrl = `postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
let pool: pg.Pool | null = null;
try {
	pool = new Pool({
		connectionString: connectionUrl,
	});
} catch (error) {
	console.error("Db connection pool fail to initialized");
}

type DBMusicMetaData = {
	id: string;
	object_storage_id: string;
	title: string;
	artist?: string;
};

export type MusicMetaData = {
	objectStorageId: string;
	title: string;
	artist?: string;
};

type DBUser = {
	id: string;
	provider_id: string;
};

export type User = {
	id: string;
	providerId: string;
};

async function initClient() {
	const createSongMetaDataTableQuery = `
		CREATE TABLE IF NOT EXISTS musicMetaData (
			id SERIAL PRIMARY KEY,
			object_storage_id VARCHAR(100) NOT NULL,
			title VARCHAR(100) NOT NULL,
			artist VARCHAR(100)
		)
	`;
	const createUserTableQuery = `
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			provider_id VARCHAR(100) NOT NULL
		)
	`;
	try {
		invariant(pool !== null, "Db connection pool is not initialized");
		await pool.connect();
		await pool.query(createSongMetaDataTableQuery);
		await pool.query(createUserTableQuery);
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
		invariant(pool !== null, "Db connection pool is not initialized");
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
		invariant(pool !== null, "Db connection pool is not initialized");
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

export async function createUser({
	providerId,
}: Pick<User, "providerId">): Promise<
	{ createdUser: User; error: null } | { createdUser: null; error: string[] }
> {
	const createUser = `
		INSERT INTO users (provider_id)
		VALUES ($1)
		RETURNING id, provider_id;
	`;
	let client: null | pg.PoolClient = null;
	try {
		invariant(pool !== null, "Db connection pool is not initialized");
		client = await pool.connect();
		const result = await client.query<DBUser>(createUser, [providerId]);
		const insertedUser = result.rows[0];
		invariant(insertedUser, "no row inserted in users table");
		return {
			createdUser: {
				id: insertedUser.id,
				providerId: insertedUser.provider_id,
			},
			error: null,
		};
	} catch (error) {
		return {
			createdUser: null,
			error: ["createUser", String(error)],
		};
	} finally {
		if (client !== null) {
			client.release();
		}
	}
}

export async function getUser(query: Partial<User>): Promise<
	| { user: User; error: null }
	| {
			user: null;
			error: string[];
	  }
> {
	const conditions = [];
	const values = [];
	if (query.id) {
		values.push(query.id);
		conditions.push(`id = $${values.length}`);
	}
	if (query.providerId) {
		values.push(query.providerId);
		conditions.push(`provider_id = $${values.length}`);
	}
	const getUserQuery = `
		SELECT id, provider_id
		FROM users
		WHERE ${conditions.join(" AND ")}
	`;
	let client: null | pg.PoolClient = null;
	try {
		invariant(pool, "Db connection pool is not initialized");
		client = await pool.connect();
		const result = await client.query<DBUser>(getUserQuery, values);
		if (!result.rows) {
			throw "wrong result";
		}
		invariant(result.rows[0], "user not found");
		return {
			user: {
				id: result.rows[0].id,
				providerId: result.rows[0].provider_id,
			},
			error: null,
		};
	} catch (error) {
		return { user: null, error: ["getUser", String(error)] };
	} finally {
		if (client !== null) {
			client.release();
		}
	}
}

export async function findOrCreateUser({
	id,
}: { id: string }): Promise<
	{ user: User; error: null } | { user: null; error: string[] }
> {
	const { user, error: errorGetUser } = await getUser({
		providerId: id,
	});
	if (user) {
		return { user, error: null };
	}
	if (errorGetUser[1] !== "Error: Invariant failed: user not found") {
		return {
			user: null,
			error: errorGetUser,
		};
	}
	const { createdUser, error: createUserError } = await createUser({
		providerId: id,
	});
	if (createUserError) {
		return { user: null, error: createUserError };
	}
	return { user: createdUser, error: null };
}
