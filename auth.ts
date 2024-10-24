import argon2 from "argon2";
import mariadb from "mariadb";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

const pool = mariadb.createPool({
	host: process.env.MDB_HOST,
	user: process.env.MDB_USER,
	password: process.env.MDB_PASSWORD,
	connectionLimit: 5,
	database: process.env.MDB_DB
});

async function isUniqueUsername(username: string) {
	let conn;
	let numUsers;
	try {
		conn = await pool.getConnection();
		const users = await conn.query("SELECT username FROM users WHERE username = \"" + username + "\";");
		numUsers = users.length;
	} catch (err) {
		return err.toString();
	} finally {
		if (conn) conn.end();
	}
	return numUsers;
}

async function createUser(username: string, password: string) {
	let conn;
	let status = "";
	try {
		if ((await isUniqueUsername(username)) == 0) {
			const hash = await argon2.hash(password, {
			    type: argon2.argon2id,
			    memoryCost: 64 * 1024,
			    timeCost: 2,
			    parallelism: 1,
			});
			conn = await pool.getConnection();
			const insert = await conn.query("INSERT INTO users (id, username, password) VALUES (\"?\", \"?\");", [uuidv4(), username, hash]);
			const users = await conn.query("SELECT username FROM users WHERE username = \"?\";", [username]);
			status = (users.length == 1) ? "Success" : "SQL Failed";
		} else {
			status = "Username already in use";
		}
	} catch (err) {
		//err.toString();
		throw err;
	} finally {
		if (conn) conn.end();
	}
	return status;
}

async function validateCredentials(username: string, password: string) {
	let conn;
	let status = false;
	try {
		conn = await pool.getConnection();
		const result = await conn.query("SELECT username, password FROM users WHERE username = \"?\";", [username]);
		let password_hash;
		if (result.length == 1) {
			password_hash = result[0]["Password"];
			status = await argon2.verify(password_hash, password);
		}
	} catch (err) {
		throw err;
	} finally {
		if (conn) conn.end();
	}
	return status;
}

async function createSession() {
	
}

const auth = {"createUser": createUser, "validateCredentials": validateCredentials, "isUniqueUsername": isUniqueUsername};
export default auth;
