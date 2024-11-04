import eSession from "express-session";
import connect from "connect-sqlite3";

declare module "express-session" {
	interface SessionData {
		user?: string;
	}
}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			[key: string]: string | undefined;
			DB_NAME: string;
			SESSION_NAME: string;
			SESSION_SECRET: string;
			CAPTCHA_SECRET_KEY: string;
		}
	}
}

export {};
