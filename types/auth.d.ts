import sqlite3 from "sqlite3";
import sqlite from "sqlite";
import connect from "connect-sqlite3";
import auth from "../src/auth";
import express from "express"

declare module "auth" {
	let db: undefined | sqlite.Database;
}
