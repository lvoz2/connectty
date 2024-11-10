import path from "node:path";
import express from "express";
import sshProxy from "./sshProxy.ts";
import auth from "./auth.ts";
import helmet from "helmet";
import toobusy from "toobusy-js";
import fetch from "isomorphic-fetch";
import "dotenv/config";
import { Buffer } from "node:buffer";
import cookieParser from "cookie-parser";

const app = express();
const endpoints = {"none": ["/", "/login", "/captcha", "/auth"], "full": ["/test-auth-status"]};
const cookieOptions: express.CookieOptions = {
	domain: "lvoz2.duckdns.org",
	maxAge: 3600000,
	path: "/",
	httpOnly: true,
	sameSite: "strict",
	secure: true,
	signed: true
};

app.set("trust proxy", 1)

app.use(express.static("static"));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_KEY));
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

app.post("/echo", auth.createCheckAuthMiddleware(endpoints), (req: express.Request, res: express.Response) => {
	res.json(req.body);
});

app.get("/hello", auth.createCheckAuthMiddleware(endpoints), (req: express.Request, res: express.Response) => {
	res.send("Hello World")
});

app.post("/auth", auth.createCheckAuthMiddleware(endpoints), auth.createAuthRoute(cookieOptions));

app.post("/register", auth.createCheckAuthMiddleware(endpoints), auth.createRegisterRoute(cookieOptions));

app.get("/test-auth-status", auth.createCheckAuthMiddleware(endpoints), (req: express.Request, res: express.Response) => {
	res.json({"status":"Success"});
});

app.post("/captcha", auth.createCheckAuthMiddleware(endpoints), (req: express.Request, res: express.Response) => {
	const secret_key = process.env.CAPTCHA_SECRET_KEY;
	const token = req.body.token;
	const url = "https://www.google.com/recaptcha/api/siteverify?secret=" + secret_key + "&response=" + token;
	fetch(url, {method: 'post'}).then(response => response.json()).then(google_response => res.json({ google_response })).catch(error => res.json({ error }));
});

app.get("/ssh/update", auth.createCheckAuthMiddleware(endpoints), sshProxy.update);
app.get("/ssh/input", auth.createCheckAuthMiddleware(endpoints), sshProxy.input);

app.use(function(req: express.Request, res: express.Response, next) {
	res.status(404);
	if (req.accepts("html")) {
		res.sendFile(path.resolve("./http_errors/404.html"));
		return;
	}
	if (req.accepts("json")) {
		res.json({error: "Not found"});
		return;
	}
	res.type("txt").send("Not found");
});

app.listen(3000);
