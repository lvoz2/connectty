import type { NextApiRequest, NextApiResponse } from "next";
import { generateRegistrationOptions, type PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/server";
import { nanoid } from "nanoid";
import { passkeyRp, jwtBuilder } from "@/lib/utils.ts";
import { getDB, queryDB } from "@/lib/db.ts";

const db = getDB();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		const user = (await queryDB(db, "SELECT id, username FROM users WHERE username = ?;", [req.body.username]))[0];
		const passkeys = await queryDB(db, "SELECT * FROM passkeys WHERE user_id = ?;", [user.id]);
		const passkeyOptions: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
			rpName: passkeyRp.name,
			rpID: passkeyRp.id,
			userName: user.username,
			attestationType: "none",
			excludeCredentials: passkeys.map(passkey => ({
    			id: passkey.id
    		}))
		});
		const jti = nanoid();
		const jwt = await jwtBuilder.sign(passkeyOptions, {jwtID: jti, expirationTime: "5 mins"});
		res.json({jwt: jwt});
	} else {

	}
}
