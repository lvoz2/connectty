import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { passkeyRp } from "@/lib/utils.ts";
import db from "@/lib/db.ts";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		res.json({status: "Success"});
	} else {

	}
}
