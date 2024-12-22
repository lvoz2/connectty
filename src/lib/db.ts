import sqlite3 from "sqlite3";
import { open, Database, Statement } from "sqlite";

const db = await open({filename: "./" + process.env.DB_NAME, driver: sqlite3.Database, mode: sqlite3.OPEN_READWRITE});

export async function queryDB(db: Database, query: string, params: string[]): Promise<string[]> {
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

export function getDB() {
	return db;
}

export default { getDB, queryDB };
