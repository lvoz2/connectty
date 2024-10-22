import argon2 from "argon2";
import mariadb from "mariadb";
import "dotenv/config";

const pool = mariadb.createPool({
	host: "127.0.0.1",
	user: process.env.MDB_USER,
	password: process.env.MDB_PASSWORD,
	connectionLimit: 5,
	database: process.env.MDB_DB
});

async function createUser(username, password) {
	let conn;
	try {
		const hash = await argon2.hash(password, {
		    type: argon2.argon2id,
		    memoryCost: 12 * 1024,
		    timeCost: 3,
		    parallelism: 1,
		});
		console.log("test");
		conn = await pool.getConnection();
		console.log("Test");
		const insert = await conn.query("INSERT INTO Users (Username, Password) VALUES (" + username + ", " + hash + ");");
		console.log(insert);
	} catch (err) {
		return err.toString();
	} finally {
		if (conn) conn.end();
	}
}

async function validateCredentials(username, password) {
	let conn;
	let status;
	try {
		conn = await pool.getConnection();
		const user_password = await conn.query("SELECT Username, Password FROM Users WHERE Username = " + username + ";");
		console.log(user_password);
		status = user_password;
		/*
		if (await argon2.verify("<big long hash>", password)) {
			console.log("Success");
		} else {
			console.log("Failure");
		}
		*/
	} catch (err) {
		throw err;
	} finally {
		if (conn) conn.end();
	}
	return status;
}

const auth = {"createUser": createUser, "validateCredentials": validateCredentials};
export default auth;
