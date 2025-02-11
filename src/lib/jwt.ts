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

interface JWTProtectedHeadersLong {
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

interface JWTPayloadLong {
	audience?: string | string[];
	expirationTime?: number | Date | string;
	issuedAt?: number | Date | string;
	issuer?: string;
	jwtID?: string;
	notBefore?: number | Date | string;
	subject?: string;
}

interface JWTSignOptions extends JWTPayloadLong {
	protectedHeaders?: JWTProtectedHeadersLong;
}

interface JWTVerifyOptions extends jose.JWTVerifyOptions {
	critical?: object;
	type?: string;
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
	constructor(key: Uint8Array | jose.KeyLike | JWKLong) {
		this.key = key;
	}

	#shortJSONWebKey(JSONWebKey: JWKLong): jose.JWK {
		const keys = Object.keys(JSONWebKey);
		const shortened: jose.JWTHeaderParameters = {};
		for (const key in keys) {
			switch (key) {
				case "keyType":
					shortened.kty = JSONWebKey[key];
					break;
				case "algorithm":
					shortened.alg = JSONWebKey[key];
					break;
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
					shortened["x52#S256"] = JSONWebKey[key];
					break;
				case "x509Url":
					shortened.x5u = JSONWebKey[key];
					break;
				case "yCoordinate":
					shortened.y = JSONWebKey[key];
					break;
			}
		}
	}

	#shortProtectedHeader(
		protectedHeader: JWTProtectedHeadersLong
	): jose.JWTHeaderParameters {
		const shortened: jose.JWTHeaderParameters = {};
		for (const key in protectedHeader) {
			switch (key) {
				case "algorithm":
					shortened.alg = protectedHeader[key];
					break;
				case "useBase64UrlEncoding":
					shortened.b64 = protectedHeader[key];
					break;
				case "critical":
					shortened.crit = protectedHeader[key];
					break;
				case "contentType":
					shortened.cty = protectedHeader[key];
					break;
				case "JWKSetUrl":
					shortened.jku = protectedHeader[key];
					break;
				case "JSONWebKey":
					shortened.jwk = this.#shortJSONWebKey(protectedHeader[key]);
					break;
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

	async sign(
		payload: JWTPayloadLong,
		options?: JWTSignOptions
	): Promise<string> {
		const jwt = await new jose.SignJWT(payload);
		if (options != undefined) {
			for (const key in options) {
				switch (key) {
					case "audience":
						jwt.setAudience(options[key]);
						break;
					case "expirationTime":
						jwt.setExpirationTime(options[key]);
						break;
					case "issuedAt":
						jwt.setIssuedAt(options[key]);
						break;
					case "issuer":
						jwt.setIssuer(options[key]);
						break;
					case "jwtID":
						jwt.setJti(options[key]);
						break;
					case "notBefore":
						jwt.setNotBefore(options[key]);
						break;
					case "protectedHeader":
						jwt.setProtectedHeader(
							this.#shortProtectedHeader(options[key])
						);
						break;
					case "subject":
						jwt.setSubject(options[key]);
						break;
				}
			}
		}
		try {
			const jwtString = await jwt.sign(this.key);
			return jwtString;
		} catch (err) {
			if (err instanceof jose.errors.JWSInvalid) {
				const msg = err.toString();
				if (
					msg ===
					"JWSInvalid: either setProtectedHeader or setUnprotectedHeader must be called before #sign()"
				) {
					const alg = "HS256";
					jwt.setProtectedHeader({ alg });
					const jwtString = await jwt.sign(this.key);
					return jwtString;
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
		options?: JWTVerifyOptions
	): Promise<
		| { payload: undefined; protectedHeader: undefined }
		| jose.JWTVerifyResult
	> {
		/*if (!betterIsJWT(jwt.toString())) {
			throw new Error("First argument must look like a valid JWT");
			return {payload: undefined, protectedHeader: undefined};
		}*/
		let shortOptions = undefined;
		if (options != undefined) {
			shortOptions = {};
			const keys = Object.keys(options);
			for (const key in keys) {
				switch (key) {
					case "critical":
						shortOptions.crit = Object.hasOwnProperty.call(options, "crit")
							? options.crit
							: options.critical;
						break;
					case "type":
						shortOptions.typ = Object.hasOwnProperty.call(options, "typ")
							? options.typ
							: options.type;
						break;
					default:
						shortOptions[key] = options[key];
				}
			}
		}
		try {
			const result = await jose.jwtVerify(jwt, this.key, shortOptions);
			return result;
		} catch (err) {
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

export default { JWT, betterIsJWT };
