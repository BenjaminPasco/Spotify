import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import * as dbClient from "../.server/database";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const { rows } = await dbClient.getAllMusicMetadata();
	const musics = await Promise.all(
		rows.map((row) => {
			return {
				...row,
				url: `${url.protocol}//${process.env.DOMAIN}/api/songs/${row.objectStorageId}`,
				// url: `${url.protocol}//${url.hostname}:${url.port}/api/songs/${row.objectStorageId}`,
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
