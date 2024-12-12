import * as jose from "jose";

export interface JWKLong {
	keyType: string,
	algorithm?: string,
	curve?: string,
	privateExponent?: string,
	firstFactorCRTExponent?: string,
	secondFactorCRTExponent?: string,
	exponent?: string,
	extractable?: boolean,
	keyValue?: string,
	keyOperations?: string[],
	keyID?: string,
	modulus?: string,
	otherPrimesInfo?: object[],
	firstPrimeFactor?: string,
	secondPrimeFactor?: string,
	firstCRTCoefficient?: string,
	publicKeyUse?: string,
	xCoordinate?: string,
	x509CertificateChain?: string[],
	x509CertificateSHA1Thumbprint?: string,
	x509CertificateSHA256Thumbprint?: string,
	x509Url?: string,
	yCoordinate?: string
}

interface JWTProtectedHeadersLong {
	algorithm: string,
	useBase64UrlEncoding?: boolean,
	critical?: string[],
	contentType?: string,
	JWKSetUrl?: string,
	JSONWebKey?: Pick<JWKLong, "xCoordinate" | "yCoordinate" | "keyType" | "curve" | "exponent" | "modulus">,
	keyID?: string,
	type?: string,
	x509CertificateChain?: string[],
	x509CertificateSHA1Thumbprint: string,
	x509Url: string
}

interface JWTPayloadLong {
	audience?: string | string[],
	expirationTime?: number | Date | string,
	issuedAt?: number | Date | string,
	issuer?: string,
	jwtID?: string,
	notBefore?: number | Date | string,
	subject?: string
}

interface JWTSignOptions extends JWTPayloadLong {
	protectedHeaders?: JWTProtectedHeadersLong
}

interface JWTVerifyOptions extends jose.JWTVerifyOptions {
	critical?: object,
	type?: string
}

export class JWT {
	constructor(key: Uint8Array | jose.KeyLike | JWKLong) {
		this.key = key;
	}

	#convertToShort(payload: JWTPayloadLong): jose.JWTPayload {
		const keys = Object.keys(payload);
		let shortened: jose.JWTPayload = {}
		for (let key in keys) {
			switch (key) {
				case "audience":
					shortened.aud = payload.audience;
					break;
				case "expirationTime":
					shortened.exp = payload.expirationTime;
					break;
				case "issuedAt":
					shortened.iat = payload.issuedAt;
					break;
				case "issuer":
					shortened.iss = payload.issuer;
					break;
				case "jwtID":
					shortened.jti = payload.jwtID;
					break;
			}
		}
		return shortened;
	}

	async sign(payload: JWTPayloadLong, options?: JWTSignOptions): Promise<string> {
		
	}

	async verify(jwt: string | Uint8Array, options?: JWTVerifyOptions): Promise<{"payload": undefined, "protectedHeader": undefined} | jose.JWTVerifyResult> {
		let shortOptions = undefined;
		if (options != undefined) {
			shortOptions = {};
			const keys = Object.keys(options);
			for (let key in keys) {
				switch (key) {
					case "critical":
						shortOptions.crit = options.hasOwnProperty("crit") ? options.crit : options.critical;
						break;
					case "type":
						shortOptions.typ = options.hasOwnProperty("typ") ? options.typ : options.type;
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
				return {"payload": undefined, "protectedHeader": undefined};
			} else {
				throw err;
				return {"payload": undefined, "protectedHeader": undefined};
			}
		}
	}
}

export default { JWT };
