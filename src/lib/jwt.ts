import * as jose from "jose";
import validator from "validator";

export interface JWKLong {
	keyType: string;
	algorithm?: string;
	curve?: string;
	privateExponent?: string;
	firstFactorCRTExponent?: string;
	secondFactorCRTExponent?: string;
	exponent?: string;
	extractable?: boolean;
	keyValue?: string;
	keyOperations?: string[];
	keyID?: string;
	modulus?: string;
	firstPrimeFactor?: string;
	secondPrimeFactor?: string;
	firstCRTCoefficient?: string;
	publicKeyUse?: string;
	xCoordinate?: string;
	x509CertificateChain?: string[];
	x509CertificateSHA1Thumbprint?: string;
	x509CertificateSHA256Thumbprint?: string;
	x509Url?: string;
	yCoordinate?: string;
}

export interface JWTProtectedHeadersLong {
	algorithm: string;
	useBase64UrlEncoding?: boolean;
	critical?: string[];
	contentType?: string;
	JWKSetUrl?: string;
	JSONWebKey?: Pick<
		JWKLong,
		| "xCoordinate"
		| "yCoordinate"
		| "keyType"
		| "curve"
		| "exponent"
		| "modulus"
	>;
	keyID?: string;
	type?: string;
	x509CertificateChain?: string[];
	x509CertificateSHA1Thumbprint: string;
	x509Url: string;
}

export interface JWTPayloadLong {
	[propName: string]: unknown;
	audience?: string | string[];
	expirationTime?: number | Date | string;
	issuedAt?: number | Date | string;
	issuer?: string;
	jwtID?: string;
	notBefore?: number | Date | string;
	subject?: string;
}

export interface JWTSignOptions extends JWTPayloadLong {
	protectedHeaders?: JWTProtectedHeadersLong;
}

export interface JWTVerifyOptionsLong extends jose.JWTVerifyOptions {
	[propName: string]: unknown;
	critical?: { [propName: string]: boolean };
	type?: string;
}

export interface JWTVerifyOptions extends jose.JWTVerifyOptions {
	[propName: string]: unknown;
}

export function betterIsJWT(jwt: string) {
	if (validator.isJWT(jwt)) {
		const parts = jwt.split(".");
		let decoded;
		try {
			decoded = [atob(parts[0]), atob(parts[1])];
		} catch (err) {
			if (err instanceof DOMException) {
				// Checks if the error is becuase of invalid characters
				if (err.code == 5) {
					return false;
				} else {
					throw err;
					return false;
				}
			} else {
				throw err;
				return false;
			}
		}
		try {
			JSON.parse(decoded[0]);
			JSON.parse(decoded[1]);
			return true;
		} catch (err) {
			if (err instanceof SyntaxError) {
				return false;
			} else {
				throw err;
				return false;
			}
		}
	}
	return false;
}

export class JWT {
	key: Uint8Array | jose.KeyLike | JWKLong;

	constructor(key: Uint8Array | jose.KeyLike | JWKLong) {
		this.key = key;
	}

