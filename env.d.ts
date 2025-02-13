declare namespace NodeJS {
	interface ProcessEnv {
		COOKIE_NAME: string;
		DB_NAME: string;
		TEST_HASH: string;
		JWT_KEY: string;
		CAPTCHA_SECRET_KEY: string;
		DOMAIN: string;
	}
}
