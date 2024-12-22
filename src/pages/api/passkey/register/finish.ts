import type { NextApiRequest, NextApiResponse } from "next";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { passkeyRp, jwtBuilder } from "@/lib/utils.ts";
import { getDB, queryDB } from "@/lib/db.ts";

const db = getDB();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		const clientOpts = req.body.options;
		// Get user id and name
		const user = (await queryDB(db, "SELECT id, username FROM users WHERE username = ?;", [req.body.username]))[0];
		// Get options from POST to /api/passkey/register/start
		const { payload, protectedHeader } = await jwtBuilder.verify(req.body.jwt, options);
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
			const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
			// Save authenticator (passkey) to DB
			const passkey = {
				credId: credential.id,
				publicKey: credential.publicKey,
				userId: user.id,
				counter: credential.counter,
				transports: credential.transports
			}
			queryDB(db, "INSERT INTO passkeys (credential_id, public_key, user_id, counter, transports) VALUES (?, ?, ?, ?, ?);", [passkey.credId, passkey.publicKey, passkey.userId, passkey.counter, passkey.transports]);
		}
		res.json({status: verified});
	} else {

	}
}
