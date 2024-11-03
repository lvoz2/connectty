import argon2 from "argon2";
import mysql from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";
import session from "express-session";
import MySQLStorePkg from "express-mysql-session";

const MySQLStore = MySQLStorePkg(session);

const pool = mysql.createPool({
	host           : process.env.MDB_HOST,
	user           : process.env.MDB_USER,
	password       : process.env.MDB_PASSWORD,
	connectionLimit: 5,
	database       : process.env.MDB_DB
});

const sessionStore = new MySQLStore({"expiration": 3600000}, pool);

async function isUniqueUsername(username: string) {
	let numUsers;
	try {
		const users = await pool.execute("SELECT username FROM users WHERE username = ?;", [username]);
		if (Array.isArray(users)) {
			numUsers = users[0].length;
		}
	} catch (err) {
		return err.toString();
	} finally {
		// Idk
	}
	if (numUsers) {
		return numUsers;
	}
	throw new TypeError("Result of SQL Query was not an Array");
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
			const insert = await pool.execute("INSERT INTO users (id, username, password) VALUES (?, ?, ?);", [uid, username, hash]);
			const users = await pool.execute("SELECT username FROM users WHERE username = ?;", [username]);
			status = (Array.isArray(users) && users.length == 1) ? "Success" : "SQL Failed";
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
		const result = await pool.execute("SELECT id, username, password FROM users WHERE username = ?;", [username]);
		let password_hash;
		if (Array.isArray(result) && result[0].length == 1) {
			password_hash = result[0][0]["password"];
			status = await argon2.verify(password_hash, password);
			if (status) {
				uid = result[0][0]["id"];
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

const auth = {"createUser": createUser, "validateCredentials": validateCredentials, "isUniqueUsername": isUniqueUsername, "sessionStore": sessionStore, "sessionMiddleware": session};
export default auth;
