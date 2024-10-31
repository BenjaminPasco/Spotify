import { type ClientLoaderFunctionArgs, redirect } from "@remix-run/react";

export const loader = async ({ request }: ClientLoaderFunctionArgs) => {
	const clientId =
		"128561937780-f3kfj7md2nqagigsq1n5cl0psmi6ljp2.apps.googleusercontent.com";
	const redirectUri = "http://localhost:8001/auth/google/callback";
	const scope =
		"https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email";
	const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(
		scope,
	)}&access_type=offline&prompt=consent`;
	return redirect(googleAuthURL);
};
