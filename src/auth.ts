import argon2 from "argon2";
import sqlite3 from "sqlite3";
import { open, Database, Statement } from "sqlite";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";
import express from "express";
import JWT from "jsonwebtoken";
import { nanoid } from "nanoid";
import validator from "validator";

interface JWTAuthPayload extends JWT.JwtPayload {
	lvl: string;
	urls?: string[];
}

interface RequiredEndpointAuth {
	none: string[];
	[key: string]: string[];
}

let db: undefined | Database;

(async () => {
	db = await open({
		filename: "./" + process.env.DB_NAME,
		driver: sqlite3.Database,
		mode: sqlite3.OPEN_READWRITE
	});
})();

async function isUniqueUsername(username: string): Promise<number> {
	let numUsers;
	try {
		const result = await queryDB(db, "SELECT username FROM users WHERE username = ?;", [username]);
		if (result) {
			numUsers = result.length;
		} else {
			console.log("Could not verify username uniqueness: query returned undefined");
		}
	} catch (err) {
		throw err;
	} finally {
		// Idk
	}
	if (numUsers) {
		return numUsers;
	}
	throw new TypeError("Result of SQL Query was not an Array");
}

async function queryDB(db: undefined | Database, query: string, params: string[]) {
	if (db) {
		const stmt: Statement = await db.prepare(query);
		stmt.bind(params);
		const result = await stmt.all();
		if (Array.isArray(result)) {
			return result;
		}
		console.log("Error - Malformed Response");
		return [];
	} else {
		console.log("DB not ready");
		return [];
	}
}

async function createUser(username: string, password: string, maxPermsLevel: string): Promise<string[]> {
	let status = "";
	let uid = uuidv4();
	try {
		if ((await isUniqueUsername(username)) == 0) {
			const hash = await argon2.hash(password, {
			    type: argon2.argon2id,
			    memoryCost: 64 * 1024,
			    timeCost: 2,
			    parallelism: 1,
			});
			const insert = await queryDB(db, "INSERT INTO users (id, username, password, max_perms) VALUES (?, ?, ?, ?);", [uid, username, hash, maxPermsLevel]);
			const users = await queryDB(db, "SELECT username FROM users WHERE username = ?;", [username]);
			status = users.length == 1 ? "Success" : "";
		} else {
			status = "Username already in use";
		}
	} catch (err) {
		//err.toString();
		throw err;
	} finally {
		// Idk
	}
	return [status, uid];
}

async function validateCredentials(username: string, password: string): Promise<string[]> {
	let status = "Failed";
	let uid;
	let permsLevel = "none";
	try {
		const result = await queryDB(db, "SELECT id, username, password, max_perms FROM users WHERE username = ?;", [username]);
		let password_hash;
		if (Array.isArray(result)) {
			if (result.length == 1) {
				password_hash = result[0]["password"];
				status = await argon2.verify(password_hash, password) ? "Correct credentials" : "Incorrect credentials";
				if (status === "Correct credentials") {
					permsLevel = result[0]["max_perms"];
					uid = result[0]["id"];
				}
			}
		}
	} catch (err) {
		throw err;
	} finally {
		// Idk
	}
	if (uid) {
		return [status, uid, permsLevel];
	}
	return [status, permsLevel];
}

export function createAuthRoute(cookieOptions: express.CookieOptions) {
	return async function authenticate(req: express.Request, res: express.Response) {
		const username = req.body.username;
		const password = req.body.password;
		let statusText = "Failed";
		let validated = true;
		let status;
		let permsLevel = "none";
		if (validated) {
			const unique = (await isUniqueUsername(username));
			if (unique == 1) {
				status = await validateCredentials(username, password);
			}
		}
		if (status) {
			if (status[0]) {
				statusText = "Success";
				permsLevel = status[status.length - 1];
			}
		}
		const jwt = await createAuthJWT(permsLevel);
		res.cookie(process.env.COOKIE_NAME, jwt, cookieOptions);
		res.json({"status": statusText});
	}
}

