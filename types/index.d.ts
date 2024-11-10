declare global {
	namespace NodeJS {
		interface ProcessEnv {
			[key: string]: string | undefined;
			DB_NAME: string;
			CAPTCHA_SECRET_KEY: string;
			COOKIE_NAME: string;
			COOKIE_KEY: string;
			JWT_KEY: string;
		}
	}
}

export {};
