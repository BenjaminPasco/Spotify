import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import * as dbClient from "../.server/database";
import * as minioClient from "../.server/minio";

export const loader = async (args: LoaderFunctionArgs) => {
	const { rows } = await dbClient.getAllMusicMetadata();
	const musics = await Promise.all(
		rows.map(async (row) => {
			const link = await minioClient.getMusicLink({
				bucket: "music",
				objectStorageId: row.objectStorageId,
			});
			const url = new URL(link);
			const path = url.pathname;
			return {
				...row,
				url: `http://spotify.benpas.local/minio${path}`,
			};
		}),
	);
	return json({ success: true, musics });
};

export default function Songs() {
	const { musics } = useLoaderData<typeof loader>();
	return (
		<>
			{musics.map((music) => {
				return (
					<div key={music.objectStorageId}>
						<audio controls>
							<source src={music.url} type="audio/mpeg" />
							<track kind="captions" srcLang="en" label="English" default />
							Your Browser does not support the audio element.
						</audio>
					</div>
				);
			})}
		</>
	);
}
