import express from "express";
import sshProxy from "./sshProxy.ts";
import auth from "./auth.ts";
import helmet from "helmet";
import toobusy from "toobusy-js";
import fetch from "isomorphic-fetch";
import "dotenv/config";

const app = express();

app.use(express.static("static"));
app.use(express.json());

app.use(helmet({
	contentSecurityPolicy: false,
	xContentTypeOptions: false,
	strictTransportSecurity: false,
	crossOriginResourcePolicy: false,
	referrerPolicy: false,
}));
app.use(function(req, res, next) {
	if (toobusy()) {
		// log if you see necessary
		res.status(503).send("Server Too Busy");
	} else {
		next();
	}
});

app.post("/echo", (req, res) => {
	res.json(req.body);
});

app.get("/hello", (req, res) => {
	res.send("Hello World")
});

app.post("/auth", async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	let validated = false;
	// validate
	if (validated) {
		if ((await auth.isUniqueUsername(username)) == 1) {
			/*
			const success = await auth.validateCredentials(username, password);
			if (success) {
				res.json(await )
			}
			*/
		}
	}
});

app.post("/register", async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	let validated = false;
	// validate
	if (validated) {
		if ((await auth.isUniqueUsername(username)) == 1) {
			//auth.createUser(username, password);
		}
	}
});

app.post("/captcha", (req, res) => {
	const secret_key = process.env.CAPTCHA_SECRET_KEY;
	const token = req.body.token;
	console.log(`${token} ${secret_key}`);
	const url = "https://www.google.com/recaptcha/api/siteverify?secret=" + secret_key + "&response=" + token;
	fetch(url, {method: 'post'}).then(response => response.json()).then(google_response => res.json({ google_response })).catch(error => res.json({ error }));
});

app.get("/ssh/update", sshProxy.update);
app.get("/ssh/input", sshProxy.input);

app.listen(3000);
