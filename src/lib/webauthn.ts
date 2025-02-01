import {
	generateAuthenticationOptions,
	type PublicKeyCredentialCreationOptionsJSON,
} from "@simplewebauthn/server";
import { nanoid } from "nanoid";
import { jwtBuilder } from "@/lib/utils.ts";

export const passkeyRp = {
	name: "lv_oz2's Website",
	id: "lvoz2.duckdns.org",
	origin: "https://lvoz2.duckdns.org",
};

export async function createOptions() {
	const passkeyOptions: PublicKeyCredentialRequestOptionsJSON =
		await generateAuthenticationOptions({
			rpID: passkeyRp.id,
		});
	const jti = nanoid();
	const jwt = await jwtBuilder.sign(passkeyOptions, {
		jwtID: jti,
		expirationTime: "5 mins",
	});
	return jwt;
}

export default { passkeyRp, createOptions };
