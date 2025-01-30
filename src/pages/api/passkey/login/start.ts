import type { NextApiRequest, NextApiResponse } from "next";
import { createOptions } from "@/lib/webauthn.ts";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "GET") {
		res.json({ jwt: await createOptions() });
	} else {
	}
}
