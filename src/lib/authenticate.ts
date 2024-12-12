import argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";
import { nanoid } from "nanoid";
import JWT from "@/lib/jwt.ts";
import { cookieOptions, validateURLArray, jwtBuilder } from "@/lib/utils.ts";
import { getDB, queryDB } from "@/lib/db.ts";

"use server";

interface JWTAuthPayload extends JWT.JWTPayloadLong {
	lvl: string,
	urls?: string[],
}

interface RequiredEndpointAuth {
	none: string[],
	[key: string]: string[],
}

let instance: undefined | auth = undefined;

export function authenticate(endpointSchema: RequiredEndpointAuth = undefined, inactivityTimeout: number = undefined, cookieOptions: CookieSerializeOptions = undefined) {
	if (instance != undefined) {
		return instance;
	}
	if (cookieOptions != undefined && endpointSchema != undefined && inactivityTimeout != undefined) {
		return new Authenticate(endpointSchema, inactivityTimeout, cookieOptions);
	} else {
		throw new TypeError("All arguments must be provided to instantiate a new class");
	}
}

class Authenticate {
	constructor(endpointSchema: RequiredEndpointAuth, inactivityTimeout: number, cookieOptions: CookieSerializeOptions) {
		this.cookieOptions = cookieOptions;
		this.endpointSchema = endpointSchema;
		this.inactivityTimeout = inactivityTimeout;
		this.jwtBuilder = jwtBuilder;
	}

	async #isUniqueUsername(username: string): Promise<number> {
		let numUsers = 0;
		try {
			const result = await queryDB(getDB(), "SELECT username FROM users WHERE username = ?;", [username]);
			if (result && Array.isArray(result)) {
				numUsers = result.length;
			} else {
				console.log("Could not verify username uniqueness: query returned invalid results");
			}
		} catch (err) {
			throw err;
		} finally {
			// Idk
		}
		if (Number.isInteger(numUsers)) {
			return numUsers;
		}
		throw new TypeError("Result of SQL Query was not an Array");
	}

	async #createUser(username: string, password: string, maxPermsLevel: string): Promise<string[]> {
		let status = "";
		let uid = uuidv4();
		try {
			if ((await this.#isUniqueUsername(username)) == 0) {
				const hash = await argon2.hash(password, {
				    type: argon2.argon2id,
				    memoryCost: 64 * 1024,
				    timeCost: 2,
				    parallelism: 1,
				});
				const insert = await queryDB(getDB(), "INSERT INTO users (id, username, password, max_perms) VALUES (?, ?, ?, ?);", [uid, username, hash, maxPermsLevel]);
				const users = await queryDB(getDB(), "SELECT username FROM users WHERE username = ?;", [username]);
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

	async #validateCredentials(username: string, password: string): Promise<string[]> {
		let status = "Failed";
		let uid;
		let permsLevel = "none";
		try {
			const result = await queryDB(getDB(), "SELECT id, username, password, max_perms FROM users WHERE username = ?;", [username]);
			let passwordHash;
			if (Array.isArray(result)) {
				if (result.length == 1) {
					passwordHash = result[0]["password"];
					status = await argon2.verify(passwordHash, password) ? "Correct credentials" : "Incorrect credentials";
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

	async #createAuthJWT(expiresIn: string = "10m", lvl: string, urls?: string[]): Promise<string> {
		const jti = nanoid();
		let payload: JWTAuthPayload = {lvl: lvl};
		if (Array.isArray(urls)) {
			payload.urls = urls;
		}
		const jwt = this.jwtBuilder.sign(payload, {jwtid: jti, expiresIn: "10m", mutatePayload: true});
		if (payload.iat == undefined) {
			throw new TypeError("Error: JWT iat not set in payload");
		}
		return jwt;
	}

	async authenticate(username: string, password: string, expiresIn: string = "10m") {
		let status = {status: false, msg: "Failed"};
		let validated = true;
		let correct;
		let permsLevel = "none";
		if (validated) {
			const unique = (await this.#isUniqueUsername(username));
			if (unique == 1) {
				correct = await this.#validateCredentials(username, password);
			}
		}
		if (correct) {
			if (correct[0]) {
				status.msg = "Success";
				status.status = true;
				permsLevel = status[status.length - 1];
			}
		}
		const jwt = await this.#createAuthJWT(expiresIn, permsLevel);
		const options = cookieOptions(process.env.COOKIE_NAME, jwt, this.cookieOptions);
		return {
			status: status,
			cookieOptions: options
		};
	}

	async register(expiresIn: string = "10m", username: string, password: string, permsLevel: string = "basic", urls?: string[]) {
		urls = (Array.isArray(urls) && validateURLArray(urls)) ? urls : undefined;
		let validated = urls != undefined;
		let status = {status: false, msg: "Failed"};
		if (validated) {
			if ((await this.#isUniqueUsername(username)) == 0) {
				const sqlStatus = await this.#createUser(username, password, permsLevel);
				status.status = sqlStatus[0];
				status.msg = sqlStatus[0] ? "Success" : "Failed";
			}
		}
		const options = cookieOptions(process.env.COOKIE_NAME, createAuthJWT(expiresInpermsLevel, urls), this.cookieOptions);
		return {
			status: status,
			cookieOptions: options
		};
	}
}

export default { authenticate };
