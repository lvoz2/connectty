"use server";

import { JWT, type JWTVerifyOptions } from "@/lib/jwt.ts";
import {
	validateURLArray,
	urlMatchArray,
	jwtBuilder,
	betterIsJWT,
	type CookieSerialiseOptions,
} from "@/lib/utils.ts";
import * as jose from "jose";

interface RequiredEndpointAuth {
	none: string[];
	[key: string]: string[];
}

export interface JWTAuthPayload extends jose.JWTPayload {
	usr: string;
	lvl: string;
	urls?: string[];
}

let instance: undefined | Authorise = undefined;

export function authorise(
	endpointSchema: RequiredEndpointAuth | undefined = undefined,
	inactivityTimeout: string | undefined = undefined,
	cookieOptions: CookieSerialiseOptions | undefined = undefined
) {
	if (instance != undefined) {
		return instance;
	}
	if (
		cookieOptions != undefined &&
		endpointSchema != undefined &&
		inactivityTimeout != undefined
	) {
		instance = new Authorise(
			endpointSchema,
			inactivityTimeout,
			cookieOptions
		);
		return instance;
	} else {
		throw new TypeError(
			"All arguments must be provided to instantiate a new class"
		);
	}
}

class Authorise {
	endpointSchema: RequiredEndpointAuth;
	inactivityTimeout: string;
	cookieOptions: CookieSerialiseOptions;
	jwtBuilder: JWT;

	constructor(
		endpointSchema: RequiredEndpointAuth,
		inactivityTimeout: string,
		cookieOptions: CookieSerialiseOptions
	) {
		this.cookieOptions = cookieOptions;
		this.endpointSchema = endpointSchema;
		this.inactivityTimeout = inactivityTimeout;
		this.jwtBuilder = jwtBuilder;
	}

	async #checkAccess(
		jwt: string,
		resource: string,
		options: JWTVerifyOptions & { endpoints?: RequiredEndpointAuth }
	): Promise<boolean> {
		if (jwt.toString().length == 0) {
			//console.log("Empty JWT or not string-like");
			return false;
		}
		try {
			const isJWT = betterIsJWT(jwt.toString());
			if (!isJWT) {
				console.log("not JWT like");
				return false;
			}
		} catch (err) {
			console.log("Error:", err);
			return false;
		}
		const payload = (await this.jwtBuilder.verify(jwt, options)).payload as
			| JWTAuthPayload
			| undefined;
		if (payload == undefined) {
			console.log("payload is undefined after trying to verify jwt");
			return false;
		}
		if ("lvl" in payload) {
			if (payload.lvl === "full") {
				return true;
			}
			let canAccess = false;
			if (options) {
				if ("endpoints" in options && options.endpoints != undefined) {
					canAccess =
						options.endpoints[payload.lvl].includes(resource);
				}
			}
			if (
				!canAccess &&
				"urls" in payload &&
				Array.isArray(payload.urls)
			) {
				canAccess =
					validateURLArray(payload.urls) &&
					payload.urls.includes(resource);
			}
			return canAccess;
		} else {
			console.log("lvl was not in payload, so not right shape jwt");
			return false;
		}
	}

	async checkAuth(path: string, JWTCookie: string) {
		if (path === "/") {
			return true;
		}
		JWTCookie = JWTCookie == undefined ? "" : JWTCookie.toString();
		let matched = false;
		for (const key in this.endpointSchema) {
			if (key != "none" && !matched) {
				matched = urlMatchArray(this.endpointSchema[key], path);
			}
		}
		let noneMatched = false;
		if (!matched) {
			noneMatched = urlMatchArray(this.endpointSchema.none, path);
		}
		const accessCheck = noneMatched
			? undefined
			: await this.#checkAccess(JWTCookie, path, {
					endpoints: this.endpointSchema,
				});
		if (noneMatched) {
			return true;
		} else if (JWTCookie !== "" && accessCheck) {
			return true;
		} else {
			return false;
		}
	}
}

export default { authorise };
