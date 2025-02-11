"use client";

import { startRegistration } from "@simplewebauthn/browser";

export function PasskeyRegister() {
	async function passkeyRegister(e) {
		e.preventDefault();
		// Get the options for passkey login, as a jwt
		const jwt = (
			await fetch("/api/passkey/register/start").then((res) => res.json())
		).jwt;
		// Get and decode the body section of the jwt
		const jwtBody = JSON.parse(atob(jwt.split(".")[1]));
		// Clean up the body
		delete jwtBody.exp;
		delete jwtBody.iat;
		delete jwtBody.jti;
		console.log(jwtBody);
		// Do client-side jwt auth
		const options = await startRegistration({ optionsJSON: jwtBody });
		const registrationSuccess = await fetch(
			"/api/passkey/register/finish",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ jwt: jwt, options: options }),
			}
		).then((res) => res.json());
		if (registrationSuccess.status) {
			console.log("Success");
		} else {
			console.log("Failure");
		}
	}

	function handleClick(e) {
		passkeyRegister(e);
	}

	return (
		<div id="passkeyRegister">
			<form>
				<button
					className="bg-blue-600 hover:bg-blue-500 text-white font-semibold p-2 mt-3 rounded w-[100%]"
					onClick={handleClick}
				>
					Create Passkey
				</button>
			</form>
		</div>
	);
}

export default { PasskeyRegister };
