import express from "express";
import sshProxy from "./sshProxy.js";
import auth from "./auth.js";
import helmet from "helmet";
import toobusy from "toobusy-js";
import fetch from "isomorphic-fetch";
import "dotenv/config";
const app = express();
app.set("trust proxy", 1);
app.use(express.static("static"));
app.use(express.json());
app.use(auth.session);
const nonAuthorisedEndpoints = ["/", "/login", "/captcha", "/auth", "/test-auth-status"];
app.use(helmet({
    contentSecurityPolicy: false,
    xContentTypeOptions: false,
    strictTransportSecurity: false,
    crossOriginResourcePolicy: false,
    referrerPolicy: false,
}));
app.use(function (req, res, next) {
    if (toobusy()) {
        // log if you see necessary
        res.status(503).send("Server Too Busy");
    }
    else {
        next();
    }
});
function isAuthenticated(req, res, next) {
    if (nonAuthorisedEndpoints.includes(req.path)) {
        next();
    }
    else if (req.session.user) {
        next();
    }
    else {
        next("route");
    }
}
app.use(isAuthenticated);
app.post("/echo", (req, res) => {
    res.json(req.body);
});
app.get("/hello", (req, res) => {
    res.send("Hello World");
});
app.post("/auth", async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    let statusText = "Failed";
    let validated = true;
    if (validated) {
        const unique = (await auth.isUniqueUsername(username));
        if (unique == 1) {
            const status = await auth.validateCredentials(username, password);
            if (status[0]) {
                statusText = "Success";
                req.session.regenerate((err) => {
                    if (err) {
                        next(err);
                    }
                    req.session.user = status[1];
                    req.session.save((err) => {
                        if (err) {
                            return next(err);
                        }
                    });
                });
            }
        }
    }
    //res.cookie(process.env.SESSION_NAME, req.session.id, req.session.cookie);
    res.json({ "status": statusText });
});
app.post("/register", async (req, res) => {
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
    res.json({ "status": status });
});
app.get("/test-auth-status", (req, res) => {
    try {
        console.log(req.session.user);
        if (req.session.user) {
            res.send("Success");
        }
        else {
            res.status(403).send("Failure");
        }
    }
    catch (err) {
        res.status(403).send("Failure");
    }
});
app.post("/captcha", (req, res) => {
    const secret_key = process.env.CAPTCHA_SECRET_KEY;
    const token = req.body.token;
    const url = "https://www.google.com/recaptcha/api/siteverify?secret=" + secret_key + "&response=" + token;
    fetch(url, { method: 'post' }).then(response => response.json()).then(google_response => res.json({ google_response })).catch(error => res.json({ error }));
});
app.get("/ssh/update", sshProxy.update);
app.get("/ssh/input", sshProxy.input);
app.use(function (req, res, next) {
    res.status(404);
    // respond with html page
    if (req.accepts("html")) {
        res.sendFile(import.meta.dirname + "/http_errors/404.html");
        return;
    }
    // respond with json
    if (req.accepts("json")) {
        res.json({ error: "Not found" });
        return;
    }
    // default to plain-text. send()
    res.type("txt").send("Not found");
});
app.listen(3000);
