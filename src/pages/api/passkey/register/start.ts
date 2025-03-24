import type { NextApiRequest, NextApiResponse } from "next";
import {
	generateRegistrationOptions,
	type PublicKeyCredentialCreationOptionsJSON,
	type Base64URLString,
	type AuthenticatorTransportFuture,
} from "@simplewebauthn/server";
import { nanoid } from "nanoid";
import { jwtBuilder } from "@/lib/utils.ts";
import { getDB, queryDB } from "@/lib/db.ts";
import { passkeyRp } from "@/lib/webauthn.ts";
import { type JWTPayloadLong, type JWTPayload } from "@/lib/jwt.ts";

const db = getDB();

interface PKCredCreationOptionsJSON
	extends PublicKeyCredentialCreationOptionsJSON,
		JWTPayloadLong {
	[propName: string]: unknown;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		const sessionCookie = Object.hasOwnProperty.call(
			req.cookies,
			process.env.COOKIE_NAME
		)
			? req.cookies[process.env.COOKIE_NAME]
			: undefined;
		if (typeof sessionCookie !== "string") {
			throw new Error("No session cookie found");
		}
		// Done type-checking, so safe to re cast as a string
		const authJwt: string = sessionCookie;
		const payload: JWTPayload | undefined = (
			await jwtBuilder.verify(authJwt)
		).payload;
		if (payload == undefined) {
			throw new Error(
				"Cannot create credential for undefined or not signed in user"
			);
		}
		if (
			!(
				Object.hasOwnProperty.call(payload, "usr") &&
				typeof payload.usr == "string"
			)
		) {
			throw new Error(
				"Cannot create credential for undefined or not signed in user"
			);
		}
		const username: string = payload.usr;
		// Get user id and name
		const user: { id: string; username: string } = (
			await queryDB(
				db,
				"SELECT id, username FROM users WHERE username = ?;",
				[username]
			)
		)[0];
		// Get already created passkeys
		const passkeys: {
			credential_id: string;
			public_key: string;
			counter: number;
			transports: string;
		}[] = await queryDB(db, "SELECT * FROM passkeys WHERE user_id = ?;", [
			user.id,
		]);
		let excludeCredentials: {
			id: Base64URLString;
			transports?: AuthenticatorTransportFuture[];
		}[];
		if (passkeys.length > 0) {
			excludeCredentials = passkeys.map((passkey) => ({
				id: passkey.credential_id,
			}));
		} else {
			excludeCredentials = [];
		}
		const passkeyOptions: PKCredCreationOptionsJSON =
			(await generateRegistrationOptions({
				rpName: passkeyRp.name,
				rpID: passkeyRp.id,
				userName: username,
				attestationType: "none",
				excludeCredentials: excludeCredentials,
			})) as PKCredCreationOptionsJSON;
		const jti = nanoid();
		const jwt = await jwtBuilder.sign(passkeyOptions, {
			jwtID: jti,
			expirationTime: "5 mins",
		});
		res.json({ jwt: jwt });
	}
}
