import argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";
import { nanoid } from "nanoid";
import JWT from "@/lib/jwt.ts";
import { convertCookieOptions, validateURLArray, jwtBuilder } from "@/lib/utils.ts";
import { getDB, queryDB } from "@/lib/db.ts";

interface JWTAuthPayload extends JWT.JWTPayloadLong {
	usr: string;
	lvl: string;
	urls?: string[];
}

interface RequiredEndpointAuth {
	none: string[];
	[key: string]: string[];
}

const instance: undefined | auth = undefined;

export function authenticate(
	endpointSchema: RequiredEndpointAuth = undefined,
	inactivityTimeout: number = undefined,
	cookieOptions: CookieSerializeOptions = undefined
) {
	if (instance != undefined) {
		return instance;
	}
	if (
		cookieOptions != undefined &&
		endpointSchema != undefined &&
		inactivityTimeout != undefined
	) {
		return new Authenticate(
			endpointSchema,
			inactivityTimeout,
			cookieOptions
		);
	} else {
		throw new TypeError(
			"All arguments must be provided to instantiate a new class"
		);
	}
}

class Authenticate {
	constructor(
		endpointSchema: RequiredEndpointAuth,
		inactivityTimeout: number,
		cookieOptions: CookieSerializeOptions
	) {
		this.cookieOptions = cookieOptions;
		this.endpointSchema = endpointSchema;
		this.inactivityTimeout = inactivityTimeout;
		this.jwtBuilder = jwtBuilder;
	}

	async #isUniqueUsername(username: string): Promise<number> {
		let numUsers = 0;
		const result = await queryDB(
			getDB(),
			"SELECT username FROM users WHERE username = ?;",
			[username]
		);
		if (result && Array.isArray(result)) {
			numUsers = result.length;
		} else {
			console.log(
				"Could not verify username uniqueness: query returned invalid results"
			);
		}
		if (Number.isInteger(numUsers)) {
			return numUsers;
		}
		throw new TypeError("Result of SQL Query was not an Array");
	}

	async #createUser(
		username: string,
		password: string,
		maxPermsLevel: string
	): Promise<string[]> {
		let status = "";
		const uid = uuidv4();
		if ((await this.#isUniqueUsername(username)) == 0) {
			const hash = await argon2.hash(password, {
				type: argon2.argon2id,
				memoryCost: 64 * 1024,
				timeCost: 2,
				parallelism: 1,
			});
			await queryDB(
				getDB(),
				"INSERT INTO users (id, username, password, max_perms) VALUES (?, ?, ?, ?);",
				[uid, username, hash, maxPermsLevel]
			);
			const users = await queryDB(
				getDB(),
				"SELECT username FROM users WHERE username = ?;",
				[username]
			);
			status = users.length == 1 ? "Success" : "";
		} else {
			status = "Username already in use";
		}
		return [status, uid];
	}

	async #validateCredentials(
		username: string,
		password: string
	): Promise<string[]> {
		let status = "Failed";
		let uid;
		let permsLevel = "none";
		const result = await queryDB(
			getDB(),
			"SELECT id, username, password, max_perms FROM users WHERE username = ?;",
			[username]
		);
		let passwordHash;
		if (Array.isArray(result)) {
			if (result.length == 1) {
				passwordHash = result[0]["password"];
				status = (await argon2.verify(passwordHash, password))
					? "Correct credentials"
					: "Incorrect credentials";
				if (status === "Correct credentials") {
					permsLevel = result[0]["max_perms"];
					uid = result[0]["id"];
				}
			} else {
				// TEST_HASH is an argon2 hash used to ensure the timing of authentication is constant-ish,
				// to mitigate a side-channel attack that leaks valid usernames. See the comment before
				// this.authenticate() for more info
				await argon2.verify(process.env.TEST_HASH, password);
			}
		}
		if (uid) {
			return [status, uid, permsLevel];
		}
		return [status, permsLevel];
	}

	async #createAuthJWT(
		username: string,
		expiresIn: string = "10 mins",
		lvl: string,
		urls?: string[]
	): Promise<string> {
		const jti = nanoid();
		const payload: JWTAuthPayload = { usr: username, lvl: lvl };
		if (Array.isArray(urls)) {
			payload.urls = urls;
		}
		const jwt = await this.jwtBuilder.sign(payload, {
			jwtID: jti,
			expirationTime: expiresIn,
		});
		return jwt;
	}

	/*
	 * This function has a side channel attack that leaks valid usernames
	 * It uses timings of the responses, which are 3-7x longer if the
	 * username does exist compared to it not existing.
	 * User exists: 600-700ms, User does not exist: 100-200ms
	 * The mitigation will be to go through all the authentication steps,
	 * with fake details, and set response to always fail when using fake
	 * data.
	 */
	async authenticatePassword(
		username: string,
		password: string,
		expiresIn: string = "10 mins"
	) {
		const status = { status: false, msg: "Failed" };
		const validated = true;
		let correct;
		let permsLevel = "none";
		if (validated) {
			const unique = await this.#isUniqueUsername(username);
			if (unique == 1) {
				correct = await this.#validateCredentials(username, password);
			} else {
				await this.#validateCredentials(username, password);
				correct = false;
			}
		}
		if (correct) {
			if (correct[0]) {
				status.msg = "Success";
				status.status = true;
				permsLevel = correct[correct.length - 1];
			}
		}
		const jwt = await this.#createAuthJWT(username, expiresIn, permsLevel);
		const options = convertCookieOptions(
			process.env.COOKIE_NAME,
			jwt,
			this.cookieOptions
		);
		return {
			status: status,
			cookieOptions: options,
		};
	}

	// Only call this after passkey authorisation has succeeded
	async authenticatePasskey(userId: string, expiresIn: string = "10 mins") {
		const queryResult = await queryDB(
			getDB(),
			"SELECT id, username, max_perms FROM users WHERE id = ?;",
			[userId]
		);
		const permsLevel = queryResult[0].max_perms;
		const jwt = await this.#createAuthJWT(
			queryResult[0].username,
			expiresIn,
			permsLevel
		);
		const options = convertCookieOptions(
			process.env.COOKIE_NAME,
			jwt,
			this.cookieOptions
		);
		return options;
	}

	async register(
		username: string,
		password: string,
		expiresIn: string = "10 mins",
		permsLevel: string = "basic",
		urls?: string[]
	) {
		urls =
			(Array.isArray(urls) && validateURLArray(urls)) || urls == undefined
				? urls
				: false;
		const validated = urls != false;
		const status = { status: false, msg: "Failed" };
		if (validated) {
			if ((await this.#isUniqueUsername(username)) == 0) {
				const sqlStatus = await this.#createUser(
					username,
					password,
					permsLevel
				);
				status.status = sqlStatus[0];
				status.msg = sqlStatus[0] ? "Success" : "Failed";
			}
		}
		const jwt = await this.#createAuthJWT(
			username,
			expiresIn,
			permsLevel,
			urls
		);
		const options = convertCookieOptions(
			process.env.COOKIE_NAME,
			jwt,
			this.cookieOptions
		);
		return {
			status: status,
			cookieOptions: options,
		};
	}
}

export default { authenticate };
