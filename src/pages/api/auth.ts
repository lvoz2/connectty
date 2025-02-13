"use server";

import { authenticate } from "@/lib/authenticate.ts";
import utils from "@/lib/utils.ts";
import type { NextApiRequest, NextApiResponse } from "next";

const defaultCookieOptions = utils.createCookieOptions();

const authService = authenticate(
	utils.endpoints,
	utils.timeout,
	defaultCookieOptions
);

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "POST") {
		if (authService) {
			const token = req.body.token;
			const secret_key = process.env.CAPTCHA_SECRET_KEY;
			const captcha = (await fetch(
				"https://challenges.cloudflare.com/turnstile/v0/siteverify",
				{
					method: "post",
					body: JSON.stringify({
						secret: secret_key,
						response: token,
					}),
				}
			).then((res) => {
				return res.json();
			})) as {
				success: boolean;
				challenge_ts: string;
				hostname: string;
				score: number;
				action: string;
			};
			if (captcha.score > 0.5) {
				const username = req.body.username;
				const password = req.body.password;
				const authStatus = await authService.authenticatePassword(
					username,
					password,
					utils.timeout
				);
				if (authStatus.status.status) {
					const cookieHeader = res.getHeader("Set-Cookie");
					console.log("header", cookieHeader);
					if (
						cookieHeader == undefined ||
						Array.isArray(cookieHeader)
					) {
						const cookies: string[] = cookieHeader || [];
						cookies.push(
							utils.cookieOptsToString(authStatus.cookieOptions)
						);
						res.setHeader("Set-Cookie", cookies);
					}
				}
				res.json({ success: authStatus.status.status });
			} else {
				res.json({ success: false });
			}
		}
	}
}
