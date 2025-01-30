"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import { useEffect } from "react";

export function PasskeyButton() {
	async function passkeyLogin(useBrowserAutofill) {
		// Get the options for passkey login, as a jwt
		const jwt = document.getElementById("webauthnOptions").value;
		// Get and decode the body section of the jwt
		const jwtBody = JSON.parse(atob(jwt.split(".")[1]));
		// Clean up the body
		delete jwtBody.exp;
		delete jwtBody.iat;
		delete jwtBody.jti;
		//document.getElementById("error").innerText += JSON.stringify(jwtBody);
		try {
			//document.getElementById("error").innerText += ". \nstart. ";
			const assertion = await startAuthentication({
				optionsJSON: jwtBody,
				useBrowserAutofill: useBrowserAutofill,
			});
			//document.getElementById("error").innerText += ". \nsuccess. ";
			const verifyResponse = await fetch("/api/passkey/login/finish", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					options: assertion,
					jwt: jwt,
				}),
			}).then((res) => res.json());
			if (verifyResponse.success) {
				console.log("Login success");
				await fetch("/api/test-auth-status");
				window.location.reload(true);
			} else {
				console.log("Login failure");
			}
		} catch (err) {
			console.log(err);
			//document.getElementById("error").innerText = err.toString();
			//throw err;
			console.log("Login failure");
		}
	}

	function handleClick(e) {
		e.preventDefault();
		passkeyLogin(false);
	}

	useEffect(() => {
		passkeyLogin(false);
	}, []);

	return (
		<>
			<input type="hidden" autoComplete="webauthn"></input>
			<button
				className="bg-blue-600 hover:bg-blue-500 text-white font-semibold p-2 rounded w-[100%]"
				onClick={handleClick}
			>
				Login using Passkey
			</button>
		</>
	);
}
