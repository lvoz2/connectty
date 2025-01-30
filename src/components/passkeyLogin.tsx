"use server";

import { PasskeyButton } from "@/components/passkeyLoginButton.tsx";
import { createOptions } from "@/lib/webauthn.ts";

export default async function PasskeyLogin() {
	const webauthnJWT = await createOptions();

	// The input in this form with name "webauthn_jwt" was inspired by GitHub: they create the options as part of intial page load and put them directly
	// inside a <form> tag with a custom attribute, named "data-webauthn-sign-request"
	return (
		<div id="passkeyLogin">
			<form>
				<input
					type="hidden"
					id="webauthnOptions"
					name="webauthn_jwt"
					value={webauthnJWT}
				></input>
				<PasskeyButton />
			</form>
			<div id="error"></div>
		</div>
	);
}
