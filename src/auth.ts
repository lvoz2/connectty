import argon2 from "argon2";
import sqlite3 from "sqlite3";
import sqlite from "sqlite";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";
import session from "express-session";
import connect from "connect-sqlite3";

const SQLiteStore = connect(session);

const sessionManager = session({
	proxy: true,
	store: new SQLiteStore({
		table: "sessions",
		db: process.env.DB_NAME,
		dir: ".",
	}),
	name: process.env.SESSION_NAME,
	resave: false,
	secret: Buffer.from(process.env.SESSION_SECRET, "hex").toString(),
	saveUninitialized: false,
	/*cookie: {
		domain: "lvoz2.duckdns.org",
		maxAge: 10800000,
		path: "/",
		httpOnly: true,
		sameSite: "strict",
		secure: true
	}*/
});

let db: undefined | sqlite.Database;

(async () => {
	db = await sqlite.open({
		filename: "./" + process.env.DB_NAME + ".db",
		driver: sqlite3.Database,
		mode: sqlite3.OPEN_READWRITE
	});
})();

/*const db = new sqlite3.Database(process.env.DB_NAME + ".db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_FULLMUTEX, (err) => {
	if (err) {
		console.log("Database could not be opened. Error: " + err);
		process.exit(1);
	}
});*/

async function isUniqueUsername(username: string) {
	let numUsers;
	try {
		const result = await queryDB(db, "SELECT username FROM users WHERE username = ?;", [username]);
		if (result) {
			numUsers = result[0].length;
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

async function queryDB(db: undefined | sqlite.Database, query: string, params: string[]) {
	if (db) {
		const stmt: sqlite.Statement = await db.prepare(query);
		stmt.bind(params);
		return await stmt.all();
	} else {
		console.log("DB not ready");
	}
}

async function createUser(username: string, password: string) {
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
			status = (() => {
				if (Array.isArray(users)) {
					if (users.length == 1) {
						return "Success";
					} else {
						return "Duplicate User";
					}
				} else {
					return "SQL Result not an Array";
				}
			})();
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

async function validateCredentials(username: string, password: string) {
	let status = false;
	let uid;
	try {
		const result = await queryDB(db, "SELECT id, username, password FROM users WHERE username = ?;", [username]);
		let password_hash;
		if (Array.isArray(result)) {
			if (result[0].length == 1) {
				password_hash = result[0][0]["password"];
				status = await argon2.verify(password_hash, password);
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
	} else {
		return [status]
	}
}

const auth = {"createUser": createUser, "validateCredentials": validateCredentials, "isUniqueUsername": isUniqueUsername, "session": sessionManager};
export default auth;
