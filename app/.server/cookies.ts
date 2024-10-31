import { createCookie } from "@remix-run/node"; // or cloudflare/deno

export const accessTokenCookie = createCookie("accessToken", {
	httpOnly: true,
	maxAge: 60 * 15,
	path: "/",
});

export const refreshTokenCookie = createCookie("refreshToken", {
	httpOnly: true,
	maxAge: 60 * 60 * 24 * 30,
	path: "/",
});
