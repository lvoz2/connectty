CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(128) NOT NULL
);

CREATE TABLE credentials (
    credential_id VARCHAR(255) NOT NULL PRIMARY KEY,
	public_key TEXT NOT NULL,
	user_id VARCHAR(255) NOT NULL,
	counter INT NOT NULL,
	transports VARCHAR(255),
	FOREIGN KEY (user_id) REFERENCES users(id)
);
