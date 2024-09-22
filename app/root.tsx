import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	json,
} from "@remix-run/node";
import {
	Form,
	Links,
	Meta,
	Outlet,
	Scripts,
	useLoaderData,
} from "@remix-run/react";
import interStyles from "/fonts/inter.css?url";
import { minioClient } from "./clients/minio";
import styles from "./tailwind.css?url";

export function links() {
	return [
		{ rel: "stylesheet", href: interStyles },
		{ rel: "stylesheet", href: styles },
	];
}

export default function App() {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="data:image/x-icon;base64,AA" />
				<Meta />
				<Links />
			</head>
			<body>
				<Outlet />
				<Scripts />
			</body>
		</html>
	);
}