	#shortJSONWebKey(JSONWebKey: JWKLong): jose.JWK {
		if (JSONWebKey.algorithm == undefined) {
			throw new Error("An algorithm is required in a JWK");
		}
		const shortened: jose.JWK = {
			alg: JSONWebKey.algorithm,
			kty: JSONWebKey.keyType,
		};
		for (const key in JSONWebKey) {
			switch (key) {
				case "curve":
					shortened.crv = JSONWebKey[key];
					break;
				case "privateExponent":
					shortened.d = JSONWebKey[key];
					break;
				case "firstFactorCRTExponent":
					shortened.dp = JSONWebKey[key];
					break;
				case "secondFactorCRTExponent":
					shortened.dq = JSONWebKey[key];
					break;
				case "exponent":
					shortened.e = JSONWebKey[key];
					break;
				case "extractable":
					shortened.ext = JSONWebKey[key];
					break;
				case "keyValue":
					shortened.k = JSONWebKey[key];
					break;
				case "keyOperations":
					shortened.key_ops = JSONWebKey[key];
					break;
				case "keyID":
					shortened.kid = JSONWebKey[key];
					break;
				case "modulus":
					shortened.n = JSONWebKey[key];
					break;
				case "firstPrimeFactor":
					shortened.p = JSONWebKey[key];
					break;
				case "secondPrimeFactor":
					shortened.q = JSONWebKey[key];
					break;
				case "firstCRTCoefficient":
					shortened.qi = JSONWebKey[key];
					break;
				case "publicKeyUse":
					shortened.use = JSONWebKey[key];
					break;
				case "xCoordinate":
					shortened.x = JSONWebKey[key];
					break;
				case "x509CertificateChain":
					shortened.x5c = JSONWebKey[key];
					break;
				case "x509CertificateSHA1Thumbprint":
					shortened.x5t = JSONWebKey[key];
					break;
				case "x509CertificateSHA256Thumbprint":
					shortened["x5t#S256"] = JSONWebKey[key];
					break;
				case "x509Url":
					shortened.x5u = JSONWebKey[key];
					break;
				case "yCoordinate":
					shortened.y = JSONWebKey[key];
					break;
			}
		}
		return shortened;
	}

	#shortProtectedHeader(
		protectedHeader: JWTProtectedHeadersLong
	): jose.JWTHeaderParameters {
		const shortened: jose.JWTHeaderParameters = {
			alg: protectedHeader.algorithm,
		};
		for (const key in protectedHeader) {
			switch (key) {
				case "useBase64UrlEncoding": {
					if (
						protectedHeader[key] != undefined &&
						protectedHeader[key]
					) {
						shortened.b64 = protectedHeader[key];
					}
					break;
				}
				case "critical":
					shortened.crit = protectedHeader[key];
					break;
				case "contentType":
					shortened.cty = protectedHeader[key];
					break;
				case "JWKSetUrl":
					shortened.jku = protectedHeader[key];
					break;
				case "JSONWebKey": {
					if (protectedHeader[key] != undefined) {
						shortened.jwk = this.#shortJSONWebKey(
							protectedHeader[key]
						);
					}
					break;
				}
				case "keyID":
					shortened.kid = protectedHeader[key];
					break;
				case "type":
					shortened.typ = protectedHeader[key];
					break;
				case "x509CertificateChain":
					shortened.x5c = protectedHeader[key];
					break;
				case "x509CertificateSHA1Thumbprint":
					shortened.x5t = protectedHeader[key];
					break;
				case "x509Url":
					shortened.x5u = protectedHeader[key];
					break;
			}
		}
		return shortened;
	}

	get isKeyLong() {
		const JWKKeys = [
			"keyType",
			"algorithm",
			"curve",
			"privateExponent",
			"firstFactorCRTExponent",
			"secondFactorCRTExponent",
			"exponent",
			"extractable",
			"keyValue",
			"keyOperations",
			"keyID",
			"modulus",
			"firstPrimeFactor",
			"secondPrimeFactor",
			"firstCRTCoefficient",
			"publicKeyUse",
			"xCoordinate",
			"x509CertificateChain",
			"x509CertificateSHA1Thumbprint",
			"x509CertificateSHA256Thumbprint",
			"x509Url",
			"yCoordinate",
		];
		const isJWKLong = JWKKeys.reduce((acc, cur) => {
			return acc || Object.hasOwnProperty.call(this.key, cur);
		}, false);
		return isJWKLong;
	}

	async sign(payload: JWTPayload, options?: JWTSignOptions): Promise<string> {
		const jwt = await new jose.SignJWT(payload);
		if (options != undefined) {
			for (const key in options) {
				switch (key) {
					case "audience": {
						if (options[key] != undefined) {
							jwt.setAudience(options[key]);
						}
						break;
					}
					case "expirationTime": {
						if (options[key] != undefined) {
							jwt.setExpirationTime(options[key]);
						}
						break;
					}
					case "issuedAt": {
						if (options[key] != undefined) {
							jwt.setIssuedAt(options[key]);
						}
						break;
					}
					case "issuer": {
						if (options[key] != undefined) {
							jwt.setIssuer(options[key]);
						}
						break;
					}
					case "jwtID": {
						if (options[key] != undefined) {
							jwt.setJti(options[key]);
						}
						break;
					}
					case "notBefore": {
						if (options[key] != undefined) {
							jwt.setNotBefore(options[key]);
						}
						break;
					}
					case "protectedHeaders": {
						if (options[key] != undefined) {
							jwt.setProtectedHeader(
								this.#shortProtectedHeader(options[key])
							);
						}
						break;
					}
					case "subject": {
						if (options[key] != undefined) {
							jwt.setSubject(options[key]);
						}
						break;
					}
				}
			}
		}
		try {
			if (this.isKeyLong) {
				const key = this.#shortJSONWebKey(this.key as JWKLong);
				const jwtString = await jwt.sign(key);
				return jwtString;
			} else {
				const jwtString = await jwt.sign(
					this.key as jose.KeyLike | Uint8Array | jose.JWK
				);
				return jwtString;
			}
		} catch (err) {
			if (err instanceof jose.errors.JWSInvalid) {
				const msg = err.toString();
				if (
					msg ===
					"JWSInvalid: either setProtectedHeader or setUnprotectedHeader must be called before #sign()"
				) {
					const alg = "HS256";
					jwt.setProtectedHeader({ alg });
					if (this.isKeyLong) {
						const key = this.#shortJSONWebKey(this.key as JWKLong);
						const jwtString = await jwt.sign(key);
						return jwtString;
					} else {
						const jwtString = await jwt.sign(
							this.key as jose.KeyLike | Uint8Array | jose.JWK
						);
						return jwtString;
					}
				} else {
					throw err;
					return "";
				}
			} else {
				throw err;
				return "";
			}
		}
	}

	async verify(
		jwt: string | Uint8Array,
		options?: JWTVerifyOptionsLong
	): Promise<
		| { payload: undefined; protectedHeader: undefined }
		| jose.JWTVerifyResult
	> {
		/*if (!betterIsJWT(jwt.toString())) {
			throw new Error("First argument must look like a valid JWT");
			return {payload: undefined, protectedHeader: undefined};
		}*/
		let shortOptions: undefined | JWTVerifyOptions = undefined;
		if (options != undefined) {
			shortOptions = {};
			for (const key in options) {
				switch (key) {
					case "critical":
						shortOptions.crit = Object.hasOwnProperty.call(
							options,
							"crit"
						)
							? options.crit
							: options.critical;
						break;
					case "type":
						shortOptions.typ = Object.hasOwnProperty.call(
							options,
							"typ"
						)
							? options.typ
							: options.type;
						break;
					default:
						shortOptions[key] = options[key];
				}
			}
		}
		try {
			// Need to verify if this.key is a JWKLong, then recast depending on this to stop tsc screaming at us
			if (this.isKeyLong) {
				const key = this.#shortJSONWebKey(this.key as JWKLong);
				const result = await jose.jwtVerify(jwt, key, shortOptions);
				return result;
			} else {
				const result = await jose.jwtVerify(
					jwt,
					this.key as Uint8Array | jose.KeyLike,
					shortOptions
				);
				return result;
			}
		} catch (err) {
			console.log(err);
			if (err instanceof jose.errors.JWSSignatureVerificationFailed) {
				return { payload: undefined, protectedHeader: undefined };
			} else if (err instanceof jose.errors.JWTExpired) {
				return { payload: undefined, protectedHeader: undefined };
			} else {
				throw err;
				return { payload: undefined, protectedHeader: undefined };
			}
		}
	}
}
// Disbaled becuase this is an alias for another interface
export interface JWTPayload
	extends jose.JWTPayload {} /* eslint @typescript-eslint/no-empty-object-type: "off" */

export default { JWT, betterIsJWT };
