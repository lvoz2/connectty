import path from "node:path";
import express from "express";
import sshProxy from "./sshProxy.js";
import auth from "./auth.js";
import helmet from "helmet";
import toobusy from "toobusy-js";
import fetch from "isomorphic-fetch";
import "dotenv/config";
import cookieParser from "cookie-parser";
var app = express();
var endpoints = {
  "none": ["/", "/login", "/captcha", "/auth"],
  "full": ["/test-auth-status"]
};
var cookieOptions = {
  domain: "lvoz2.duckdns.org",
  maxAge: 3600000,
  path: "/",
  httpOnly: true,
  sameSite: "strict",
  secure: true,
  signed: true
};
app.set("trust proxy", 1);
app.use(express["static"]("static"));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_KEY));
app.use(helmet({
  contentSecurityPolicy: false,
  xContentTypeOptions: false,
  strictTransportSecurity: false,
  crossOriginResourcePolicy: false,
  referrerPolicy: false
}));
app.use(function (req, res, next) {
  if (toobusy()) {
    // log if you see necessary
    res.status(503).send("Server Too Busy");
  } else {
    next();
  }
});
app.post("/echo", auth.createCheckAuthMiddleware(endpoints), function (req, res) {
  res.json(req.body);
});
app.get("/hello", auth.createCheckAuthMiddleware(endpoints), function (req, res) {
  res.send("Hello World");
});
app.post("/auth", auth.createCheckAuthMiddleware(endpoints), auth.createAuthRoute(cookieOptions));
app.post("/register", auth.createCheckAuthMiddleware(endpoints), auth.createRegisterRoute(cookieOptions));
app.get("/test-auth-status", auth.createCheckAuthMiddleware(endpoints), function (req, res) {
  res.json({
    "status": "Success"
  });
});
app.post("/captcha", auth.createCheckAuthMiddleware(endpoints), function (req, res) {
  var secret_key = process.env.CAPTCHA_SECRET_KEY;
  var token = req.body.token;
  var url = "https://www.google.com/recaptcha/api/siteverify?secret=" + secret_key + "&response=" + token;
  fetch(url, {
    method: 'post'
  }).then(function (response) {
    return response.json();
  }).then(function (google_response) {
    return res.json({
      google_response: google_response
    });
  })["catch"](function (error) {
    return res.json({
      error: error
    });
  });
});
app.get("/ssh/update", auth.createCheckAuthMiddleware(endpoints), sshProxy.update);
app.get("/ssh/input", auth.createCheckAuthMiddleware(endpoints), sshProxy.input);
app.use(function (req, res, next) {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.resolve("./http_errors/404.html"));
    return;
  }
  if (req.accepts("json")) {
    res.json({
      error: "Not found"
    });
    return;
  }
  res.type("txt").send("Not found");
});
app.listen(3000);