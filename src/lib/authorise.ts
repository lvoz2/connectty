import JWT from "@/lib/jwt.ts";
import ms from "ms";
import {
	validateURLArray,
	urlMatchArray,
	jwtBuilder,
	betterIsJWT,
} from "@/lib/utils.ts";

interface RequiredEndpointAuth {
	none: string[];
	[key: string]: string[];
}

const instance: undefined | auth = undefined;

export function authorise(
	endpointSchema: RequiredEndpointAuth = undefined,
	inactivityTimeout: number = undefined,
	cookieOptions: CookieSerializeOptions = undefined
) {
	if (instance != undefined) {
		return instance;
	}
	if (
		cookieOptions != undefined &&
		endpointSchema != undefined &&
		inactivityTimeout != undefined
	) {
		return new Authorise(endpointSchema, inactivityTimeout, cookieOptions);
	} else {
		throw new TypeError(
			"All arguments must be provided to instantiate a new class"
		);
	}
}

class Authorise {
	constructor(
		endpointSchema: RequiredEndpointAuth,
		inactivityTimeout: number,
		cookieOptions: CookieSerializeOptions
	) {
		this.cookieOptions = cookieOptions;
		this.endpointSchema = endpointSchema;
		this.inactivityTimeout = inactivityTimeout;
		this.jwtBuilder = jwtBuilder;
	}

	async #checkAccess(
		jwt: string,
		resource: string,
		expiresIn?: string,
		options?: JWT.JWTVerifyOptions & { endpoints?: RequiredEndpointAuth }
	): Promise<boolean> {
		if (typeof expiresIn !== "string") {
			options = expiresIn;
		}
		if (jwt.toString().length == 0) {
			return false;
		}
		try {
			const isJWT = betterIsJWT(jwt.toString());
			if (!isJWT) {
				console.log("not JWT like");
				return false;
			}
		} catch (err) {
			console.log("Error thing:", err);
			return false;
		}
		if (!Object.hasOwnProperty.call(options, "maxTokenAge")) {
			options.maxTokenAge =
				typeof expiresIn === "string"
					? Math.floor(ms(expiresIn) / 1000)
					: undefined;
		}
		const { payload } = await this.jwtBuilder.verify(
			jwt,
			options
		);
		if (!(payload != undefined)) {
			//console.log("payload is undefined after trying to verify jwt");
			return false;
		}
		if ("lvl" in payload) {
			if (payload.lvl === "full") {
				return true;
			}
			let canAccess = false;
			if (options) {
				if (
					"endpoints" in options &&
					options.endpoints != undefined
				) {
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
