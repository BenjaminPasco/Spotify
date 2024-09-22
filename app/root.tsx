import { Links, Meta, Outlet, Scripts } from "@remix-run/react";
import styles from "./tailwind.css?url";

export function links() {
	return [
		{ rel: "stylesheet", href: styles },
		{ rel: "stylesheet", href: "/fonts/inter.css" },
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
