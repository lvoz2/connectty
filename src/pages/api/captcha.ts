import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		const secret_key = process.env.CAPTCHA_SECRET_KEY;
		const token = req.body.token;
		const url = "https://www.google.com/recaptcha/api/siteverify?secret=" + secret_key + "&response=" + token;
		const captcha = await fetch(url, {method: 'post'})
		const response = await captcha.json()
		res.json({ google_response: response });
	}
}
