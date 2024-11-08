import path from "node:path";
import express from "express";
import sshProxy from "./sshProxy.ts";
import auth from "./auth.ts";
import helmet from "helmet";
import toobusy from "toobusy-js";
import fetch from "isomorphic-fetch";
import "dotenv/config";
import { Buffer } from "node:buffer";

const app = express();

app.set("trust proxy", 1)

app.use(express.static("static"));
app.use(express.json());

const nonAuthorisedEndpoints = ["/", "/login", "/captcha", "/auth", "/test-auth-status"];

app.use(helmet({
	contentSecurityPolicy: false,
	xContentTypeOptions: false,
	strictTransportSecurity: false,
	crossOriginResourcePolicy: false,
	referrerPolicy: false,
}));

app.use(function(req: express.Request, res: express.Response, next) {
	if (toobusy()) {
		// log if you see necessary
		res.status(503).send("Server Too Busy");
	} else {
		next();
	}
});

app.use(isAuthenticated);

app.post("/echo", (req: express.Request, res: express.Response) => {
	res.json(req.body);
});

app.get("/hello", (req: express.Request, res: express.Response) => {
	res.send("Hello World")
});

app.post("/auth", });

app.post("/register", async (req: express.Request, res: express.Response) => {
	const username = req.body.username;
	const password = req.body.password;
	let validated = true;
	let status = "Failed";
	// validate
	if (validated) {
		if ((await auth.isUniqueUsername(username)) == 0) {
			const sqlStatus = await auth.createUser(username, password);
			status = sqlStatus[0] ? "Successful Creation of User" : "Failed";
		}
	}
	res.json({"status": status});
});

app.get("/test-auth-status", (req: express.Request, res: express.Response) => {
	try {
		console.log(req.session);
		console.log(req.session.user);
		if (req.session.user) {
			res.send("Success");
		} else {
			res.status(403).send("Failure");
		}
	} catch (err) {
		res.status(403).send("Failure, no session");
	}
});

app.post("/captcha", (req: express.Request, res: express.Response) => {
	const secret_key = process.env.CAPTCHA_SECRET_KEY;
	const token = req.body.token;
	const url = "https://www.google.com/recaptcha/api/siteverify?secret=" + secret_key + "&response=" + token;
	fetch(url, {method: 'post'}).then(response => response.json()).then(google_response => res.json({ google_response })).catch(error => res.json({ error }));
});

app.get("/ssh/update", sshProxy.update);
app.get("/ssh/input", sshProxy.input);

app.use(function(req: express.Request, res: express.Response, next) {
	res.status(404);
	// respond with html page
	if (req.accepts("html")) {
		res.sendFile(path.resolve("./http_errors/404.html"));
		return;
	}

	// respond with json
	if (req.accepts("json")) {
		res.json({error: "Not found"});
		return;
	}

	// default to plain-text. send()
	res.type("txt").send("Not found");
});

app.listen(3000);
