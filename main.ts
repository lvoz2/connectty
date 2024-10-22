import express from "express";
import sshProxy from "./sshProxy.ts";
import auth from "./auth.ts";
import helmet from "helmet";
import toobusy from "toobusy-js";

const app = express();

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
	auth.createUser("test", "password");
	res.send(auth.validateCredentials("test", "password"));
});

app.get("/ssh/update", sshProxy.update);
app.get("/ssh/input", sshProxy.input);

app.listen(3000);