async function checkAccess(jwt: string, resource: string, timeout: number, options?: JWT.VerifyOptions & { endpoints?: RequiredEndpointAuth }): Promise<boolean> {
	const JWTKey = process.env.JWT_KEY;
	try {
		const isJWT = validator.isJWT(jwt);
		if (!isJWT) {
			return false;
		}
	} catch (err) {
		console.log(err);
		return false;
	}
	try {
		let payload;
		const payloadSection: JWT.JwtPayload | string = JWT.verify(jwt, JWTKey, options);
		if (typeof payloadSection === "string") {
			payload = JSON.parse(payloadSection);
		} else {
			payload = payloadSection;
		}
		if ("lvl" in payload) {
			let canAccess = false;
			if (options) {
				if ("endpoints" in options && options.endpoints != undefined) {
					canAccess = options.endpoints[payload.lvl].includes(resource);
				}
			}
			if (!canAccess && "urls" in payload && Array.isArray(payload.urls)) {
				canAccess = validateURLArray(payload.urls) && payload.urls.includes(resource);
			}
			if (canAccess === true) {
				const dbEntry = await queryDB(db, "SELECT jti, last_used FROM jwt WHERE jti = ?", [payload.jti]);
				const xMinsAgo = Math.floor(Date.now() / 1000) - (timeout * 60);
				if ((dbEntry.length !== 1) || (dbEntry.length == 1 && dbEntry[0]["last_used"] <= xMinsAgo)) {
					canAccess = false;
				}
			}
			return canAccess;
		} else {
			return false;
		}
	} catch (err) {
		if (err instanceof JWT.JsonWebTokenError) {
			let extraInfo;
			if (err instanceof JWT.TokenExpiredError) {
				let payload;
				const payloadSection: null | JWT.JwtPayload | string = JWT.decode(jwt, options);
				if (payloadSection != null) {
					if (typeof payloadSection === "string") {
						payload = JSON.parse(payloadSection);
					} else {
						payload = payloadSection;
					}
					if ("lvl" in payload) {
						await queryDB(db, "DELETE FROM jwt WHERE jti = ?;", [payload.jti]);
					}
				}
				return false;
			} else if (err instanceof JWT.NotBeforeError) {
				extraInfo = ". Date: " + err.date;
			}
			console.log(err.name + ": " + err.message + (extraInfo != undefined ? extraInfo : ""));
			return false;
		} else {
			throw err;
			return false;
		}
	}
}

function createJWT(payload: JWT.JwtPayload, options?: JWT.SignOptions): string {
	const JWTKey = process.env.JWT_KEY;
	const token = JWT.sign(payload, JWTKey, options);
	return token;
}

async function createAuthJWT(lvl: string, urls?: string[]): Promise<string> {
	const jti = nanoid();
	let payload: JWTAuthPayload = {lvl: lvl};
	if (Array.isArray(urls)) {
		payload.urls = urls;
	}
	const jwt = createJWT(payload, {jwtid: jti, expiresIn: "3h", mutatePayload: true});
	if (payload.iat == undefined) {
		throw new TypeError("Error: JWT iat not set in payload");
	}
	await queryDB(db, "INSERT INTO jwt (jti, last_used) VALUES (?, ?);", [jti, payload.iat.toString()]);
	const numJWTs = (await queryDB(db, "SELECT * FROM jwt WHERE jti = ?;", [jti])).length;
	if (numJWTs === 1) {
		return jwt;
	}
	throw new Error("NanoID Collision Found");
}

function validateURLArray(urls: string[]): boolean {
	return urls.reduce((acc, e) => {
		return acc && validator.isURL(e, {
			protocols: ["http","https"],
			require_tld: false,
			require_host: false,
			allow_underscores: true,
			allow_protocol_relative_urls: true,
			allow_query_components: false,
		});
	}, true);
}

export function createRegisterRoute(cookieOptions: express.CookieOptions) {
	return async function register(req: express.Request, res: express.Response) {
		const username = req.body.username;
		const password = req.body.password;
		const permsLevel = req.body.permsLevel || "basic";
		const urls = (Array.isArray(req.body.urls) && validateURLArray(req.body.urls)) ? req.body.urls : null;
		let validated = urls != undefined;
		let status = "Failed";
		// validate
		if (validated) {
			if ((await isUniqueUsername(username)) == 0) {
				const sqlStatus = await createUser(username, password, permsLevel);
				status = sqlStatus[0] ? "Successful Creation of User" : "Failed";
			}
		}
		res.json({"status": status});
		res.cookie(process.env.COOKIE_NAME, createAuthJWT(permsLevel, urls), cookieOptions);
	}
}

export function createRemoveStaleJWTsMiddleware(timeout: number) {
	return function (req: express.Request, res: express.Response, next: express.NextFunction) {
		const xMinsAgo = Math.floor(Date.now() / 1000) - (timeout * 60);
		queryDB(db, "DELETE FROM jwt WHERE last_used < ?;", [xMinsAgo.toString()])
		next()
	}
}

export function createCheckAuthMiddleware(endpoints: RequiredEndpointAuth, timeout: number) {
	return async function(req: express.Request, res: express.Response, next: express.NextFunction) {
		const jwt: string | false = req.signedCookies[process.env.COOKIE_NAME];
		if (endpoints.none.includes(req.path)) {
			next();
		} else if (jwt !== false && await checkAccess(jwt, req.path, timeout, {"endpoints": endpoints})) {
			next()
		} else {
			next("route");
		}
	}
}

export default { createAuthRoute, createCheckAuthMiddleware, createRegisterRoute, createRemoveStaleJWTsMiddleware };
