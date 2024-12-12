import { authenticate } from "@/lib/authenticate.ts";
import utils from "@/lib/utils.ts";
import type { NextApiRequest, NextApiResponse } from "next";

const authService = authenticate(utils.endpoints, utils.timeout, utils.cookieOptions);

"use server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (authService) {
		if (req.method === "POST") {
			const username = req.body.username;
			const password = req.body.password;
			const authStatus = await authService.authenticate(username, password, utils.timeout);
			if (authStatus.status.status) {
				let cookies = res.getHeader("Set-Cookie") || [];
				cookies.push(utils.cookieOptsToString(authStatus.cookieOptions));
				res.setHeader("Set-Cookie", cookies);
			}
			res.json({status: authStatus.status.status});
		}
	}
}
