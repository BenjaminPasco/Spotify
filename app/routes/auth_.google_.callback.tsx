import {
	type ClientLoaderFunctionArgs,
	json,
	redirect,
} from "@remix-run/react";
import { accessTokenCookie, refreshTokenCookie } from "../.server/cookies";
import { findOrCreateUser } from "../.server/database";
import { generateAccessToken, generateRefreshToken } from "../.server/jwt";
import { fetchTokens, fetchUserInfos } from "../lib/googleOAuth";

export async function loader({ request }: ClientLoaderFunctionArgs) {
	const ERROR = "/auth/google/callback loader failed";
	const url = new URL(request.url);
	const oAuthError = url.searchParams.get("error");
	const code = url.searchParams.get("code");
	if (oAuthError) {
		return json({ error: [ERROR, oAuthError] });
	}
	if (!code) {
		return json({ error: [ERROR, "no code returned from oAuth"] });
	}
	const { tokens, error: fetchTokensError } = await fetchTokens({ code });
	if (fetchTokensError) {
		return json({ error: [ERROR, ...fetchTokensError] });
	}
	const { userInfos, error: fetchUserInfosError } = await fetchUserInfos({
		accessToken: tokens.access_token,
	});
	if (fetchUserInfosError) {
		return json({ error: [ERROR, ...fetchUserInfosError] });
	}
	const { user, error: errorGetUser } = await findOrCreateUser({
		id: userInfos.id,
	});
	if (errorGetUser) {
		return redirect("/auth?success=false");
	}
	const accessToken = generateAccessToken({ id: user.id });
	const refreshToken = generateRefreshToken({ id: user.id });

	// return redirect("/auth?success=true", {
	const serializedAccessTokenCookie =
		await accessTokenCookie.serialize(accessToken);
	const serializedRefreshTokenCookie =
		await refreshTokenCookie.serialize(refreshToken);
	const headers = new Headers();
	headers.append("Set-Cookie", serializedAccessTokenCookie);
	headers.append("Set-Cookie", serializedRefreshTokenCookie);
	return redirect("/upload", {
		headers,
	});
}
