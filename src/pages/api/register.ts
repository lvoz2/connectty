import { authenticate } from "@/lib/authenticate.ts";
import argon2 from "argon2";
import utils from "@/lib/utils.ts";
import type { NextApiRequest, NextApiResponse } from "next";

const authService = authenticate(utils.endpoints, utils.timeout, utils.cookieOptions);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		if (authService) {
			const username = req.body.username;
			const password = req.body.password;
			const permsLevel = req.body.permsLevel || "basic";
			const urls = req.body.urls;
			const authStatus = authService.register(username, password, permsLevel, urls);
			// Uncomment when needing account registration from an unauthorised user
			/*if (authStatus.status.status) {
				let cookies = res.getHeader("Set-Cookie") || [];
				cookies.push(utils.cookieOptsToString(authStatus.options));
				res.setHeader("Set-Cookie", cookies);
			}*/
			res.json({status: authStatus.status.status});
		}
	}
}
