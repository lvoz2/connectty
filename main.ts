import express from "express";
import sshProxy from "./sshProxy.ts";
import auth from "./auth.ts";
import helmet from "helmet";
import toobusy from "toobusy-js";

const app = express();
let test;

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

app.get("/test-auth", (req, res) => {
	res.send(auth.createUser("test", "password"));
	test = auth.validateCredentials("test", "password"));
	if (test) res.send(test);
});

app.get("/test-auth-update", (req, res) => {
	if (test) {
		res.send(test);
	} else {
		res.json({status: "not ready"});
	}
});

app.get("/ssh/update", sshProxy.update);
app.get("/ssh/input", sshProxy.input);

app.listen(3000);
