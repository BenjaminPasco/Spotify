import jwt, { type JwtPayload } from "jsonwebtoken";
import invariant from "tiny-invariant";

const DEFAULT_ACCESS_TOKEN = "access_secret";
const DEFAULT_REFRESH_TOKEN = "refresh_secret";

export function generateAccessToken({ id }: { id: string }) {
	return jwt.sign(
		{ id },
		process.env.ACCESS_TOKEN_SECRET || DEFAULT_ACCESS_TOKEN,
		{ expiresIn: "15m" },
	);
}

export function generateRefreshToken({ id }: { id: string }) {
	return jwt.sign(
		{ id },
		process.env.REFRESH_TOKEN_SECRET || DEFAULT_REFRESH_TOKEN,
		{ expiresIn: "30d" },
	);
}

type VerifyTokenReturn =
	| { payload: JwtPayload; error: null; expired: boolean }
	| { payload: null; error: string; expired: boolean };

export function verifyAccessToken({
	token,
}: { token: string }): VerifyTokenReturn {
	try {
		const payload = jwt.verify(
			token,
			process.env.ACCESS_TOKEN_SECRET || DEFAULT_ACCESS_TOKEN,
		);
		invariant(typeof payload !== "string", "invalid payload of type string");
		return { payload, error: null, expired: false };
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			return { payload: null, error: String(error), expired: true };
		}
		if (error instanceof jwt.JsonWebTokenError) {
			return { payload: null, error: String(error), expired: false };
		}
		return { payload: null, error: String(error), expired: false };
	}
}

export function verifyRefreshToken({
	token,
}: { token: string }): VerifyTokenReturn {
	try {
		const payload = jwt.verify(
			token,
			process.env.REFRESH_TOKEN_SECRET || DEFAULT_REFRESH_TOKEN,
		);
		invariant(typeof payload !== "string", "invalid payload of type string");
		return { payload, error: null, expired: false };
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			return { payload: null, error: String(error), expired: true };
		}
		if (error instanceof jwt.JsonWebTokenError) {
			return { payload: null, error: String(error), expired: false };
		}
		return { payload: null, error: String(error), expired: false };
	}
}
