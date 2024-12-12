import JWT from "@/lib/jwt.ts";
import ms from "ms";
import { cookieOptions, validateURLArray, urlMatchArray, jwtBuilder } from "@/lib/utils.ts";
import validator from "validator";

"use server";

interface JWTAuthPayload extends JWT.JWTPayload {
	lvl: string;
	urls?: string[];
}

interface RequiredEndpointAuth {
	none: string[];
	[key: string]: string[];
}

let instance: undefined | auth = undefined;

export function authorise(endpointSchema: RequiredEndpointAuth = undefined, inactivityTimeout: number = undefined, cookieOptions: CookieSerializeOptions = undefined) {
	if (instance != undefined) {
		return instance;
	}
	if (cookieOptions != undefined && endpointSchema != undefined && inactivityTimeout != undefined) {
		return new Authorise(endpointSchema, inactivityTimeout, cookieOptions);
	} else {
		throw new TypeError("All arguments must be provided to instantiate a new class");
	}
}

class Authorise {
	constructor(endpointSchema: RequiredEndpointAuth, inactivityTimeout: number, cookieOptions: CookieSerializeOptions) {
		this.cookieOptions = cookieOptions;
		this.endpointSchema = endpointSchema;
		this.inactivityTimeout = inactivityTimeout;
		this.jwtBuilder = jwtBuilder;
	}

	async #checkAccess(jwt: string, resource: string, expiresIn?: string, options?: JWT.JWTVerifyOptions & { endpoints?: RequiredEndpointAuth }): Promise<boolean> {
		if (typeof expiresIn !== "string") {
			options = expiresIn;
		}
		try {
			const isJWT = validator.isJWT(jwt);
			if (!isJWT) {
				return false;
			}
		} catch (err) {
			console.log(err);
			return false;
		}
		if (!options.hasOwnProperty("maxTokenAge")) {
			options.maxTokenAge = (typeof expiresIn) === "string" ? Math.floor(ms(expiresIn) / 1000) : undefined;
		}
		try {
			const { payload, protectedHeader } = await this.jwtBuilder.verify(jwt, options);
			if (!(payload != undefined)) {
				return false;
			}
			if ("lvl" in payload) {
				let canAccess = false;
				if (options) {
					if ("endpoints" in options && options.endpoints != undefined) {
						canAccess = options.endpoints[payload.lvl].includes(resource);
					}
				}
				if (!canAccess && "urls" in payload && Array.isArray(payload.urls)) {
					canAccess = validateURLArray(payload.urls) && payload.urls.includes(resource);
				}
				return canAccess;
			} else {
				return false;
			}
		} catch (err) {
			throw err;
			return false;
		}
	}

	async checkAuth(path: string, JWTCookie: string) {
		if (urlMatchArray(this.endpointSchema.none, path)) {
			return true;
		} else if (JWTCookie !== "" && await this.#checkAccess(JWTCookie, path, {"endpoints": this.endpointSchema})) {
			return true;
		} else {
			//console.log(JWTCookie.length);
			return false;
		}
	}
}

export default { authorise };
