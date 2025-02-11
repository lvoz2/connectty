import type { NextApiRequest, NextApiResponse } from "next";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { jwtBuilder } from "@/lib/utils.ts";
import { passkeyRp } from "@/lib/webauthn.ts";
import { getDB, queryDB } from "@/lib/db.ts";

const db = getDB();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "POST") {
		const clientOpts = req.body.options;
		const authJwt = Object.hasOwnProperty.call(req.cookies, process.env.COOKIE_NAME)
			? req.cookies[process.env.COOKIE_NAME]
			: "";
		const authJwtParts = await jwtBuilder.verify(authJwt);
		const username = authJwtParts.payload.usr;
		// Get user id and name
		const user = (
			await queryDB(
				db,
				"SELECT id, username FROM users WHERE username = ?;",
				[username]
			)
		)[0];
		// Get options from POST to /api/passkey/register/start
		const { payload } = await jwtBuilder.verify(
			req.body.jwt
		);
		// Remove JWT-specific properties, leaving the options
		delete payload.jti;
		delete payload.exp;
		const currentOptions: PublicKeyCredentialCreationOptionsJSON = payload;
		/*let verification;
		try {*/
		const verification = await verifyRegistrationResponse({
			response: clientOpts,
			expectedChallenge: currentOptions.challenge,
			expectedOrigin: passkeyRp.origin,
			expectedRPID: passkeyRp.id,
		});
		/*} catch (error) {
			console.error(error);
			return res.status(400).send({ error: error.message });
		}*/
		const verified = verification.verified;
		if (verified) {
			const { credential } =
				verification.registrationInfo;
			// Save authenticator (passkey) to DB
			const passkey = {
				credId: credential.id,
				publicKey: credential.publicKey,
				userId: user.id,
				counter: credential.counter,
				transports: credential.transports,
			};
			queryDB(
				db,
				"INSERT INTO passkeys (credential_id, public_key, user_id, counter, transports) VALUES (?, ?, ?, ?, ?);",
				[
					passkey.credId,
					passkey.publicKey,
					passkey.userId,
					passkey.counter,
					JSON.stringify(passkey.transports),
				]
			);
		}
		res.json({ status: verified });
	}
}
