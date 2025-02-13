import type { NextApiRequest, NextApiResponse } from "next";
import {
	verifyRegistrationResponse,
	type PublicKeyCredentialCreationOptionsJSON,
} from "@simplewebauthn/server";
import { jwtBuilder } from "@/lib/utils.ts";
import { passkeyRp } from "@/lib/webauthn.ts";
import { getDB, queryDB } from "@/lib/db.ts";
import { type JWTPayload } from "@/lib/jwt.ts";

const db = getDB();

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "POST") {
		const sessionCookie = Object.hasOwnProperty.call(
			req.cookies,
			process.env.COOKIE_NAME
		)
			? req.cookies[process.env.COOKIE_NAME]
			: undefined;
		if (typeof sessionCookie !== "string") {
			throw new Error("No session cookie found");
		}
		const clientOpts = req.body.options;
		// Done type-checking, so safe to re cast as a string
		const authJwt: string = sessionCookie;
		const authPayload: JWTPayload | undefined = (
			await jwtBuilder.verify(authJwt)
		).payload;
		// Check if a username property exists before getting it
		if (authPayload == undefined) {
			throw new Error("No authorisation JWT provided");
		}
		if (!Object.hasOwnProperty.call(authPayload, "usr")) {
			throw new Error(
				"Cannot create credential for undefined or not signed in user"
			);
		}
		const username: string = authPayload.usr as string;
		// Get user id and name
		const user = (
			await queryDB(
				db,
				"SELECT id, username FROM users WHERE username = ?;",
				[username]
			)
		)[0];
		// Get options from POST to /api/passkey/register/start
		const jwtPayload: JWTPayload | undefined = (
			await jwtBuilder.verify(req.body.jwt)
		).payload;
		if (jwtPayload == undefined) {
			throw new Error(
				"No JWT supplied with options from registration start request"
			);
		}
		// Remove JWT-specific properties, leaving the options
		delete jwtPayload.jti;
		delete jwtPayload.exp;
		// Re-cast options in the format required by @simplewebauthn/server, making sure the minimum properties exist first
		// Because there is no overlap between JWTPayload and PublicKeyCredentialCreationOptionsJSON, we cast as unknown then
		// cast as PublicKeyCredentialCreationOptionsJSON
		if (
			!(
				Object.hasOwnProperty.call(jwtPayload, "rp") &&
				Object.hasOwnProperty.call(jwtPayload, "user") &&
				Object.hasOwnProperty.call(jwtPayload, "challenge") &&
				Object.hasOwnProperty.call(jwtPayload, "pubKeyCredParams")
			)
		) {
			throw new Error(
				"Options given by registration start are malformed"
			);
		}
		const currentOptions: PublicKeyCredentialCreationOptionsJSON =
			jwtPayload as unknown as PublicKeyCredentialCreationOptionsJSON;
		const verification = await verifyRegistrationResponse({
			response: clientOpts,
			expectedChallenge: currentOptions.challenge,
			expectedOrigin: passkeyRp.origin,
			expectedRPID: passkeyRp.id,
		});
		const verified = verification.verified;
		if (
			verified &&
			verification.registrationInfo != undefined &&
			Object.hasOwnProperty.call(
				verification.registrationInfo,
				"credential"
			)
		) {
			const { credential } = verification.registrationInfo;
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
