import { Links, Meta, Outlet, Scripts } from "@remix-run/react";
import Navbar from "./components/Navbar";
import styles from "./tailwind.css?url";
export function links() {
	return [
		{ rel: "stylesheet", href: styles },
		{ rel: "stylesheet", href: "/fonts/inter.css" },
		{ rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
		{
			rel: "apple-touch-icon",
			sizes: "180x180",
			href: "/apple-touch-icon.png",
		},
		{
			rel: "icon",
			type: "image/png",
			sizes: "32x32",
			href: "/favicon-32x32.png",
		},
		{
			rel: "icon",
			type: "image/png",
			sizes: "16x16",
			href: "/favicon-16x16.png",
		},
		{ rel: "manifest", href: "/site.webmanifest" },
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
				<Navbar />
				<Outlet />
				<Scripts />
			</body>
		</html>
	);
}
