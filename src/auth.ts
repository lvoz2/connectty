import argon2 from "argon2";
import sqlite3 from "sqlite3";
import { open, Database, Statement } from "sqlite";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

let db: undefined | Database;

(async () => {
	db = await open({
		filename: "./" + process.env.DB_NAME,
		driver: sqlite3.Database,
		mode: sqlite3.OPEN_READWRITE
	});
})();

/*const db = new sqlite3.Database(process.env.DB_NAME, sqlite3.OPEN_READWRITE | sqlite3.OPEN_FULLMUTEX, (err) => {
	if (err) {
		console.log("Database could not be opened. Error: " + err);
		process.exit(1);
	}
});*/

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

async function createUser(username: string, password: string): Promise<string[]> {
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
			const insert = await queryDB(db, "INSERT INTO users (id, username, password) VALUES (?, ?, ?);", [uid, username, hash]);
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
	try {
		const result = await queryDB(db, "SELECT id, username, password FROM users WHERE username = ?;", [username]);
		let password_hash;
		if (Array.isArray(result)) {
			if (result[0].length == 1) {
				password_hash = result[0][0]["password"];
				status = await argon2.verify(password_hash, password) ? "Correct credentials" : "Incorrect credentials";
				if (status) {
					uid = result[0][0]["id"];
				}
			}
		}
	} catch (err) {
		throw err;
	} finally {
		// Idk
	}
	if (uid) {
		return [status, uid];
	}
	return [status];
}

async function authenticate(req: express.Request, res: express.Response) {
	const username = req.body.username;
	const password = req.body.password;
	let statusText = "Failed";
	let validated = true;
	if (validated) {
		const unique = (awaitisUniqueUsername(username));
		if (unique == 1) {
			const status = await validateCredentials(username, password);
			if (status[0]) {
				statusText = "Success";
			}
		}
	}
	//res.cookie(process.env.SESSION_NAME, req.session.id, req.session.cookie);
	res.json({"status": statusText});
}

function checkJWT(jwt: string) {

}

function createJWT(payload: JWTAuthPayload): string {
    const token = jwt.sign(payload, process.env.JWT_Key);
    return token;
}

async function register(req: express.Request, res: express.Response) {
}

const auth = {"isUniqueUsername": isUniqueUsername};
export default auth;
