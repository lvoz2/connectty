import { authenticate } from "@/lib/authenticate.ts";
import utils from "@/lib/utils.ts";
import type { NextApiRequest, NextApiResponse } from "next";

const authService = authenticate(utils.endpoints, utils.timeout, utils.cookieOptions);

"use server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		if (authService) {
			const token = req.body.token;
			const secret_key = process.env.CAPTCHA_SECRET_KEY;
			const url = "https://www.google.com/recaptcha/api/siteverify?secret=" + secret_key + "&response=" + token;
			const captcha = await fetch(url, {method: 'post'}).then(res => { return res.json(); });
			if (captcha.score > 0.5) {
				const username = req.body.username;
				const password = req.body.password;
				const authStatus = await authService.authenticate(username, password, utils.timeout);
				if (authStatus.status.status) {
					let cookies = res.getHeader("Set-Cookie") || [];
					cookies.push(utils.cookieOptsToString(authStatus.cookieOptions));
					res.setHeader("Set-Cookie", cookies);
				}
				res.json({success: authStatus.status.status});
			} else {
				res.json({success: false});
			}
		}
	}
}
