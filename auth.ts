import argon2 from "argon2";
import mariadb from "mariadb";
import "dotenv/config";

const pool = mariadb.createPool({
	host: process.env.MDB_HOST,
	user: process.env.MDB_USER,
	password: process.env.MDB_PASSWORD,
	connectionLimit: 5,
	database: process.env.MDB_DB
});

async function isUniqueUsername(username) {
	let conn;
	let isUnique = false;
	try {
		conn = await pool.getConnection();
		const users = await conn.query("SELECT Username FROM Users WHERE Username = \"" + username + "\";");
		isUnique = (users.length == 0);
	} catch (err) {
		return err.toString();
	} finally {
		if (conn) conn.end();
	}
	return isUnique;
}

async function createUser(username, password) {
	let conn;
	let status = "";
	try {
		if (await isUniqueUsername(username)) {
			const hash = await argon2.hash(password, {
			    type: argon2.argon2id,
			    memoryCost: 64 * 1024,
			    timeCost: 2,
			    parallelism: 1,
			});
			conn = await pool.getConnection();
			const insert = await conn.query("INSERT INTO Users (Username, Password) VALUES (\"" + username + "\", \"" + hash + "\");");
			const users = await conn.query("SELECT Username FROM Users WHERE Username = \"" + username + "\";");
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

async function validateCredentials(username, password) {
	let conn;
	let status = false;
	try {
		conn = await pool.getConnection();
		const result = await conn.query("SELECT Username, Password FROM Users WHERE Username = \"" + username + "\";");
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

const auth = {"createUser": createUser, "validateCredentials": validateCredentials, "isUniqueUsername": isUniqueUsername};
export default auth;
