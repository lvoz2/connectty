import type { NextApiRequest, NextApiResponse } from "next";
import {
	generateRegistrationOptions,
	type PublicKeyCredentialCreationOptionsJSON,
} from "@simplewebauthn/server";
import { nanoid } from "nanoid";
import { jwtBuilder } from "@/lib/utils.ts";
import { getDB, queryDB } from "@/lib/db.ts";
import { passkeyRp } from "@/lib/webauthn.ts";

const db = getDB();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		const authJwt = req.cookies.hasOwnProperty(process.env.COOKIE_NAME)
			? req.cookies[process.env.COOKIE_NAME]
			: "";
		const { payload, protectedHeader } = await jwtBuilder.verify(authJwt);
		const username = payload.usr;
		// Get user id and name
		const user = (
			await queryDB(
				db,
				"SELECT id, username FROM users WHERE username = ?;",
				[username]
			)
		)[0];
		// Get already created passkeys
		const passkeys = await queryDB(
			db,
			"SELECT * FROM passkeys WHERE user_id = ?;",
			[user.id]
		);
		let excludeCredentials;
		console.log(passkeys);
		if (passkeys.length > 0) {
			excludeCredentials = passkeys.map((passkey) => ({
				id: passkey.credential_id,
			}));
		} else {
			excludeCredentials = [];
		}
		console.log(excludeCredentials);
		const passkeyOptions: PublicKeyCredentialCreationOptionsJSON =
			await generateRegistrationOptions({
				rpName: passkeyRp.name,
				rpID: passkeyRp.id,
				userName: username,
				attestationType: "none",
				excludeCredentials: excludeCredentials,
			});
		const jti = nanoid();
		const jwt = await jwtBuilder.sign(passkeyOptions, {
			jwtID: jti,
			expirationTime: "5 mins",
		});
		res.json({ jwt: jwt });
	} else {
	}
}
