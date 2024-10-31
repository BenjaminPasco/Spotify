import invariant from "tiny-invariant";
import { accessTokenCookie, refreshTokenCookie } from "./cookies";
import { getUser } from "./database";
import {
	generateAccessToken,
	generateRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
} from "./jwt";

export async function authenticate(
	request: Request,
): Promise<{ authenticated: boolean; headers?: Headers }> {
	try {
		const cookieHeader = request.headers.get("Cookie");
		const accessToken: string = await accessTokenCookie.parse(cookieHeader);
		const parsedAccessToken = verifyAccessToken({ token: accessToken });
		if (parsedAccessToken.error && !parsedAccessToken.expired) {
			return { authenticated: false };
		}
		if (parsedAccessToken.payload && !parsedAccessToken.expired) {
			invariant(
				parsedAccessToken.payload &&
					"id" in parsedAccessToken.payload &&
					typeof parsedAccessToken.payload.id === "number" &&
					parsedAccessToken.payload.exp,
				"access token invalid",
			);
			const userFromAccessTokenPayload = await getUser({
				id: String(parsedAccessToken.payload.id),
			});
			if (userFromAccessTokenPayload.error) {
				return { authenticated: false };
			}
			return { authenticated: true };
		}
		const refreshToken: string = await refreshTokenCookie.parse(cookieHeader);
		const parsedRefreshToken = verifyRefreshToken({ token: refreshToken });
		if (parsedRefreshToken.error) {
			return { authenticated: false };
		}
		invariant(
			parsedRefreshToken.payload &&
				"id" in parsedRefreshToken.payload &&
				typeof parsedRefreshToken.payload.id === "number" &&
				parsedRefreshToken.payload.exp,
			"access token invalid",
		);
		const userFromRefreshTokenPayload = await getUser({
			id: String(parsedRefreshToken.payload.id),
		});
		if (userFromRefreshTokenPayload.error) {
			return { authenticated: false };
		}
		if (parsedRefreshToken.expired) {
			return { authenticated: false };
		}
		const newAccessToken = generateAccessToken({
			id: userFromRefreshTokenPayload.user.id,
		});
		const newRefreshToken = generateRefreshToken({
			id: userFromRefreshTokenPayload.user.id,
		});

		const serializedAccessTokenCookie =
			await accessTokenCookie.serialize(newAccessToken);
		const serializedRefreshTokenCookie =
			await refreshTokenCookie.serialize(newRefreshToken);
		const headers = new Headers();
		headers.append("Set-Cookie", serializedAccessTokenCookie);
		headers.append("Set-Cookie", serializedRefreshTokenCookie);
		return { authenticated: true, headers };
	} catch (error) {
		return { authenticated: false };
	}
}
