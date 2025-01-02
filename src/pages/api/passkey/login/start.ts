import type { NextApiRequest, NextApiResponse } from "next";
import { generateAuthenticationOptions, type PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/server";
import { nanoid } from "nanoid";
import { passkeyRp, jwtBuilder } from "@/lib/utils.ts";
import { getDB, queryDB } from "@/lib/db.ts";

const db = getDB();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		// Get user id and name
		const user = await queryDB(db, "SELECT id, username FROM users WHERE username = ?;", [req.body.username]);
		// Get already created passkeys
		if (user.length === 1 && user[0].hasOwnProperty("id")) {
			const passkeys = await queryDB(db, "SELECT * FROM passkeys WHERE user_id = ?;", [user[0].id]);
			const passkeyOptions: PublicKeyCredentialRequestOptionsJSON = await generateAuthenticationOptions({
				rpID: passkeyRp.id,
				allowCredentials: passkeys.map(passkey => ({
	    			id: passkey.credential_id
	    		}))
			});
			const jti = nanoid();
			const jwt = await jwtBuilder.sign(passkeyOptions, {jwtID: jti, expirationTime: "5 mins"});
			res.json({jwt: jwt});
		}
		res.json({});
	} else {

	}
}
