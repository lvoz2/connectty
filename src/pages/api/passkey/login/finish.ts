import type { NextApiRequest, NextApiResponse } from "next";
import {
	verifyAuthenticationResponse,
	type PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/server";
import utils from "@/lib/utils.ts";
import { authenticate } from "@/lib/authenticate.ts";
import { getDB, queryDB } from "@/lib/db.ts";
import { passkeyRp } from "@/lib/webauthn.ts";

const db = getDB();
const authService = authenticate(
	utils.endpoints,
	utils.timeout,
	utils.createCookieOptions()
);

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "POST") {
		if (!utils.betterIsJWT(req.body.jwt)) {
			res.json({ status: false });
			throw new Error("A JWT-like string must be given to this API");
		} else {
			const clientOpts = req.body.options;
			// Get options from POST to /api/passkey/login/start
			const { payload } = await utils.jwtBuilder.verify(req.body.jwt);
			if (payload == undefined) {
				throw new Error(
					"No JWT supplied with options from login start request"
				);
			}
			// Remove JWT-specific properties, leaving the options
			delete payload.jti;
			delete payload.exp;
			// Re-cast options as format required by @simplewebauthn/server, as we have verified that it is safe to do so
			// It's safe because this is what we sent to the browser originally, thanks to JWTs
			const currentOptions: PublicKeyCredentialRequestOptionsJSON =
				payload as unknown as PublicKeyCredentialRequestOptionsJSON;
			// Get passkey that will be used for the final step
			const passkey = await queryDB(
				db,
				"SELECT * FROM passkeys WHERE credential_id = ?;",
				[clientOpts.id]
			);
			if (!passkey) {
				console.log("Could not find passkey " + clientOpts.id);
			} else if (passkey.length === 0) {
				console.log("Could not find passkey " + clientOpts.id);
			}
			/*let verification;
			try {*/
			const verification = await verifyAuthenticationResponse({
				response: clientOpts,
				expectedChallenge: currentOptions.challenge,
				expectedOrigin: passkeyRp.origin,
				expectedRPID: passkeyRp.id,
				credential: {
					id: passkey[0].id,
					publicKey: passkey[0].public_key,
					counter: passkey[0].counter,
					transports: passkey[0].transports,
				},
			});
			/*} catch (error) {
				console.error(error);
				return res.status(400).send({ error: error.message });
			}*/
			const newCounter = verification.authenticationInfo.newCounter;
			queryDB(
				db,
				"UPDATE passkeys SET counter = ? WHERE credential_id = ?;",
				[newCounter, passkey[0].credential_id]
			);
			const verified = verification.verified;
			if (verified) {
				const options = await authService.authenticatePasskey(
					passkey[0].user_id,
					utils.timeout
				);
				const cookieHeader = res.getHeader("Set-Cookie");
				if (Array.isArray(cookieHeader)) {
					const cookies: string[] = cookieHeader || [];
					cookies.push(utils.cookieOptsToString(options));
					res.setHeader("Set-Cookie", cookies);
				}
			}
			res.json({ success: verified });
		}
	}
}
