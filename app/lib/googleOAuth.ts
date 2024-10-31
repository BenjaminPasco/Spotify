import invariant from "tiny-invariant";

type GetTokensResponse = {
	access_token: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
	token_type: string;
	id_token: string;
};

export async function fetchTokens({
	code,
}: { code: string }): Promise<
	{ tokens: GetTokensResponse; error: null } | { tokens: null; error: string[] }
> {
	try {
		const client_id = process.env.GOOGLE_OAUTH_CLIENT_ID;
		const client_secret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
		invariant(typeof client_id === "string", "Invalid google oauth client id");
		invariant(
			typeof client_secret === "string",
			"Invalid google oauth client secret",
		);
		const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				code: code,
				client_id,
				client_secret,
				redirect_uri: "http://localhost:8001/auth/google/callback",
				grant_type: "authorization_code",
			}),
		});
		const tokens: GetTokensResponse = await tokenResponse.json();
		invariant(tokens !== null, "Nil tokens");
		invariant(
			tokens.access_token && typeof tokens.access_token === "string",
			"Invalid access token",
		);
		return { tokens: tokens, error: null };
	} catch (error) {
		return { tokens: null, error: ["fetchTokens", String(error)] };
	}
}

type GetUserInfosResponse = {
	id: string;
	email: string;
	verified_email: boolean;
	name: string;
	given_name: string;
	family_name: string;
	picture: string;
};

export async function fetchUserInfos({
	accessToken,
}: { accessToken: string }): Promise<
	| { userInfos: GetUserInfosResponse; error: null }
	| { userInfos: null; error: string[] }
> {
	try {
		const userInfoResponse = await fetch(
			"https://www.googleapis.com/oauth2/v2/userinfo",
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			},
		);
		const userInfos: GetUserInfosResponse = await userInfoResponse.json();
		invariant(
			userInfos.id && typeof userInfos.id === "string",
			"Invalid user infos",
		);
		return { userInfos, error: null };
	} catch (error) {
		return { userInfos: null, error: ["fetchUserInfos", String(error)] };
	}
}
